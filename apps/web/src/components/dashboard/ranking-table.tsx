'use client';

import { motion } from 'framer-motion';
import { Trophy, ChevronRight } from 'lucide-react';
import { ScoreRing } from './score-ring';
import type { AnalysisResult } from '@resume-analyzer/shared';

interface RankingTableProps {
  results: AnalysisResult[];
  onSelect: (result: AnalysisResult) => void;
}

const RANK_BADGE: Record<number, string> = {
  1: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  2: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  3: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

export function RankingTable({ results, onSelect }: RankingTableProps) {
  if (results.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Trophy className="w-8 h-8 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No results yet. Run analysis to see rankings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {results.map((result, idx) => (
        <motion.button
          key={result.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          onClick={() => onSelect(result)}
          className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-foreground/20 hover:shadow-sm transition-all text-left group"
        >
          {/* Rank */}
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              RANK_BADGE[result.rank ?? 99] ?? 'bg-muted text-muted-foreground'
            }`}
          >
            {result.rank}
          </span>

          {/* Score ring */}
          <ScoreRing score={result.scores.overall} size={48} strokeWidth={4} />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{result.candidateName}</p>
            <p className="text-xs text-muted-foreground truncate">{result.candidateEmail}</p>
          </div>

          {/* Section scores */}
          <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
            <div className="text-center">
              <p className="font-medium text-foreground">{result.scores.skills}%</p>
              <p>Skills</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">{result.scores.experience}%</p>
              <p>Exp.</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">{result.scores.education}%</p>
              <p>Edu.</p>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
        </motion.button>
      ))}
    </div>
  );
}