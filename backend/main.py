import os

from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from openai import APIError, OpenAI
from pydantic import BaseModel, Field

load_dotenv(override=True)

GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
GEMINI_MODEL = "gemini-3.6-flash"

app = FastAPI(title="Commonplace Chat API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)


class ChatResponse(BaseModel):
    reply: str


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    message = request.message.strip()
    if not message:
        return ChatResponse(reply="Please send a message with some text, and we can get started.")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY is not configured.")

    gemini = OpenAI(base_url=GEMINI_BASE_URL, api_key=api_key)
    try:
        response = gemini.chat.completions.create(
            model=GEMINI_MODEL,
            messages=[
                {"role": "system", "content": "You are a developer. Keep your answers short."},
                {"role": "user", "content": message},
            ],
        )
    except APIError as error:
        raise HTTPException(status_code=502, detail="The Gemini API request failed.") from error

    reply = response.choices[0].message.content
    if not reply:
        raise HTTPException(status_code=502, detail="The Gemini API returned an empty response.")

    return ChatResponse(reply=reply)