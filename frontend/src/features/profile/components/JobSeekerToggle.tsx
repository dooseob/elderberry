/**
 * 구직자 상태 토글 컴포넌트
 * Features 레이어 - 구직자 상태 변경 비즈니스 로직 포함
 */
import React, { useState } from 'react';
import { 
  useCurrentUser,
  useUserActions,
  useUserState,
} from '../../../entities/user';
import { 
  Button,
  Card,
  LoadingSpinner,
  Toast,
} from '../../../shared/ui';

interface JobSeekerToggleProps {
  onToggle?: (isJobSeeker: boolean) => void;
  className?: string;
  showCard?: boolean;
}

export const JobSeekerToggle: React.FC<JobSeekerToggleProps> = ({
  onToggle,
  className = '',
  showCard = true,
}) => {
  // 상태 관리
  const currentUser = useCurrentUser();
  const { toggleJobSeeker } = useUserActions();
  const { loading, error, successMessage } = useUserState();
  
  // 토스트 메시지 상태
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // 토글 핸들러
  const handleToggle = async () => {
    try {
      await toggleJobSeeker();
      
      // 성공 시 콜백 실행
      const newStatus = !currentUser?.isJobSeeker;
      onToggle?.(newStatus);
      
      // 토스트 메시지 표시
      const message = newStatus 
        ? '구직자 상태가 활성화되었습니다' 
        : '구직자 상태가 비활성화되었습니다';
      
      setToastMessage(message);
      setToastType('success');
      setShowToast(true);
      
    } catch (error: any) {
      // 에러 토스트 표시
      setToastMessage(error?.message || '구직자 상태 변경에 실패했습니다');
      setToastType('error');
      setShowToast(true);
    }
  };

  // 현재 상태 정보
  const isJobSeeker = currentUser?.isJobSeeker ?? false;
  const isLoading = loading.jobSeekerToggle;

  const content = (
    <div className={`space-y-4 ${!showCard ? className : ''}`}>
      {/* 헤더 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          구직자 상태 관리
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          구직자 상태를 관리하여 채용 공고를 받아보세요.
        </p>
      </div>

      {/* 현재 상태 표시 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-700">현재 구직자 상태</h4>
            <p className="text-sm text-gray-600 mt-1">
              {isJobSeeker 
                ? '구직자로 등록되어 있습니다. 채용 공고와 매칭 서비스를 받을 수 있습니다.' 
                : '구직자로 등록되어 있지 않습니다. 매칭 서비스를 받으려면 활성화하세요.'}
            </p>
          </div>
          
          <div className="ml-4">
            <span 
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                isJobSeeker 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {isJobSeeker ? '활성' : '비활성'}
            </span>
          </div>
        </div>
      </div>

      {/* 상태 변경 버튼 */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div>
          <p className="text-sm text-gray-600">
            {isJobSeeker 
              ? '구직자 상태를 비활성화하시겠습니까?' 
              : '구직자 상태를 활성화하시겠습니까?'}
          </p>
        </div>
        
        <Button
          onClick={handleToggle}
          disabled={isLoading}
          variant={isJobSeeker ? 'outline' : 'primary'}
          className="min-w-[120px]"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="small" className="mr-2" />
              변경 중...
            </>
          ) : (
            isJobSeeker ? '비활성화' : '활성화'
          )}
        </Button>
      </div>

      {/* 구직자 혜택 안내 */}
      {!isJobSeeker && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            구직자 등록 혜택
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li className="flex items-start">
              <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mr-2 mt-1.5 flex-shrink-0" />
              맞춤형 채용 공고 알림 수신
            </li>
            <li className="flex items-start">
              <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mr-2 mt-1.5 flex-shrink-0" />
              AI 기반 시설-구직자 매칭 서비스
            </li>
            <li className="flex items-start">
              <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mr-2 mt-1.5 flex-shrink-0" />
              전담 코디네이터 지원 서비스
            </li>
            <li className="flex items-start">
              <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mr-2 mt-1.5 flex-shrink-0" />
              면접 및 입사 지원 서비스
            </li>
          </ul>
        </div>
      )}

      {/* 구직자 활동 정보 */}
      {isJobSeeker && currentUser && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-900 mb-2">
            구직자 활동 정보
          </h4>
          <dl className="text-sm text-green-800 space-y-1">
            <div>
              <dt className="inline font-medium">등록일:</dt>
              <dd className="inline ml-2">
                {new Date(currentUser.createdAt).toLocaleDateString('ko-KR')}
              </dd>
            </div>
            <div>
              <dt className="inline font-medium">최근 업데이트:</dt>
              <dd className="inline ml-2">
                {new Date(currentUser.updatedAt).toLocaleDateString('ko-KR')}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );

  // 카드로 감싸기 여부에 따라 렌더링
  if (showCard) {
    return (
      <>
        <Card className={`p-6 ${className}`}>
          {content}
        </Card>

        {/* 토스트 메시지 */}
        {showToast && (
          <Toast
            message={toastMessage}
            type={toastType}
            onClose={() => setShowToast(false)}
            duration={4000}
          />
        )}
      </>
    );
  }

  return (
    <>
      {content}
      
      {/* 토스트 메시지 */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
          duration={4000}
        />
      )}
    </>
  );
};

export default JobSeekerToggle;