import { Router, Request, Response } from 'express';
import { exec } from 'child_process';
import path from 'path';

export const chaosRouter = Router();

// Endpoint called by the React dashboard "Inject Chaos" button
chaosRouter.post('/inject', (req: Request, res: Response) => {
  
  // In a real cluster, we would apply the K8s NetworkChaos CRD here using the K8s API.
  // For this portfolio, we simulate triggering the chaos experiment script.
  console.log('User triggered chaos injection!');
  
  // We can just simulate the delay that Prometheus would normally take to fire the alert.
  // We'll return 200 OK immediately so the frontend knows the request was received.
  res.status(200).json({ message: 'Chaos injection initiated. Prometheus is watching...' });
  
});
