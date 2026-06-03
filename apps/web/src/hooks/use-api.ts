import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { AnalysisResult } from '@resume-analyzer/shared';

// ── Resumes ──────────────────────────────────────────────
export function useResumes() {
  return useQuery({
    queryKey: ['resumes'],
    queryFn: () => api.get('/resumes').then((r) => r.data),
  });
}

export function useUploadResumes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => {
      const fd = new FormData();
      files.forEach((f) => fd.append('files', f));
      return api.post('/resumes/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resumes'] }),
  });
}

export function useDeleteResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/resumes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resumes'] }),
  });
}

// ── Job Descriptions ──────────────────────────────────────
export function useJobDescriptions() {
  return useQuery({
    queryKey: ['job-descriptions'],
    queryFn: () => api.get('/analysis/job-descriptions').then((r) => r.data),
  });
}

export function useSaveJobDescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; content: string }) =>
      api.post('/analysis/job-descriptions', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['job-descriptions'] }),
  });
}

// ── Analysis ──────────────────────────────────────────────
export function useRunAnalysis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobDescriptionId: string) =>
      api.post<AnalysisResult[]>('/analysis/run', { jobDescriptionId }).then((r) => r.data),
    onSuccess: (_data, jdId) => {
      qc.invalidateQueries({ queryKey: ['analysis-results', jdId] });
    },
  });
}

export function useAnalysisResults(jobDescriptionId: string | null) {
  return useQuery({
    queryKey: ['analysis-results', jobDescriptionId],
    queryFn: () =>
      api.get<AnalysisResult[]>('/analysis/results', { params: { jobDescriptionId } }).then((r) => r.data),
    enabled: !!jobDescriptionId,
  });
}

export function useAnalysisById(id: string | null) {
  return useQuery({
    queryKey: ['analysis', id],
    queryFn: () => api.get<AnalysisResult>(`/analysis/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}