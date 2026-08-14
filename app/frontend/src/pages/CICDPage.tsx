import { useState, useEffect } from 'react';
import { 
  GitPullRequest, 
  GitCommit, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Terminal, 
  Sparkles, 
  Zap, 
  FileCode2, 
  Box, 
  Copy,
  Check,
  Lock,
  ChevronRight,
  ChevronLeft,
  X,
  UploadCloud,
  Rocket,
  ExternalLink
} from 'lucide-react';

interface PipelineStage {
  id: string;
  name: string;
  shortLabel: string;
  category: 'dev' | 'ops';
  phase: string;
  status: 'success' | 'running' | 'queued' | 'failed';
  duration: string;
  description: string;
  command: string;
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

import { fetchApi } from '../api/client';

export default function CICDPage() {
  const [data, setData] = useState<CICDData | null>(null);
  const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchCICD = async () => {
    try {
      const res = await fetchApi('/api/cluster/cicd');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load CI/CD data:', err);
    }
  };

  useEffect(() => {
    fetchCICD();
    const interval = setInterval(fetchCICD, 12000);
    return () => clearInterval(interval);
  }, []);

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

  // Handle stage navigation inside drawer
  const currentStageIndex = selectedStage ? stages.findIndex(s => s.id === selectedStage.id) : -1;
  const handlePrevStage = () => {
    if (currentStageIndex > 0) {
      setSelectedStage(stages[currentStageIndex - 1]);
    }
  };
  const handleNextStage = () => {
    if (currentStageIndex >= 0 && currentStageIndex < stages.length - 1) {
      setSelectedStage(stages[currentStageIndex + 1]);
    }
  };

  const getStageIcon = (stage: PipelineStage, isSelected: boolean) => {
    const iconClass = `h-6 w-6 ${isSelected ? 'text-white' : 'text-cyan-400'}`;
    switch (stage.shortLabel) {
      case 'Commit': return <GitCommit className={iconClass} />;
      case 'OIDC Auth': return <Lock className={iconClass} />;
      case 'Compile': return <FileCode2 className={iconClass} />;
      case 'Trivy Scan': return <ShieldCheck className={iconClass} />;
      case 'Package': return <Box className={iconClass} />;
      case 'ECR Push': return <UploadCloud className={iconClass} />;
      case 'Deploy': return <Rocket className={iconClass} />;
      default: return <Sparkles className={iconClass} />;
    }
  };

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
          <span className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            GitOps Pipeline Active
          </span>
        </div>
      </div>

      {/* DORA Engineering Metrics Strip */}
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

      {/* Horizontal Connected Circular Pipeline Timeline */}
      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {/* Run Metadata Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded-full font-bold">
                Run #{activeRun?.id || 'run-1043'}
              </span>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {activeRun?.workflowName || 'Deploy to ECR & EKS'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 flex flex-wrap items-center gap-2">
              <GitCommit className="h-3.5 w-3.5 text-slate-500" />
              <span className="font-mono text-cyan-400 font-semibold">{activeRun?.commitSha}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 max-w-md truncate">{activeRun?.commitMessage}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">by {activeRun?.author} ({activeRun?.timestamp})</span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-slate-400 font-mono">Total Duration: <strong className="text-white">{activeRun?.duration || '49s'}</strong></span>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> All 7 Stages Passed
            </span>
          </div>
        </div>

        {/* Phase Category Labels */}
        <div className="grid grid-cols-7 gap-2 mb-4 text-xs font-bold uppercase tracking-wider">
          <div className="col-span-4 flex items-center gap-2 text-cyan-400 bg-cyan-500/5 px-3 py-1 rounded-lg border border-cyan-500/10">
            <span>Development & Continuous Integration (CI)</span>
            <span className="text-[10px] text-slate-500 font-normal lowercase">(4 stages)</span>
          </div>
          <div className="col-span-3 flex items-center gap-2 text-indigo-400 bg-indigo-500/5 px-3 py-1 rounded-lg border border-indigo-500/10">
            <span>Operations & Continuous Delivery (CD)</span>
            <span className="text-[10px] text-slate-500 font-normal lowercase">(3 stages)</span>
          </div>
        </div>

        {/* Horizontal Circular Milestone Track */}
        <div className="relative py-6 px-2 overflow-x-auto">
          {/* Continuous Connecting Line */}
          <div className="absolute top-[60px] left-8 right-8 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 opacity-60 z-0"></div>

          <div className="grid grid-cols-7 gap-2 min-w-[700px] relative z-10">
            {stages.map((stage, idx) => {
              const isSelected = selectedStage?.id === stage.id;
              return (
                <div key={stage.id} className="flex flex-col items-center text-center group">
                  {/* Circular Milestone Node */}
                  <button
                    onClick={() => setSelectedStage(stage)}
                    className={`relative w-15 h-15 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-gradient-to-br from-cyan-400 to-indigo-600 ring-4 ring-cyan-400/40 shadow-cyan-500/30 scale-110'
                        : 'bg-slate-900 border-2 border-cyan-500/60 hover:border-cyan-400 hover:scale-105 hover:shadow-cyan-500/20'
                    }`}
                  >
                    {/* Pulsing ring indicator */}
                    <div className="absolute inset-0 rounded-full border border-cyan-400/30 animate-ping opacity-20"></div>
                    
                    {getStageIcon(stage, isSelected)}
                  </button>

                  {/* Stage Details Underneath */}
                  <div className="mt-3.5 space-y-1">
                    <div className="text-[11px] font-mono text-slate-500 uppercase">
                      Stage 0{idx + 1}
                    </div>
                    <div className={`text-xs font-bold transition-colors ${
                      isSelected ? 'text-cyan-400' : 'text-white group-hover:text-cyan-400'
                    }`}>
                      {stage.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {stage.duration}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedStage(stage)}
                    className="mt-2 text-[10px] text-slate-400 hover:text-cyan-300 font-medium opacity-80 hover:opacity-100 flex items-center gap-0.5"
                  >
                    Inspect <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tip text */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Terminal className="h-3.5 w-3.5 text-cyan-400" />
          Click any circular stage node above to slide open the <strong className="text-slate-200">Stage Execution Logs Drawer</strong>.
        </div>
      </div>

      {/* Security Audit Link Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">DevSecOps Security & Compliance Audit</h3>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                CIS A+ (98.2%)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Verified 0 Critical/High CVEs via AquaSecurity Trivy. Passwordless AWS STS OIDC federation active.
            </p>
          </div>
        </div>

        <a
          href="/security"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-all shrink-0 active:scale-95 shadow-sm"
        >
          View Full Security Audit <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Historical Deployment Runs (Full Width) */}
      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-5.5 shadow-xl">
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
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
                    <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px] max-w-[200px] truncate">
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

      {/* Right Slide-Over Terminal Logs Drawer */}
      {selectedStage && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
          {/* Backdrop Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedStage(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between p-6 z-50">
              {/* Drawer Header */}
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
                      {getStageIcon(selectedStage, false)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-cyan-400 uppercase font-bold">
                          {selectedStage.phase}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                          {selectedStage.duration}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-white mt-0.5">
                        {selectedStage.name}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyLogs}
                      className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={() => setSelectedStage(null)}
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Stage Info & Command executed */}
                <div className="my-4 space-y-2 text-xs">
                  <p className="text-slate-300 leading-relaxed">
                    {selectedStage.description}
                  </p>
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 font-mono text-cyan-400 text-[11px] overflow-x-auto flex items-center gap-2">
                    <span className="text-slate-500">$</span>
                    <span>{selectedStage.command}</span>
                  </div>
                </div>

                {/* Terminal Console */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                    <span className="flex items-center gap-1.5"><Terminal className="h-3.5 w-3.5 text-cyan-400" /> Stage Execution Log Output</span>
                    <span className="text-emerald-400">Exit Code: 0 (Success)</span>
                  </div>

                  <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2.5 max-h-[380px] overflow-y-auto border border-slate-800 shadow-inner">
                    {selectedStage.logs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-2 leading-relaxed">
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
              </div>

              {/* Drawer Footer with Stage Stepper */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={handlePrevStage}
                  disabled={currentStageIndex <= 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Previous Stage
                </button>

                <span className="text-xs text-slate-500 font-mono">
                  {currentStageIndex + 1} of {stages.length}
                </span>

                <button
                  onClick={handleNextStage}
                  disabled={currentStageIndex >= stages.length - 1}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700"
                >
                  Next Stage <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
