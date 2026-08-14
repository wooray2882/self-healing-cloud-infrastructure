#!/usr/bin/env bash
# ==============================================================================
# HealOps AWS Infrastructure Teardown Script
# Safely destroys all AWS cloud resources to bring your hourly spend to $0.00/day
# ==============================================================================

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
TF_DIR="${ROOT_DIR}/terraform/environments/dev"

echo ""
echo "==============================================================================="
echo "  🔥 HEALOPS AWS CLOUD INFRASTRUCTURE TEARDOWN"
echo "==============================================================================="
echo "  This script will destroy:"
echo "    - Amazon EKS Cluster & Spot Worker Node Group"
echo "    - AWS NAT Gateway & VPC Subnets"
echo "    - Elastic Load Balancers & EBS gp3 Volumes"
echo ""
echo "  💰 RESULT: Your hourly AWS cloud spend will drop to \$0.00 / day."
echo "  🚀 REBUILD: You can rebuild everything anytime by running: ./scripts/rebuild.sh"
echo "==============================================================================="
echo ""

# Pre-flight check
if ! command -v terraform &> /dev/null; then
  echo "❌ Error: terraform is not installed or not in PATH."
  exit 1
fi

if ! command -v aws &> /dev/null; then
  echo "❌ Error: aws CLI is not installed or not in PATH."
  exit 1
fi

# Step 1: Clean up any Kubernetes Ingress / Load Balancers to release AWS Elastic IPs
echo "→ Step 1/3: Checking Kubernetes cluster connectivity to release AWS Load Balancers..."
if command -v kubectl &> /dev/null && kubectl get nodes &> /dev/null; then
  echo "  Deleting active Kubernetes LoadBalancer services & Ingress..."
  kubectl delete ingress --all -A --timeout=30s 2>/dev/null || true
  kubectl delete svc healops-frontend-svc healops-backend-svc -n default --timeout=30s 2>/dev/null || true
  echo "  ✓ Kubernetes network endpoints released."
else
  echo "  ℹ️  Cluster already unreachable or offline. Proceeding directly to Terraform destroy."
fi

# Step 2: Stop local port forwarding background processes
echo ""
echo "→ Step 2/3: Terminating local port-forwarding tunnels..."
pkill -f "port-forward" 2>/dev/null || true
echo "  ✓ Local tunnels closed."

# Force clean ECR images if present so Terraform doesn't block
echo "  Cleaning ECR repository images..."
aws ecr delete-repository --repository-name healops-backend-dev --force --region us-east-1 2>/dev/null || true
aws ecr delete-repository --repository-name healops-frontend-dev --force --region us-east-1 2>/dev/null || true

# Step 3: Run Terraform Destroy
echo ""
echo "→ Step 3/3: Running 'terraform destroy' in ${TF_DIR}..."
cd "${TF_DIR}"

terraform destroy -auto-approve

echo ""
echo "==============================================================================="
echo "  ✅ TEARDOWN COMPLETE — ALL AWS RESOURCES DESTROYED"
echo "==============================================================================="
echo "  Current AWS Spend: \$0.00 / day"
echo ""
echo "  To spin up the entire cluster again in ~12 minutes, simply run:"
echo "    ./scripts/rebuild.sh"
echo "==============================================================================="
echo ""
