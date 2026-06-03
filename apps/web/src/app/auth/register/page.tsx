'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form.email, form.password, form.name);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8">
          <Link href="/" className="text-sm font-semibold tracking-tight">ResumeRank</Link>
          <h1 className="text-2xl font-semibold mt-6 mb-1">Create your workspace</h1>
          <p className="text-sm text-muted-foreground">Start evaluating candidates today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Full name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Alex Johnson"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Min. 8 characters"
            />
          </div>

          {error && <p className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-3 py-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create account
          </button>
        </form>

        <p className="text-sm text-muted-foreground mt-6 text-center">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}