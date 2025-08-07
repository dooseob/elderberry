/**
 * 시설 매칭 신청 및 결과 이력 컴포넌트
 * 사용자의 매칭 신청 내역과 결과를 관리하는 기능 제공
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Calendar,
  Phone,
  Mail,
  User,
  Building2,
  Star,
  TrendingUp,
  RefreshCw,
  Eye,
  MessageSquare,
  ChevronRight
} from '../../../components/icons/LucideIcons';
import { Card } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { useFacilityStore } from '../../../stores/facilityStore';
import { useAuthStore } from '../../../stores/authStore';

interface MatchingRecord {
  id: number;
  facilityId: number;
  facilityName: string;
  facilityType: string;
  facilityAddress: string;
  matchingStatus: MatchingStatus;
  requestDate: string;
  responseDate?: string;
  interviewDate?: string;
  startDate?: string;
  coordinatorName?: string;
  coordinatorPhone?: string;
  coordinatorEmail?: string;
  notes?: string;
  rating?: number;
  salary?: number;
  position?: string;
  workSchedule?: string;
  rejectionReason?: string;
}

type MatchingStatus = 
  | 'PENDING'     // 신청 중
  | 'REVIEWING'   // 검토 중
  | 'INTERVIEW'   // 면접 예정
  | 'APPROVED'    // 승인됨
  | 'REJECTED'    // 거절됨
  | 'CANCELLED'   // 취소됨
  | 'COMPLETED'   // 완료됨
  | 'EXPIRED';    // 만료됨

interface MatchingFilter {
  status: MatchingStatus | 'ALL';
  facilityType: string;
  searchQuery: string;
  dateRange: 'all' | '1month' | '3month' | '6month' | '1year';
  sortBy: 'latest' | 'oldest' | 'status' | 'facility';
}

/**
 * 매칭 이력 컴포넌트
 */
export const MatchingHistory: React.FC = () => {
  // 상태 관리
  const { user } = useAuthStore();
  const { facilities, loading } = useFacilityStore();
  const [matchingRecords, setMatchingRecords] = useState<MatchingRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MatchingRecord[]>([]);
  const [filter, setFilter] = useState<MatchingFilter>({
    status: 'ALL',
    facilityType: '',
    searchQuery: '',
    dateRange: 'all',
    sortBy: 'latest'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MatchingRecord | null>(null);

  // 더미 데이터 (실제로는 API에서 가져와야 함)
  useEffect(() => {
    const dummyRecords: MatchingRecord[] = [
      {
        id: 1,
        facilityId: 1,
        facilityName: '서울시립요양원',
        facilityType: '요양원',
        facilityAddress: '서울시 강남구 테헤란로 123',
        matchingStatus: 'COMPLETED',
        requestDate: '2024-01-15',
        responseDate: '2024-01-17',
        interviewDate: '2024-01-20',
        startDate: '2024-02-01',
        coordinatorName: '김코디',
        coordinatorPhone: '010-1234-5678',
        coordinatorEmail: 'coordinator@facility.com',
        rating: 4.5,
        salary: 2800000,
        position: '요양보호사',
        workSchedule: '주간 근무 (08:00-17:00)',
        notes: '경력 인정받아 우대 조건으로 계약 성사'
      },
      {
        id: 2,
        facilityId: 2,
        facilityName: '행복한 요양병원',
        facilityType: '요양병원',
        facilityAddress: '서울시 서초구 강남대로 456',
        matchingStatus: 'INTERVIEW',
        requestDate: '2024-01-25',
        responseDate: '2024-01-26',
        interviewDate: '2024-01-30',
        coordinatorName: '이매니저',
        coordinatorPhone: '010-2345-6789',
        position: '간병인',
        salary: 2500000,
        workSchedule: '야간 근무 (22:00-08:00)'
      },
      {
        id: 3,
        facilityId: 3,
        facilityName: '은빛마을 데이케어센터',
        facilityType: '데이케어센터',
        facilityAddress: '서울시 송파구 올림픽로 789',
        matchingStatus: 'REJECTED',
        requestDate: '2024-01-10',
        responseDate: '2024-01-12',
        rejectionReason: '경력 부족으로 인한 부적합 판정'
      }
    ];
    setMatchingRecords(dummyRecords);
  }, []);

  // 필터링 및 정렬
  useEffect(() => {
    let filtered = [...matchingRecords];

    // 상태 필터
    if (filter.status !== 'ALL') {
      filtered = filtered.filter(record => record.matchingStatus === filter.status);
    }

    // 시설 유형 필터
    if (filter.facilityType) {
      filtered = filtered.filter(record => record.facilityType === filter.facilityType);
    }

    // 검색어 필터
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(record => 
        record.facilityName.toLowerCase().includes(query) ||
        record.facilityAddress.toLowerCase().includes(query) ||
        record.coordinatorName?.toLowerCase().includes(query)
      );
    }

    // 날짜 범위 필터
    if (filter.dateRange !== 'all') {
      const now = new Date();
      const months = {
        '1month': 1,
        '3month': 3,
        '6month': 6,
        '1year': 12
      };
      const monthsAgo = months[filter.dateRange];
      const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, now.getDate());
      
      filtered = filtered.filter(record => 
        new Date(record.requestDate) >= cutoffDate
      );
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (filter.sortBy) {
        case 'latest':
          return new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime();
        case 'oldest':
          return new Date(a.requestDate).getTime() - new Date(b.requestDate).getTime();
        case 'status':
          return a.matchingStatus.localeCompare(b.matchingStatus);
        case 'facility':
          return a.facilityName.localeCompare(b.facilityName);
        default:
          return 0;
      }
    });

    setFilteredRecords(filtered);
  }, [matchingRecords, filter]);

  // 상태별 배지 색상 및 아이콘
  const getStatusInfo = (status: MatchingStatus) => {
    switch (status) {
      case 'PENDING':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: Clock,
          label: '신청 중'
        };
      case 'REVIEWING':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: AlertCircle,
          label: '검토 중'
        };
      case 'INTERVIEW':
        return {
          color: 'bg-purple-100 text-purple-800',
          icon: User,
          label: '면접 예정'
        };
      case 'APPROVED':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          label: '승인됨'
        };
      case 'REJECTED':
        return {
          color: 'bg-red-100 text-red-800',
          icon: XCircle,
          label: '거절됨'
        };
      case 'CANCELLED':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: XCircle,
          label: '취소됨'
        };
      case 'COMPLETED':
        return {
          color: 'bg-emerald-100 text-emerald-800',
          icon: CheckCircle,
          label: '완료됨'
        };
      case 'EXPIRED':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: Clock,
          label: '만료됨'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: AlertCircle,
          label: '알 수 없음'
        };
    }
  };

  // 통계 정보
  const getStatistics = () => {
    const total = matchingRecords.length;
    const completed = matchingRecords.filter(r => r.matchingStatus === 'COMPLETED').length;
    const pending = matchingRecords.filter(r => 
      ['PENDING', 'REVIEWING', 'INTERVIEW', 'APPROVED'].includes(r.matchingStatus)
    ).length;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, successRate };
  };

  const stats = getStatistics();

  // 빈 상태
  if (!loading && matchingRecords.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          매칭 신청 이력이 없습니다
        </h3>
        <p className="text-gray-600 mb-6">
          관심 있는 시설에 매칭을 신청해보세요.
        </p>
        <Button href="/facilities">시설 찾아보기</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <Building2 className="h-6 w-6 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">총 신청</div>
        </Card>
        <Card className="p-4 text-center">
          <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
          <div className="text-sm text-gray-600">완료</div>
        </Card>
        <Card className="p-4 text-center">
          <Clock className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
          <div className="text-sm text-gray-600">진행 중</div>
        </Card>
        <Card className="p-4 text-center">
          <TrendingUp className="h-6 w-6 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.successRate}%</div>
          <div className="text-sm text-gray-600">성공률</div>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="시설명, 주소, 담당자로 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filter.searchQuery}
              onChange={(e) => setFilter(prev => ({ ...prev, searchQuery: e.target.value }))}
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>필터</span>
          </Button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filter.status}
                    onChange={(e) => setFilter(prev => ({ 
                      ...prev, 
                      status: e.target.value as MatchingStatus | 'ALL' 
                    }))}
                  >
                    <option value="ALL">전체</option>
                    <option value="PENDING">신청 중</option>
                    <option value="REVIEWING">검토 중</option>
                    <option value="INTERVIEW">면접 예정</option>
                    <option value="APPROVED">승인됨</option>
                    <option value="REJECTED">거절됨</option>
                    <option value="COMPLETED">완료됨</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시설 유형</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filter.facilityType}
                    onChange={(e) => setFilter(prev => ({ ...prev, facilityType: e.target.value }))}
                  >
                    <option value="">전체</option>
                    <option value="요양원">요양원</option>
                    <option value="요양병원">요양병원</option>
                    <option value="데이케어센터">데이케어센터</option>
                    <option value="재활센터">재활센터</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">기간</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filter.dateRange}
                    onChange={(e) => setFilter(prev => ({ 
                      ...prev, 
                      dateRange: e.target.value as MatchingFilter['dateRange']
                    }))}
                  >
                    <option value="all">전체</option>
                    <option value="1month">최근 1개월</option>
                    <option value="3month">최근 3개월</option>
                    <option value="6month">최근 6개월</option>
                    <option value="1year">최근 1년</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">정렬</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filter.sortBy}
                    onChange={(e) => setFilter(prev => ({ 
                      ...prev, 
                      sortBy: e.target.value as MatchingFilter['sortBy']
                    }))}
                  >
                    <option value="latest">최신순</option>
                    <option value="oldest">오래된순</option>
                    <option value="status">상태순</option>
                    <option value="facility">시설명순</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* 매칭 기록 목록 */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredRecords.map((record) => {
            const statusInfo = getStatusInfo(record.matchingStatus);
            const StatusIcon = statusInfo.icon;

            return (
              <motion.div
                key={record.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{record.facilityName}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color} flex items-center space-x-1`}>
                          <StatusIcon className="h-4 w-4" />
                          <span>{statusInfo.label}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Building2 className="h-4 w-4" />
                          <span>{record.facilityType}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{record.facilityAddress}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>신청일: {new Date(record.requestDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* 추가 정보 */}
                      {record.position && (
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <span><strong>직책:</strong> {record.position}</span>
                          {record.salary && (
                            <span><strong>급여:</strong> {record.salary.toLocaleString()}원</span>
                          )}
                        </div>
                      )}

                      {record.workSchedule && (
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>근무시간:</strong> {record.workSchedule}
                        </div>
                      )}

                      {record.coordinatorName && (
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{record.coordinatorName}</span>
                          </div>
                          {record.coordinatorPhone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span>{record.coordinatorPhone}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedRecord(record)}
                      className="flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>상세보기</span>
                    </Button>
                  </div>

                  {/* 상태별 추가 정보 */}
                  {record.matchingStatus === 'INTERVIEW' && record.interviewDate && (
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-800">
                        <strong>면접 일정:</strong> {new Date(record.interviewDate).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {record.matchingStatus === 'REJECTED' && record.rejectionReason && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>거절 사유:</strong> {record.rejectionReason}
                      </p>
                    </div>
                  )}

                  {record.matchingStatus === 'COMPLETED' && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center justify-between">
                      <div className="text-sm text-green-800">
                        <strong>근무 시작일:</strong> {record.startDate && new Date(record.startDate).toLocaleDateString()}
                      </div>
                      {record.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{record.rating}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {record.notes && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>메모:</strong> {record.notes}
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredRecords.length === 0 && !loading && (
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">검색 조건에 맞는 매칭 기록이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 상세 정보 모달 */}
      <AnimatePresence>
        {selectedRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedRecord(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  매칭 상세 정보
                </h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedRecord(null)}
                >
                  닫기
                </Button>
              </div>

              <div className="space-y-6">
                {/* 기본 정보 */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">시설 정보</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">시설명</span>
                      <p className="font-medium">{selectedRecord.facilityName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">시설 유형</span>
                      <p className="font-medium">{selectedRecord.facilityType}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-sm text-gray-600">주소</span>
                      <p className="font-medium">{selectedRecord.facilityAddress}</p>
                    </div>
                  </div>
                </div>

                {/* 일정 정보 */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">일정</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">신청일</span>
                      <span>{new Date(selectedRecord.requestDate).toLocaleDateString()}</span>
                    </div>
                    {selectedRecord.responseDate && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">응답일</span>
                        <span>{new Date(selectedRecord.responseDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedRecord.interviewDate && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">면접일</span>
                        <span>{new Date(selectedRecord.interviewDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedRecord.startDate && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">근무 시작일</span>
                        <span>{new Date(selectedRecord.startDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 담당자 정보 */}
                {selectedRecord.coordinatorName && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">담당자 정보</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">이름</span>
                        <span>{selectedRecord.coordinatorName}</span>
                      </div>
                      {selectedRecord.coordinatorPhone && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">전화번호</span>
                          <span>{selectedRecord.coordinatorPhone}</span>
                        </div>
                      )}
                      {selectedRecord.coordinatorEmail && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">이메일</span>
                          <span>{selectedRecord.coordinatorEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 근무 조건 */}
                {(selectedRecord.position || selectedRecord.salary || selectedRecord.workSchedule) && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">근무 조건</h3>
                    <div className="space-y-2">
                      {selectedRecord.position && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">직책</span>
                          <span>{selectedRecord.position}</span>
                        </div>
                      )}
                      {selectedRecord.salary && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">급여</span>
                          <span>{selectedRecord.salary.toLocaleString()}원</span>
                        </div>
                      )}
                      {selectedRecord.workSchedule && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">근무시간</span>
                          <span>{selectedRecord.workSchedule}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 메모 및 기타 */}
                {(selectedRecord.notes || selectedRecord.rejectionReason) && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">추가 정보</h3>
                    {selectedRecord.notes && (
                      <div className="mb-3">
                        <span className="text-sm text-gray-600 block mb-1">메모</span>
                        <p className="text-sm bg-gray-50 p-3 rounded">{selectedRecord.notes}</p>
                      </div>
                    )}
                    {selectedRecord.rejectionReason && (
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">거절 사유</span>
                        <p className="text-sm bg-red-50 p-3 rounded text-red-800">{selectedRecord.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};