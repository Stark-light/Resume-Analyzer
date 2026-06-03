'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, AlertTriangle, Lightbulb, CheckCircle } from 'lucide-react';
import { ScoreRing } from './score-ring';
import type { AnalysisResult } from '@resume-analyzer/shared';

interface CandidateDrawerProps {
  result: AnalysisResult | null;
  onClose: () => void;
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

export function CandidateDrawer({ result, onClose }: CandidateDrawerProps) {
  return (
    <AnimatePresence>
      {result && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border z-50 overflow-y-auto"
          >
            <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">{result.candidateName}</h2>
                <p className="text-xs text-muted-foreground">{result.candidateEmail}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Overall + section scores */}
              <div>
                <div className="flex items-center justify-center mb-6">
                  <div className="text-center">
                    <ScoreRing score={result.scores.overall} size={100} strokeWidth={8} />
                    <p className="text-sm text-muted-foreground mt-2">Overall Match</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Skills', value: result.scores.skills, color: '#10b981' },
                    { label: 'Experience', value: result.scores.experience, color: '#3b82f6' },
                    { label: 'Education', value: result.scores.education, color: '#8b5cf6' },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium" style={{ color }}>{value}%</span>
                      </div>
                      <ProgressBar value={value} color={color} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              {result.skills.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Skills Detected
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {result.skills.map((skill) => (
                      <span key={skill} className="text-xs px-2.5 py-1 rounded-full border border-border bg-muted font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths */}
              {result.feedback.strengths.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Strengths
                  </h3>
                  <ul className="space-y-2">
                    {result.feedback.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing skills */}
              {result.feedback.missingSkills.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Gaps
                  </h3>
                  <ul className="space-y-2">
                    {result.feedback.missingSkills.map((s, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {result.feedback.improvements.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-500" /> Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {result.feedback.improvements.map((s, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}