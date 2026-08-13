# 🎬 Self-Healing Infrastructure Demo Notes

These notes outline the narrative arc, key points, and workflow steps for recording the demo video of the **Self-Healing Cloud Infrastructure Project**. 

Use these notes to present the project professionally to hiring managers or technical teams.

---

## ⏱️ Video Structure (Target: 3 - 5 Minutes)

### 1. Introduction & The "Why" (0:00 - 0:45)
- **Visual**: Show the React Resilience Dashboard running with a healthy state green status.
- **Narrative**:
  > "Hi, I'm Ray. I built a self-healing cloud infrastructure system that automatically detects, diagnoses, and resolves outages in a Kubernetes cluster without human intervention. In this video, I'll walk you through the architecture, inject a high-load CPU fault to simulate an incident, and show you how the system automatically self-heals."
- **Key Point**: Emphasize that the system solves real operational pain: minimizing Downtime and reducing manual pager duties.

### 2. High-Level Architecture (0:45 - 1:30)
- **Visual**: Show the architecture diagram from the README or `docs/architecture.png`.
- **Narrative**: Explain the feedback loop:
  - **App Layer**: Node/React client-server app.
  - **Observability Layer**: Prometheus scrapes metrics and defines alert rules; Alertmanager handles dispatch.
  - **Remediation Layer**: A custom backend API receives the alerts and acts on the cluster using AWS/Kubernetes client APIs.
  - **Chaos Layer**: Scripted faults to validate resilience.

### 3. Injecting Chaos (1:30 - 2:30)
- **Visual**: Split screen or overlay. One side showing terminal window running `bash chaos/scenarios/cpu_spike.sh`, the other showing the dashboard.
- **Narrative**:
  > "Now, we will trigger a CPU exhaustion attack on one of our EKS node instances. This script starts high-load processes inside our target pods, simulating a sudden, severe resource leak or traffic spike."
- **Observe**:
  - Point out the metrics climbing in the dashboard charts.
  - Show the Prometheus Alert transition from `Pending` to `Firing`.

### 4. Auto-Remediation in Action (2:30 - 3:45)
- **Visual**: Focus on the React dashboard logging panel and active nodes list.
- **Narrative**:
  > "At this point, Prometheus Alertmanager has dispatched a JSON payload to our Remediation backend. The backend analyzes the node context and starts the healing playbook. 
  > First, it cordons the overloaded node to prevent new workloads from landing there. Next, it triggers a Horizontal Pod Autoscaler (HPA) to scale target pods on other nodes. Finally, it schedules a replacement node in EKS and safely drains the degraded node."
- **Observe**: Show live nodes status transitioning from `Scheduling Disabled` (Cordoned) to `Healthy` and active workloads migrating cleanly.

### 5. Summary & Tech Takeaways (3:45 - End)
- **Visual**: Show the clean, green dashboard dashboard again.
- **Narrative**:
  > "In summary, the system recovered within under 2 minutes with zero dropped requests. This monorepo includes the Terraform manifests for EKS, the K8s deploy files, the Prometheus rule configs, and the backend engine. All code is structured and modular. Thanks for watching!"

---

## 💡 Reminders for the Presenter
- Keep the terminal text size readable (zoom in).
- Keep dashboard browser tabs clean and minimal.
- Highlight the **resiliency logs** in the dashboard UI — this demonstrates a polished product, not just a raw backend.
- Frame the problem around SRE (Site Reliability Engineering) principles (SLOs, SLIs, automated playbooks).
