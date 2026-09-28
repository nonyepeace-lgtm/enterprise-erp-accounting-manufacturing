import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { setupRoutes } from './routes/setup.routes.js';
import { accountingRoutes } from './routes/accounting.routes.js';

dotenv.config();

export const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('combined'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'enterprise-erp-accounting-manufacturing' });
});

app.use('/api', setupRoutes);
app.use('/api', accountingRoutes);

export default app;
