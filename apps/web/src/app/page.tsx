'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, BarChart3, Shield, Layers } from 'lucide-react';

const features = [
  { icon: Zap, title: 'Instant Analysis', desc: 'Semantic embeddings score resumes against your JD in seconds, not hours.' },
  { icon: BarChart3, title: 'Section-wise Scoring', desc: 'Skills (40%), Experience (40%), Education (20%) — weighted exactly right.' },
  { icon: Shield, title: 'RAG-Powered Insights', desc: 'Vector DB retrieval surfaces the most relevant candidates from your pool.' },
  { icon: Layers, title: 'Ranked Leaderboard', desc: 'Candidates ranked by overall match score. No bias, just data.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-semibold tracking-tight">ResumeRank</span>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Log in
            </Link>
            <Link
              href="/auth/register"
              className="text-sm px-4 py-1.5 rounded-md bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full border border-border bg-muted text-muted-foreground mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              AI-powered candidate evaluation
            </span>

            <h1 className="text-5xl sm:text-7xl font-semibold tracking-tight leading-[1.08] mb-6">
              Hire the right person.
              <br />
              <span className="text-muted-foreground">Every time.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Upload resumes, paste a job description, and get AI-generated match scores with actionable feedback — in under 30 seconds.
            </p>

            <div className="flex items-center justify-center gap-3">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Start for free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                Sign in
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }}
                className="p-6 rounded-xl border border-border bg-card hover:border-foreground/20 transition-colors"
              >
                <f.icon className="w-5 h-5 mb-4 text-foreground" />
                <h3 className="text-sm font-semibold mb-2">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <span>ResumeRank</span>
          <span>Built with Next.js, OpenAI & ChromaDB</span>
        </div>
      </footer>
    </div>
  );
}