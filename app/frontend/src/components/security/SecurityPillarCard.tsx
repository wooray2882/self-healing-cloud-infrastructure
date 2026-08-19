import { useState } from 'react';
import { 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Box, 
  Key, 
  Layers, 
  Server, 
  Sparkles
} from 'lucide-react';

export interface SecurityCheckItem {
  name: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  detail: string;
}

export interface SecurityPillar {
  id: string;
  name: string;
  category: string;
  score: number;
  status: 'VERIFIED' | 'COMPLIANT' | 'HARDENED';
  summary: string;
  checks: SecurityCheckItem[];
}

interface SecurityPillarCardProps {
  pillar: SecurityPillar;
  isExpandedDefault?: boolean;
}

export default function SecurityPillarCard({ pillar, isExpandedDefault = false }: SecurityPillarCardProps) {
  const [isExpanded, setIsExpanded] = useState(isExpandedDefault);

  const getPillarIcon = (id: string) => {
    switch (id) {
      case 'pillar-1': return <Box className="h-4 w-4 text-sky-400" />;
      case 'pillar-2': return <Key className="h-4 w-4 text-indigo-400" />;
      case 'pillar-3': return <Layers className="h-4 w-4 text-emerald-400" />;
      case 'pillar-4': return <Server className="h-4 w-4 text-amber-400" />;
      case 'pillar-5': return <Sparkles className="h-4 w-4 text-purple-400" />;
      default: return <ShieldCheck className="h-4 w-4 text-sky-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HARDENED':
        return <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold tracking-wide uppercase">HARDENED</span>;
      case 'VERIFIED':
        return <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold tracking-wide uppercase">VERIFIED</span>;
      case 'COMPLIANT':
        return <span className="px-2 py-0.5 bg-sky-600 text-white rounded text-[10px] font-bold tracking-wide uppercase">COMPLIANT</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-700 text-white rounded text-[10px] font-bold tracking-wide uppercase">{status}</span>;
    }
  };

  const getCheckStatusBadge = (status: 'PASS' | 'WARN' | 'FAIL') => {
    switch (status) {
      case 'PASS':
        return <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[9px] font-bold tracking-wide">PASS</span>;
      case 'WARN':
        return <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 rounded text-[9px] font-bold tracking-wide">WARN</span>;
      case 'FAIL':
        return <span className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[9px] font-bold tracking-wide">FAIL</span>;
      default:
        return <span className="px-1.5 py-0.5 bg-slate-700 text-white rounded text-[9px] font-bold tracking-wide">{status}</span>;
    }
  };

  return (
    <div className="card-panel p-4 flex flex-col justify-between transition-all duration-200 hover:border-slate-700/80">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900/90 border border-slate-800 rounded-md shrink-0">
              {getPillarIcon(pillar.id)}
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-white tracking-tight">
                {pillar.name}
              </h3>
              <span className="text-[10px] text-slate-400 block font-medium">
                {pillar.category}
              </span>
            </div>
          </div>
          <div className="shrink-0">
            {getStatusBadge(pillar.status)}
          </div>
        </div>

        {/* Summary */}
        <p className="text-xs text-slate-300 leading-relaxed mb-3.5">
          {pillar.summary}
        </p>

        {/* Progress score bar */}
        <div className="mb-3.5">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-400 font-medium">Posture Compliance</span>
            <span className="text-emerald-400 font-mono font-bold">{pillar.score}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
              style={{ width: `${pillar.score}%` }} 
            />
          </div>
        </div>

        {/* Checklist Accordion */}
        <div className="bg-slate-950/70 rounded-md border border-slate-800/80 overflow-hidden">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-3 py-2 flex items-center justify-between text-xs text-slate-300 hover:text-white hover:bg-slate-900/60 transition-colors"
          >
            <span className="flex items-center gap-1.5 font-medium text-[11px]">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
              Verified Security Controls ({pillar.checks.length})
            </span>
            <span className="text-slate-400 flex items-center gap-1 text-[10px]">
              {isExpanded ? 'Hide Details' : 'Show Details'}
              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </span>
          </button>

          {isExpanded && (
            <div className="p-3 pt-1 space-y-2 border-t border-slate-800/60 divide-y divide-slate-800/40">
              {pillar.checks.map((chk, i) => (
                <div key={i} className="pt-2 first:pt-0 flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[11px] font-semibold text-slate-100">{chk.name}</div>
                      <p className="text-[10px] text-slate-400 leading-snug mt-0.5">{chk.detail}</p>
                    </div>
                  </div>
                  <div className="shrink-0 mt-0.5">
                    {getCheckStatusBadge(chk.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Meta */}
      <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
        <span className="font-mono text-slate-400">Control ID: #{pillar.id}</span>
        <span className="flex items-center gap-1 text-slate-400">
          CIS Benchmark 1.30 Mapping
        </span>
      </div>
    </div>
  );
}
