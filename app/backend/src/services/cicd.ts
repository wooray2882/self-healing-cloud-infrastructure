export interface PipelineStage {
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

const detailedStages: PipelineStage[] = [
  {
    id: 'stage-1',
    name: 'Commit Change',
    shortLabel: 'Commit',
    category: 'dev',
    phase: 'Source Control',
    status: 'success',
    duration: '1s',
    description: 'Code pushed to GitHub feature branch with Conventional Commit formatting',
    command: 'git push origin feat/cicd-pipeline-page',
    logs: [
      '[00:00:01] ➔ actions/checkout@v4: Fetching repository wooray2882/self-healing-cloud-infrastructure',
      '[00:00:01] ➔ HEAD is now at dd33e34 (feat(cicd): implement CI/CD pipeline page)',
      '[00:00:01] ➔ Commit verified with GPG signature by author: Ray Woo <raywoo@github>',
      '[00:00:01] ✓ Verified clean working tree against remote origin'
    ]
  },
  {
    id: 'stage-2',
    name: 'AWS OIDC Auth',
    shortLabel: 'OIDC Auth',
    category: 'dev',
    phase: 'Security Identity',
    status: 'success',
    duration: '2s',
    description: 'Passwordless AWS STS AssumeRoleWithWebIdentity via GitHub OIDC token',
    command: 'aws-actions/configure-aws-credentials@v4',
    logs: [
      '[00:00:01] ➔ Requesting JWT Web Identity Token from GitHub Actions token provider...',
      '[00:00:02] ➔ Exchanging JWT with AWS Security Token Service (STS) in us-east-1...',
      '[00:00:02] ➔ Assumed IAM Role: arn:aws:iam::000622214837:role/healops-dev-github-actions-role',
      '[00:00:02] ✓ Temporary STS credentials generated. Expiration: 1 hour (Zero hardcoded secrets)'
    ]
  },
  {
    id: 'stage-3',
    name: 'Lint & Compile',
    shortLabel: 'Compile',
    category: 'dev',
    phase: 'Build Integration',
    status: 'success',
    duration: '5s',
    description: 'Strict TypeScript compilation and Vite asset bundling on Node 22',
    command: 'npm run build (tsc -b && vite build)',
    logs: [
      '[00:00:02] ➔ Setting up Node.js v22.14.0 (Alpine runtime environment)',
      '[00:00:03] ➔ Running tsc -b across app/backend and app/frontend',
      '[00:00:05] ➔ Transforming and minifying 2,821 modules with Vite 8',
      '[00:00:07] ✓ TypeScript compilation passed with 0 warnings, 0 syntax errors'
    ]
  },
  {
    id: 'stage-4',
    name: 'Trivy Security Scan',
    shortLabel: 'Trivy Scan',
    category: 'dev',
    phase: 'DevSecOps Audit',
    status: 'success',
    duration: '7s',
    description: 'AquaSecurity Trivy container image CVE and package vulnerability scanner',
    command: 'aquasecurity/trivy-action@master',
    logs: [
      '[00:00:07] ➔ aquasecurity/trivy-action: Downloading latest National Vulnerability Database (NVD)...',
      '[00:00:09] ➔ Scanning OS dependencies on alpine:3.21.3 base layer...',
      '[00:00:12] ➔ Scanning Node.js npm dependency lockfiles for known CVEs...',
      '[00:00:14] ✓ Trivy audit complete: 0 CRITICAL, 0 HIGH, 0 MEDIUM. Status: PASSED (CIS Clean)'
    ]
  },
  {
    id: 'stage-5',
    name: 'Docker Build',
    shortLabel: 'Package',
    category: 'ops',
    phase: 'Container Packaging',
    status: 'success',
    duration: '14s',
    description: 'Multi-stage Docker builds for backend API and frontend Nginx distribution',
    command: 'docker build -t healops-backend:latest -t healops-frontend:latest .',
    logs: [
      '[00:00:14] ➔ [1/2] Building healops-backend:latest (node:22-alpine base, dist/server.js)',
      '[00:00:20] ➔ Backend container built successfully (Layer size: 48.2 MB)',
      '[00:00:21] ➔ [2/2] Building healops-frontend:latest (nginx:alpine multi-stage static asset host)',
      '[00:00:28] ✓ Frontend container built successfully (Layer size: 24.1 MB)'
    ]
  },
  {
    id: 'stage-6',
    name: 'ECR Delivery',
    shortLabel: 'ECR Push',
    category: 'ops',
    phase: 'Artifact Registry',
    status: 'success',
    duration: '9s',
    description: 'Push cryptographically tagged image artifacts to Amazon ECR private repository',
    command: 'docker push 000622214837.dkr.ecr.us-east-1.amazonaws.com/...',
    logs: [
      '[00:00:28] ➔ Logging in to Amazon ECR registry 000622214837.dkr.ecr.us-east-1.amazonaws.com...',
      '[00:00:31] ➔ Pushing healops-backend:dd33e34 and healops-backend:latest',
      '[00:00:34] ➔ Pushing healops-frontend:dd33e34 and healops-frontend:latest',
      '[00:00:37] ✓ 2 container manifests successfully registered in AWS ECR repository'
    ]
  },
  {
    id: 'stage-7',
    name: 'EKS Rollout',
    shortLabel: 'Deploy',
    category: 'ops',
    phase: 'Production Deployment',
    status: 'success',
    duration: '11s',
    description: 'Zero-downtime Kubernetes rolling update with HTTP readiness probe verification',
    command: 'kubectl rollout restart deployment/healops-backend deployment/healops-frontend',
    logs: [
      '[00:00:37] ➔ kubectl rollout restart deployment/healops-backend deployment/healops-frontend -n default',
      '[00:00:40] ➔ Provisioning new pod replicas across EC2 worker nodes (us-east-1a, us-east-1b)...',
      '[00:00:45] ➔ HTTP 200 health probe check passed on /health endpoint for 2/2 replicas',
      '[00:00:48] ➔ Terminating old container replicas gracefully after route convergence',
      '[00:00:49] ✓ Zero-downtime rollout completed successfully on Amazon EKS!'
    ]
  }
];

export const inMemoryRuns: PipelineRun[] = [
  {
    id: 'run-1043',
    workflowName: 'Deploy to ECR & EKS',
    commitSha: 'dd33e34',
    commitMessage: 'feat(cicd): implement CI/CD pipeline page with visual DAG, DORA metrics, and terminal logs',
    author: 'wooray2882',
    branch: 'feat/cicd-pipeline-page',
    status: 'success',
    duration: '49s',
    timestamp: 'Just now',
    stages: detailedStages
  },
  {
    id: 'run-1042',
    workflowName: 'Deploy to ECR',
    commitSha: '6a496a9',
    commitMessage: 'feat(dashboard): implement live telemetry and all 7 dedicated dashboard pages',
    author: 'wooray2882',
    branch: 'feat/multi-page-dashboard',
    status: 'success',
    duration: '51s',
    timestamp: '45m ago',
    stages: detailedStages
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
    stages: detailedStages
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
    stages: detailedStages
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

export function triggerNewPipelineRun(branch = 'feat/cicd-pipeline-page', message = 'feat(cicd): automated zero-downtime deployment rollout'): PipelineRun {
  const newRun: PipelineRun = {
    id: `run-${1044 + inMemoryRuns.length}`,
    workflowName: 'Deploy to ECR & EKS',
    commitSha: Math.random().toString(16).substring(2, 9),
    commitMessage: message,
    author: 'wooray2882',
    branch,
    status: 'success',
    duration: '49s',
    timestamp: 'Just now',
    stages: detailedStages
  };
  inMemoryRuns.unshift(newRun);
  return newRun;
}

