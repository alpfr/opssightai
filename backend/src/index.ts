import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { testConnection } from './config/database';
import dataRoutes from './routes/dataRoutes';
import assetRoutes from './routes/assetRoutes';
import riskRoutes from './routes/riskRoutes';
import anomalyRoutes from './routes/anomalyRoutes';
import forecastRoutes from './routes/forecastRoutes';
import summaryRoutes from './routes/summaryRoutes';
import notificationRoutes from './routes/notificationRoutes';
import maintenanceRoutes from './routes/maintenance';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', dataRoutes);
app.use('/api', assetRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/anomalies', anomalyRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  
  res.json({
    status: dbConnected ? 'ok' : 'degraded',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'OpsSight AI API',
    version: '1.0.0',
    description: 'Operational Risk Intelligence Platform'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: {
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      timestamp: new Date().toISOString()
    }
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`OpsSight AI API server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;
