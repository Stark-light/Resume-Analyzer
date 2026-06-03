import OpenAI from 'openai';
import { config } from '../config';
import { logger } from '../utils/logger';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

export class EmbeddingService {
  async createEmbedding(text: string): Promise<number[]> {
    const cleaned = text.replace(/\s+/g, ' ').trim().slice(0, 8000);

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: cleaned,
    });

    return response.data[0].embedding;
  }

  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embedding dimension mismatch');
    }

    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) return 0;

    return dot / denominator;
  }

  // Normalize similarity score from [-1, 1] to [0, 100]
  normalizeScore(similarity: number): number {
    return Math.round(((similarity + 1) / 2) * 100);
  }
}

export class AIFeedbackService {
  async generateFeedback(
    resumeText: string,
    jobDescription: string,
    scores: { skills: number; experience: number; education: number }
  ): Promise<{ strengths: string[]; missingSkills: string[]; improvements: string[] }> {
    const prompt = `You are an expert HR recruiter and career coach. Analyze this resume against the job description and provide structured feedback.

JOB DESCRIPTION:
${jobDescription.slice(0, 1500)}

RESUME:
${resumeText.slice(0, 2000)}

SCORES:
- Skills Match: ${scores.skills}%
- Experience Match: ${scores.experience}%
- Education Match: ${scores.education}%

Respond in JSON format only:
{
  "strengths": ["...", "...", "..."],
  "missingSkills": ["...", "...", "..."],
  "improvements": ["...", "...", "..."]
}

Be specific, concise, and actionable. Each array should have 3-5 items.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content ?? '{}';
      return JSON.parse(content);
    } catch (err) {
      logger.error('Feedback generation failed', { error: err });
      return {
        strengths: ['Resume submitted successfully'],
        missingSkills: ['Unable to analyze at this time'],
        improvements: ['Please retry the analysis'],
      };
    }
  }
}

export const embeddingService = new EmbeddingService();
export const aiFeedbackService = new AIFeedbackService();