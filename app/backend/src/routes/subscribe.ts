import { Router, Request, Response } from 'express';
import { subscribeUser } from '../services/sns';

export const subscribeRouter = Router();

// This endpoint is called by the React Frontend when a user enters their contact info
subscribeRouter.post('/', async (req: Request, res: Response) => {
  const { protocol, endpoint } = req.body;

  if (!protocol || !endpoint) {
    return res.status(400).json({ error: 'Missing protocol (sms/email) or endpoint (phone/email string)' });
  }

  if (protocol !== 'sms' && protocol !== 'email') {
    return res.status(400).json({ error: 'Protocol must be either sms or email' });
  }

  try {
    await subscribeUser(protocol, endpoint);
    res.status(200).json({ message: `Successfully requested subscription for ${endpoint}. Please check your device to confirm.` });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Failed to subscribe user to alerts.' });
  }
});
