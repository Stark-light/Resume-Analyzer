'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, Zap, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useRunAnalysis, useAnalysisResults, useResumes } from '@/hooks/use-api';
import { ResumeDropzone } from '@/components/dashboard/resume-dropzone';
import { JobDescriptionPanel } from '@/components/dashboard/job-description-panel';
import { RankingTable } from '@/components/dashboard/ranking-table';
import { CandidateDrawer } from '@/components/dashboard/candidate-drawer';
import type { AnalysisResult } from '@resume-analyzer/shared';

export default function DashboardPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [selectedJdId, setSelectedJdId] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<AnalysisResult | null>(null);

  const { data: resumes = [] } = useResumes();
  const { data: results = [], refetch } = useAnalysisResults(selectedJdId);
  const runAnalysis = useRunAnalysis();

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  if (loading || !user) return null;

  const handleRun = async () => {
    if (!selectedJdId) return;
    try {
      await runAnalysis.mutateAsync(selectedJdId);
    } catch (err: any) {
      console.error('Analysis failed:', err.response?.data?.error ?? err.message);
    }
  };

  const canRun = resumes.length > 0 && !!selectedJdId;

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-semibold tracking-tight text-sm">ResumeRank</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">{user.name}</span>
            <button
              onClick={() => { logout(); router.push('/'); }}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-semibold">Candidate Analysis</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload resumes, select a job description, and run AI-powered matching.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Resumes panel */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold">Resumes</h2>
                <span className="text-xs text-muted-foreground">{resumes.length} uploaded</span>
              </div>
              <ResumeDropzone />
            </motion.div>

            {/* JD panel */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <h2 className="text-sm font-semibold mb-4">Job Description</h2>
              <JobDescriptionPanel selectedId={selectedJdId} onSelect={setSelectedJdId} />
            </motion.div>

            {/* Run button */}
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={handleRun}
              disabled={!canRun || runAnalysis.isPending}
              className="w-full py-3 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
            >
              {runAnalysis.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Run Analysis
                </>
              )}
            </motion.button>

            {!canRun && (
              <p className="text-xs text-muted-foreground text-center">
                {resumes.length === 0 ? 'Upload at least one resume' : 'Select a job description'}
              </p>
            )}

            {runAnalysis.isError && (
              <p className="text-xs text-rose-500 text-center">
                {(runAnalysis.error as any)?.response?.data?.error ?? 'Analysis failed'}
              </p>
            )}
          </div>

          {/* Results column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-sm font-semibold">Candidate Rankings</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {results.length > 0 ? `${results.length} candidates ranked` : 'Run analysis to see results'}
                  </p>
                </div>
                {results.length > 0 && (
                  <button
                    onClick={() => refetch()}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>

              <RankingTable results={results} onSelect={setSelectedCandidate} />
            </motion.div>
          </div>
        </div>
      </main>

      <CandidateDrawer result={selectedCandidate} onClose={() => setSelectedCandidate(null)} />
    </div>
  );
}