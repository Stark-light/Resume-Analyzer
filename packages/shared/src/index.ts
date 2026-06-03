export interface ParsedResume {
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  rawText: string;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  duration: string;
  description: string;
  years?: number;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  year?: string;
  field?: string;
}

export interface SectionScores {
  skills: number;
  experience: number;
  education: number;
  overall: number;
}

export interface AnalysisFeedback {
  strengths: string[];
  missingSkills: string[];
  improvements: string[];
}

export interface AnalysisResult {
  id: string;
  resumeId: string;
  jobDescriptionId: string;
  scores: SectionScores;
  feedback: AnalysisFeedback;
  rank?: number;
  candidateName: string;
  candidateEmail: string;
  skills: string[];
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}