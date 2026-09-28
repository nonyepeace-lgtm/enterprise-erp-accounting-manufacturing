import { Router } from 'express';
import { accountingRoutes } from './accounting.routes.js';

export const setupRoutes = Router();

setupRoutes.post('/setup-company', async (req, res) => {
  try {
    await accountingRoutes.setup(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Setup failed', error: (error as Error).message });
  }
});

setupRoutes.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});
