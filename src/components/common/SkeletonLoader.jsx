import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Reusable high-density Skeleton loader for zero-CLS loading states.
 */
export const SkeletonLoader = ({
  variant = 'text', // 'text' | 'rect' | 'circle' | 'card' | 'grid' | 'dashboard'
  rows = 1,
  className = '',
}) => {
  if (variant === 'dashboard') {
    return (
      <div className="space-y-4 animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-32 sm:h-36 bg-slate-200 rounded-2xl w-full" />
        
        {/* Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="w-8 h-8 bg-slate-100 rounded-xl" />
              </div>
              <div className="h-3 bg-slate-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-pulse">
        {Array.from({ length: rows * 3 }).map((_, i) => (
          <div key={i} className="h-28 bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="w-8 h-8 bg-slate-100 rounded-xl" />
            </div>
            <div className="h-3 bg-slate-100 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn('student-card animate-pulse space-y-3', className)}>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="w-8 h-8 bg-slate-200 rounded-lg" />
        </div>
        <div className="h-6 bg-slate-200 rounded w-1/2" />
        <div className="h-3 bg-slate-200 rounded w-2/3" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse bg-slate-200',
            variant === 'circle' && 'rounded-full',
            variant === 'rect' && 'rounded-xl',
            variant === 'text' && 'h-4 rounded-md w-full',
            className
          )}
        />
      ))}
    </div>
  );
};
