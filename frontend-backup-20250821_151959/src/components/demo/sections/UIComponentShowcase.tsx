/**
 * UI 컴포넌트 쇼케이스 섹션 - UI 전문가 구현
 * Button, Input, Card, Badge, Modal, Tooltip 완전한 데모
 * 
 * @author UI 전문가 (서브 에이전트 시스템)
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Square,
  Download,
  Upload,
  Heart,
  Star,
  Bell,
  User,
  Settings,
  Search,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Info,
  HelpCircle,
  ExternalLink,
  Copy,
  Trash2,
  Edit,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';

import { Button } from '@/shared/ui';
import { Input } from '@/shared/ui';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/ui';
import { Badge } from '@/shared/ui';
import { Modal } from '@/shared/ui';
import { Tooltip } from '@/shared/ui';
import { useLinearTheme } from '../../../hooks/useLinearTheme';

/**
 * 버튼 데모 섹션
 */
const ButtonDemo: React.FC = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const handleLoadingDemo = useCallback((buttonId: string) => {
    setLoadingStates(prev => ({ ...prev, [buttonId]: true }));
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [buttonId]: false }));
    }, 2000);
  }, []);

  const buttonVariants = [
    { variant: 'primary', label: 'Primary', description: '주요 액션용 버튼' },
    { variant: 'secondary', label: 'Secondary', description: '보조 액션용 버튼' },
    { variant: 'outline', label: 'Outline', description: '경계선 스타일 버튼' },
    { variant: 'ghost', label: 'Ghost', description: '투명 배경 버튼' },
    { variant: 'success', label: 'Success', description: '성공 상태 버튼' },
    { variant: 'destructive', label: 'Destructive', description: '위험한 액션용 버튼' }
  ] as const;

  const buttonSizes = [
    { size: 'sm', label: 'Small' },
    { size: 'md', label: 'Medium' },
    { size: 'lg', label: 'Large' }
  ] as const;

  return (
    <div className="button-demo space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-[var(--linear-color-text-primary)] mb-4">
          버튼 변형 (Variants)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buttonVariants.map(({ variant, label, description }) => (
            <Card key={variant} className="p-4">
              <div className="text-center space-y-3">
                <h5 className="font-medium text-[var(--linear-color-text-primary)]">
                  {label}
                </h5>
                <p className="text-sm text-[var(--linear-color-text-secondary)]">
                  {description}
                </p>
                <div className="space-y-2">
                  <Button variant={variant as any} className="w-full">
                    {label} Button
                  </Button>
                  <Button 
                    variant={variant as any} 
                    className="w-full"
                    disabled
                  >
                    Disabled
                  </Button>
                  <Button
                    variant={variant as any}
                    className="w-full"
                    loading={loadingStates[`${variant}-loading`]}
                    onClick={() => handleLoadingDemo(`${variant}-loading`)}
                  >
                    {loadingStates[`${variant}-loading`] ? 'Loading...' : 'Click for Loading'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-[var(--linear-color-text-primary)] mb-4">
          버튼 크기 (Sizes)
        </h4>
        <Card className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            {buttonSizes.map(({ size, label }) => (
              <Button key={size} variant="primary" size={size as any}>
                {label}
              </Button>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-[var(--linear-color-text-primary)] mb-4">
          아이콘 버튼
        </h4>
        <Card className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="primary" icon={<Download className="w-4 h-4" />}>
              Download
            </Button>
            <Button variant="secondary" icon={<Upload className="w-4 h-4" />}>
              Upload
            </Button>
            <Button variant="outline" icon={<Heart className="w-4 h-4" />}>
              Like
            </Button>
            <Button variant="ghost" icon={<Star className="w-4 h-4" />}>
              Favorite
            </Button>
            <Button variant="success" icon={<Check className="w-4 h-4" />}>
              Confirm
            </Button>
            <Button variant="destructive" icon={<Trash2 className="w-4 h-4" />}>
              Delete
            </Button>
            <Button variant="outline" icon={<Settings className="w-4 h-4" />} />
            <Button variant="ghost" icon={<HelpCircle className="w-4 h-4" />} />
          </div>
        </Card>
      </div>
    </div>
  );
};

/**
 * 입력 필드 데모 섹션
 */
const InputDemo: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    search: '',
    username: '',
    phone: '',
    message: ''
  });

  const [inputStates, setInputStates] = useState({
    showPassword: false,
    loading: false
  });

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="input-demo space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-[var(--linear-color-text-primary)] mb-4">
          기본 입력 필드
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4">
            <CardHeader>
              <CardTitle size="sm">기본 입력</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="이메일"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                helperText="이메일 주소를 입력하세요"
              />
              
              <Input
                label="사용자명"
                placeholder="사용자명을 입력하세요"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                required
              />
              
              <Input
                label="전화번호"
                type="tel"
                placeholder="010-1234-5678"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                helperText="'-' 없이 입력해주세요"
              />
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardHeader>
              <CardTitle size="sm">상태별 입력</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="성공 상태"
                placeholder="올바른 입력"
                value="valid@example.com"
                successText="올바른 이메일 형식입니다"
              />
              
              <Input
                label="에러 상태"
                placeholder="잘못된 입력"
                value="invalid-email"
                errorText="올바른 이메일 형식이 아닙니다"
              />
              
              <Input
                label="비활성화"
                placeholder="입력할 수 없습니다"
                disabled
                value="disabled input"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-[var(--linear-color-text-primary)] mb-4">
          아이콘이 있는 입력 필드
        </h4>
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="검색"
              placeholder="검색어를 입력하세요..."
              startIcon={<Search className="w-4 h-4" />}
              value={formData.search}
              onChange={(e) => handleInputChange('search', e.target.value)}
            />
            
            <Input
              label="이메일"
              type="email"
              placeholder="이메일 주소"
              startIcon={<Mail className="w-4 h-4" />}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
            
            <Input
              label="비밀번호"
              type={inputStates.showPassword ? 'text' : 'password'}
              placeholder="비밀번호를 입력하세요"
              startIcon={<Lock className="w-4 h-4" />}
              endIcon={
                <button
                  type="button"
                  onClick={() => setInputStates(prev => ({ 
                    ...prev, 
                    showPassword: !prev.showPassword 
                  }))}
                  className="text-[var(--linear-color-text-secondary)] hover:text-[var(--linear-color-text-primary)]"
                >
                  {inputStates.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
            />
            
            <Input
              label="사용자"
              placeholder="사용자명"
              startIcon={<User className="w-4 h-4" />}
              endIcon={<Check className="w-4 h-4 text-[var(--linear-color-success)]" />}
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
            />
          </div>
        </Card>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-[var(--linear-color-text-primary)] mb-4">
          텍스트 영역
        </h4>
        <Card className="p-6">
          <Input
            label="메시지"
            placeholder="메시지를 입력하세요..."
            multiline
            rows={4}
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            helperText={`${formData.message.length}/500 글자`}
          />
        </Card>
      </div>
    </div>
  );
};

/**
 * 카드 데모 섹션
 */
const CardDemo: React.FC = () => {
  const [interactiveCardState, setInteractiveCardState] = useState({
    liked: false,
    bookmarked: false,
    shared: false
  });

  return (
    <div className="card-demo space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-[var(--linear-color-text-primary)] mb-4">
          카드 변형
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 기본 카드 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 카드</CardTitle>
              <CardDescription>
                가장 기본적인 카드 스타일입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--linear-color-text-primary)]">
                이것은 기본 카드의 내용입니다. Linear Design System의 
                색상과 스페이싱을 사용합니다.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="primary" size="sm">액션</Button>
              <Button variant="ghost" size="sm">취소</Button>
            </CardFooter>
          </Card>

          {/* 승격된 카드 */}
          <Card surface="elevated" shadow="card">
            <CardHeader>
              <CardTitle>승격된 카드</CardTitle>
              <CardDescription>
                그림자와 승격된 표면을 가진 카드입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[var(--linear-color-accent)] rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h5 className="font-semibold text-[var(--linear-color-text-primary)]">
                    특별한 내용
                  </h5>
                  <p className="text-sm text-[var(--linear-color-text-secondary)]">
                    중요한 정보가 담겨있습니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 인터랙티브 카드 */}
          <Card hover interactive shadow="modal">
            <CardHeader>
              <CardTitle>인터랙티브 카드</CardTitle>
              <CardDescription>
                호버 효과와 상호작용이 가능한 카드입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--linear-color-text-primary)] mb-4">
                이 카드에 마우스를 올려보세요. 부드러운 애니메이션을 볼 수 있습니다.
              </p>
              <div className="flex gap-2">
                <Button
                  variant={interactiveCardState.liked ? "success" : "ghost"}
                  size="sm"
                  icon={<Heart className="w-4 h-4" />}
                  onClick={() => setInteractiveCardState(prev => ({ 
                    ...prev, 
                    liked: !prev.liked 
                  }))}
                >
                  {interactiveCardState.liked ? '좋아함' : '좋아요'}
                </Button>
                <Button
                  variant={interactiveCardState.bookmarked ? "primary" : "ghost"}
                  size="sm"
                  icon={<Star className="w-4 h-4" />}
                  onClick={() => setInteractiveCardState(prev => ({ 
                    ...prev, 
                    bookmarked: !prev.bookmarked 
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-[var(--linear-color-text-primary)] mb-4">
          다양한 표면 스타일
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card surface="panel" padding="lg">
            <CardHeader>
              <CardTitle>패널 표면</CardTitle>
              <CardDescription>패널 배경색을 사용한 카드</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--linear-color-text-primary)]">
                패널 표면은 사이드바나 별도 영역에 적합합니다.
              </p>
            </CardContent>
          </Card>

          <Card surface="modal" padding="xl" shadow="deep">
            <CardHeader>
              <CardTitle>모달 표면</CardTitle>
              <CardDescription>모달 배경색과 깊은 그림자</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--linear-color-text-primary)]">
                모달이나 대화상자에 사용되는 표면입니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

/**
 * 배지 데모 섹션
 */
const BadgeDemo: React.FC = () => {
  const badgeVariants = [
    { variant: 'default', label: 'Default' },
    { variant: 'secondary', label: 'Secondary' },
    { variant: 'outline', label: 'Outline' },
    { variant: 'success', label: 'Success' },
    { variant: 'destructive', label: 'Destructive' }
  ] as const;

  const badgeSizes = [
    { size: 'sm', label: 'Small' },
    { size: 'md', label: 'Medium' },
    { size: 'lg', label: 'Large' }
  ] as const;

  return (
    <div className="badge-demo space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-[var(--linear-color-text-primary)] mb-4">
          배지 변형
        </h4>
        <Card className="p-6">
          <div className="flex flex-wrap gap-3">
            {badgeVariants.map(({ variant, label }) => (
              <Badge key={variant} variant={variant as any}>
                {label}
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-[var(--linear-color-text-primary)] mb-4">
          배지 크기
        </h4>
        <Card className="p-6">
          <div className="flex flex-wrap items-center gap-3">
            {badgeSizes.map(({ size, label }) => (
              <Badge key={size} variant="default" size={size as any}>
                {label}
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-[var(--linear-color-text-primary)] mb-4">
          실용적인 배지 예시
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4">
            <CardHeader>
              <CardTitle size="sm">상태 배지</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span>온라인 상태</span>
                <Badge variant="success">온라인</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>처리 중</span>
                <Badge variant="default">진행중</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>오프라인</span>
                <Badge variant="secondary">오프라인</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>오류 발생</span>
                <Badge variant="destructive">오류</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardHeader>
              <CardTitle size="sm">카운트 배지</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <span>알림</span>
                </div>
                <Badge variant="destructive" size="sm">12</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>메시지</span>
                </div>
                <Badge variant="default" size="sm">3</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>즐겨찾기</span>
                </div>
                <Badge variant="outline" size="sm">24</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

/**
 * 모달 및 툴팁 데모 섹션
 */
const ModalTooltipDemo: React.FC = () => {
  const [modalStates, setModalStates] = useState({
    basic: false,
    confirmation: false,
    form: false
  });

  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  const openModal = useCallback((type: keyof typeof modalStates) => {
    setModalStates(prev => ({ ...prev, [type]: true }));
  }, []);

  const closeModal = useCallback((type: keyof typeof modalStates) => {
    setModalStates(prev => ({ ...prev, [type]: false }));
  }, []);

  return (
    <div className="modal-tooltip-demo space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-[var(--linear-color-text-primary)] mb-4">
          모달 데모
        </h4>
        <Card className="p-6">
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" onClick={() => openModal('basic')}>
              기본 모달
            </Button>
            <Button variant="destructive" onClick={() => openModal('confirmation')}>
              확인 모달
            </Button>
            <Button variant="outline" onClick={() => openModal('form')}>
              폼 모달
            </Button>
          </div>
        </Card>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-[var(--linear-color-text-primary)] mb-4">
          툴팁 데모
        </h4>
        <Card className="p-6">
          <div className="flex flex-wrap gap-4">
            <Tooltip content="기본 툴팁입니다">
              <Button variant="outline">기본 툴팁</Button>
            </Tooltip>
            
            <Tooltip content="이것은 긴 설명이 담긴 툴팁입니다. 여러 줄의 텍스트를 포함할 수 있습니다.">
              <Button variant="outline">긴 툴팁</Button>
            </Tooltip>
            
            <Tooltip content="바로가기: Ctrl+S">
              <Button variant="outline" icon={<Download className="w-4 h-4" />}>
                저장
              </Button>
            </Tooltip>
            
            <Tooltip content="삭제하시겠습니까?">
              <Button variant="destructive" icon={<Trash2 className="w-4 h-4" />}>
                삭제
              </Button>
            </Tooltip>
          </div>
        </Card>
      </div>

      {/* 모달들 */}
      <Modal
        isOpen={modalStates.basic}
        onClose={() => closeModal('basic')}
        title="기본 모달"
      >
        <div className="space-y-4">
          <p className="text-[var(--linear-color-text-primary)]">
            이것은 기본 모달입니다. 간단한 정보나 알림을 표시할 때 사용합니다.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => closeModal('basic')}>
              취소
            </Button>
            <Button variant="primary" onClick={() => closeModal('basic')}>
              확인
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modalStates.confirmation}
        onClose={() => closeModal('confirmation')}
        title="작업 확인"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--linear-color-error)]/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[var(--linear-color-error)]" />
            </div>
            <div>
              <h4 className="font-semibold text-[var(--linear-color-text-primary)]">
                정말로 삭제하시겠습니까?
              </h4>
              <p className="text-sm text-[var(--linear-color-text-secondary)]">
                이 작업은 되돌릴 수 없습니다.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => closeModal('confirmation')}>
              취소
            </Button>
            <Button variant="destructive" onClick={() => closeModal('confirmation')}>
              삭제
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modalStates.form}
        onClose={() => closeModal('form')}
        title="새 항목 추가"
      >
        <div className="space-y-4">
          <Input
            label="제목"
            placeholder="제목을 입력하세요"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />
          <Input
            label="설명"
            placeholder="설명을 입력하세요"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => closeModal('form')}>
              취소
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                closeModal('form');
                setFormData({ title: '', description: '' });
              }}
            >
              추가
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

/**
 * UI 컴포넌트 쇼케이스 메인 컴포넌트
 */
const UIComponentShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('buttons');

  const tabs = [
    { id: 'buttons', label: '버튼', icon: <Square className="w-4 h-4" /> },
    { id: 'inputs', label: '입력', icon: <Edit className="w-4 h-4" /> },
    { id: 'cards', label: '카드', icon: <Copy className="w-4 h-4" /> },
    { id: 'badges', label: '배지', icon: <Star className="w-4 h-4" /> },
    { id: 'modals', label: '모달/툴팁', icon: <ExternalLink className="w-4 h-4" /> }
  ];

  return (
    <div className="ui-component-showcase">
      {/* 탭 네비게이션 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-[var(--linear-color-accent)] text-white'
                : 'bg-[var(--linear-color-surface-elevated)] text-[var(--linear-color-text-secondary)] hover:text-[var(--linear-color-text-primary)] hover:bg-[var(--linear-color-surface-panel)]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'buttons' && <ButtonDemo />}
          {activeTab === 'inputs' && <InputDemo />}
          {activeTab === 'cards' && <CardDemo />}
          {activeTab === 'badges' && <BadgeDemo />}
          {activeTab === 'modals' && <ModalTooltipDemo />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default UIComponentShowcase;