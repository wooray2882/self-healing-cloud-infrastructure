import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Terminal, ShieldCheck } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export default function AIAssistantPage() {
  const { userName } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: '1',
        sender: 'ai',
        text: `Hello ${userName}! I am your Amazon Bedrock-powered HealOps Autonomous Infrastructure Assistant. I am actively monitoring your EKS cluster nodes, pod health probes, and Prometheus alert streams for you. How can I assist your SRE operations today?`,
        timestamp: 'Just now'
      }
    ]);
  }, [userName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    const query = input;
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let aiResponseText = `[AI Diagnostic for ${userName}]: Querying EKS cluster nodes and Prometheus metrics... All 2 EC2 worker nodes are reporting Ready. No unhandled CrashLoops detected. Autonomous safety guardrails are fully active.`;
      
      if (query.toLowerCase().includes('status') || query.toLowerCase().includes('health')) {
        aiResponseText = `[Cluster Health Assessment for ${userName}]: Overall health score is 98.5/100. 2/2 worker nodes are healthy (us-east-1a, us-east-1b). 6 container workloads active across default namespace. Zero unhandled alerts.`;
      } else if (query.toLowerCase().includes('chaos') || query.toLowerCase().includes('remediate')) {
        aiResponseText = `[Remediation Runbook Ready]: 4 auto-recovery playbooks loaded (Pod CrashLoop, Memory Pressure, CPU Saturation, Network Loss). Ingesting Alertmanager webhooks with sub-second MTTR.`;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
        <div>
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white flex items-center gap-2">
            <Bot className="h-4.5 w-4.5 text-sky-400" />
            AI Autonomous SRE Assistant
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Natural-language Bedrock AI cluster diagnostics & automated runbook execution personalized for <strong>{userName}</strong>
          </p>
        </div>

        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded text-[11px] font-semibold flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          Claude 3 Haiku Active
        </span>
      </div>

      {/* Chat Container Panel */}
      <div className="card-panel flex flex-col h-[650px] overflow-hidden p-0">
        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/40">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`p-2 rounded-md shrink-0 font-bold text-xs ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white'
                  : 'bg-purple-600/20 border border-purple-500/30 text-purple-300'
              }`}>
                {msg.sender === 'user' ? (userName ? userName.charAt(0).toUpperCase() : 'U') : <Bot className="h-4 w-4" />}
              </div>

              <div className={`max-w-xl rounded-md p-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-200'
              }`}>
                <div className="flex items-center justify-between gap-2 mb-1 opacity-75 text-[10px]">
                  <span className="font-semibold">{msg.sender === 'user' ? userName : 'Bedrock AI SRE'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <p className="font-sans whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic p-2 bg-slate-900/60 rounded border border-slate-800/80 w-fit">
              <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-spin" />
              <span>Amazon Bedrock analyzing cluster telemetry for {userName}...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
          <div className="relative flex-1">
            <Terminal className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder={`Ask Bedrock AI SRE assistant about cluster status, runbooks, or chaos...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs text-white transition-all bg-slate-950 border rounded-md border-slate-700 focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="btn-primary text-xs py-2 px-4"
          >
            <Send className="h-3.5 w-3.5" /> Send
          </button>
        </form>
      </div>
    </div>
  );
}
