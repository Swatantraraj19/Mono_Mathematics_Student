import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Reusable accessible Modal dialog for video player, confirmations, etc.
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-lg',
  closeOnBackdropClick = true,
  className = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-3 text-center sm:p-0">
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            'relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-h-[94vh] flex flex-col border border-slate-200 animate-fadeIn',
            maxWidth,
            className
          )}
        >
          {/* Header */}
          {(title || onClose) && (
            <div className="flex items-start justify-between border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-3.5 shrink-0">
              <div className="min-w-0 pr-2">
                {title && (
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="mt-0.5 text-[11px] sm:text-xs text-slate-500 truncate leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="px-4 py-3 sm:px-5 sm:py-4 overflow-y-auto flex-1">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="bg-slate-50/80 border-t border-slate-100 px-4 py-2.5 sm:px-5 sm:py-3 flex flex-row-reverse gap-2 rounded-b-2xl shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
