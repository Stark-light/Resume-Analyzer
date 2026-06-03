import type { ParsedResume } from '@resume-analyzer/shared';
import { config } from '../config';

interface ScoringContext {
  resume: ParsedResume;
  jobDescription: string;
  semanticSimilarity: number; // 0-1
}

export class ScoringService {
  calculateSkillScore(resume: ParsedResume, jobDescription: string): number {
    const jdLower = jobDescription.toLowerCase();
    const resumeSkills = resume.skills.map((s) => s.toLowerCase());

    const jdWords = new Set(
      jdLower
        .split(/[\s,.()\n]+/)
        .filter((w) => w.length > 2)
    );

    let matched = 0;
    for (const skill of resumeSkills) {
      const skillWords = skill.split(' ');
      if (skillWords.every((word) => jdLower.includes(word))) {
        matched++;
      }
    }

    // Also check keyword density
    const jdSkillDemands = this.extractJdSkills(jobDescription);
    const jdMatched = jdSkillDemands.filter((s) =>
      resumeSkills.some((r) => r.includes(s) || s.includes(r))
    ).length;

    const directMatchRate = resumeSkills.length > 0 ? matched / Math.max(resumeSkills.length, 5) : 0;
    const jdMatchRate = jdSkillDemands.length > 0 ? jdMatched / jdSkillDemands.length : directMatchRate;

    return Math.round(Math.min(100, ((directMatchRate * 0.4 + jdMatchRate * 0.6) * 100)));
  }

  calculateExperienceScore(resume: ParsedResume, jobDescription: string): number {
    const totalYears = resume.experience.reduce((sum, exp) => sum + (exp.years ?? 0), 0);

    // Extract required years from JD
    const yearsRequired = this.extractRequiredYears(jobDescription);
    const yearsScore = yearsRequired > 0
      ? Math.min(1, totalYears / yearsRequired)
      : totalYears >= 3 ? 1 : totalYears / 3;

    // Check title/role relevance
    const jdLower = jobDescription.toLowerCase();
    const titleMatches = resume.experience.filter((exp) => {
      const titleWords = exp.title.toLowerCase().split(' ');
      return titleWords.some((w) => w.length > 3 && jdLower.includes(w));
    }).length;

    const relevanceScore = resume.experience.length > 0
      ? Math.min(1, titleMatches / resume.experience.length)
      : 0;

    return Math.round((yearsScore * 0.6 + relevanceScore * 0.4) * 100);
  }

  calculateEducationScore(resume: ParsedResume, jobDescription: string): number {
    const jdLower = jobDescription.toLowerCase();

    const degreeLevel = {
      phd: 4, doctorate: 4,
      master: 3, msc: 3, mtech: 3, mca: 3, mba: 3,
      bachelor: 2, bsc: 2, btech: 2, bca: 2, be: 2,
      associate: 1, diploma: 1,
    };

    let maxDegreeScore = 0;
    for (const edu of resume.education) {
      const lower = edu.degree.toLowerCase();
      for (const [keyword, score] of Object.entries(degreeLevel)) {
        if (lower.includes(keyword)) {
          maxDegreeScore = Math.max(maxDegreeScore, score);
        }
      }
    }

    // Required degree from JD
    let requiredLevel = 2; // default: bachelor's
    if (jdLower.includes('phd') || jdLower.includes('doctorate')) requiredLevel = 4;
    else if (jdLower.includes('master') || jdLower.includes('mba')) requiredLevel = 3;

    const degreeScore = Math.min(1, maxDegreeScore / requiredLevel);

    // Field relevance
    const relevantFields = ['computer science', 'software', 'information technology', 'engineering', 'data science', 'mathematics'];
    const hasRelevantField = resume.education.some((edu) => {
      const text = `${edu.degree} ${edu.field ?? ''}`.toLowerCase();
      return relevantFields.some((f) => text.includes(f));
    });

    return Math.round((degreeScore * 0.7 + (hasRelevantField ? 0.3 : 0)) * 100);
  }

  calculateOverallScore(skillsScore: number, experienceScore: number, educationScore: number): number {
    const { weights } = config.scoring;
    return Math.round(
      skillsScore * weights.skills +
      experienceScore * weights.experience +
      educationScore * weights.education
    );
  }

  // Boost scores using semantic similarity from embeddings
  applySemanticBoost(baseScore: number, similarity: number): number {
    const normalizedSimilarity = Math.round(((similarity + 1) / 2) * 100);
    // Blend base score with semantic similarity (60/40 split)
    return Math.round(baseScore * 0.6 + normalizedSimilarity * 0.4);
  }

  private extractJdSkills(jd: string): string[] {
    const techSkills = [
      'react', 'node', 'python', 'typescript', 'javascript', 'sql', 'aws', 'docker',
      'kubernetes', 'graphql', 'mongodb', 'postgresql', 'redis', 'git', 'css', 'html',
      'java', 'kotlin', 'swift', 'go', 'rust', 'angular', 'vue', 'nextjs', 'django',
      'fastapi', 'spring', 'terraform', 'linux', 'machine learning', 'tensorflow',
    ];
    const jdLower = jd.toLowerCase();
    return techSkills.filter((s) => jdLower.includes(s));
  }

  private extractRequiredYears(jd: string): number {
    const match = jd.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i);
    return match ? parseInt(match[1]) : 0;
  }
}

export const scoringService = new ScoringService();