import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
  actionText?: string;
  onAction?: () => void;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error', actionText?: string, onAction?: () => void) => void;
  addToast: (message: string, type?: 'success' | 'info' | 'error', actionText?: string, onAction?: () => void) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success', actionText?: string, onAction?: () => void) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast: Toast = { id, message, type, actionText, onAction };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, addToast: showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
