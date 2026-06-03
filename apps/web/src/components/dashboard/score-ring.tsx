'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981'; // emerald
  if (score >= 60) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

export function ScoreRing({ score, size = 80, strokeWidth = 6, label, className }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className ?? ''}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-border"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-sm font-semibold"
          style={{ color }}
        >
          {score}
        </span>
      </div>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
}