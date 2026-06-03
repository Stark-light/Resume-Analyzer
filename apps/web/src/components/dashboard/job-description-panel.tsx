'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronDown, Plus } from 'lucide-react';
import { useSaveJobDescription, useJobDescriptions } from '@/hooks/use-api';

interface JobDescriptionPanelProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function JobDescriptionPanel({ selectedId, onSelect }: JobDescriptionPanelProps) {
  const { data: jds = [] } = useJobDescriptions();
  const saveMutation = useSaveJobDescription();
  const [form, setForm] = useState({ title: '', content: '' });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const jd = await saveMutation.mutateAsync(form);
      setForm({ title: '', content: '' });
      setShowForm(false);
      onSelect(jd.id);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to save');
    }
  };

  return (
    <div className="space-y-4">
      {/* Saved JDs */}
      {jds.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Saved</p>
          {jds.map((jd: any) => (
            <button
              key={jd.id}
              onClick={() => onSelect(jd.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                selectedId === jd.id
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border hover:border-foreground/30 hover:bg-muted'
              }`}
            >
              <span className="font-medium">{jd.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Add new */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-border hover:border-foreground/40 text-sm text-muted-foreground hover:text-foreground transition-all"
      >
        <Plus className="w-4 h-4" />
        New job description
      </button>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSave}
            className="space-y-3 overflow-hidden"
          >
            <input
              type="text"
              required
              placeholder="e.g. Senior Frontend Engineer"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <textarea
              required
              minLength={50}
              rows={8}
              placeholder="Paste the job description here..."
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono"
            />

            {error && <p className="text-xs text-rose-500">{error}</p>}

            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="w-full py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Save & select
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}