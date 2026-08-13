import { SNSClient, PublishCommand, SubscribeCommand } from '@aws-sdk/client-sns';

// Initialize the AWS SNS Client
// It automatically picks up credentials from the environment (or IRSA in Kubernetes)
const snsClient = new SNSClient({ region: 'us-east-1' });

// We would normally inject this from environment variables via Terraform outputs
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN || 'arn:aws:sns:us-east-1:123456789012:healops-alerts';

/**
 * Sends a text message or email to all subscribed users on the topic.
 */
export async function sendNotification(message: string): Promise<void> {
  try {
    const command = new PublishCommand({
      TopicArn: SNS_TOPIC_ARN,
      Message: message,
      Subject: 'HealOps: Cluster Alert',
    });
    
    await snsClient.send(command);
    console.log('Successfully published notification to SNS');
  } catch (error) {
    console.error('Failed to send SNS notification:', error);
    // Don't crash the server if SNS fails
  }
}

/**
 * Subscribes a user's phone number or email to the SNS topic.
 * They will receive a confirmation message they must accept.
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
    console.log(`Successfully requested subscription for ${endpoint} via ${protocol}`);
  } catch (error) {
    console.error(`Failed to subscribe ${endpoint}:`, error);
    throw error;
  }
}
