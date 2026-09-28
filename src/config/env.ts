import { config } from 'dotenv';

config();

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'local-dev-secret',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
};
