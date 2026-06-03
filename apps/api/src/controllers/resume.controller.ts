import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { resumeParser } from '../services/resume-parser.service';
import { AppError } from '../middleware/error.middleware';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import fs from 'fs';

export async function uploadResumes(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) throw new AppError(400, 'No files uploaded');

    const results = await Promise.all(
      files.map(async (file) => {
        const rawText = await resumeParser.extractText(file.path, file.mimetype);
        const parsedData = resumeParser.parse(rawText);

        return prisma.resume.create({
          data: {
            userId: req.userId,
            filename: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            fileSize: file.size,
            parsedData: parsedData as any,
          },
          select: {
            id: true,
            originalName: true,
            fileSize: true,
            createdAt: true,
            parsedData: true,
          },
        });
      })
    );

    res.status(201).json(results);
  } catch (err) {
    next(err);
  }
}

export async function listResumes(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        originalName: true,
        fileSize: true,
        createdAt: true,
        parsedData: true,
      },
    });
    res.json(resumes);
  } catch (err) {
    next(err);
  }
}

export async function deleteResume(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const resume = await prisma.resume.findFirst({ where: { id, userId: req.userId } });
    if (!resume) throw new AppError(404, 'Resume not found');

    // Clean up uploaded file
    const filePath = `${process.env.UPLOAD_DIR ?? './uploads'}/${resume.filename}`;
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.resume.delete({ where: { id } });
    res.json({ message: 'Resume deleted' });
  } catch (err) {
    next(err);
  }
}