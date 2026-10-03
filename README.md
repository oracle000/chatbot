# Kishibot

A responsive React chat interface built with Vite and TypeScript, backed by a FastAPI service. Conversations stay in memory for the current browser session. The API currently returns a local demo response; it is not connected to an AI model provider.

## Run the API

Create a `.env` file in the project root based on `.env.example` and set `GEMINI_API_KEY` to your Gemini API key.

```sh
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API listens on `http://localhost:8000`. Interactive API documentation is available at `http://localhost:8000/docs`.

## Run the frontend

In a separate terminal from the project root:

```sh
npm install
npm run dev
```

The frontend uses `http://localhost:8000` by default. Set `VITE_API_URL` to use another API origin. Use Enter to send a message and Shift+Enter to add a line break. Select a recent conversation in the sidebar or start a new one.

## Production build

```sh
npm run build
```