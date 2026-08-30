import { useState, useRef, useEffect } from 'react'
import { io } from 'socket.io-client'
import { fetchApi } from '../../api/client'
import AIMessageRenderer from './AIMessageRenderer'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

const socket = io(window.location.port === '5173' ? 'http://localhost:4000' : undefined, {
  transports: ['websocket', 'polling'],
  upgrade: true,
  reconnectionAttempts: 5
})

const QUICK_PROMPTS = [
  'Cluster Status',
  'Why is payment-service failing?',
  'Active Playbooks',
  'Kubectl Diagnostic Commands'
]

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am your HealOps AI SRE assistant powered by Amazon Bedrock. Ask me about cluster health, incident root causes, or autonomous runbooks.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const toggleChat = () => setIsOpen(!isOpen)

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping, isOpen])

  // Listen for WebSockets from backend
  useEffect(() => {
    socket.on('remediation_event', (data: { timestamp: string, message: string }) => {
      setIsOpen(true);
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `🚨 **ALERT INCOMING**\n\n${data.message}`,
        timestamp: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    });

    return () => {
      socket.off('remediation_event');
    };
  }, []);

  const sendQuery = async (queryText: string) => {
    if (!queryText.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setIsTyping(true)

    try {
      const response = await fetchApi('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          history: nextMessages.map(m => ({ role: m.role, content: m.content }))
        })
      })

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`)
      }

      const data = await response.json()
      const aiReply = data.response || 'I was unable to retrieve a response from Bedrock AI.'

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    } catch (err: any) {
      console.error('[AI Chat Error]', err)
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠️ **Diagnostic Connection Alert**: Unable to communicate with the HealOps SRE backend service (${err.message || 'Network error'}). Please verify the backend API service on port 4000 is healthy.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    sendQuery(input)
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-5 right-5 w-11 h-11 rounded-md flex items-center justify-center shadow-lg transition-transform hover:scale-105 z-50 border border-sky-400/30"
        style={{
          background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
          color: 'white'
        }}
        title="Open AI SRE Assistant"
      >
        <i className={`ri-robot-2-line text-lg transition-transform ${isOpen ? 'rotate-90 scale-0 absolute' : 'rotate-0 scale-100 relative'}`} />
        <i className={`ri-close-line text-xl transition-transform ${isOpen ? 'rotate-0 scale-100 relative' : '-rotate-90 scale-0 absolute'}`} />
      </button>

      {/* Slide-over Chat Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] shadow-2xl transition-transform duration-200 ease-in-out z-40 flex flex-col`}
        style={{
          background: 'var(--color-bg-sidebar)',
          borderLeft: '1px solid var(--color-border)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center w-7 h-7 rounded-md shadow"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
            >
              <i className="ri-robot-2-line text-white text-sm" />
            </div>
            <div>
              <h2 className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>HealOps AI SRE</h2>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="live-dot" />
                Amazon Bedrock Connected
              </p>
            </div>
          </div>
          <button onClick={toggleChat} className="p-1 rounded-md hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
            <i className="ri-close-line text-base" />
          </button>
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-3 py-2 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendQuery(prompt)}
              disabled={isTyping}
              className="px-2 py-1 bg-slate-900 hover:bg-slate-850 hover:border-sky-500/50 border border-slate-800 rounded text-[10.5px] text-slate-300 whitespace-nowrap transition-colors flex-shrink-0 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-slate-950/20">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col max-w-[94%] ${msg.role === 'user' ? 'self-end items-end ml-auto' : 'self-start items-start'}`}>
              <div
                className="p-3 rounded-lg text-xs leading-relaxed shadow-sm"
                style={{
                  background: msg.role === 'user' 
                    ? 'rgba(14, 165, 233, 0.18)' 
                    : '#0f172a',
                  color: 'var(--color-text-primary)',
                  border: msg.role === 'user'
                    ? '1px solid rgba(14, 165, 233, 0.4)'
                    : '1px solid #1e293b',
                }}
              >
                {msg.role === 'assistant' ? (
                  <AIMessageRenderer content={msg.content} />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
              <span className="text-[9px] mt-1 mx-1 text-slate-500">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic p-2.5 bg-slate-900/90 rounded-md border border-slate-800 w-fit animate-pulse">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span className="text-[11px] text-sky-300">Amazon Bedrock analyzing cluster telemetry...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 border-t shrink-0" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-base)' }}>
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask SRE about cluster health, pods, or incidents..."
              disabled={isTyping}
              className="w-full pl-3 pr-10 py-2 rounded-md text-xs bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-1.5 p-1 rounded-md text-sky-400 hover:text-sky-300 disabled:opacity-40 transition-colors"
              title="Send Query"
            >
              <i className="ri-send-plane-fill text-sm" />
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

