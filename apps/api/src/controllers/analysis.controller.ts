import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { analysisService } from '../services/analysis.service';
import { cache } from '../config/redis';
import { AppError } from '../middleware/error.middleware';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';

const runSchema = z.object({
  jobDescriptionId: z.string().cuid(),
});

const saveJdSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(50, 'Job description must be at least 50 characters'),
});

export async function saveJobDescription(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, content } = saveJdSchema.parse(req.body);
    const jd = await prisma.jobDescription.create({
      data: { userId: req.userId, title, content },
    });
    res.status(201).json(jd);
  } catch (err) {
    next(err);
  }
}

export async function listJobDescriptions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const jds = await prisma.jobDescription.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, createdAt: true },
    });
    res.json(jds);
  } catch (err) {
    next(err);
  }
}

export async function runAnalysis(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { jobDescriptionId } = runSchema.parse(req.body);

    // Invalidate previous cache for this analysis
    await cache.delPattern(`analysis:${req.userId}:${jobDescriptionId}`);
    await cache.delPattern(`results:${req.userId}:${jobDescriptionId}`);

    const results = await analysisService.runAnalysis(req.userId, jobDescriptionId);
    res.json(results);
  } catch (err) {
    next(err);
  }
}

export async function getResults(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { jobDescriptionId } = req.query;
    if (typeof jobDescriptionId !== 'string') throw new AppError(400, 'jobDescriptionId is required');

    const results = await analysisService.getResults(req.userId, jobDescriptionId);
    res.json(results);
  } catch (err) {
    next(err);
  }
}

export async function getAnalysisById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const result = await analysisService.getById(id, req.userId);
    if (!result) throw new AppError(404, 'Analysis result not found');
    res.json(result);
  } catch (err) {
    next(err);
  }
}