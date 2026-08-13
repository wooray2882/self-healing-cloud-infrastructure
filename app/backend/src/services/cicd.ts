export interface PipelineStage {
  id: string;
  name: string;
  category: 'source' | 'test' | 'security' | 'build' | 'deploy';
  status: 'success' | 'running' | 'queued' | 'failed';
  duration: string;
  description: string;
  logs: string[];
}

export interface PipelineRun {
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

export interface DoraMetrics {
  leadTimeForChanges: string;
  deploymentFrequency: string;
  changeFailureRate: string;
  meanTimeToRecovery: string;
}

export interface SecurityScanSummary {
  vulnerabilities: { critical: number; high: number; medium: number; low: number };
  targetImages: string[];
  scanTool: string;
  status: string;
  lastScanned: string;
}

export interface CICDData {
  doraMetrics: DoraMetrics;
  securityScan: SecurityScanSummary;
  activeRun: PipelineRun;
  history: PipelineRun[];
}

const defaultStages: PipelineStage[] = [
  {
    id: 'stage-1',
    name: 'Source & Git Checkout',
    category: 'source',
    status: 'success',
    duration: '2s',
    description: 'Fetch commit refs and configure AWS OIDC authentication token',
    logs: [
      '[00:00:01] ➔ actions/checkout@v4: Fetching repository wooray2882/self-healing-cloud-infrastructure',
      '[00:00:01] ➔ HEAD is now at 6a496a9 (feat/cicd-pipeline-page)',
      '[00:00:02] ➔ aws-actions/configure-aws-credentials@v4: Assuming role arn:aws:iam::000622214837:role/healops-dev-github-actions-role',
      '[00:00:02] ✓ OIDC web identity token exchanged successfully with AWS STS (us-east-1)'
    ]
  },
  {
    id: 'stage-2',
    name: 'Lint & Typecheck',
    category: 'test',
    status: 'success',
    duration: '6s',
    description: 'Strict TypeScript compilation and lint verification on Node 22',
    logs: [
      '[00:00:02] ➔ npm ci in ./app/backend and ./app/frontend',
      '[00:00:04] ➔ tsc -b: Validating strict null checks and module boundaries',
      '[00:00:06] ➔ vite build: Validating React bundling & tree shaking',
      '[00:00:08] ✓ Typecheck passed with 0 errors across 2,820 modules'
    ]
  },
  {
    id: 'stage-3',
    name: 'Trivy DevSecOps Scan',
    category: 'security',
    status: 'success',
    duration: '8s',
    description: 'AquaSecurity Trivy container image vulnerability and CVE scanner',
    logs: [
      '[00:00:08] ➔ aquasecurity/trivy-action: Initializing CVE vulnerability database',
      '[00:00:10] ➔ Scanning image healops-backend:test (OS: alpine 3.21, Library: nodejs)',
      '[00:00:13] ➔ Scanning image healops-frontend:test (OS: alpine 3.21, Library: nginx)',
      '[00:00:16] ✓ Trivy audit complete: 0 CRITICAL, 0 HIGH, 0 MEDIUM vulnerabilities. Status: PASSED'
    ]
  },
  {
    id: 'stage-4',
    name: 'Docker Build & ECR Push',
    category: 'build',
    status: 'success',
    duration: '21s',
    description: 'Multi-stage Docker builds tagged with git SHA and latest pushed to ECR',
    logs: [
      '[00:00:16] ➔ aws-actions/amazon-ecr-login@v2: Authenticated to 000622214837.dkr.ecr.us-east-1.amazonaws.com',
      '[00:00:18] ➔ docker build -t healops-backend-dev:latest ./app/backend',
      '[00:00:25] ➔ docker build -t healops-frontend-dev:latest ./app/frontend',
      '[00:00:32] ➔ docker push 000622214837.dkr.ecr.us-east-1.amazonaws.com/healops-backend-dev:latest',
      '[00:00:37] ✓ Pushed 2 container artifacts to Amazon ECR (us-east-1)'
    ]
  },
  {
    id: 'stage-5',
    name: 'Zero-Downtime EKS Rollout',
    category: 'deploy',
    status: 'success',
    duration: '12s',
    description: 'Kubernetes rolling update with readiness probes and surge protection',
    logs: [
      '[00:00:37] ➔ kubectl rollout restart deployment/healops-backend deployment/healops-frontend -n default',
      '[00:00:41] ➔ Waiting for pods: 2 old replicas pending termination...',
      '[00:00:47] ➔ Readiness probes verified 2/2 containers passing HTTP 200 health checks',
      '[00:00:49] ✓ Deployment healops-backend & healops-frontend successfully rolled out on EKS!'
    ]
  }
];

export const inMemoryRuns: PipelineRun[] = [
  {
    id: 'run-1042',
    workflowName: 'Deploy to ECR & EKS',
    commitSha: '6a496a9',
    commitMessage: 'feat(dashboard): implement live telemetry and all 7 dedicated dashboard pages',
    author: 'wooray2882',
    branch: 'feat/multi-page-dashboard',
    status: 'success',
    duration: '49s',
    timestamp: 'Just now',
    stages: defaultStages
  },
  {
    id: 'run-1041',
    workflowName: 'Deploy to ECR',
    commitSha: '67b811c',
    commitMessage: 'fix(k8s): configure SNS alerts, RBAC rolebinding, and IAM policies',
    author: 'wooray2882',
    branch: 'feat/aws-deployment',
    status: 'success',
    duration: '44s',
    timestamp: '5h ago',
    stages: defaultStages
  },
  {
    id: 'run-1040',
    workflowName: 'Deploy to ECR',
    commitSha: '4a77346',
    commitMessage: 'fix(docker): update base images to node 22 for Vite 8 support',
    author: 'wooray2882',
    branch: 'feat/aws-deployment',
    status: 'success',
    duration: '45s',
    timestamp: '6h ago',
    stages: defaultStages
  },
  {
    id: 'run-1039',
    workflowName: 'Continuous Integration (CI)',
    commitSha: 'd9b32fa',
    commitMessage: 'feat(k8s): add Prometheus and Alertmanager monitoring manifests',
    author: 'wooray2882',
    branch: 'main',
    status: 'success',
    duration: '1m 12s',
    timestamp: '1d ago',
    stages: defaultStages
  }
];

export async function getCICDPipelineData(): Promise<CICDData> {
  return {
    doraMetrics: {
      leadTimeForChanges: '49s',
      deploymentFrequency: 'On-Demand / Continuous',
      changeFailureRate: '0.0%',
      meanTimeToRecovery: '4.2s (AI Autonomous)'
    },
    securityScan: {
      vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0 },
      targetImages: ['healops-backend-dev:latest', 'healops-frontend-dev:latest'],
      scanTool: 'AquaSecurity Trivy v0.58.0',
      status: 'VERIFIED_CLEAN',
      lastScanned: 'Just now'
    },
    activeRun: inMemoryRuns[0],
    history: inMemoryRuns
  };
}

export function triggerNewPipelineRun(branch = 'feat/cicd-pipeline-page', message = 'feat(cicd): update visual pipeline workflow'): PipelineRun {
  const newRun: PipelineRun = {
    id: `run-${1043 + inMemoryRuns.length}`,
    workflowName: 'Deploy to ECR & EKS',
    commitSha: Math.random().toString(16).substring(2, 9),
    commitMessage: message,
    author: 'wooray2882',
    branch,
    status: 'success',
    duration: '48s',
    timestamp: 'Just now',
    stages: defaultStages
  };
  inMemoryRuns.unshift(newRun);
  return newRun;
}
