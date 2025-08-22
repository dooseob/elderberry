/**
 * useModal Hook
 * 모달 상태 관리와 UI 제어를 위한 종합적인 Hook
 * 
 * @version 3.0.0
 * @features
 * - 단일/다중 모달 상태 관리
 * - 모달 스택 관리 (중첩 모달)
 * - 애니메이션 상태 추적
 * - 포커스 관리 및 복원
 * - ESC 키 및 오버레이 클릭 처리
 * - 모달 간 데이터 전달
 * - 비동기 모달 (로딩/에러 상태)
 * - 접근성 완전 지원
 * - React 18 호환
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useLinearTheme } from '../../hooks/useLinearTheme';

// === 타입 정의 ===

interface ModalConfig {
  /** 모달 ID */
  id: string;
  /** 모달 제목 */
  title?: string;
  /** 모달 크기 */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** 닫기 버튼 표시 */
  closable?: boolean;
  /** ESC 키로 닫기 */
  closeOnEsc?: boolean;
  /** 오버레이 클릭으로 닫기 */
  closeOnOverlayClick?: boolean;
  /** 애니메이션 활성화 */
  animated?: boolean;
  /** 지속성 (다른 모달이 열려도 닫히지 않음) */
  persistent?: boolean;
  /** 자동 포커스 */
  autoFocus?: boolean;
  /** 최대 지속 시간 (ms) */
  timeout?: number;
  /** 모달 데이터 */
  data?: any;
  /** 모달 콘텐츠 */
  content?: React.ReactNode;
  /** 헤더 콘텐츠 */
  header?: React.ReactNode;
  /** 푸터 콘텐츠 */
  footer?: React.ReactNode;
  /** 성공 콜백 */
  onConfirm?: (data?: any) => void | Promise<void>;
  /** 취소 콜백 */
  onCancel?: () => void;
  /** 닫기 콜백 */
  onClose?: () => void;
  /** 열기 완료 콜백 */
  onOpened?: () => void;
  /** 닫기 완료 콜백 */
  onClosed?: () => void;
}

interface ModalState {
  /** 모달 ID */
  id: string;
  /** 열림 상태 */
  isOpen: boolean;
  /** 애니메이션 진행 중 */
  isAnimating: boolean;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 상태 */
  hasError: boolean;
  /** 에러 메시지 */
  errorMessage?: string;
  /** 모달 설정 */
  config: ModalConfig;
  /** 생성 시간 */
  createdAt: number;
  /** 마지막 업데이트 */
  updatedAt: number;
}

interface UseModalOptions {
  /** 기본 모달 설정 */
  defaultConfig?: Partial<ModalConfig>;
  /** 최대 모달 수 */
  maxModals?: number;
  /** 모달 스택 관리 */
  stackable?: boolean;
  /** 글로벌 ESC 핸들링 */
  globalEscHandler?: boolean;
  /** 자동 정리 (타임아웃된 모달 제거) */
  autoCleanup?: boolean;
  /** 정리 간격 (ms) */
  cleanupInterval?: number;
}

interface ModalHelpers {
  /** 모달 열기 */
  open: (config: Partial<ModalConfig> & { id: string }) => void;
  /** 모달 닫기 */
  close: (id: string) => void;
  /** 모든 모달 닫기 */
  closeAll: () => void;
  /** 모달 토글 */
  toggle: (id: string, config?: Partial<ModalConfig>) => void;
  /** 모달 업데이트 */
  update: (id: string, config: Partial<ModalConfig>) => void;
  /** 모달 존재 여부 확인 */
  isOpen: (id: string) => boolean;
  /** 모달 설정 가져오기 */
  getConfig: (id: string) => ModalConfig | null;
  /** 로딩 상태 설정 */
  setLoading: (id: string, loading: boolean) => void;
  /** 에러 상태 설정 */
  setError: (id: string, error: string | null) => void;
  /** 모달 데이터 업데이트 */
  setData: (id: string, data: any) => void;
}

interface ModalStackInfo {
  /** 총 모달 수 */
  count: number;
  /** 모달 ID 목록 (최신순) */
  stack: string[];
  /** 최상단 모달 ID */
  topModal: string | null;
  /** 활성 모달 목록 */
  activeModals: ModalState[];
}

type UseModalResult = ModalHelpers & {
  /** 모달 상태 맵 */
  modals: Record<string, ModalState>;
  /** 모달 스택 정보 */
  stack: ModalStackInfo;
  /** 전체 로딩 상태 */
  isAnyLoading: boolean;
  /** 전체 애니메이션 상태 */
  isAnyAnimating: boolean;
  /** 열린 모달이 있는지 여부 */
  hasOpenModals: boolean;
};

// === 기본값들 ===
const DEFAULT_CONFIG: ModalConfig = {
  id: '',
  size: 'md',
  closable: true,
  closeOnEsc: true,
  closeOnOverlayClick: true,
  animated: true,
  persistent: false,
  autoFocus: true,
};

const DEFAULT_OPTIONS: UseModalOptions = {
  maxModals: 5,
  stackable: true,
  globalEscHandler: true,
  autoCleanup: true,
  cleanupInterval: 60000, // 1분
};

// === 유틸리티 함수들 ===
const generateModalId = (): string => 
  `modal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const createModalState = (config: ModalConfig): ModalState => ({
  id: config.id,
  isOpen: false,
  isAnimating: false,
  isLoading: false,
  hasError: false,
  config,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// === 글로벌 모달 매니저 ===
class GlobalModalManager {
  private static instance: GlobalModalManager;
  private subscribers: Set<() => void> = new Set();
  private activeModals: Set<string> = new Set();

  static getInstance(): GlobalModalManager {
    if (!this.instance) {
      this.instance = new GlobalModalManager();
    }
    return this.instance;
  }

  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify(): void {
    this.subscribers.forEach(callback => callback());
  }

  addModal(id: string): void {
    this.activeModals.add(id);
    this.notify();
  }

  removeModal(id: string): void {
    this.activeModals.delete(id);
    this.notify();
  }

  getActiveModalCount(): number {
    return this.activeModals.size;
  }

  hasActiveModals(): boolean {
    return this.activeModals.size > 0;
  }
}

// === 메인 Hook ===
export const useModal = (options: UseModalOptions = {}): UseModalResult => {
  const {
    defaultConfig = {},
    maxModals = DEFAULT_OPTIONS.maxModals!,
    stackable = DEFAULT_OPTIONS.stackable!,
    globalEscHandler = DEFAULT_OPTIONS.globalEscHandler!,
    autoCleanup = DEFAULT_OPTIONS.autoCleanup!,
    cleanupInterval = DEFAULT_OPTIONS.cleanupInterval!,
  } = { ...DEFAULT_OPTIONS, ...options };

  // === 테마 Hook 사용 ===
  const { isReducedMotion } = useLinearTheme();

  // === 상태 관리 ===
  const [modals, setModals] = useState<Record<string, ModalState>>({});
  
  // === Refs ===
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const modalManagerRef = useRef(GlobalModalManager.getInstance());

  // === 모달 스택 정보 계산 ===
  const stack = useMemo<ModalStackInfo>(() => {
    const activeModals = Object.values(modals)
      .filter(modal => modal.isOpen)
      .sort((a, b) => b.createdAt - a.createdAt);

    return {
      count: activeModals.length,
      stack: activeModals.map(modal => modal.id),
      topModal: activeModals[0]?.id || null,
      activeModals,
    };
  }, [modals]);

  // === 계산된 상태들 ===
  const isAnyLoading = useMemo(
    () => Object.values(modals).some(modal => modal.isLoading),
    [modals]
  );

  const isAnyAnimating = useMemo(
    () => Object.values(modals).some(modal => modal.isAnimating),
    [modals]
  );

  const hasOpenModals = useMemo(
    () => Object.values(modals).some(modal => modal.isOpen),
    [modals]
  );

  // === 상태 업데이트 헬퍼 ===
  const updateModal = useCallback((id: string, updater: (prev: ModalState) => ModalState) => {
    setModals(prev => {
      const existing = prev[id];
      if (!existing) return prev;
      
      return {
        ...prev,
        [id]: {
          ...updater(existing),
          updatedAt: Date.now(),
        },
      };
    });
  }, []);

  // === 모달 열기 ===
  const open = useCallback((config: Partial<ModalConfig> & { id: string }) => {
    const finalConfig: ModalConfig = {
      ...DEFAULT_CONFIG,
      ...defaultConfig,
      ...config,
      id: config.id,
    };

    // 애니메이션 설정 반영
    if (isReducedMotion) {
      finalConfig.animated = false;
    }

    // 최대 모달 수 체크
    if (stack.count >= maxModals && !modals[config.id]) {
      console.warn(`Maximum modal limit (${maxModals}) reached`);
      return;
    }

    // 스택 불가능하고 다른 모달이 열려있으면 닫기
    if (!stackable && hasOpenModals) {
      closeAll();
    }

    // 이전 포커스 저장 (첫 번째 모달인 경우)
    if (stack.count === 0 && document.activeElement instanceof HTMLElement) {
      previousFocusRef.current = document.activeElement;
    }

    setModals(prev => {
      const existing = prev[config.id];
      const newModal = existing 
        ? { ...existing, isOpen: true, config: finalConfig, updatedAt: Date.now() }
        : createModalState(finalConfig);

      newModal.isOpen = true;
      newModal.isAnimating = finalConfig.animated || false;

      return { ...prev, [config.id]: newModal };
    });

    // 글로벌 매니저에 등록
    modalManagerRef.current.addModal(config.id);

    // 애니메이션 완료 처리
    if (finalConfig.animated) {
      setTimeout(() => {
        updateModal(config.id, prev => ({ ...prev, isAnimating: false }));
        finalConfig.onOpened?.();
      }, 300); // 표준 애니메이션 시간
    } else {
      finalConfig.onOpened?.();
    }

    // 자동 닫기 타임아웃
    if (finalConfig.timeout && finalConfig.timeout > 0) {
      setTimeout(() => {
        close(config.id);
      }, finalConfig.timeout);
    }
  }, [defaultConfig, isReducedMotion, stack.count, maxModals, modals, stackable, hasOpenModals, updateModal, modalManagerRef]);

  // === 모달 닫기 ===
  const close = useCallback((id: string) => {
    const modal = modals[id];
    if (!modal || !modal.isOpen) return;

    // 닫기 콜백 실행
    modal.config.onClose?.();

    if (modal.config.animated && !isReducedMotion) {
      // 애니메이션과 함께 닫기
      updateModal(id, prev => ({ ...prev, isAnimating: true }));

      setTimeout(() => {
        setModals(prev => {
          const { [id]: removed, ...rest } = prev;
          return rest;
        });

        // 글로벌 매니저에서 제거
        modalManagerRef.current.removeModal(id);

        // 포커스 복원 (마지막 모달인 경우)
        if (stack.count === 1 && previousFocusRef.current) {
          previousFocusRef.current.focus();
          previousFocusRef.current = null;
        }

        modal.config.onClosed?.();
      }, 300);
    } else {
      // 즉시 닫기
      setModals(prev => {
        const { [id]: removed, ...rest } = prev;
        return rest;
      });

      // 글로벌 매니저에서 제거
      modalManagerRef.current.removeModal(id);

      // 포커스 복원
      if (stack.count === 1 && previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }

      modal.config.onClosed?.();
    }
  }, [modals, isReducedMotion, updateModal, stack.count, modalManagerRef]);

  // === 모든 모달 닫기 ===
  const closeAll = useCallback(() => {
    const openModals = Object.values(modals).filter(modal => modal.isOpen);
    
    openModals.forEach(modal => {
      if (!modal.config.persistent) {
        close(modal.id);
      }
    });
  }, [modals, close]);

  // === 모달 토글 ===
  const toggle = useCallback((id: string, config?: Partial<ModalConfig>) => {
    if (modals[id]?.isOpen) {
      close(id);
    } else {
      open({ id, ...config });
    }
  }, [modals, close, open]);

  // === 모달 업데이트 ===
  const update = useCallback((id: string, config: Partial<ModalConfig>) => {
    updateModal(id, prev => ({
      ...prev,
      config: { ...prev.config, ...config },
    }));
  }, [updateModal]);

  // === 모달 상태 확인 ===
  const isOpen = useCallback((id: string): boolean => {
    return modals[id]?.isOpen || false;
  }, [modals]);

  // === 모달 설정 가져오기 ===
  const getConfig = useCallback((id: string): ModalConfig | null => {
    return modals[id]?.config || null;
  }, [modals]);

  // === 로딩 상태 설정 ===
  const setLoading = useCallback((id: string, loading: boolean) => {
    updateModal(id, prev => ({ ...prev, isLoading: loading }));
  }, [updateModal]);

  // === 에러 상태 설정 ===
  const setError = useCallback((id: string, error: string | null) => {
    updateModal(id, prev => ({
      ...prev,
      hasError: !!error,
      errorMessage: error || undefined,
    }));
  }, [updateModal]);

  // === 모달 데이터 업데이트 ===
  const setData = useCallback((id: string, data: any) => {
    updateModal(id, prev => ({
      ...prev,
      config: { ...prev.config, data },
    }));
  }, [updateModal]);

  // === ESC 키 글로벌 핸들러 ===
  useEffect(() => {
    if (!globalEscHandler) return;

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      
      // 최상단 모달 찾기
      const topModal = stack.activeModals.find(modal => 
        modal.isOpen && modal.config.closeOnEsc
      );

      if (topModal) {
        event.preventDefault();
        close(topModal.id);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [globalEscHandler, stack.activeModals, close]);

  // === 자동 정리 ===
  useEffect(() => {
    if (!autoCleanup) return;

    const cleanup = () => {
      const now = Date.now();
      const expiredModals = Object.values(modals).filter(modal => {
        const config = modal.config;
        return (
          config.timeout &&
          config.timeout > 0 &&
          now - modal.createdAt > config.timeout &&
          modal.isOpen
        );
      });

      expiredModals.forEach(modal => close(modal.id));
    };

    cleanupIntervalRef.current = setInterval(cleanup, cleanupInterval);

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, [autoCleanup, cleanupInterval, modals, close]);

  // === 컴포넌트 언마운트 시 정리 ===
  useEffect(() => {
    return () => {
      // 모든 모달 닫기
      Object.keys(modals).forEach(id => {
        modalManagerRef.current.removeModal(id);
      });

      // 포커스 복원
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }

      // 인터벌 정리
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    modals,
    stack,
    isAnyLoading,
    isAnyAnimating,
    hasOpenModals,
    open,
    close,
    closeAll,
    toggle,
    update,
    isOpen,
    getConfig,
    setLoading,
    setError,
    setData,
  };
};

// === 특수 Hook들 ===

/**
 * 단일 모달 관리를 위한 간단한 Hook
 */
export const useSimpleModal = (id?: string, config?: Partial<ModalConfig>) => {
  const modalId = useMemo(() => id || generateModalId(), [id]);
  const modal = useModal({ maxModals: 1, stackable: false });

  const isOpen = modal.isOpen(modalId);
  const modalState = modal.modals[modalId];

  const open = useCallback((openConfig?: Partial<ModalConfig>) => {
    modal.open({ id: modalId, ...config, ...openConfig });
  }, [modal, modalId, config]);

  const close = useCallback(() => {
    modal.close(modalId);
  }, [modal, modalId]);

  const toggle = useCallback((toggleConfig?: Partial<ModalConfig>) => {
    modal.toggle(modalId, { ...config, ...toggleConfig });
  }, [modal, modalId, config]);

  return {
    isOpen,
    isLoading: modalState?.isLoading || false,
    isAnimating: modalState?.isAnimating || false,
    hasError: modalState?.hasError || false,
    errorMessage: modalState?.errorMessage,
    config: modalState?.config,
    open,
    close,
    toggle,
    setLoading: (loading: boolean) => modal.setLoading(modalId, loading),
    setError: (error: string | null) => modal.setError(modalId, error),
    setData: (data: any) => modal.setData(modalId, data),
  };
};

/**
 * 확인 다이얼로그를 위한 Hook
 */
export const useConfirmModal = () => {
  const modal = useSimpleModal();

  const confirm = useCallback((options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'primary' | 'destructive' | 'warning';
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      modal.open({
        title: options.title,
        size: 'sm',
        content: options.message,
        footer: `
          <div class="flex gap-2 justify-end w-full">
            <button 
              id="cancel-btn" 
              class="px-4 py-2 text-sm border rounded hover:bg-gray-50"
            >
              ${options.cancelText || '취소'}
            </button>
            <button 
              id="confirm-btn"
              class="px-4 py-2 text-sm text-white rounded ${
                options.variant === 'destructive' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }"
            >
              ${options.confirmText || '확인'}
            </button>
          </div>
        `,
        onConfirm: () => {
          resolve(true);
          modal.close();
        },
        onCancel: () => {
          resolve(false);
          modal.close();
        },
        closeOnOverlayClick: false,
      });
    });
  }, [modal]);

  return { confirm, ...modal };
};

/**
 * 알림 모달을 위한 Hook
 */
export const useAlertModal = () => {
  const modal = useSimpleModal();

  const alert = useCallback((options: {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    buttonText?: string;
  }): Promise<void> => {
    return new Promise((resolve) => {
      const iconMap = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌',
      };

      modal.open({
        title: `${iconMap[options.type || 'info']} ${options.title}`,
        size: 'sm',
        content: options.message,
        footer: `
          <button 
            id="ok-btn"
            class="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded"
          >
            ${options.buttonText || '확인'}
          </button>
        `,
        onConfirm: () => {
          resolve();
          modal.close();
        },
        closeOnOverlayClick: true,
      });
    });
  }, [modal]);

  return { alert, ...modal };
};

/**
 * 글로벌 모달 상태를 구독하는 Hook
 */
export const useGlobalModalState = () => {
  const [, forceUpdate] = useState({});
  const manager = useRef(GlobalModalManager.getInstance());

  useEffect(() => {
    const unsubscribe = manager.current.subscribe(() => {
      forceUpdate({});
    });

    return unsubscribe;
  }, []);

  return {
    activeModalCount: manager.current.getActiveModalCount(),
    hasActiveModals: manager.current.hasActiveModals(),
  };
};

export default useModal;