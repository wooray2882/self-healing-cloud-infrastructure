import { Router, Request, Response } from 'express';
import { subscribeUser } from '../services/sns';

export const subscribeRouter = Router();

/**
 * Normalizes phone numbers to valid E.164 (+1XXXXXXXXXX) and cleans emails
 */
function normalizeEndpoint(protocol: 'sms' | 'email', endpoint: string): string {
  if (protocol === 'email') {
    return endpoint.trim().toLowerCase();
  }
  
  // For SMS, strip non-digits except leading +
  let cleaned = endpoint.trim().replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    const digits = cleaned.replace(/\D/g, '');
    return `+${digits}`;
  }
  
  const digits = cleaned.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+1${digits}`; // Standard 10-digit US number
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  return `+${digits}`;
}

// This endpoint is called by the React Frontend when a user enters their contact info
subscribeRouter.post('/', async (req: Request, res: Response) => {
  const { protocol, endpoint } = req.body;

  if (!protocol || !endpoint) {
    return res.status(400).json({ error: 'Missing protocol (sms/email) or endpoint (phone/email string)' });
  }

  if (protocol !== 'sms' && protocol !== 'email') {
    return res.status(400).json({ error: 'Protocol must be either sms or email' });
  }

  const normalized = normalizeEndpoint(protocol, endpoint);

  try {
    await subscribeUser(protocol, normalized);
    res.status(200).json({ 
      success: true,
      message: `Successfully requested subscription for ${normalized}. Please check your ${protocol === 'email' ? 'inbox for the AWS confirmation link' : 'device'} to confirm.`,
      endpoint: normalized,
      protocol 
    });
  } catch (error: any) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: error.message || 'Failed to subscribe user to alerts.' });
  }
});
