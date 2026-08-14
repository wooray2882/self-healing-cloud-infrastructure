import { useState, useRef, useEffect } from 'react'
import { io } from 'socket.io-client'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

const socket = io(window.location.port === '5173' ? 'http://localhost:4000' : undefined)

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am your HealOps AI assistant. How can I help you manage your cluster today?',
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
  }, [messages, isOpen])

  // Listen for WebSockets from the backend!
  useEffect(() => {
    socket.on('remediation_event', (data: { timestamp: string, message: string }) => {
      // Auto-open the chat widget if it's closed so the user sees the alert!
      setIsOpen(true);
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `🚨 ALERT INCOMING 🚨\n\n${data.message}`,
        timestamp: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    });

    return () => {
      socket.off('remediation_event');
    };
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages([...messages, newMessage])
    setInput('')

    // Mock AI response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I have received your command. Once the backend is connected, I will execute this via Bedrock Action Groups.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    }, 1000)
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 z-50 glow-purple"
        style={{
          background: 'linear-gradient(135deg, #06D6F0, #8B5CF6)',
          color: 'white'
        }}
      >
        <i className={`ri-robot-2-line text-2xl transition-transform ${isOpen ? 'rotate-90 scale-0 absolute' : 'rotate-0 scale-100 relative'}`} />
        <i className={`ri-close-line text-3xl transition-transform ${isOpen ? 'rotate-0 scale-100 relative' : '-rotate-90 scale-0 absolute'}`} />
      </button>

      {/* Slide-over Chat Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] shadow-2xl transition-transform duration-300 ease-in-out z-40 flex flex-col`}
        style={{
          background: 'var(--color-bg-sidebar)',
          borderLeft: '1px solid var(--color-border)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{ background: 'linear-gradient(135deg, #06D6F0, #8B5CF6)' }}
            >
              <i className="ri-robot-2-line text-white" />
            </div>
            <div>
              <h2 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>AI Assistant</h2>
              <p className="text-xs" style={{ color: 'var(--color-cyan-500)' }}>
                <span className="live-dot mr-1" />
                Online
              </p>
            </div>
          </div>
          <button onClick={toggleChat} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <i className="ri-close-line text-xl" style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-end items-end ml-auto' : 'self-start items-start'}`}>
              <div
                className="p-3 rounded-2xl text-sm leading-relaxed"
                style={{
                  background: msg.role === 'user' 
                    ? 'linear-gradient(135deg, rgba(6,214,240,0.1), rgba(139,92,246,0.2))' 
                    : 'var(--color-bg-input)',
                  color: 'var(--color-text-primary)',
                  border: msg.role === 'user'
                    ? '1px solid rgba(139,92,246,0.3)'
                    : '1px solid var(--color-border)',
                  borderBottomRightRadius: msg.role === 'user' ? '0.25rem' : '1rem',
                  borderBottomLeftRadius: msg.role === 'assistant' ? '0.25rem' : '1rem',
                }}
              >
                {msg.content}
              </div>
              <span className="text-[10px] mt-1 mx-1" style={{ color: 'var(--color-text-muted)' }}>
                {msg.timestamp}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t shrink-0" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-base)' }}>
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me to check health or fix an issue..."
              className="w-full pl-4 pr-12 py-3 rounded-xl text-sm focus:outline-none transition-shadow"
              style={{
                background: 'var(--color-bg-input)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 p-2 rounded-lg disabled:opacity-50 transition-colors"
              style={{ color: 'var(--color-cyan-500)' }}
            >
              <i className="ri-send-plane-fill text-lg" />
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
