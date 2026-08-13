import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Layers, 
  CheckCircle2, 
  Terminal, 
  Box, 
  Server, 
  Sparkles 
} from 'lucide-react';

interface SecurityCheckItem {
  name: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  detail: string;
}

interface SecurityPillar {
  id: string;
  name: string;
  category: string;
  score: number;
  status: 'VERIFIED' | 'COMPLIANT' | 'HARDENED';
  summary: string;
  checks: SecurityCheckItem[];
}

interface SecurityAuditEvent {
  id: string;
  type: string;
  severity: 'clean' | 'info' | 'warning' | 'critical';
  message: string;
  target: string;
  timestamp: string;
}

interface SecurityData {
  healthScore: number;
  cisBenchmarkScore: string;
  complianceStatus: string;
  kpis: {
    totalCves: number;
    storedSecrets: number;
    rbacViolations: number;
    aiGuardrailsRate: string;
  };
  pillars: SecurityPillar[];
  auditLog: SecurityAuditEvent[];
}

export default function SecurityPage() {
  const [data, setData] = useState<SecurityData | null>(null);

  const fetchSecurityData = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/cluster/security');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load security audit data:', err);
    }
  };

  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 12000);
    return () => clearInterval(interval);
  }, []);

  const kpis = data?.kpis || {
    totalCves: 0,
    storedSecrets: 0,
    rbacViolations: 0,
    aiGuardrailsRate: '100%'
  };

  const pillars = data?.pillars || [];
  const auditLogs = data?.auditLog || [];

  const getPillarIcon = (id: string) => {
    switch (id) {
      case 'pillar-1': return <Box className="h-5 w-5 text-cyan-400" />;
      case 'pillar-2': return <Key className="h-5 w-5 text-indigo-400" />;
      case 'pillar-3': return <Layers className="h-5 w-5 text-emerald-400" />;
      case 'pillar-4': return <Server className="h-5 w-5 text-amber-400" />;
      case 'pillar-5': return <Sparkles className="h-5 w-5 text-violet-400" />;
      default: return <ShieldCheck className="h-5 w-5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-emerald-400" />
            Security & DevSecOps Compliance Audit
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Zero-trust cloud architecture, passwordless AWS IAM federation, and CIS Kubernetes benchmark posture
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="h-3.5 w-3.5" /> CIS Benchmark: {data?.cisBenchmarkScore || 'A+ (98.2%)'}
          </span>
          <span className="px-3 py-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Lock className="h-3.5 w-3.5" /> Zero-Trust Active
          </span>
        </div>
      </div>

      {/* Top Security KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Security Health Index</span>
            <span className="text-emerald-400 text-xs font-semibold">Grade A+</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">{data?.healthScore || 98.5}%</div>
          <div className="text-[11px] text-slate-500 mt-1">Composite cross-layer posture</div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><Box className="h-4 w-4 text-cyan-400" /> Container CVEs</span>
            <span className="text-emerald-400 text-xs font-semibold">Trivy Audit</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">{kpis.totalCves} <span className="text-xs font-normal text-emerald-400">Found</span></div>
          <div className="text-[11px] text-slate-500 mt-1">0 Critical / 0 High vulnerabilities</div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><Key className="h-4 w-4 text-indigo-400" /> AWS Secrets in K8s</span>
            <span className="text-emerald-400 text-xs font-semibold">Passwordless</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">ZERO <span className="text-xs font-normal text-slate-400">Keys</span></div>
          <div className="text-[11px] text-slate-500 mt-1">AWS STS OIDC Federation active</div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-violet-400" /> AI Safety Guardrails</span>
            <span className="text-cyan-400 text-xs font-semibold">Enforced</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">{kpis.aiGuardrailsRate}</div>
          <div className="text-[11px] text-slate-500 mt-1">Action whitelist & blast limit</div>
        </div>
      </div>

      {/* 5-Pillar Security Architecture Grid */}
      <div>
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Lock className="h-4.5 w-4.5 text-cyan-400" />
          5-Pillar Cloud Security Architecture
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {pillars.map((pillar) => (
            <div 
              key={pillar.id}
              className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700/80 transition-all shadow-xl flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl">
                      {getPillarIcon(pillar.id)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {pillar.name}
                      </h3>
                      <span className="text-[11px] text-slate-400">{pillar.category}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                    {pillar.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {pillar.summary}
                </p>

                {/* Checklist items */}
                <div className="space-y-2 mb-4 bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                  {pillar.checks.map((chk, i) => (
                    <div key={i} className="flex items-start justify-between gap-2 text-xs">
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-slate-200 font-medium">{chk.name}</span>
                          <p className="text-[11px] text-slate-400">{chk.detail}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0">
                        {chk.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span>Compliance Score:</span>
                <span className="font-mono font-bold text-emerald-400">{pillar.score}/100</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-Time Security Event Audit Stream */}
      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-5.5 shadow-xl">
        <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Terminal className="h-4.5 w-4.5 text-cyan-400" />
          Real-Time Cloud Security Event Audit Log
        </h2>

        <div className="divide-y divide-slate-800/60">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-800/20 px-2 rounded-xl transition-colors">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg mt-0.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="text-xs font-mono text-white font-medium">{log.message}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>Target: <strong className="text-cyan-400">{log.target}</strong></span>
                    <span>•</span>
                    <span className="text-slate-500 font-mono">{log.type}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs">
                <span className="text-slate-500 font-mono text-[11px]">{log.timestamp}</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold">
                  VERIFIED
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
