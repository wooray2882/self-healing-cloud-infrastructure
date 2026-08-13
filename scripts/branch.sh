#!/usr/bin/env bash
# ==============================================================================
# branch.sh — Create a new Git branch with consistent naming and documentation.
#
# Usage:
#   ./scripts/branch.sh <type> <name> "<description>"
#
# Arguments:
#   type         Branch type prefix: feat, fix, refactor, docs, chore, ci, test
#   name         Descriptive branch name (lowercase, hyphens, no spaces)
#   description  One-line description of the branch purpose (quoted string)
#
# Examples:
#   ./scripts/branch.sh feat app-foundation "Step 1: Frontend + Backend + Dockerfiles"
#   ./scripts/branch.sh fix prometheus-scrape-config "Fix Prometheus service discovery targeting"
#   ./scripts/branch.sh docs final-documentation "Step 11: Final README polish and demo notes"
#
# What this script does:
#   1. Validates the branch type against allowed prefixes.
#   2. Ensures the working tree is clean (no uncommitted changes).
#   3. Creates a new branch from the current HEAD with the format: type/name
#   4. Creates an annotated Git tag at the branch point for traceability.
#   5. Prints a summary with the branch name and next steps.
# ==============================================================================

set -euo pipefail

# --- Configuration ---
ALLOWED_TYPES=("feat" "fix" "refactor" "docs" "chore" "ci" "test")

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# --- Functions ---
usage() {
    echo -e "${CYAN}Usage:${NC} ./scripts/branch.sh <type> <name> \"<description>\""
    echo ""
    echo -e "${CYAN}Allowed types:${NC} ${ALLOWED_TYPES[*]}"
    echo ""
    echo -e "${CYAN}Examples:${NC}"
    echo "  ./scripts/branch.sh feat app-foundation \"Step 1: Frontend + Backend + Dockerfiles\""
    echo "  ./scripts/branch.sh fix api-timeout \"Fix backend API timeout on large payloads\""
    exit 1
}

error() {
    echo -e "${RED}Error:${NC} $1" >&2
    exit 1
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

info() {
    echo -e "${YELLOW}→${NC} $1"
}

# --- Validation ---
if [[ $# -lt 3 ]]; then
    echo -e "${RED}Error:${NC} Missing arguments."
    echo ""
    usage
fi

TYPE="$1"
NAME="$2"
DESCRIPTION="$3"
BRANCH_NAME="${TYPE}/${NAME}"

# Validate branch type
TYPE_VALID=false
for allowed in "${ALLOWED_TYPES[@]}"; do
    if [[ "$TYPE" == "$allowed" ]]; then
        TYPE_VALID=true
        break
    fi
done

if [[ "$TYPE_VALID" == false ]]; then
    error "Invalid branch type '${TYPE}'. Allowed types: ${ALLOWED_TYPES[*]}"
fi

# Validate branch name format (lowercase, hyphens, alphanumeric only)
if [[ ! "$NAME" =~ ^[a-z0-9][a-z0-9-]*[a-z0-9]$ ]] && [[ ! "$NAME" =~ ^[a-z0-9]$ ]]; then
    error "Branch name '${NAME}' must be lowercase alphanumeric with hyphens only (e.g., 'app-foundation')."
fi

# Check for uncommitted changes
if ! git diff --quiet HEAD 2>/dev/null || ! git diff --cached --quiet HEAD 2>/dev/null; then
    error "Working tree has uncommitted changes. Please commit or stash them before creating a new branch."
fi

# Check if branch already exists
if git show-ref --verify --quiet "refs/heads/${BRANCH_NAME}" 2>/dev/null; then
    error "Branch '${BRANCH_NAME}' already exists. Use 'git checkout ${BRANCH_NAME}' to switch to it."
fi

# --- Create Branch ---
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
CURRENT_COMMIT=$(git rev-parse --short HEAD)

info "Creating branch '${BRANCH_NAME}' from '${CURRENT_BRANCH}' (${CURRENT_COMMIT})..."

git checkout -b "${BRANCH_NAME}"

# Create an annotated tag at the branch point for traceability
TAG_NAME="branch-point/${NAME}"
if ! git show-ref --verify --quiet "refs/tags/${TAG_NAME}" 2>/dev/null; then
    git tag -a "${TAG_NAME}" -m "Branch point for ${BRANCH_NAME}: ${DESCRIPTION}"
    success "Tagged branch point as '${TAG_NAME}'"
fi

# --- Summary ---
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Branch created successfully${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${CYAN}Branch:${NC}       ${BRANCH_NAME}"
echo -e "  ${CYAN}From:${NC}         ${CURRENT_BRANCH} (${CURRENT_COMMIT})"
echo -e "  ${CYAN}Description:${NC}  ${DESCRIPTION}"
echo ""
echo -e "  ${YELLOW}Next steps:${NC}"
echo -e "    1. Start building — commits go to '${BRANCH_NAME}'"
echo -e "    2. Push with: git push -u origin ${BRANCH_NAME}"
echo -e "    3. When done, open a PR to merge into '${CURRENT_BRANCH}'"
echo ""
