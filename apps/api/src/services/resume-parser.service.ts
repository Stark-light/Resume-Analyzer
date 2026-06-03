import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import type { ParsedResume, ExperienceEntry, EducationEntry } from '@resume-analyzer/shared';

const SKILL_KEYWORDS = [
  // Languages
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin',
  // Frontend
  'react', 'vue', 'angular', 'nextjs', 'svelte', 'html', 'css', 'tailwind', 'sass',
  // Backend
  'nodejs', 'express', 'fastapi', 'django', 'spring', 'nestjs', 'graphql', 'rest',
  // Data / AI
  'machine learning', 'deep learning', 'nlp', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn',
  // Cloud / DevOps
  'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'terraform', 'ci/cd', 'github actions',
  // Databases
  'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'prisma', 'sql',
  // Other
  'git', 'linux', 'agile', 'scrum', 'microservices', 'websocket', 'grpc',
];

export class ResumeParserService {
  async extractText(filePath: string, mimeType: string): Promise<string> {
    if (mimeType === 'application/pdf') {
      const buffer = fs.readFileSync(filePath);
      const result = await pdfParse(buffer);
      return result.text;
    }

    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      path.extname(filePath).toLowerCase() === '.docx'
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }

    throw new Error(`Unsupported file type: ${mimeType}`);
  }

  parse(rawText: string): ParsedResume {
    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

    return {
      name: this.extractName(lines),
      email: this.extractEmail(rawText),
      phone: this.extractPhone(rawText),
      skills: this.extractSkills(rawText),
      experience: this.extractExperience(lines),
      education: this.extractEducation(lines),
      rawText,
    };
  }

  private extractName(lines: string[]): string {
    // First non-trivial line is usually the name
    for (const line of lines.slice(0, 5)) {
      if (
        line.length > 2 &&
        line.length < 60 &&
        !line.includes('@') &&
        !line.match(/\d{3}/) &&
        !line.toLowerCase().includes('resume') &&
        !line.toLowerCase().includes('curriculum')
      ) {
        return line;
      }
    }
    return 'Unknown';
  }

  private extractEmail(text: string): string {
    const match = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
    return match?.[0] ?? '';
  }

  private extractPhone(text: string): string | undefined {
    const match = text.match(/(\+?[\d\s\-().]{10,})/);
    return match?.[0].trim();
  }

  private extractSkills(text: string): string[] {
    const lower = text.toLowerCase();
    const found = new Set<string>();

    for (const skill of SKILL_KEYWORDS) {
      if (lower.includes(skill)) {
        found.add(skill.charAt(0).toUpperCase() + skill.slice(1));
      }
    }

    // Also grab lines under "Skills" section
    const skillsSection = text.match(/skills[:\s]*\n([\s\S]*?)(?:\n\n|\n[A-Z])/i);
    if (skillsSection) {
      const items = skillsSection[1]
        .split(/[,•|\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 1 && s.length < 30);
      items.forEach((item) => found.add(item));
    }

    return [...found].slice(0, 25);
  }

  private extractExperience(lines: string[]): ExperienceEntry[] {
    const experiences: ExperienceEntry[] = [];
    let inExperience = false;
    let current: Partial<ExperienceEntry> | null = null;

    const expHeaders = /^(experience|work experience|employment|professional experience)/i;
    const nextSection = /^(education|skills|projects|certifications|awards|publications)/i;
    const datePattern = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|20\d\d|19\d\d|present|current)\b/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (expHeaders.test(line)) { inExperience = true; continue; }
      if (nextSection.test(line) && inExperience) {
        if (current?.title) experiences.push(this.finalizeExp(current));
        inExperience = false;
        current = null;
        continue;
      }

      if (inExperience) {
        if (datePattern.test(line) || line.includes('–') || line.includes('-')) {
          if (current?.title) experiences.push(this.finalizeExp(current));
          current = {
            title: lines[i - 1] ?? line,
            company: '',
            duration: line,
            description: '',
          };
        } else if (current) {
          if (!current.company && line.length < 60) {
            current.company = line;
          } else {
            current.description = ((current.description ?? '') + ' ' + line).trim();
          }
        }
      }
    }

    if (current?.title) experiences.push(this.finalizeExp(current));
    return experiences.slice(0, 6);
  }

  private finalizeExp(partial: Partial<ExperienceEntry>): ExperienceEntry {
    const durationText = partial.duration ?? '';
    const years = this.estimateYears(durationText);
    return {
      title: partial.title ?? 'Unknown Role',
      company: partial.company ?? 'Unknown Company',
      duration: durationText,
      description: partial.description ?? '',
      years,
    };
  }

  private estimateYears(duration: string): number {
    const yearMatch = duration.match(/(\d{4})\s*[-–]\s*(\d{4}|present|current)/i);
    if (yearMatch) {
      const start = parseInt(yearMatch[1]);
      const end = yearMatch[2].toLowerCase() === 'present' || yearMatch[2].toLowerCase() === 'current'
        ? new Date().getFullYear()
        : parseInt(yearMatch[2]);
      return Math.max(0, end - start);
    }
    return 1; // default assumption
  }

  private extractEducation(lines: string[]): EducationEntry[] {
    const education: EducationEntry[] = [];
    let inEdu = false;
    const eduHeader = /^(education|academic|qualifications)/i;
    const nextSection = /^(experience|skills|projects|certifications|work)/i;
    const degreeKeywords = /\b(bachelor|master|phd|b\.?sc|m\.?sc|b\.?tech|m\.?tech|be|me|bca|mca|mba|b\.?e|m\.?e|associate|diploma)\b/i;

    for (const line of lines) {
      if (eduHeader.test(line)) { inEdu = true; continue; }
      if (nextSection.test(line) && inEdu) { inEdu = false; continue; }

      if (inEdu && degreeKeywords.test(line)) {
        const yearMatch = line.match(/\b(20\d\d|19\d\d)\b/);
        education.push({
          degree: line.replace(/\d{4}/, '').trim(),
          institution: lines[lines.indexOf(line) + 1] ?? '',
          year: yearMatch?.[0],
          field: this.extractField(line),
        });
      }
    }

    return education.slice(0, 3);
  }

  private extractField(line: string): string | undefined {
    const fields = ['computer science', 'information technology', 'software engineering', 'data science', 'electrical', 'mechanical'];
    const lower = line.toLowerCase();
    return fields.find((f) => lower.includes(f));
  }
}

export const resumeParser = new ResumeParserService();