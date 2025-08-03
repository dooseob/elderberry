/**
 * 토스트 알림 관리 훅
 */
import { useState, useCallback } from 'react';
import { ToastMessage, ToastType } from '../../shared/ui/Toast';

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
import React, { createContext, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from '../components/icons/LucideIcons';

/**
 * Toast 컴포넌트
 */
interface ToastComponentProps extends ToastMessage {
  onClose: () => void;
}

const ToastComponent: React.FC<ToastComponentProps> = ({
  id,
  type,
  title,
  description,
  duration = 5000,
  action,
  onClose
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const IconComponent = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`
        min-w-80 max-w-md p-4 rounded-lg border shadow-lg ${colors[type]}
        relative flex items-start space-x-3
      `}
      role="alert"
      aria-live="assertive"
    >
      <IconComponent className="w-5 h-5 flex-shrink-0 mt-0.5" />
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{title}</p>
        {description && (
          <p className="text-sm opacity-90 mt-1">{description}</p>
        )}
        
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-sm font-medium underline hover:no-underline"
          >
            {action.label}
          </button>
        )}
      </div>
      
      <button
        onClick={onClose}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="알림 닫기"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

const ToastContext = createContext<ReturnType<typeof useToast> | null>(null);

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast 컨테이너 렌더링 */}
      <div 
        className="fixed top-4 right-4 z-50 space-y-2"
        aria-live="polite"
        aria-label="알림 메시지"
      >
        {toast.toasts.map((toastMsg) => (
          <ToastComponent
            key={toastMsg.id}
            {...toastMsg}
            onClose={() => toast.removeToast(toastMsg.id)}
          />
        ))}
      </div>
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