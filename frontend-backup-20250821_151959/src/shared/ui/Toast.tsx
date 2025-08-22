/**
 * 토스트 알림 컴포넌트
 * 접근성을 고려한 사용자 피드백 시스템
 */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, AlertCircle, Info } from '../../components/icons/LucideIcons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(toast.id), 300);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const getToastConfig = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50 border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          descColor: 'text-green-700',
          ariaLabel: '성공 알림'
        };
      case 'error':
        return {
          icon: XCircle,
          bgColor: 'bg-red-50 border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          descColor: 'text-red-700',
          ariaLabel: '오류 알림'
        };
      case 'warning':
        return {
          icon: AlertCircle,
          bgColor: 'bg-yellow-50 border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          descColor: 'text-yellow-700',
          ariaLabel: '경고 알림'
        };
      case 'info':
        return {
          icon: Info,
          bgColor: 'bg-blue-50 border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          descColor: 'text-blue-700',
          ariaLabel: '정보 알림'
        };
    }
  };

  const config = getToastConfig(toast.type);
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}\n          animate={{ opacity: 1, y: 0, scale: 1 }}\n          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}\n          className={`\n            max-w-sm w-full ${config.bgColor} border rounded-lg shadow-lg pointer-events-auto\n            ring-1 ring-black ring-opacity-5 overflow-hidden\n          `}\n          role=\"alert\"\n          aria-live={toast.type === 'error' ? 'assertive' : 'polite'}\n          aria-label={config.ariaLabel}\n        >\n          <div className=\"p-4\">\n            <div className=\"flex items-start\">\n              <div className=\"flex-shrink-0\">\n                <Icon className={`w-5 h-5 ${config.iconColor}`} aria-hidden=\"true\" />\n              </div>\n              \n              <div className=\"ml-3 w-0 flex-1\">\n                <p className={`text-sm font-medium ${config.titleColor}`}>\n                  {toast.title}\n                </p>\n                \n                {toast.description && (\n                  <p className={`mt-1 text-sm ${config.descColor}`}>\n                    {toast.description}\n                  </p>\n                )}\n                \n                {toast.action && (\n                  <div className=\"mt-3\">\n                    <button\n                      onClick={toast.action.onClick}\n                      className={`\n                        text-sm font-medium ${config.titleColor} hover:${config.descColor}\n                        focus:outline-none focus:ring-2 focus:ring-elderberry-500 focus:ring-offset-2\n                        rounded-md px-2 py-1\n                      `}\n                    >\n                      {toast.action.label}\n                    </button>\n                  </div>\n                )}\n              </div>\n              \n              <div className=\"ml-4 flex-shrink-0 flex\">\n                <button\n                  onClick={() => {\n                    setIsVisible(false);\n                    setTimeout(() => onClose(toast.id), 300);\n                  }}\n                  className={`\n                    rounded-md inline-flex ${config.descColor} hover:${config.titleColor}\n                    focus:outline-none focus:ring-2 focus:ring-elderberry-500 focus:ring-offset-2\n                    p-1\n                  `}\n                  aria-label=\"알림 닫기\"\n                >\n                  <X className=\"w-4 h-4\" aria-hidden=\"true\" />\n                </button>\n              </div>\n            </div>\n          </div>\n        </motion.div>\n      )}\n    </AnimatePresence>\n  );\n};\n\nexport default Toast;\n\n/**\n * 토스트 컨테이너 컴포넌트\n */\ninterface ToastContainerProps {\n  toasts: ToastMessage[];\n  onClose: (id: string) => void;\n  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';\n}\n\nexport const ToastContainer: React.FC<ToastContainerProps> = ({ \n  toasts, \n  onClose, \n  position = 'top-right' \n}) => {\n  const getPositionClasses = () => {\n    switch (position) {\n      case 'top-right':\n        return 'top-0 right-0';\n      case 'top-left':\n        return 'top-0 left-0';\n      case 'bottom-right':\n        return 'bottom-0 right-0';\n      case 'bottom-left':\n        return 'bottom-0 left-0';\n      case 'top-center':\n        return 'top-0 left-1/2 transform -translate-x-1/2';\n      case 'bottom-center':\n        return 'bottom-0 left-1/2 transform -translate-x-1/2';\n      default:\n        return 'top-0 right-0';\n    }\n  };\n\n  return (\n    <div \n      className={`fixed z-50 p-4 space-y-2 ${getPositionClasses()}`}\n      aria-live=\"polite\"\n      aria-label=\"알림 영역\"\n    >\n      <AnimatePresence>\n        {toasts.map((toast) => (\n          <Toast key={toast.id} toast={toast} onClose={onClose} />\n        ))}\n      </AnimatePresence>\n    </div>\n  );\n};