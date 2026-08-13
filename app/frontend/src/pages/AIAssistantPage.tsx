import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Terminal, ShieldCheck } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am your Amazon Bedrock-powered HealOps Autonomous Infrastructure Assistant. I am actively monitoring your EKS cluster nodes, pod health probes, and Prometheus alert streams. How can I assist your SRE operations today?',
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    // Simulate Bedrock Agent reasoning
    setTimeout(() => {
      let aiResponseText = `[AI Root-Cause Diagnostic]: Querying EKS cluster nodes and Prometheus metrics... All 2 EC2 worker nodes are reporting Ready. No unhandled CrashLoops detected. Autonomous safety guardrails are fully active.`;
      
      if (query.toLowerCase().includes('status') || query.toLowerCase().includes('health')) {
        aiResponseText = `[Cluster Health Assessment]: Overall score is 96/100. 2/2 worker nodes are healthy (us-east-1a, us-east-1b). 16 container workloads active across default and monitoring namespaces.`;
      } else if (query.toLowerCase().includes('chaos') || query.toLowerCase().includes('remediate')) {
        aiResponseText = `[Remediation Runbook Ready]: 4 auto-recovery playbooks loaded (Pod CrashLoop, Memory Pressure, CPU Saturation, Network Loss). Ingesting Alertmanager webhooks with 4.2s average MTTR.`;
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Bot className="h-7 w-7 text-cyan-400" />
            AI Operations & Diagnostic Terminal
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Direct conversational interface to Amazon Bedrock AI Agents and Kubernetes control plane
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" /> Bedrock Claude 3.5
          </span>
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Guardrails Active
          </span>
        </div>
      </div>

      {/* Main Terminal Chat Window */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
        {/* Terminal Titlebar */}
        <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            <Terminal className="h-4 w-4 text-cyan-400" />
            healops-agent://bedrock.us-east-1.amazonaws.com
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] text-emerald-400 font-mono">ONLINE</span>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 font-sans">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${
                msg.sender === 'user' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400'
              }`}>
                {msg.sender === 'user' ? <Terminal className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-200 shadow-md font-mono'
              }`}>
                <div className="flex justify-between items-center mb-1 text-[10px] text-slate-400 font-sans">
                  <span>{msg.sender === 'user' ? 'SRE Operator' : 'HealOps AI Agent'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
                <Bot className="h-4 w-4 animate-bounce" />
              </div>
              <div className="bg-slate-950/80 border border-slate-800 text-slate-400 px-4 py-3 rounded-2xl text-xs font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>Bedrock Agent reasoning across Kubernetes telemetry...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI about cluster status, pods at risk, or execute runbook commands..."
            className="flex-1 px-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-cyan-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
