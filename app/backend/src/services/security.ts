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

export interface SecurityAuditEvent {
  id: string;
  type: string;
  severity: 'clean' | 'info' | 'warning' | 'critical';
  message: string;
  target: string;
  timestamp: string;
}

export interface SecurityOverviewData {
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

const defaultPillars: SecurityPillar[] = [
  {
    id: 'pillar-1',
    name: 'Container Vulnerability Management',
    category: 'Supply Chain & DevSecOps',
    score: 100,
    status: 'VERIFIED',
    summary: 'AquaSecurity Trivy automated container image scanning before ECR push',
    checks: [
      { name: 'Base Image Minimal Surface', status: 'PASS', detail: 'node:22-alpine (Minimal ~48MB footprint)' },
      { name: 'Known CVE Vulnerabilities', status: 'PASS', detail: '0 Critical, 0 High, 0 Medium, 0 Low CVEs detected' },
      { name: 'Non-Root User Execution', status: 'PASS', detail: 'Containers run under unprivileged uid 1000' },
      { name: 'Read-Only Root Filesystem', status: 'PASS', detail: 'Ephemeral container scratch storage isolated' }
    ]
  },
  {
    id: 'pillar-2',
    name: 'AWS Cloud IAM & Passwordless OIDC',
    category: 'Identity & Access Management',
    score: 100,
    status: 'HARDENED',
    summary: 'AWS STS Web Identity Federation & IRSA role bindings with zero static keys',
    checks: [
      { name: 'GitHub OIDC Integration', status: 'PASS', detail: 'Passwordless AWS STS AssumeRoleWithWebIdentity' },
      { name: 'Repo Trust Policy Scoping', status: 'PASS', detail: 'Scoped strictly to wooray2882/self-healing-cloud-infrastructure' },
      { name: 'IRSA Pod IAM Binding', status: 'PASS', detail: 'eks.amazonaws.com/role-arn attached to healops-backend-sa' },
      { name: 'Zero Static AWS Keys', status: 'PASS', detail: 'No AWS_SECRET_ACCESS_KEY stored in K8s Secrets' }
    ]
  },
  {
    id: 'pillar-3',
    name: 'Kubernetes RBAC & Isolation',
    category: 'Workload & Cluster Hardening',
    score: 96,
    status: 'COMPLIANT',
    summary: 'Least-privilege Role and ClusterRole bindings for cluster observation',
    checks: [
      { name: 'Mutation Least Privilege', status: 'PASS', detail: 'Pod delete and deployment patch restricted to default namespace' },
      { name: 'Read-Only Cluster Scope', status: 'PASS', detail: 'ClusterRole restricted to get, list, watch for telemetry' },
      { name: 'Namespace Segregation', status: 'PASS', detail: 'Workload isolated from kube-system and monitoring' },
      { name: 'ServiceAccount Token Auto-Mount', status: 'PASS', detail: 'Projected ServiceAccount tokens with bound lifetime' }
    ]
  },
  {
    id: 'pillar-4',
    name: 'Terraform IaC & VPC Boundary',
    category: 'Infrastructure as Code Security',
    score: 98,
    status: 'HARDENED',
    summary: 'Multi-AZ private subnet isolation with AWS KMS encryption at rest',
    checks: [
      { name: 'Data Encryption at Rest', status: 'PASS', detail: 'AWS KMS encryption enforced on EBS volumes and EKS secrets' },
      { name: 'VPC Subnet Architecture', status: 'PASS', detail: 'Worker EC2 instances provisioned in isolated private subnets' },
      { name: 'Security Group Ingress', status: 'PASS', detail: 'Ingress restricted to ALB and internal VPC CIDR blocks' },
      { name: 'IaC Security Scanning', status: 'PASS', detail: 'Terraform modules pre-scanned with tfsec / Trivy' }
    ]
  },
  {
    id: 'pillar-5',
    name: 'Amazon Bedrock AI Safety Guardrails',
    category: 'AI Model Safety & Control',
    score: 100,
    status: 'HARDENED',
    summary: 'Hard whitelist guardrail enforcement preventing unauthorized cluster mutations',
    checks: [
      { name: 'Machine Action Whitelisting', status: 'PASS', detail: 'Only RESTART_POD and SCALE_UP permitted; others blocked' },
      { name: 'Prompt Injection Neutralization', status: 'PASS', detail: 'System prompt enforces structured JSON output schema' },
      { name: 'Autonomous Blast Radius Limit', status: 'PASS', detail: 'AI decisions cannot mutate control plane or system nodes' },
      { name: 'Remediation Audit Logging', status: 'PASS', detail: 'Every AI mutation cryptographically recorded in event log' }
    ]
  }
];

const defaultAuditLogs: SecurityAuditEvent[] = [
  {
    id: 'sec-1',
    type: 'IAM_OIDC_TOKEN_EXCHANGE',
    severity: 'clean',
    message: 'AWS STS Web Identity Token assumed for healops-dev-github-actions-role (Expires in 3600s)',
    target: 'AWS IAM STS',
    timestamp: 'Just now'
  },
  {
    id: 'sec-2',
    type: 'TRIVY_CVE_SCAN_PASS',
    severity: 'clean',
    message: 'Image healops-backend-dev:latest verified clean against NVD database (0 Critical/High CVEs)',
    target: 'AquaSecurity Trivy',
    timestamp: '12m ago'
  },
  {
    id: 'sec-3',
    type: 'AI_GUARDRAIL_ENFORCEMENT',
    severity: 'clean',
    message: 'Bedrock AI Agent remediation evaluated: RESTART_POD validated against safety whitelist',
    target: 'Amazon Bedrock Guardrail',
    timestamp: '45m ago'
  },
  {
    id: 'sec-4',
    type: 'K8S_RBAC_CHECK',
    severity: 'clean',
    message: 'ServiceAccount healops-backend-sa authenticated via IRSA with namespace-scoped RBAC',
    target: 'Kubernetes RBAC',
    timestamp: '1h ago'
  },
  {
    id: 'sec-5',
    type: 'TERRAFORM_KMS_AUDIT',
    severity: 'clean',
    message: 'AWS KMS CMK encryption verified active on EKS secrets and cluster storage volumes',
    target: 'AWS KMS (us-east-1)',
    timestamp: '2h ago'
  }
];

export async function getSecurityOverviewData(): Promise<SecurityOverviewData> {
  return {
    healthScore: 98.5,
    cisBenchmarkScore: 'A+ (98.2%)',
    complianceStatus: 'FULLY_COMPLIANT',
    kpis: {
      totalCves: 0,
      storedSecrets: 0,
      rbacViolations: 0,
      aiGuardrailsRate: '100%'
    },
    pillars: defaultPillars,
    auditLog: defaultAuditLogs
  };
}
