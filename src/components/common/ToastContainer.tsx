import React from 'react';
import { useToast } from '../../context/ToastContext';
import { Check, Info, AlertCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 md:bottom-6 right-4 md:right-8 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        const icon =
          toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-lacquer flex-shrink-0" />
          ) : toast.type === 'info' ? (
            <Info className="w-4 h-4 text-bronze flex-shrink-0" />
          ) : (
            <Check className="w-4 h-4 text-ink-900 flex-shrink-0" />
          );

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-paper-100/98 backdrop-blur-md border border-ink-900/15 shadow-elevated p-3.5 flex items-center justify-between text-xs text-ink-900 animate-fade-in transition-all"
          >
            <div className="flex items-center space-x-2.5">
              {icon}
              <span className="font-medium tracking-tight">{toast.message}</span>
            </div>

            <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
              {toast.actionText && toast.onAction && (
                <button
                  onClick={() => {
                    toast.onAction?.();
                    removeToast(toast.id);
                  }}
                  className="underline font-semibold text-ink-900 hover:text-lacquer"
                >
                  {toast.actionText}
                </button>
              )}
              <button
                onClick={() => removeToast(toast.id)}
                className="text-ink-400 hover:text-ink-900 p-0.5"
                aria-label="알림 닫기"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
