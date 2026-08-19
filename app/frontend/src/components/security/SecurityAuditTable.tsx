import { useState } from 'react';
import { 
  Terminal, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Info 
} from 'lucide-react';

export interface SecurityAuditEvent {
  id: string;
  type: string;
  severity: 'clean' | 'info' | 'warning' | 'critical';
  message: string;
  target: string;
  timestamp: string;
}

interface SecurityAuditTableProps {
  auditLogs: SecurityAuditEvent[];
}

export default function SecurityAuditTable({ auditLogs }: SecurityAuditTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const filterCategories = [
    { id: 'ALL', label: 'All Events' },
    { id: 'IAM', label: 'AWS IAM STS' },
    { id: 'TRIVY', label: 'Trivy CVEs' },
    { id: 'AI', label: 'AI Guardrails' },
    { id: 'RBAC', label: 'K8s RBAC' },
    { id: 'KMS', label: 'AWS KMS' },
  ];

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.type.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'IAM') return log.type.includes('IAM') || log.target.includes('IAM');
    if (selectedFilter === 'TRIVY') return log.type.includes('TRIVY') || log.target.includes('Trivy');
    if (selectedFilter === 'AI') return log.type.includes('AI') || log.target.includes('Bedrock');
    if (selectedFilter === 'RBAC') return log.type.includes('RBAC') || log.target.includes('RBAC');
    if (selectedFilter === 'KMS') return log.type.includes('KMS') || log.target.includes('KMS');

    return true;
  });

  const getSeverityBadge = (severity: 'clean' | 'info' | 'warning' | 'critical') => {
    switch (severity) {
      case 'clean':
        return (
          <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold tracking-wide uppercase flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> VERIFIED
          </span>
        );
      case 'info':
        return (
          <span className="px-2 py-0.5 bg-sky-600 text-white rounded text-[10px] font-bold tracking-wide uppercase flex items-center gap-1">
            <Info className="h-3 w-3" /> INFO
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded text-[10px] font-bold tracking-wide uppercase flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> WARN
          </span>
        );
      case 'critical':
        return (
          <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold tracking-wide uppercase flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> CRITICAL
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-slate-700 text-white rounded text-[10px] font-bold tracking-wide uppercase">
            {severity}
          </span>
        );
    }
  };

  return (
    <div className="card-panel">
      {/* Header with Search and Filter */}
      <div className="p-4 pb-3 border-b border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
              <Terminal className="h-4 w-4 text-sky-400" />
              Real-Time DevSecOps Security Audit Log
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live cryptographic verification stream of AWS STS authentication, Trivy CVE scans, and AI safety guardrails
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {filterCategories.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all whitespace-nowrap ${
                selectedFilter === tab.id
                  ? 'bg-sky-600 text-white font-bold shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table / Stream */}
      <div className="divide-y divide-slate-800/60">
        {filteredLogs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No security audit events match the current search filter.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div 
              key={log.id} 
              className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/20 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-slate-900 border border-slate-800 text-sky-400 rounded mt-0.5 shrink-0">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-mono text-slate-200 leading-relaxed">
                    {log.message}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                    <span>
                      Target: <strong className="text-sky-400 font-semibold">{log.target}</strong>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800/80">
                      {log.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <span className="text-[11px] text-slate-400 font-mono">
                  {log.timestamp}
                </span>
                {getSeverityBadge(log.severity)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-slate-950/50 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          Showing {filteredLogs.length} verified security audit records
        </span>
        <span className="font-mono text-slate-400">Immutable Hash Stream Active</span>
      </div>
    </div>
  );
}
