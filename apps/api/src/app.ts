import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler, notFound } from './middleware/error.middleware';
import { authenticate } from './middleware/auth.middleware';
import { upload } from './middleware/upload.middleware';
import * as authController from './controllers/auth.controller';
import * as resumeController from './controllers/resume.controller';
import * as analysisController from './controllers/analysis.controller';
import type { AuthenticatedRequest } from './middleware/auth.middleware';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000', credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('combined'));

  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
  app.use(limiter);

  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

  // Health check
  app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

  // Auth routes
  app.post('/auth/register', authLimiter, authController.register);
  app.post('/auth/login', authLimiter, authController.login);

  // Protected routes
  app.use('/resumes', authenticate as any);
  app.post('/resumes/upload', upload.array('files', 10), (req, res, next) =>
    resumeController.uploadResumes(req as AuthenticatedRequest, res, next)
  );
  app.get('/resumes', (req, res, next) =>
    resumeController.listResumes(req as AuthenticatedRequest, res, next)
  );
  app.delete('/resumes/:id', (req, res, next) =>
    resumeController.deleteResume(req as AuthenticatedRequest, res, next)
  );

  app.use('/analysis', authenticate as any);
  app.post('/analysis/job-descriptions', (req, res, next) =>
    analysisController.saveJobDescription(req as AuthenticatedRequest, res, next)
  );
  app.get('/analysis/job-descriptions', (req, res, next) =>
    analysisController.listJobDescriptions(req as AuthenticatedRequest, res, next)
  );
  app.post('/analysis/run', (req, res, next) =>
    analysisController.runAnalysis(req as AuthenticatedRequest, res, next)
  );
  app.get('/analysis/results', (req, res, next) =>
    analysisController.getResults(req as AuthenticatedRequest, res, next)
  );
  app.get('/analysis/:id', (req, res, next) =>
    analysisController.getAnalysisById(req as AuthenticatedRequest, res, next)
  );

  app.use(notFound);
  app.use(errorHandler);

  return app;
}