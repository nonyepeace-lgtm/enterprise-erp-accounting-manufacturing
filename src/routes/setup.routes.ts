import { Router } from 'express';
import { ChartOfAccountsService } from '../services/accounting/accounting.service.js';

export const setupRoutes = Router();

setupRoutes.post('/setup-company', (req, res) => {
  const { companyId, companyName } = req.body ?? {};
  if (!companyId || !companyName) return res.status(400).json({ error: 'companyId and companyName are required.' });
  const chart = ChartOfAccountsService.createDefaultChart(companyId);
  return res.status(201).json({
    message: 'Starter chart generated; database persistence is not yet implemented.',
    company: { id: companyId, name: companyName },
    chartLength: chart.length,
    chart,
  });
});

setupRoutes.get('/health', (_req, res) => res.json({ status: 'ok' }));
