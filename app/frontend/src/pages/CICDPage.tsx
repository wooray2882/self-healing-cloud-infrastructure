import { useState, useEffect } from 'react';
import { 
  GitPullRequest, 
  GitCommit, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Terminal, 
  Play, 
  RefreshCw, 
  Layers, 
  Sparkles, 
  Zap, 
  FileCode2, 
  Box, 
  Copy,
  Check
} from 'lucide-react';

interface PipelineStage {
  id: string;
  name: string;
  category: 'source' | 'test' | 'security' | 'build' | 'deploy';
  status: 'success' | 'running' | 'queued' | 'failed';
  duration: string;
  description: string;
  logs: string[];
}

interface PipelineRun {
  id: string;
  workflowName: string;
  commitSha: string;
  commitMessage: string;
  author: string;
  branch: string;
  status: 'success' | 'running' | 'failed';
  duration: string;
  timestamp: string;
  stages: PipelineStage[];
}

interface DoraMetrics {
  leadTimeForChanges: string;
  deploymentFrequency: string;
  changeFailureRate: string;
  meanTimeToRecovery: string;
}

interface SecurityScanSummary {
  vulnerabilities: { critical: number; high: number; medium: number; low: number };
  targetImages: string[];
  scanTool: string;
  status: string;
  lastScanned: string;
}

interface CICDData {
  doraMetrics: DoraMetrics;
  securityScan: SecurityScanSummary;
  activeRun: PipelineRun;
  history: PipelineRun[];
}

export default function CICDPage() {
  const [data, setData] = useState<CICDData | null>(null);
  const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchCICD = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('http://localhost:4000/api/cluster/cicd');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (!selectedStage && json.activeRun?.stages?.length > 0) {
          setSelectedStage(json.activeRun.stages[2]); // Default to Trivy Security scan
        }
      }
    } catch (err) {
      console.error('Failed to load CI/CD data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCICD();
    const interval = setInterval(fetchCICD, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerDeployment = async () => {
    setIsTriggering(true);
    setActionMessage('Dispatching GitHub Actions CI/CD workflow...');
    try {
      const res = await fetch('http://localhost:4000/api/cluster/cicd/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch: 'feat/cicd-pipeline-page',
          message: 'feat(cicd): automated zero-downtime deployment rollout'
        })
      });
      if (res.ok) {
        setActionMessage('Pipeline build triggered! Zero-downtime rollout initiated.');
        fetchCICD();
      }
    } catch (err) {
      setActionMessage('Failed to trigger deployment');
    } finally {
      setTimeout(() => {
        setIsTriggering(false);
        setActionMessage(null);
      }, 3500);
    }
  };

  const handleCopyLogs = () => {
    if (selectedStage) {
      navigator.clipboard.writeText(selectedStage.logs.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeRun = data?.activeRun;
  const stages = activeRun?.stages || [];
  const dora = data?.doraMetrics || {
    leadTimeForChanges: '49s',
    deploymentFrequency: 'Continuous',
    changeFailureRate: '0.0%',
    meanTimeToRecovery: '4.2s'
  };
  const security = data?.securityScan;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <GitPullRequest className="h-7 w-7 text-cyan-400" />
            CI/CD & GitOps Delivery Pipeline
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Continuous Integration, DevSecOps vulnerability audits, and Amazon EKS automated rollouts
          </p>
        </div>
        <div className="flex items-center gap-3">
          {actionMessage && (
            <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-lg animate-pulse">
              {actionMessage}
            </span>
          )}
          <button
            onClick={handleTriggerDeployment}
            disabled={isTriggering}
            className="flex items-center gap-2 px-4 py-2 font-bold text-slate-950 transition-all bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 rounded-xl text-xs shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
          >
            <Play className={`h-3.5 w-3.5 ${isTriggering ? 'animate-spin' : 'fill-slate-950'}`} />
            {isTriggering ? 'Triggering Build...' : 'Trigger Pipeline Build'}
          </button>
          <button
            onClick={fetchCICD}
            disabled={refreshing}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Refresh pipeline status"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* DORA Engineering Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-cyan-400" /> Lead Time for Changes</span>
            <span className="text-emerald-400 text-xs font-semibold">Elite Tier</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">{dora.leadTimeForChanges}</div>
          <div className="text-[11px] text-slate-500 mt-1">Git commit push $\rightarrow$ live on EKS</div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-amber-400" /> Deployment Frequency</span>
            <span className="text-emerald-400 text-xs font-semibold">Continuous</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">On-Demand</div>
          <div className="text-[11px] text-slate-500 mt-1">Automated GitHub Actions triggers</div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Change Failure Rate</span>
            <span className="text-emerald-400 text-xs font-semibold">0 Failures</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">{dora.changeFailureRate}</div>
          <div className="text-[11px] text-slate-500 mt-1">Validated via automated probes</div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-violet-400" /> Mean Time to Recovery</span>
            <span className="text-cyan-400 text-xs font-semibold">AI Autopilot</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">{dora.meanTimeToRecovery}</div>
          <div className="text-[11px] text-slate-500 mt-1">Bedrock closed-loop remediation</div>
        </div>
      </div>

      {/* Active Pipeline Flow (DAG) */}
      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-5.5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-bold">
                Run #{activeRun?.id || 'run-1042'}
              </span>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {activeRun?.workflowName || 'Deploy to ECR & EKS'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <GitCommit className="h-3.5 w-3.5 text-slate-500" />
              <span className="font-mono text-slate-300">{activeRun?.commitSha}</span>
              <span>•</span>
              <span className="text-slate-300">{activeRun?.commitMessage}</span>
              <span>•</span>
              <span className="text-slate-500">by {activeRun?.author} ({activeRun?.timestamp})</span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-slate-400 font-mono">Duration: <strong className="text-white">{activeRun?.duration || '49s'}</strong></span>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Pipeline Succeeded
            </span>
          </div>
        </div>

        {/* Visual Stages Flow (Left-to-Right DAG) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {stages.map((stage) => {
            const isSelected = selectedStage?.id === stage.id;
            return (
              <div key={stage.id} className="relative flex flex-col">
                <button
                  onClick={() => setSelectedStage(stage)}
                  className={`p-4 rounded-xl text-left border transition-all h-full flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500/60 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/40'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg ${
                        stage.category === 'source' ? 'bg-cyan-500/10 text-cyan-400' :
                        stage.category === 'test' ? 'bg-indigo-500/10 text-indigo-400' :
                        stage.category === 'security' ? 'bg-emerald-500/10 text-emerald-400' :
                        stage.category === 'build' ? 'bg-violet-500/10 text-violet-400' :
                        'bg-rose-500/10 text-rose-400'
                      }`}>
                        {stage.category === 'source' && <GitPullRequest className="h-4 w-4" />}
                        {stage.category === 'test' && <FileCode2 className="h-4 w-4" />}
                        {stage.category === 'security' && <ShieldCheck className="h-4 w-4" />}
                        {stage.category === 'build' && <Box className="h-4 w-4" />}
                        {stage.category === 'deploy' && <Layers className="h-4 w-4" />}
                      </div>

                      <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> {stage.duration}
                      </span>
                    </div>

                    <h3 className={`text-xs font-bold transition-colors ${
                      isSelected ? 'text-cyan-400' : 'text-white group-hover:text-cyan-400'
                    }`}>
                      {stage.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                      {stage.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="capitalize">{stage.category} Stage</span>
                    <span className="font-semibold text-slate-400 group-hover:text-cyan-300">View Logs ➔</span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal Logs & Security Scorecard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Terminal Logs Drawer */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-5 shadow-xl lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  Stage Execution Logs: <span className="text-cyan-400 font-mono">{selectedStage?.name || 'Select a Stage'}</span>
                </h3>
              </div>
              <button
                onClick={handleCopyLogs}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy Logs'}
              </button>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2 max-h-64 overflow-y-auto border border-slate-800/80">
              {selectedStage?.logs.map((log, i) => (
                <div key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className={`${
                    log.includes('✓') ? 'text-emerald-400 font-semibold' :
                    log.includes('➔') ? 'text-cyan-400' : 'text-slate-300'
                  }`}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span>Runner: <code className="text-slate-300 font-mono">ubuntu-latest (Node 22 / Docker 27)</code></span>
            <span>Authentication: <code className="text-indigo-400 font-mono">AWS OIDC IAM Role</code></span>
          </div>
        </div>

        {/* DevSecOps Trivy Security Audit Scorecard */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">DevSecOps Security Audit</h3>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                PASSED
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              Automated image vulnerability scanning executed via AquaSecurity Trivy before push to AWS ECR.
            </p>

            <div className="grid grid-cols-2 gap-2.5 text-xs mb-4">
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-center">
                <div className="text-lg font-bold text-emerald-400">{security?.vulnerabilities.critical || 0}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Critical CVEs</div>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-center">
                <div className="text-lg font-bold text-emerald-400">{security?.vulnerabilities.high || 0}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">High CVEs</div>
              </div>
            </div>

            <div className="space-y-2 text-xs bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
              <div className="flex justify-between">
                <span className="text-slate-400">Scanner Engine:</span>
                <span className="font-mono text-white text-[11px]">{security?.scanTool || 'AquaSecurity Trivy'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Base Image:</span>
                <span className="font-mono text-cyan-400 text-[11px]">node:22-alpine (Minimal)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Compliance:</span>
                <span className="text-emerald-400 font-semibold">CIS Benchmark Clean</span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-800/60 text-center">
            <span className="text-xs text-slate-400">Images signed and verified in AWS ECR</span>
          </div>
        </div>
      </div>

      {/* Historical Deployment Runs */}
      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-5 shadow-xl">
        <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-cyan-400" />
          Deployment History & Git Traceability
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Run ID</th>
                <th className="py-2.5 px-3">Workflow</th>
                <th className="py-2.5 px-3">Branch</th>
                <th className="py-2.5 px-3">Commit Message</th>
                <th className="py-2.5 px-3">Author</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data?.history?.map(run => (
                <tr key={run.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-cyan-400 font-bold">{run.id}</td>
                  <td className="py-2.5 px-3 font-medium text-white">{run.workflowName}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
                      {run.branch}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px] max-w-[240px] truncate">
                    <span className="text-slate-500 mr-1.5">{run.commitSha}</span>
                    {run.commitMessage}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{run.author}</td>
                  <td className="py-2.5 px-3 font-mono text-white">{run.duration}</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3" /> SUCCESS
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono">{run.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
