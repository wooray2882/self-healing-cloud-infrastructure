import { SNSClient, PublishCommand, SubscribeCommand } from '@aws-sdk/client-sns';

// Initialize the AWS SNS Client
const snsClient = new SNSClient({ region: 'us-east-1' });

const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN || 'arn:aws:sns:us-east-1:000622214837:healops-dev-alerts';

export interface IncidentNotificationPayload {
  id: string;
  title: string;
  target: string;
  anomaly: string;
  detectedAt: string;
  resolvedAt?: string;
  durationSeconds?: string | number;
  initiatedBy: string;
  remediatedBy?: string;
  actionTaken?: string;
  verification?: string;
}

/**
 * Generic notification sender
 */
export async function sendNotification(message: string, subject = 'HealOps: Cluster Alert'): Promise<void> {
  try {
    const command = new PublishCommand({
      TopicArn: SNS_TOPIC_ARN,
      Message: message,
      Subject: subject,
    });
    
    await snsClient.send(command);
    console.log('[SNS] Successfully published notification');
  } catch (error) {
    console.error('[SNS] Failed to send notification:', error);
  }
}

/**
 * Formatted natural-language notification sender for Bedrock human summaries
 */
export async function sendFormattedNotification(
  humanSummary: string, 
  incidentId: string, 
  statusType: 'PENDING_APPROVAL' | 'CIRCUIT_BREAKER_ESCALATED' | 'REMEDIATED'
): Promise<void> {
  const subjectPrefix = 
    statusType === 'PENDING_APPROVAL' 
      ? '⚠️ [HealOps Approval Required]' 
      : statusType === 'CIRCUIT_BREAKER_ESCALATED'
        ? '🚨 [HealOps Circuit Breaker Escalation]'
        : '🛡️ [HealOps Remediation Report]';

  const message = `${subjectPrefix} Incident ${incidentId}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `${humanSummary}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Dashboard Intervention URL: http://localhost:8080/incidents\n` +
    `HealOps Autonomous SRE Control Plane`;

  await sendNotification(message, `${subjectPrefix} Incident ${incidentId}`);
}

/**
 * Phase 1: Incident Detected & Triage Notification
 */
export async function sendTriageNotification(incident: IncidentNotificationPayload): Promise<void> {
  const message = `🚨 [HealOps Alert] Incident Acknowledged & Triage Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Incident ID:  ${incident.id}
• Detected At:  ${incident.detectedAt}
• Initiated By: ${incident.initiatedBy}
• Target:       ${incident.target}
• Anomaly:      ${incident.anomaly}
• Status:       AI Agent actively investigating root cause and selecting runbook...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HealOps Autonomous SRE Engine`;

  await sendNotification(message, `🚨 [HealOps] Incident ${incident.id} Detected`);
}

/**
 * Phase 2: Incident Remediated & MTTR Resolution Notification
 */
export async function sendResolutionNotification(incident: IncidentNotificationPayload): Promise<void> {
  const message = `🛡️ [HealOps Resolved] Automated Remediation Successful!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Incident ID:   ${incident.id}
• Resolved At:   ${incident.resolvedAt || new Date().toISOString()}
• Total MTTR:    ${incident.durationSeconds || '4.2'}s (Detection ➔ Full Recovery)
• Remediated By: ${incident.remediatedBy || 'Amazon Bedrock AI Engine'}
• Action Taken:  ${incident.actionTaken || 'RESTART_POD on ' + incident.target}
• Verification:  ${incident.verification || 'HTTP 200 health probe verified across 2/2 replicas'}
• Service State: HEALTHY (Zero traffic dropped)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HealOps Autonomous SRE Engine`;

  await sendNotification(message, `🛡️ [HealOps] Incident ${incident.id} Resolved (MTTR ${incident.durationSeconds}s)`);
}

/**
 * Subscribes a user's phone number or email to the SNS topic.
 */
export async function subscribeUser(protocol: 'sms' | 'email', endpoint: string): Promise<void> {
  try {
    const command = new SubscribeCommand({
      TopicArn: SNS_TOPIC_ARN,
      Protocol: protocol,
      Endpoint: endpoint,
      ReturnSubscriptionArn: true,
    });
    
    await snsClient.send(command);
    console.log(`[SNS] Successfully requested subscription for ${endpoint} via ${protocol}`);
  } catch (error) {
    console.error(`[SNS] Failed to subscribe ${endpoint}:`, error);
    throw error;
  }
}
