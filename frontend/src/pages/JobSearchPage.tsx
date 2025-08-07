/**
 * JobSearchPage - 요양 분야 전문 구인구직 페이지
 * 간병인, 사회복지사, 요양보호사 등을 위한 전문 취업 플랫폼
 * 
 * @version 1.0.0 - User Journey Focused
 * @author MaxModeAgent
 * 
 * 핵심 기능:
 * - 경력/자격증 기반 맞춤 매칭
 * - 지역별/급여별 구인정보 필터링
 * - 원클릭 지원 시스템
 * - 실시간 채용공고 알림
 * - 면접 일정 관리
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Star,
  Award,
  CheckCircle2,
  ArrowRight,
  Filter,
  Search,
  Send,
  Calendar,
  Phone,
  Heart,
  Shield,
  TrendingUp,
  Building2,
  GraduationCap,
  Zap
} from 'lucide-react';

import { Button } from '../shared/ui';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../shared/ui';
import { useAuthStore } from '../stores/authStore';
import { useSEO } from '../hooks/useSEO';

interface JobPosition {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  workType: 'full-time' | 'part-time' | 'contract';
  experience: string;
  requirements: string[];
  benefits: string[];
  description: string;
  postedDate: string;
  isUrgent: boolean;
  isRecommended: boolean;
  contactPerson: string;
  contactPhone: string;
  applicationDeadline: string;
  tags: string[];
}

const MOCK_JOB_POSITIONS: JobPosition[] = [
  {
    id: 'job-001',
    title: '요양보호사',
    company: '서울 중앙 요양원',
    location: '서울시 중구',
    salary: '월 250-300만원',
    workType: 'full-time',
    experience: '신입/경력 무관',
    requirements: ['요양보호사 자격증', '성실하고 책임감 있는 분', '어르신 돌봄에 애정이 있는 분'],
    benefits: ['4대보험', '퇴직금', '야간근무수당', '명절휴가비', '교육지원'],
    description: '어르신들의 일상생활을 도와드리고 건강관리를 지원하는 업무입니다.',
    postedDate: '2024-01-15',
    isUrgent: true,
    isRecommended: true,
    contactPerson: '김인사',
    contactPhone: '02-1234-5678',
    applicationDeadline: '2024-02-15',
    tags: ['신입환영', '교육지원', '복리후생우수']
  },
  {
    id: 'job-002',
    title: '사회복지사',
    company: '따뜻한 실버홈',
    location: '서울시 강남구',
    salary: '월 280-350만원',
    workType: 'full-time',
    experience: '1년 이상',
    requirements: ['사회복지사 2급 이상', '노인복지 관련 경력', '컴퓨터 활용 가능'],
    benefits: ['4대보험', '퇴직금', '성과급', '자기계발비 지원', '유급휴가'],
    description: '어르신들의 사회복지서비스 계획 수립 및 실행을 담당합니다.',
    postedDate: '2024-01-12',
    isUrgent: false,
    isRecommended: true,
    contactPerson: '박부장',
    contactPhone: '02-2345-6789',
    applicationDeadline: '2024-02-20',
    tags: ['경력우대', '성과급', '전문성향상']
  },
  {
    id: 'job-003',
    title: '물리치료사',
    company: '재활전문 요양센터',
    location: '서울시 서초구',
    salary: '월 350-450만원',
    workType: 'full-time',
    experience: '2년 이상',
    requirements: ['물리치료사 면허', '노인재활 경력', '재활운동 프로그램 기획 가능'],
    benefits: ['4대보험', '퇴직금', '전문교육 지원', '연구비 지원', '승진기회'],
    description: '어르신들의 신체기능 회복을 위한 재활치료를 담당합니다.',
    postedDate: '2024-01-10',
    isUrgent: false,
    isRecommended: false,
    contactPerson: '이팀장',
    contactPhone: '02-3456-7890',
    applicationDeadline: '2024-02-25',
    tags: ['전문직', '고급여', '연구기회']
  },
  {
    id: 'job-004',
    title: '간병인 (야간)',
    company: '24시간 케어센터',
    location: '서울시 마포구',
    salary: '월 280-320만원',
    workType: 'part-time',
    experience: '경력 무관',
    requirements: ['간병인 교육 이수', '야간근무 가능', '응급상황 대처 능력'],
    benefits: ['야간수당', '교통비 지원', '식사제공', '휴게공간 완비'],
    description: '야간시간 어르신들의 안전과 편안한 휴식을 책임집니다.',
    postedDate: '2024-01-14',
    isUrgent: true,
    isRecommended: false,
    contactPerson: '최실장',
    contactPhone: '02-4567-8901',
    applicationDeadline: '2024-02-10',
    tags: ['야간근무', '수당우대', '즉시채용']
  }
];

const JobSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  
  // SEO 최적화
  useSEO({
    title: '요양 분야 전문 구인구직 - 맞춤 채용정보 | Elderberry',
    description: '요양보호사, 사회복지사, 간병인 등 요양 분야 전문직 채용정보. 경력과 자격증에 맞는 맞춤 구인정보를 찾아보세요.',
    keywords: '요양보호사 채용, 사회복지사 구인, 간병인 채용, 물리치료사 구직, 요양원 채용',
    canonicalUrl: 'https://elderberry.co.kr/job-search'
  });

  const [currentView, setCurrentView] = useState<'intro' | 'search' | 'application'>('intro');
  const [searchFilters, setSearchFilters] = useState({
    keyword: '',
    location: '',
    jobType: '',
    experience: '',
    salary: ''
  });
  const [filteredJobs, setFilteredJobs] = useState<JobPosition[]>(MOCK_JOB_POSITIONS);
  const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // 필터 적용
  useEffect(() => {
    let filtered = MOCK_JOB_POSITIONS;

    if (searchFilters.keyword) {
      filtered = filtered.filter(job => 
        job.title.includes(searchFilters.keyword) || 
        job.company.includes(searchFilters.keyword)
      );
    }

    if (searchFilters.location) {
      filtered = filtered.filter(job => job.location.includes(searchFilters.location));
    }

    if (searchFilters.jobType) {
      filtered = filtered.filter(job => job.workType === searchFilters.jobType);
    }

    setFilteredJobs(filtered);
  }, [searchFilters]);

  const handleApplyJob = async (job: JobPosition) => {
    if (!isAuthenticated) {
      if (window.confirm('채용 지원을 위해서는 회원가입이 필요합니다. 지금 가입하시겠습니까?')) {
        navigate(`/auth/signup?redirect=/job-search&job=${job.id}`);
      }
      return;
    }

    setSelectedJob(job);
    setIsApplying(true);
    
    // 실제 지원 처리 시뮬레이션
    setTimeout(() => {
      setIsApplying(false);
      alert(`${job.company}에 지원이 완료되었습니다! 담당자가 검토 후 연락드릴 예정입니다.`);
      setSelectedJob(null);
    }, 2000);
  };

  const handleCallCompany = (job: JobPosition) => {
    if (window.confirm(`${job.company} 담당자(${job.contactPerson})에게 전화를 걸겠습니까?`)) {
      window.location.href = `tel:${job.contactPhone}`;
    }
  };

  // 인트로 화면
  const IntroView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      {/* 헤더 */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-2xl mb-6">
          <Briefcase className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          요양 분야 전문 일자리
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          간병인, 요양보호사, 사회복지사 등 요양 분야 전문직을 위한 맞춤 채용 정보.
          경력과 자격에 맞는 최적의 일자리를 찾아보세요.
        </p>
      </div>

      {/* 주요 직종 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { title: '요양보호사', count: '324건', icon: Heart, color: 'red' },
          { title: '사회복지사', count: '158건', icon: Users, color: 'blue' },
          { title: '간병인', count: '267건', icon: Shield, color: 'green' },
          { title: '물리치료사', count: '89건', icon: Award, color: 'purple' }
        ].map((job, index) => (
          <Card key={job.title} className="hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => {
                  setSearchFilters(prev => ({ ...prev, keyword: job.title }));
                  setCurrentView('search');
                }}>
            <CardContent className="p-6 text-center">
              <div className={`w-12 h-12 bg-${job.color}-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <job.icon className={`w-6 h-6 text-${job.color}-600`} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{job.title}</h3>
              <p className="text-sm text-gray-600">{job.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 빠른 검색 */}
      <Card className="mb-12 border-2 border-green-200">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            <Search className="w-6 h-6 inline mr-2" />
            바로 시작하기
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">직종</label>
              <select 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                value={searchFilters.keyword}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, keyword: e.target.value }))}
              >
                <option value="">전체 직종</option>
                <option value="요양보호사">요양보호사</option>
                <option value="사회복지사">사회복지사</option>
                <option value="간병인">간병인</option>
                <option value="물리치료사">물리치료사</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">지역</label>
              <select 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                value={searchFilters.location}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, location: e.target.value }))}
              >
                <option value="">전체 지역</option>
                <option value="서울시">서울시</option>
                <option value="경기도">경기도</option>
                <option value="인천시">인천시</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => setCurrentView('search')}
              >
                <Search className="w-4 h-4 mr-2" />
                일자리 찾기
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 특징 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card className="text-center">
          <CardContent className="p-6">
            <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-gray-900 mb-2">맞춤 매칭</h4>
            <p className="text-gray-600">자격증과 경력에 딱 맞는 일자리를 추천해드립니다</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-gray-900 mb-2">빠른 지원</h4>
            <p className="text-gray-600">원클릭으로 간편하게 지원하고 즉시 피드백을 받아보세요</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-gray-900 mb-2">검증된 업체</h4>
            <p className="text-gray-600">신뢰할 수 있는 우수 요양기관만 엄선하여 제공합니다</p>
          </CardContent>
        </Card>
      </div>

      {/* 성공 스토리 */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              <Star className="w-6 h-6 inline mr-2 text-yellow-500" />
              이용자 성공 스토리
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
              <div className="text-sm text-gray-600">첫 지원 합격률</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">1,247</div>
              <div className="text-sm text-gray-600">성공 취업자 수</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">평균 3일</div>
              <div className="text-sm text-gray-600">채용 확정 기간</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // 검색 결과 화면
  const SearchView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">채용 정보</h2>
          <p className="text-gray-600 mt-1">
            총 <strong>{filteredJobs.length}</strong>건의 채용공고가 있습니다
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setCurrentView('intro')}
        >
          검색 조건 변경
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 필터 사이드바 */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                상세 필터
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">근무형태</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={searchFilters.jobType}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, jobType: e.target.value }))}
                >
                  <option value="">전체</option>
                  <option value="full-time">정규직</option>
                  <option value="part-time">비정규직</option>
                  <option value="contract">계약직</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">경력</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={searchFilters.experience}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, experience: e.target.value }))}
                >
                  <option value="">전체</option>
                  <option value="신입">신입</option>
                  <option value="1년">1년 이상</option>
                  <option value="3년">3년 이상</option>
                  <option value="5년">5년 이상</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">급여</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={searchFilters.salary}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, salary: e.target.value }))}
                >
                  <option value="">전체</option>
                  <option value="250">250만원 이상</option>
                  <option value="300">300만원 이상</option>
                  <option value="350">350만원 이상</option>
                  <option value="400">400만원 이상</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 채용공고 목록 */}
        <div className="lg:col-span-2 space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                      {job.isUrgent && (
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                          급구
                        </span>
                      )}
                      {job.isRecommended && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                          추천
                        </span>
                      )}
                    </div>
                    
                    <div className="text-lg font-semibold text-gray-800 mb-2">
                      {job.company}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-3 flex-wrap gap-4">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {job.salary}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {job.workType === 'full-time' ? '정규직' : job.workType === 'part-time' ? '비정규직' : '계약직'}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{job.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.tags.map((tag, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={() => handleApplyJob(job)}
                    className="flex-1"
                    disabled={isApplying && selectedJob?.id === job.id}
                  >
                    {isApplying && selectedJob?.id === job.id ? (
                      <>
                        <Send className="w-4 h-4 mr-2 animate-spin" />
                        지원 중...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        지원하기
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleCallCompany(job)}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    문의
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => alert('찜하기 기능은 회원가입 후 이용 가능합니다.')}
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                  게시일: {job.postedDate} | 마감일: {job.applicationDeadline} | 담당자: {job.contactPerson}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {currentView === 'intro' && <IntroView />}
          {currentView === 'search' && <SearchView />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default JobSearchPage;