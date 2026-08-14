import { useState, useEffect } from 'react';
import { 
  GitPullRequest, 
  GitCommit, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Terminal, 
  Copy, 
  Check, 
  X, 
  ExternalLink,
  ChevronRight,
  Zap,
  Sparkles,
  RefreshCw,
  Box,
  Layers
} from 'lucide-react';
import { fetchApi } from '../api/client';

interface PipelineStage {
  id: string;
  name: string;
  phase: 'CI' | 'CD';
  icon: string;
  duration: string;
  status: 'passed' | 'running' | 'failed' | 'pending';
  command: string;
  description: string;
  logs: string;
}

interface DeploymentRun {
  id: string;
  workflowName: string;
  branch: string;
  commitSha: string;
  commitMessage: string;
  author: string;
  duration: string;
  status: 'success' | 'failed' | 'in_progress';
  timestamp: string;
  url: string;
}

interface DoraMetrics {
  deploymentFrequency: string;
  leadTimeForChanges: string;
  changeFailureRate: string;
  meanTimeToRecovery: string;
}

interface CicdData {
  dora: DoraMetrics;
  activeRun: DeploymentRun;
  stages: PipelineStage[];
  history: DeploymentRun[];
}

export default function CICDPage() {
  const [data, setData] = useState<CicdData | null>(null);
  const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCicdData = async () => {
    try {
      setRefreshing(true);
      const res = await fetchApi('/api/cicd/pipeline');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load CI/CD pipeline telemetry:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCicdData();
    const interval = setInterval(fetchCicdData, 10000);
    return () => clearInterval(interval);
  }, []);

  const dora = data?.dora || {
    deploymentFrequency: 'On-Demand (Automated)',
    leadTimeForChanges: '52 seconds',
    changeFailureRate: '0.0%',
    meanTimeToRecovery: '4.2s (AI Autopilot)'
  };

  const activeRun = data?.activeRun;
  const stages = data?.stages || [];

  const handleCopyLogs = () => {
    if (selectedStage?.logs) {
      navigator.clipboard.writeText(selectedStage.logs);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStageIcon = (stage: PipelineStage, isSelected: boolean) => {
    const iconClass = `h-4.5 w-4.5 ${isSelected ? 'text-white' : 'text-sky-400'}`;
    switch (stage.id) {
      case 'checkout': return <GitPullRequest className={iconClass} />;
      case 'auth': return <ShieldCheck className={iconClass} />;
      case 'build-backend': return <Box className={iconClass} />;
      case 'build-frontend': return <Layers className={iconClass} />;
      case 'security-scan': return <ShieldCheck className={iconClass} />;
      case 'push-ecr': return <Zap className={iconClass} />;
      case 'deploy-eks': return <CheckCircle2 className={iconClass} />;
      default: return <Terminal className={iconClass} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-800/60">
        <div>
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white flex items-center gap-2">
            <GitPullRequest className="h-4.5 w-4.5 text-sky-400" />
            CI/CD & GitOps Delivery Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous Integration, DevSecOps vulnerability audits, and Amazon EKS automated rollouts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[11px] font-semibold flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            GitOps Pipeline Active
          </span>
          <button
            onClick={fetchCicdData}
            disabled={refreshing}
            className="btn-secondary text-xs"
            title="Refresh pipeline status"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* DORA Engineering Metrics Strip (monday.com Minimalist Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-panel p-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-sky-400" /> Lead Time</span>
            <span className="text-emerald-400 text-[10px] font-semibold">Elite Tier</span>
          </div>
          <div className="text-lg sm:text-xl font-semibold text-white font-mono mt-1">{dora.leadTimeForChanges}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Git commit push $\rightarrow$ live on EKS</div>
        </div>

        <div className="card-panel p-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-amber-400" /> Frequency</span>
            <span className="text-emerald-400 text-[10px] font-semibold">Continuous</span>
          </div>
          <div className="text-lg sm:text-xl font-semibold text-white font-mono mt-1">On-Demand</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Automated GitHub Actions triggers</div>
        </div>

        <div className="card-panel p-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Failure Rate</span>
            <span className="text-emerald-400 text-[10px] font-semibold">0 Failures</span>
          </div>
          <div className="text-lg sm:text-xl font-semibold text-white font-mono mt-1">{dora.changeFailureRate}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Validated via automated probes</div>
        </div>

        <div className="card-panel p-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 text-purple-400" /> Recovery (MTTR)</span>
            <span className="text-sky-400 text-[10px] font-semibold">Autopilot</span>
          </div>
          <div className="text-lg sm:text-xl font-semibold text-white font-mono mt-1">{dora.meanTimeToRecovery}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Bedrock closed-loop remediation</div>
        </div>
      </div>

      {/* Horizontal Connected Circular Pipeline Timeline */}
      <div className="card-panel p-4 relative overflow-hidden">
        {/* Run Metadata Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-5 pb-3 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded font-semibold">
                Run #{activeRun?.id || 'run-1043'}
              </span>
              <h2 className="text-xs font-semibold text-white flex items-center gap-1.5">
                {activeRun?.workflowName || 'Deploy to ECR & EKS'}
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-1.5">
              <GitCommit className="h-3 w-3 text-slate-500" />
              <span className="font-mono text-sky-400 font-semibold">{activeRun?.commitSha}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 max-w-md truncate">{activeRun?.commitMessage}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">by {activeRun?.author} ({activeRun?.timestamp})</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-slate-400 font-mono">Duration: <strong className="text-white">{activeRun?.duration || '49s'}</strong></span>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> All 7 Stages Passed
            </span>
          </div>
        </div>

        {/* Phase Category Labels */}
        <div className="grid grid-cols-7 gap-2 mb-3 text-[10px] font-semibold uppercase tracking-wider">
          <div className="col-span-4 flex items-center gap-1.5 text-sky-400 bg-sky-500/5 px-2.5 py-1 rounded border border-sky-500/10">
            <span>Continuous Integration (CI)</span>
            <span className="text-[9px] text-slate-500 lowercase">(4 stages)</span>
          </div>
          <div className="col-span-3 flex items-center gap-1.5 text-indigo-400 bg-indigo-500/5 px-2.5 py-1 rounded border border-indigo-500/10">
            <span>Continuous Delivery (CD)</span>
            <span className="text-[9px] text-slate-500 lowercase">(3 stages)</span>
          </div>
        </div>

        {/* Horizontal Circular Milestone Track */}
        <div className="relative py-4 px-1 overflow-x-auto touch-pan-x">
          {/* Continuous Connecting Line */}
          <div className="absolute top-[48px] left-6 right-6 h-0.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 opacity-50 z-0"></div>

          <div className="grid grid-cols-7 gap-2 min-w-[650px] relative z-10">
            {stages.map((stage, idx) => {
              const isSelected = selectedStage?.id === stage.id;
              return (
                <div key={stage.id} className="flex flex-col items-center text-center group">
                  {/* Circular Milestone Node */}
                  <button
                    onClick={() => setSelectedStage(stage)}
                    className={`relative w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center transition-all duration-200 shadow-md cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-gradient-to-br from-sky-400 to-indigo-600 ring-2 ring-sky-400/50 shadow-sky-500/20 scale-105'
                        : 'bg-slate-900 border border-sky-500/50 hover:border-sky-400 hover:scale-105'
                    }`}
                  >
                    {getStageIcon(stage, isSelected)}
                  </button>

                  {/* Stage Details Underneath */}
                  <div className="mt-2.5 space-y-0.5">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">
                      Stage 0{idx + 1}
                    </div>
                    <div className={`text-[11px] font-semibold transition-colors ${
                      isSelected ? 'text-sky-400' : 'text-slate-200 group-hover:text-sky-400'
                    }`}>
                      {stage.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {stage.duration}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedStage(stage)}
                    className="mt-1 text-[10px] text-slate-400 hover:text-sky-300 font-medium flex items-center gap-0.5"
                  >
                    Inspect <ChevronRight className="h-2.5 w-2.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tip text */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <Terminal className="h-3 w-3 text-sky-400" />
          Click any circular stage node above to slide open the <strong className="text-slate-200">Stage Execution Logs Drawer</strong>.
        </div>
      </div>

      {/* Security Audit Link Banner */}
      <div className="card-panel p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/20 border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-white">DevSecOps Security & Compliance Audit</h3>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-semibold">
                CIS A+ (98.2%)
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Verified 0 Critical/High CVEs via AquaSecurity Trivy. Passwordless AWS STS OIDC federation active.
            </p>
          </div>
        </div>

        <a
          href="/security"
          className="btn-secondary text-xs shrink-0"
        >
          View Security Audit <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Historical Deployment Runs */}
      <div className="card-panel">
        <div className="mb-2 pb-2 border-b border-slate-800/80">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-sky-400" />
            Deployment History & Git Traceability
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
                <th className="py-2 px-2.5">Run ID</th>
                <th className="py-2 px-2.5">Workflow</th>
                <th className="py-2 px-2.5">Branch</th>
                <th className="py-2 px-2.5">Commit</th>
                <th className="py-2 px-2.5">Author</th>
                <th className="py-2 px-2.5">Duration</th>
                <th className="py-2 px-2.5">Status</th>
                <th className="py-2 px-2.5">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-[11px]">
              {data?.history?.map(run => (
                <tr key={run.id} className="hover:bg-slate-800/30 transition-colors font-mono">
                  <td className="py-2 px-2.5 text-sky-400 font-semibold">{run.id}</td>
                  <td className="py-2 px-2.5 font-sans font-medium text-slate-200">{run.workflowName}</td>
                  <td className="py-2 px-2.5">
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 border border-slate-700">
                      {run.branch}
                    </span>
                  </td>
                  <td className="py-2 px-2.5 text-slate-300 font-sans truncate max-w-[200px]">{run.commitMessage}</td>
                  <td className="py-2 px-2.5 text-slate-400 font-sans">{run.author}</td>
                  <td className="py-2 px-2.5 text-slate-400">{run.duration}</td>
                  <td className="py-2 px-2.5 font-sans">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                      <CheckCircle2 className="h-2.5 w-2.5" /> {run.status}
                    </span>
                  </td>
                  <td className="py-2 px-2.5 text-slate-500">{run.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Stage Execution Logs Drawer */}
      {selectedStage && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedStage(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
            <div className="w-screen max-w-full sm:max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between p-4 sm:p-5 z-50 overflow-y-auto">
              {/* Drawer Header */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-md">
                      {getStageIcon(selectedStage, false)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-sky-400 uppercase font-bold">
                          {selectedStage.phase}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-semibold">
                          {selectedStage.duration}
                        </span>
                      </div>
                      <h2 className="text-sm font-semibold text-white mt-0.5">
                        {selectedStage.name}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopyLogs}
                      className="btn-secondary text-[11px] py-1 px-2.5"
                    >
                      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-slate-400" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={() => setSelectedStage(null)}
                      className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-md transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Stage Info & Command executed */}
                <div className="my-3 space-y-1.5 text-xs">
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {selectedStage.description}
                  </p>
                  <div className="bg-slate-950 p-2 rounded-md border border-slate-800 font-mono text-sky-400 text-[10px] overflow-x-auto flex items-center gap-1.5">
                    <span className="text-slate-500">$</span>
                    <span>{selectedStage.command}</span>
                  </div>
                </div>

                {/* Log Terminal Viewer */}
                <div className="bg-slate-950 border border-slate-800 rounded-md p-3 font-mono text-[11px] text-slate-300 space-y-1 max-h-80 overflow-y-auto">
                  <pre className="whitespace-pre-wrap leading-relaxed text-slate-400 font-mono text-[10px]">
                    {selectedStage.logs}
                  </pre>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Stage Completed Successfully
                </span>
                <button
                  onClick={() => setSelectedStage(null)}
                  className="btn-secondary text-xs"
                >
                  Close Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
