import React from 'react';
import { BookOpen } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

/**
 * Reusable clean EmptyState component for student views.
 */
export const EmptyState = ({
  icon: Icon = BookOpen,
  title = 'No content available',
  description = 'There are currently no items to display.',
  actionLabel,
  onAction,
  actionIcon,
  className = '',
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-6 sm:p-8 text-center rounded-2xl bg-white border border-dashed border-slate-200', className)}>
      <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 mb-3 shadow-xs">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button size="sm" onClick={onAction} icon={actionIcon}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
