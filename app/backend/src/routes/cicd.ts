import { Router } from 'express';
import { getCICDPipelineData, triggerNewPipelineRun } from '../services/cicd';

export const cicdRouter = Router();

// GET /api/cicd/pipeline
cicdRouter.get('/pipeline', async (req, res) => {
  try {
    const data = await getCICDPipelineData();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch CI/CD pipeline data' });
  }
});

// POST /api/cicd/trigger
cicdRouter.post('/trigger', async (req, res) => {
  try {
    const { branch, message } = req.body || {};
    const newRun = triggerNewPipelineRun(branch, message);
    res.json({ message: 'Pipeline trigger queued', run: newRun });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to trigger pipeline' });
  }
});
