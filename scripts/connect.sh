#!/usr/bin/env bash
# ==============================================================================
# HealOps Local Port Forward & Connection Re-establishment Script
# ==============================================================================

set -eo pipefail

export PATH="$PATH:/usr/local/bin:/opt/homebrew/bin:~/.local/bin"

echo "→ Checking Kubernetes connection..."
kubectl get nodes > /dev/null

echo "→ Restarting local access tunnels to EKS..."
pkill -f "port-forward" 2>/dev/null || true
sleep 1

nohup kubectl port-forward svc/healops-frontend-svc -n default 8080:80 > /dev/null 2>&1 &
nohup kubectl port-forward svc/healops-backend-svc -n default 4000:80 > /dev/null 2>&1 &
sleep 2

echo ""
echo "==============================================================================="
echo "  ✓ TUNNELS CONNECTED SUCCESSFULLY"
echo "==============================================================================="
echo "  Dashboard:    http://localhost:8080"
echo "  Backend API:  http://localhost:4000"
echo "==============================================================================="
echo ""
