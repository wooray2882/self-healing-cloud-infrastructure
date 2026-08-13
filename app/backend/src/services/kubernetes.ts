import * as k8s from '@kubernetes/client-node';

const kc = new k8s.KubeConfig();
// Load from default cluster config (works locally with ~/.kube/config and in-cluster via ServiceAccount)
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);

export async function executeRemediation(action: string, targetApp: string): Promise<string> {
  console.log(`Executing Remediation: ${action} on ${targetApp}`);
  
  try {
    switch (action) {
      case 'RESTART_POD':
        return await restartPodsByLabel(targetApp);
      case 'SCALE_UP':
        return await scaleDeployment(targetApp, 1);
      case 'NO_ACTION_REQUIRED':
        return 'No cluster mutation required.';
      default:
        // HARD GUARDRAIL: Reject unknown actions
        console.warn(`[SECURITY] Invalid machine_action received from AI: ${action}`);
        throw new Error(`Unauthorized Kubernetes action blocked: ${action}`);
    }
  } catch (error: any) {
    console.error('Failed to execute remediation:', error);
    throw error;
  }
}

async function restartPodsByLabel(appLabel: string): Promise<string> {
  // Find all pods matching the label
  const res = await k8sApi.listNamespacedPod({ namespace: 'default', labelSelector: `app=${appLabel}` });
  
  if (res.items.length === 0) {
    return `No pods found with label app=${appLabel} to restart.`;
  }

  // Delete the pods to force a restart
  for (const pod of res.items) {
    if (pod.metadata?.name) {
      await k8sApi.deleteNamespacedPod({ name: pod.metadata.name, namespace: 'default' });
      console.log(`Deleted pod ${pod.metadata.name} to force restart.`);
    }
  }
  return `Successfully restarted ${res.items.length} pods for ${appLabel}.`;
}

async function scaleDeployment(appLabel: string, increment: number): Promise<string> {
  // Note: HPA usually handles scaling, but this allows AI to force a scale up if HPA is failing
  const deployment = await k8sAppsApi.readNamespacedDeployment({ name: appLabel, namespace: 'default' });
  
  if (!deployment.spec) throw new Error('Deployment spec not found');
  
  const currentReplicas = deployment.spec.replicas || 0;
  const newReplicas = currentReplicas + increment;
  
  deployment.spec.replicas = newReplicas;
  
  await k8sAppsApi.replaceNamespacedDeployment({ name: appLabel, namespace: 'default', body: deployment });
  return `Scaled deployment ${appLabel} from ${currentReplicas} to ${newReplicas}.`;
}
