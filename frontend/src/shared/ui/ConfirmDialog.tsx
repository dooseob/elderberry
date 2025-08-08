/**
 * ConfirmDialog - 확인 다이얼로그 컴포넌트
 * 중요한 액션에 대한 사용자 확인을 받는 모달
 */

import React from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from './Modal';
import { Button } from './Button';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'info' | 'warning' | 'danger' | 'success';
  isLoading?: boolean;
}

const variantConfig = {
  info: {
    icon: Info,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    confirmButtonVariant: 'primary' as const
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
    confirmButtonVariant: 'primary' as const
  },
  danger: {
    icon: XCircle,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    confirmButtonVariant: 'primary' as const
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    confirmButtonVariant: 'primary' as const
  }
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  variant = 'info',
  isLoading = false
}) => {
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.iconBg}`}>
              <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
            </div>
            <ModalTitle>{title}</ModalTitle>
          </div>
        </ModalHeader>
        
        <div className="px-6 py-4">
          <p className="text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>

        <ModalFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={config.confirmButtonVariant}
            onClick={onConfirm}
            disabled={isLoading}
            className={variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {isLoading ? '처리 중...' : confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmDialog;