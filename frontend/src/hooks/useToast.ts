/**
 * 토스트 알림 관리 훅
 */
import { useState, useCallback } from 'react';
import { ToastMessage, ToastType } from '../components/ui/Toast';

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((
    type: ToastType, 
    title: string, 
    options?: {
      description?: string;
      duration?: number;
      action?: {
        label: string;
        onClick: () => void;
      };
    }
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newToast: ToastMessage = {
      id,
      type,
      title,
      description: options?.description,
      duration: options?.duration || 5000,
      action: options?.action,
    };

    setToasts(prev => [...prev, newToast]);

    // 접근성: 스크린 리더에 알림
    if (typeof window !== 'undefined') {
      const announcement = `${title}${options?.description ? `. ${options.description}` : ''}`;
      announceToScreenReader(announcement, type === 'error' ? 'assertive' : 'polite');
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // 편의 메서드들
  const success = useCallback((title: string, options?: Omit<Parameters<typeof addToast>[2], 'type'>) => {
    return addToast('success', title, options);
  }, [addToast]);

  const error = useCallback((title: string, options?: Omit<Parameters<typeof addToast>[2], 'type'>) => {
    return addToast('error', title, options);
  }, [addToast]);

  const warning = useCallback((title: string, options?: Omit<Parameters<typeof addToast>[2], 'type'>) => {
    return addToast('warning', title, options);
  }, [addToast]);

  const info = useCallback((title: string, options?: Omit<Parameters<typeof addToast>[2], 'type'>) => {
    return addToast('info', title, options);
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
  };
}

/**
 * 스크린 리더에 메시지 알리기
 */
function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', priority);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  
  document.body.appendChild(announcer);
  
  // 약간의 지연을 두고 메시지 설정 (스크린 리더가 인식할 수 있도록)
  setTimeout(() => {
    announcer.textContent = message;
  }, 100);
  
  // 메시지 전달 후 요소 제거
  setTimeout(() => {
    document.body.removeChild(announcer);
  }, 3000);
}

/**
 * 글로벌 토스트 컨텍스트
 */
import React, { createContext, useContext } from 'react';

const ToastContext = createContext<ReturnType<typeof useToast> | null>(null);

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};