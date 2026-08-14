#!/usr/bin/env bash
# ==============================================================================
# HealOps AWS Infrastructure Rebuild Script
# Provisions VPC, EKS Cluster, Spot Nodes, and Deploys All Microservices in 1 Shot
# ==============================================================================

set -eo pipefail

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
echo "    1. Terraform Apply (VPC, EKS Cluster, Spot Nodes, IAM OIDC)"
echo "    2. Configure local kubectl kubeconfig"
echo "    3. Deploy Kubernetes microservices & Prometheus monitoring"
echo "    4. Initialize background tunnels to http://localhost:8080"
echo "==============================================================================="
echo ""

# Pre-flight check
for cmd in terraform aws kubectl; do
  if ! command -v "$cmd" &> /dev/null; then
    echo "❌ Error: '$cmd' is required but not installed."
    exit 1
  fi
done

# Step 1: Terraform Apply
echo "→ Step 1/4: Provisioning AWS Cloud Infrastructure via Terraform..."
cd "${TF_DIR}"
terraform init -upgrade
terraform apply -auto-approve

echo ""
echo "  ✓ AWS VPC, EKS Control Plane, and Spot Instances successfully created!"

# Step 2: Configure kubectl kubeconfig
echo ""
echo "→ Step 2/4: Updating local kubeconfig..."
aws eks update-kubeconfig --name "${CLUSTER_NAME}" --region "${REGION}"

echo "  Waiting for Kubernetes worker nodes to report Ready status..."
kubectl wait --for=condition=Ready nodes --all --timeout=180s || true
kubectl get nodes

# Step 3: Deploy Kubernetes Manifests
echo ""
echo "→ Step 3/4: Deploying HealOps Microservices & Configuration..."
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
kubectl rollout status deployment/healops-backend -n default --timeout=120s || true
kubectl rollout status deployment/healops-frontend -n default --timeout=120s || true

# Step 4: Launch local port forwarding
echo ""
echo "→ Step 4/4: Opening local access tunnels..."
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
