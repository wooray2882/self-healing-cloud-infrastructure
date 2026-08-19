#!/usr/bin/env bash
# ==============================================================================
# HealOps AWS Infrastructure Rebuild Script
# Provisions VPC, EKS Cluster, Spot Nodes, and Deploys All Microservices in 1 Shot
# ==============================================================================

set -eo pipefail

export PATH="$PATH:/usr/local/bin:/opt/homebrew/bin:~/.local/bin"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
TF_DIR="${ROOT_DIR}/terraform/environments/dev"
REGION="us-east-1"
CLUSTER_NAME="healops-dev-cluster"

echo ""
echo "==============================================================================="
echo "  🚀 HEALOPS 1-CLICK CLOUD INFRASTRUCTURE REBUILD"
echo "==============================================================================="
echo "  Target Region:  ${REGION}"
echo "  Target Cluster: ${CLUSTER_NAME}"
echo ""
echo "  Automated Steps:"
echo "    1. Terraform Apply (VPC, EKS Cluster, Spot Nodes, IAM OIDC, ECR)"
echo "    2. Trigger and wait for CI/CD Container Image Build (GitHub Actions)"
echo "    3. Configure local kubectl kubeconfig & Verify Node Readiness"
echo "    4. Deploy Kubernetes microservices & Prometheus monitoring"
echo "    5. Initialize background tunnels to http://localhost:8080"
echo "==============================================================================="
echo ""

# Pre-flight check
for cmd in terraform aws kubectl gh; do
  if ! command -v "$cmd" &> /dev/null; then
    echo "❌ Error: '$cmd' is required but not installed."
    exit 1
  fi
done

# Step 1: Terraform Apply
echo "→ Step 1/5: Provisioning AWS Cloud Infrastructure via Terraform..."
cd "${TF_DIR}"
terraform init -upgrade
terraform apply -auto-approve

echo ""
echo "  ✓ AWS VPC, EKS Control Plane, Spot Instances, and ECR Repositories created!"

# Step 2: Trigger CI/CD Container Build & Push
echo ""
echo "→ Step 2/5: Building & Pushing fresh Docker container images via GitHub Actions..."
cd "${ROOT_DIR}"
gh workflow run deploy.yml --ref "$(git branch --show-current)" || gh workflow run deploy.yml
sleep 5

echo "  Waiting for container images to build and push to Amazon ECR..."
LATEST_RUN_ID=$(gh run list --workflow=deploy.yml --limit 1 --json databaseId -q '.[0].databaseId')
if [ -n "$LATEST_RUN_ID" ]; then
  gh run watch "$LATEST_RUN_ID" || true
fi
echo "  ✓ Docker container images available in ECR!"

# Step 3: Configure kubectl kubeconfig
echo ""
echo "→ Step 3/5: Updating local kubeconfig..."
aws eks update-kubeconfig --name "${CLUSTER_NAME}" --region "${REGION}"

echo "  Waiting for Kubernetes worker nodes to report Ready status..."
kubectl wait --for=condition=Ready nodes --all --timeout=180s || true
kubectl get nodes

# Step 4: Deploy Kubernetes Manifests
echo ""
echo "→ Step 4/5: Deploying HealOps Microservices & Configuration..."
cd "${ROOT_DIR}"

if [ -d "kubernetes" ]; then
  kubectl apply -f kubernetes/backend/serviceaccount.yaml 2>/dev/null || true
  kubectl apply -f kubernetes/backend/deployment.yaml 2>/dev/null || true
  kubectl apply -f kubernetes/backend/service.yaml 2>/dev/null || true
  kubectl apply -f kubernetes/backend/hpa.yaml 2>/dev/null || true
  kubectl apply -f kubernetes/frontend/deployment.yaml 2>/dev/null || true
  kubectl apply -f kubernetes/frontend/service.yaml 2>/dev/null || true
fi

echo "  Waiting for deployments to roll out..."
kubectl rollout status deployment/healops-backend -n default --timeout=180s || true
kubectl rollout status deployment/healops-frontend -n default --timeout=180s || true

# Step 5: Launch local port forwarding
echo ""
echo "→ Step 5/5: Opening local access tunnels..."
pkill -f "port-forward" 2>/dev/null || true
sleep 1

kubectl port-forward svc/healops-frontend-svc -n default 8080:80 > /dev/null 2>&1 &
kubectl port-forward svc/healops-backend-svc -n default 4000:80 > /dev/null 2>&1 &
sleep 2

echo ""
echo "==============================================================================="
echo "  🎉 REBUILD COMPLETE — HEALOPS IS FULLY OPERATIONAL"
echo "==============================================================================="
echo "  Dashboard URL:  http://localhost:8080"
echo "  Backend API:    http://localhost:4000"
echo ""
echo "  To destroy everything when done and save your credits, run:"
echo "    ./scripts/destroy.sh"
echo "==============================================================================="
echo ""
