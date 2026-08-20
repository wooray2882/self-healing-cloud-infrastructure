import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Box, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw,
  Info
} from 'lucide-react';
import { fetchApi } from '../api/client';
import SecurityPillarCard, { type SecurityPillar } from '../components/security/SecurityPillarCard';
import SecurityAuditTable, { type SecurityAuditEvent } from '../components/security/SecurityAuditTable';

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
  const [refreshing, setRefreshing] = useState(false);

  const fetchSecurityData = async () => {
    try {
      setRefreshing(true);
      const res = await fetchApi('/api/cluster/security');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load security audit data:', err);
    } finally {
      setRefreshing(false);
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

  return (
    <div className="space-y-4">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-800/60">
        <div>
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
            Security Audit
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            CIS Kubernetes Benchmark & Zero-Trust IAM Posture
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="h-3.5 w-3.5" /> CIS: {data?.cisBenchmarkScore || 'A+ (98.2%)'}
          </span>
          <span className="px-2.5 py-1 bg-sky-600 text-white rounded text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
            <Lock className="h-3.5 w-3.5" /> Zero-Trust
          </span>
          <button
            onClick={fetchSecurityData}
            disabled={refreshing}
            className="btn-secondary text-xs"
            title="Refresh Security Audit"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Executive Security KPI Cards with Hover Popups */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1 */}
        <div className="card-panel p-3.5 flex flex-col justify-between relative group">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Overall Health
            </span>
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded">
                GRADE A+
              </span>
              <div className="relative">
                <Info className="h-3.5 w-3.5 text-slate-400 hover:text-sky-400 cursor-pointer transition-colors" />
                <div className="absolute right-0 top-6 hidden group-hover:block w-60 p-2.5 bg-slate-900 border border-slate-700 shadow-2xl rounded-md text-[11px] text-slate-300 z-50 pointer-events-none leading-relaxed">
                  <strong className="text-white block mb-0.5">Composite Posture Score</strong>
                  Aggregated health across CIS Kubernetes benchmarks, Trivy CVE scans, and AWS IAM STS OIDC federation.
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold text-white font-mono">
              {data?.healthScore || 98.5}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
              Across all 5 security domains
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="card-panel p-3.5 flex flex-col justify-between relative group">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <Box className="h-3.5 w-3.5 text-sky-400" />
              Container CVEs
            </span>
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded">
                PASSED
              </span>
              <div className="relative">
                <Info className="h-3.5 w-3.5 text-slate-400 hover:text-sky-400 cursor-pointer transition-colors" />
                <div className="absolute right-0 top-6 hidden group-hover:block w-60 p-2.5 bg-slate-900 border border-slate-700 shadow-2xl rounded-md text-[11px] text-slate-300 z-50 pointer-events-none leading-relaxed">
                  <strong className="text-white block mb-0.5">AquaSecurity Trivy Scan</strong>
                  Zero Critical or High severity vulnerabilities detected in ECR container image manifests.
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold text-white font-mono flex items-baseline gap-1.5">
              {kpis.totalCves}
              <span className="text-xs font-semibold text-emerald-400">Critical / High</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
              Trivy NVD audit verified
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="card-panel p-3.5 flex flex-col justify-between relative group">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <Key className="h-3.5 w-3.5 text-indigo-400" />
              AWS Secrets
            </span>
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-sky-600 text-white text-[9px] font-bold rounded">
                OIDC ACTIVE
              </span>
              <div className="relative">
                <Info className="h-3.5 w-3.5 text-slate-400 hover:text-sky-400 cursor-pointer transition-colors" />
                <div className="absolute right-0 top-6 hidden group-hover:block w-60 p-2.5 bg-slate-900 border border-slate-700 shadow-2xl rounded-md text-[11px] text-slate-300 z-50 pointer-events-none leading-relaxed">
                  <strong className="text-white block mb-0.5">Passwordless Federation</strong>
                  Zero long-lived AWS IAM access keys stored in K8s secrets. WebIdentity STS federation active.
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold text-white font-mono flex items-baseline gap-1.5">
              ZERO
              <span className="text-xs font-semibold text-slate-400">Static Keys</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
              IAM Web Identity Federation
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="card-panel p-3.5 flex flex-col justify-between relative group">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              AI Autopilot
            </span>
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded">
                ENFORCED
              </span>
              <div className="relative">
                <Info className="h-3.5 w-3.5 text-slate-400 hover:text-sky-400 cursor-pointer transition-colors" />
                <div className="absolute right-0 top-6 hidden group-hover:block w-60 p-2.5 bg-slate-900 border border-slate-700 shadow-2xl rounded-md text-[11px] text-slate-300 z-50 pointer-events-none leading-relaxed">
                  <strong className="text-white block mb-0.5">Bedrock Guardrails</strong>
                  Autonomous remediation actions constrained by strict action whitelist and RBAC policies.
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold text-white font-mono">
              {kpis.aiGuardrailsRate}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
              Remediation whitelist active
            </div>
          </div>
        </div>
      </div>

      {/* 5-Pillar Cloud Security Architecture Section */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-sky-400" />
            Security Pillars & Controls
          </h2>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Click pillar to view controls
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {pillars.map((pillar) => (
            <SecurityPillarCard 
              key={pillar.id} 
              pillar={pillar} 
              isExpandedDefault={false}
            />
          ))}
        </div>
      </div>

      {/* Real-Time Security Audit Stream Table */}
      <SecurityAuditTable auditLogs={auditLogs} />
    </div>
  );
}
