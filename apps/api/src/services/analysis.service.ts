import { prisma } from '../config/database';
import { cache } from '../config/redis';
import { config } from '../config';
import { embeddingService, aiFeedbackService } from './embedding.service';
import { scoringService } from './scoring.service';
import { vectorStore } from './vector-store.service';
import { logger } from '../utils/logger';
import type { AnalysisResult, ParsedResume } from '@resume-analyzer/shared';

export class AnalysisService {
  async runAnalysis(userId: string, jobDescriptionId: string): Promise<AnalysisResult[]> {
    const cacheKey = `analysis:${userId}:${jobDescriptionId}`;
    const cached = await cache.get<AnalysisResult[]>(cacheKey);
    if (cached) return cached;

    const [jd, resumes] = await Promise.all([
      prisma.jobDescription.findFirst({
        where: { id: jobDescriptionId, userId },
      }),
      prisma.resume.findMany({ where: { userId } }),
    ]);

    if (!jd) throw new Error('Job description not found');
    if (resumes.length === 0) throw new Error('No resumes uploaded');

    // Create JD embedding once
    const jdEmbedding = await embeddingService.createEmbedding(jd.content);

    const results = await Promise.all(
      resumes.map((resume) => this.analyzeResume(resume, jd.content, jdEmbedding, jd.id))
    );

    // Sort by overall score and assign ranks
    const ranked = results
      .sort((a, b) => b.scores.overall - a.scores.overall)
      .map((r, idx) => ({ ...r, rank: idx + 1 }));

    // Persist ranks
    await Promise.all(
      ranked.map((r) =>
        prisma.analysisResult.update({
          where: { id: r.id },
          data: { rank: r.rank },
        })
      )
    );

    const output = ranked.map(this.formatResult);
    await cache.set(cacheKey, output, config.cache.analysisTtl);
    return output;
  }

  private async analyzeResume(
    resume: any,
    jdContent: string,
    jdEmbedding: number[],
    jobDescriptionId: string
  ): Promise<any> {
    const parsedData = resume.parsedData as ParsedResume;

    // Create or reuse resume embedding
    let resumeEmbedding: number[];
    try {
      resumeEmbedding = await embeddingService.createEmbedding(parsedData.rawText);
    } catch (err) {
      logger.error('Embedding creation failed', { resumeId: resume.id, error: err });
      resumeEmbedding = new Array(1536).fill(0);
    }

    const similarity = embeddingService.cosineSimilarity(resumeEmbedding, jdEmbedding);

    const rawSkillsScore = scoringService.calculateSkillScore(parsedData, jdContent);
    const rawExpScore = scoringService.calculateExperienceScore(parsedData, jdContent);
    const rawEduScore = scoringService.calculateEducationScore(parsedData, jdContent);

    const skillsScore = scoringService.applySemanticBoost(rawSkillsScore, similarity);
    const experienceScore = scoringService.applySemanticBoost(rawExpScore, similarity);
    const educationScore = scoringService.applySemanticBoost(rawEduScore, similarity);
    const overallScore = scoringService.calculateOverallScore(skillsScore, experienceScore, educationScore);

    const feedback = await aiFeedbackService.generateFeedback(parsedData.rawText, jdContent, {
      skills: skillsScore,
      experience: experienceScore,
      education: educationScore,
    });

    // Store in ChromaDB for RAG
    await vectorStore.upsertResume(resume.id, resumeEmbedding, {
      name: parsedData.name,
      email: parsedData.email,
      overallScore: String(overallScore),
    });

    const result = await prisma.analysisResult.upsert({
      where: { resumeId_jobDescriptionId: { resumeId: resume.id, jobDescriptionId } },
      update: { skillsScore, experienceScore, educationScore, overallScore, feedback },
      create: {
        resumeId: resume.id,
        jobDescriptionId,
        skillsScore,
        experienceScore,
        educationScore,
        overallScore,
        feedback,
      },
    });

    return { result, parsedData };
  }

  async getResults(userId: string, jobDescriptionId: string): Promise<AnalysisResult[]> {
    const cacheKey = `results:${userId}:${jobDescriptionId}`;
    const cached = await cache.get<AnalysisResult[]>(cacheKey);
    if (cached) return cached;

    const results = await prisma.analysisResult.findMany({
      where: { jobDescriptionId, resume: { userId } },
      include: { resume: true },
      orderBy: { rank: 'asc' },
    });

    const output = results.map((r) => ({
      id: r.id,
      resumeId: r.resumeId,
      jobDescriptionId: r.jobDescriptionId,
      scores: {
        skills: r.skillsScore,
        experience: r.experienceScore,
        education: r.educationScore,
        overall: r.overallScore,
      },
      feedback: r.feedback as any,
      rank: r.rank ?? undefined,
      candidateName: (r.resume.parsedData as ParsedResume).name,
      candidateEmail: (r.resume.parsedData as ParsedResume).email,
      skills: (r.resume.parsedData as ParsedResume).skills,
      createdAt: r.createdAt.toISOString(),
    }));

    await cache.set(cacheKey, output, config.cache.resultsTtl);
    return output;
  }

  async getById(id: string, userId: string): Promise<AnalysisResult | null> {
    const result = await prisma.analysisResult.findFirst({
      where: { id, resume: { userId } },
      include: { resume: true, jobDescription: true },
    });

    if (!result) return null;

    return {
      id: result.id,
      resumeId: result.resumeId,
      jobDescriptionId: result.jobDescriptionId,
      scores: {
        skills: result.skillsScore,
        experience: result.experienceScore,
        education: result.educationScore,
        overall: result.overallScore,
      },
      feedback: result.feedback as any,
      rank: result.rank ?? undefined,
      candidateName: (result.resume.parsedData as ParsedResume).name,
      candidateEmail: (result.resume.parsedData as ParsedResume).email,
      skills: (result.resume.parsedData as ParsedResume).skills,
      createdAt: result.createdAt.toISOString(),
    };
  }

  private formatResult({ result, parsedData }: { result: any; parsedData: ParsedResume }): AnalysisResult {
    return {
      id: result.id,
      resumeId: result.resumeId,
      jobDescriptionId: result.jobDescriptionId,
      scores: {
        skills: result.skillsScore,
        experience: result.experienceScore,
        education: result.educationScore,
        overall: result.overallScore,
      },
      feedback: result.feedback,
      rank: result.rank ?? undefined,
      candidateName: parsedData.name,
      candidateEmail: parsedData.email,
      skills: parsedData.skills,
      createdAt: result.createdAt.toISOString(),
    };
  }
}

export const analysisService = new AnalysisService();