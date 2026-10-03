import { useEffect, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Compass,
  MessageSquare,
  Plus,
  Sparkles,
} from 'lucide-react'

type Message = { role: 'user' | 'assistant'; content: string }

const starterPrompts = [
  { icon: Compass, title: 'Explore an idea', detail: 'Help me think through something new' },
  { icon: MessageSquare, title: 'Write something', detail: 'Shape a note, story, or first draft' },
  { icon: Sparkles, title: 'Make a plan', detail: 'Turn a big goal into small steps' },
]

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messageEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, isThinking])

  function startNewChat() {
    setMessages([])
    setDraft('')
    window.setTimeout(() => textareaRef.current?.focus(), 30)
  }

  async function submitMessage(text = draft) {
    const content = text.trim()
    if (!content || isThinking) return

    const userMessage: Message = { role: 'user', content }
    setMessages((current) => [...current, userMessage])
    setDraft('')
    setIsThinking(true)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      })
      if (!response.ok) throw new Error(`Chat API returned ${response.status}`)
      const data: { reply: string } = await response.json()
      setMessages((current) => [...current, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages((current) => [...current, { role: 'assistant', content: 'I couldn’t reach the chat service. Check that the FastAPI server is running, then try again.' }])
    } finally {
      setIsThinking(false)
    }
  }

  function handleComposerKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submitMessage()
    }
  }

  return (
    <div className="app-shell">
      <main className="main-panel">
        <header className="topbar">
          <div className="topbar-left">
            <a className="wordmark topbar-wordmark" href="#home" onClick={startNewChat} aria-label="Kishibot home">
              <span className="brand-mark"><span /></span>
              <span>kishibot</span>
            </a>
          </div>
          <div className="topbar-actions">
            <button className="topbar-new-chat" onClick={startNewChat}>
              <Plus size={16} strokeWidth={2.2} />
              <span>New conversation</span>
            </button>
            <button className="share-button" onClick={() => navigator.clipboard?.writeText(window.location.href)} title="Copy conversation link">
              <ArrowDown size={15} /> <span>Share</span>
            </button>
          </div>
        </header>

        <section className={`conversation-view ${messages.length ? 'has-messages' : 'is-empty'}`}>
          {messages.length === 0 ? (
            <div className="welcome-content">
              <div className="welcome-eyebrow"><span className="eyebrow-line" /> A GOOD PLACE TO BEGIN</div>
              <h1>What’s on<br /><em>your mind?</em></h1>
              <p className="welcome-subtitle">A thought, a question, a half-formed idea.<br className="desktop-break" /> Let’s make something of it.</p>
              <div className="prompt-grid">
                {starterPrompts.map(({ icon: Icon, title, detail }) => (
                  <button className="prompt-card" key={title} onClick={() => { setDraft(`${title}: `); textareaRef.current?.focus() }}>
                    <span className="prompt-icon"><Icon size={17} strokeWidth={1.8} /></span>
                    <span className="prompt-text"><strong>{title}</strong><small>{detail}</small></span>
                    <ArrowUp size={15} className="prompt-arrow" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="message-thread">
              {messages.map((message, index) => (
                <article className={`message-row message-${message.role}`} key={index}>
                  {message.role === 'assistant' ? <span className="assistant-mark"><span /></span> : <span className="user-avatar">J</span>}
                  <div className="message-body">
                    <div className="message-author">{message.role === 'assistant' ? 'Kishibot' : 'You'}</div>
                    <p>{message.content}</p>
                  </div>
                </article>
              ))}
              {isThinking && <div className="thinking"><span /><span /><span /></div>}
              <div ref={messageEndRef} />
            </div>
          )}
        </section>

        <div className="composer-dock">
          <form className="composer" onSubmit={(event) => { event.preventDefault(); submitMessage() }}>
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value)
                event.target.style.height = 'auto'
                event.target.style.height = `${Math.min(event.target.scrollHeight, 180)}px`
              }}
              onKeyDown={handleComposerKeyDown}
              placeholder="Ask anything, or just start somewhere…"
              aria-label="Write a message"
              rows={1}
            />
            <div className="composer-footer">
              <span className="composer-hint"><span className="sparkle-dot"><Sparkles size={13} /></span> A little curiosity goes a long way</span>
              <button className="send-button" type="submit" disabled={!draft.trim() || isThinking} aria-label="Send message" title="Send message">
                <ArrowUp size={18} strokeWidth={2.2} />
              </button>
            </div>
          </form>
          <p className="disclaimer">Kishibot can make mistakes. Check important details.</p>
        </div>
      </main>
    </div>
  )
}

export default App