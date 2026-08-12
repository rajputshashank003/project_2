import React from 'react';

export const SkeletonText: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = 'h-48 w-full' }) => (
  <div className={`animate-pulse bg-slate-200 rounded-2xl ${className}`} />
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="space-y-3 w-full animate-pulse">
    <div className="h-10 bg-slate-200 rounded-xl" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-12 bg-slate-100 rounded-xl" />
    ))}
  </div>
);
