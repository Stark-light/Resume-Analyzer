'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useUploadResumes, useResumes, useDeleteResume } from '@/hooks/use-api';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function ResumeDropzone() {
  const { data: resumes = [], isLoading } = useResumes();
  const uploadMutation = useUploadResumes();
  const deleteMutation = useDeleteResume();
  const [uploadError, setUploadError] = useState('');

  const onDrop = useCallback(
    async (accepted: File[]) => {
      setUploadError('');
      try {
        await uploadMutation.mutateAsync(accepted);
      } catch (err: any) {
        setUploadError(err.response?.data?.error ?? 'Upload failed');
      }
    },
    [uploadMutation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-foreground bg-muted'
            : 'border-border hover:border-foreground/40 hover:bg-muted/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          {uploadMutation.isPending ? (
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          ) : (
            <Upload className={`w-8 h-8 ${isDragActive ? 'text-foreground' : 'text-muted-foreground'}`} />
          )}
          <div>
            <p className="text-sm font-medium">
              {isDragActive ? 'Drop resumes here' : 'Drag & drop resumes'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">PDF or DOCX · Up to 10MB each · Multiple files OK</p>
          </div>
        </div>
      </div>

      {uploadError && (
        <p className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-3 py-2 rounded-lg">{uploadError}</p>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <AnimatePresence>
          {resumes.map((resume: any) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
            >
              <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{resume.originalName}</p>
                <p className="text-xs text-muted-foreground">
                  {(resume.parsedData as any).name} · {formatBytes(resume.fileSize)}
                </p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <button
                onClick={() => deleteMutation.mutate(resume.id)}
                className="p-1 rounded hover:bg-muted transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}