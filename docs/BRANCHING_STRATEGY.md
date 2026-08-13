# Branching Strategy

This document outlines the Git branching strategy, naming conventions, and merge workflow used throughout this project. It follows industry-standard practices used by DevOps and Platform Engineering teams working in monorepo environments.

---

## Branch Naming Convention

All branches follow the `type/descriptive-name` pattern:

| Prefix | Purpose | Example |
|---|---|---|
| `feat/` | New feature or major capability | `feat/app-foundation` |
| `fix/` | Bug fix or patch | `fix/prometheus-scrape-config` |
| `refactor/` | Code restructuring without behavior change | `refactor/backend-service-layer` |
| `docs/` | Documentation-only changes | `docs/final-documentation` |
| `chore/` | Maintenance, tooling, or config changes | `chore/update-terraform-providers` |

### Rules
- Branch names use **lowercase** with **hyphens** as word separators.
- Names should be **short but descriptive** — a developer should understand the scope from the name alone.
- Each branch maps to a **single cohesive milestone** (see Project Branch Map below).

---

## Commit Message Convention

All commits follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

```
type(scope): short description

Optional longer description explaining the "why" behind the change.
```

### Types
| Type | When to Use |
|---|---|
| `feat` | Adding new functionality |
| `fix` | Fixing a bug |
| `docs` | Documentation changes only |
| `chore` | Maintenance, dependency updates, tooling |
| `refactor` | Code quality improvement (no behavior change) |
| `ci` | CI/CD pipeline changes |
| `test` | Adding or updating tests |

### Examples
```
feat(frontend): add cluster health overview dashboard
fix(backend): correct Prometheus webhook payload parsing
ci(pipeline): add Trivy container scanning to build step
docs(readme): add architecture diagram and tech stack
```

---

## Merge Strategy

1. **Feature branches** are created from `main`.
2. Work is committed incrementally with descriptive Conventional Commit messages.
3. When a milestone is complete, the branch is merged to `main` via **squash merge**.
4. The squash merge commit message summarizes the entire milestone.
5. This keeps `main` with a **clean, linear history** where each commit = one complete milestone.

```
main:  [scaffold] → [app-foundation] → [terraform] → [k8s-deploy] → [cicd] → ...
```

---

## Project Branch Map

Each branch corresponds to a major build step. Branches are created and merged sequentially.

| Order | Branch | Build Step | Scope |
|---|---|---|---|
| 1 | `feat/app-foundation` | Step 1 | React + Vite + Tremor Raw dashboard, Node.js/TypeScript backend API, Dockerfiles for both services |
| 2 | `feat/terraform-infrastructure` | Step 2 | Terraform modules: VPC, subnets, security groups, EKS cluster, node groups, IAM roles, S3/ECR |
| 3 | `feat/kubernetes-deployment` | Step 3 | Kubernetes manifests (Deployments, Services, Ingress, HPA), Helm charts, autoscaling and restart policies |
| 4 | `feat/cicd-security-pipeline` | Steps 4+5 | GitHub Actions workflows: lint, test, build, Trivy scan, deploy. Dependabot config. tfsec/checkov for Terraform |
| 5 | `feat/monitoring-observability` | Step 6 | Prometheus scrape configs, alerting rules, Alertmanager routing, Grafana dashboard JSON exports |
| 6 | `feat/self-healing-engine` | Step 7 | Custom remediation service: auto-rollback on error spike, node quarantine, cascading alert suppression |
| 7 | `feat/ai-ops-assistant` | Step 8 | Bedrock AgentCore integration, Lambda Action Groups (Trusted Advisor, DevOps Guru, SSM, CloudWatch, Health API), dashboard chat panel, optional Lex V2 voice input |
| 8 | `feat/chaos-engineering` | Step 9 | Chaos scenarios (pod kill, CPU spike, network disruption), dashboard trigger buttons, live recovery visualization |
| 9 | `docs/final-documentation` | Step 11 | Final README polish, architecture diagram, demo video script, deployment guide |

---

## Protected Branch: `main`

- `main` is always in a **deployable state**.
- No direct commits to `main` for feature work.
- All feature work goes through feature branches.
- Each merge to `main` should pass all CI checks (once the pipeline is set up in Step 4).
