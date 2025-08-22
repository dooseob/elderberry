import { useState } from 'react';
import { Search, MapPin, Clock, DollarSign, Users, Briefcase, Filter, Star, Calendar } from 'lucide-react';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract';
  salary: string;
  experience: string;
  posted: string;
  deadline: string;
  description: string;
  requirements: string[];
  benefits: string[];
  isUrgent?: boolean;
  rating?: number;
  reviewCount?: number;
}

const mockJobs: Job[] = [
  {
    id: 1,
    title: "요양보호사 (주간근무)",
    company: "서울 실버케어센터",
    location: "서울시 강남구",
    type: "full-time",
    salary: "월 280만원 ~ 320만원",
    experience: "경력 1년 이상",
    posted: "2일 전",
    deadline: "2024.01.15",
    description: "어르신들의 일상생활을 도와드리는 요양보호사를 모집합니다. 따뜻한 마음과 전문성을 갖춘 분을 찾습니다.",
    requirements: ["요양보호사 자격증 필수", "경력 1년 이상", "성실하고 책임감 있는 분", "컴퓨터 기초 활용 가능"],
    benefits: ["4대보험", "퇴직금", "연차수당", "교육비 지원", "식사 제공"],
    isUrgent: true,
    rating: 4.8,
    reviewCount: 127
  },
  {
    id: 2,
    title: "재가 요양보호사 (시간제)",
    company: "행복한 홈케어",
    location: "서울시 서초구",
    type: "part-time",
    salary: "시급 15,000원 ~ 18,000원",
    experience: "신입 가능",
    posted: "1일 전",
    deadline: "2024.01.20",
    description: "어르신 댁에서 직접 돌봄 서비스를 제공하는 재가 요양보호사를 모집합니다.",
    requirements: ["요양보호사 자격증 필수", "신입 환영", "차량 소지자 우대", "주 3일 이상 근무 가능"],
    benefits: ["교통비 지원", "유연근무", "교육 제공", "성과급"],
    rating: 4.6,
    reviewCount: 89
  },
  {
    id: 3,
    title: "주간보호센터 요양보호사",
    company: "평화 주간보호센터",
    location: "서울시 송파구",
    type: "full-time",
    salary: "월 260만원 ~ 300만원",
    experience: "경력 무관",
    posted: "3일 전",
    deadline: "2024.01.25",
    description: "주간보호센터에서 어르신들의 활동을 도와주실 요양보호사를 모집합니다.",
    requirements: ["요양보호사 자격증 필수", "경력 무관", "레크리에이션 경험 우대", "밝고 활발한 성격"],
    benefits: ["4대보험", "퇴직금", "교육비 지원", "우수직원 포상", "야근 없음"],
    rating: 4.9,
    reviewCount: 203
  },
  {
    id: 4,
    title: "야간 요양보호사 (고급여)",
    company: "프리미엄 요양원",
    location: "서울시 마포구",
    type: "full-time",
    salary: "월 350만원 ~ 400만원",
    experience: "경력 3년 이상",
    posted: "5일 전",
    deadline: "2024.01.30",
    description: "야간 전담 요양보호사를 모집합니다. 경력자 우대하며 높은 급여를 제공합니다.",
    requirements: ["요양보호사 자격증 필수", "야간근무 경험 3년 이상", "응급상황 대처 능력", "건강한 체력"],
    benefits: ["고급여", "야간수당", "4대보험", "퇴직금", "건강검진", "휴게시설 완비"],
    isUrgent: true,
    rating: 4.7,
    reviewCount: 156
  }
];

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('전체');
  const [selectedLocation, setSelectedLocation] = useState('전체');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' or 'resumes'

  const jobTypes = ['전체', '정규직', '시간제', '계약직'];
  const locations = ['전체', '강남구', '서초구', '송파구', '마포구', '종로구'];

  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === '전체' || 
                       (selectedType === '정규직' && job.type === 'full-time') ||
                       (selectedType === '시간제' && job.type === 'part-time') ||
                       (selectedType === '계약직' && job.type === 'contract');
    const matchesLocation = selectedLocation === '전체' || job.location.includes(selectedLocation);
    return matchesSearch && matchesType && matchesLocation;
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'full-time': return '정규직';
      case 'part-time': return '시간제';
      case 'contract': return '계약직';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-text-main mb-4">구인구직</h1>
          <p className="text-text-secondary text-lg mb-8">
            요양보호사 전문 채용 플랫폼에서 최적의 일자리를 찾아보세요
          </p>

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'jobs'
                  ? 'bg-primary text-white'
                  : 'bg-white text-text-muted hover:text-primary border border-border-light'
              }`}
            >
              채용정보 보기
            </button>
            <button
              onClick={() => setActiveTab('resumes')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'resumes'
                  ? 'bg-primary text-white'
                  : 'bg-white text-text-muted hover:text-primary border border-border-light'
              }`}
            >
              인재 찾기
            </button>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl border-2 border-primary shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                <input
                  type="text"
                  placeholder={activeTab === 'jobs' ? "직무명 또는 회사명을 검색하세요" : "원하는 인재를 검색하세요"}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-3 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  필터
                </button>
                <button className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  검색
                </button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-border-light space-y-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-text-secondary font-medium mr-4">근무형태:</span>
                  {jobTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedType === type
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-text-muted hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-text-secondary font-medium mr-4">지역:</span>
                  {locations.map((location) => (
                    <button
                      key={location}
                      onClick={() => setSelectedLocation(location)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedLocation === location
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-text-muted hover:bg-gray-200'
                      }`}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          {activeTab === 'jobs' ? (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-text-main">
                  채용정보 ({filteredJobs.length}개)
                </h2>
                <select className="px-4 py-2 border border-border-light rounded-lg text-text-secondary">
                  <option>최신순</option>
                  <option>급여순</option>
                  <option>마감임박순</option>
                </select>
              </div>

              {/* Job Cards */}
              <div className="grid gap-6">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="bg-white border border-border-light rounded-2xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-text-main">{job.title}</h3>
                          {job.isUrgent && (
                            <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-medium">
                              급구
                            </span>
                          )}
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium">
                            {getTypeLabel(job.type)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-text-muted text-sm mb-2">
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {job.company}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </div>
                          {job.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">{job.rating}</span>
                              <span className="text-xs">({job.reviewCount})</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-primary font-bold text-lg mb-1">{job.salary}</div>
                        <div className="text-text-muted text-sm">{job.experience}</div>
                      </div>
                    </div>

                    <p className="text-text-secondary mb-4">{job.description}</p>

                    {/* Requirements */}
                    <div className="mb-4">
                      <h4 className="text-text-main font-semibold mb-2">자격요건</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.requirements.map((req, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-text-muted px-3 py-1 rounded-full text-sm"
                          >
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="mb-4">
                      <h4 className="text-text-main font-semibold mb-2">복리혜택</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.benefits.map((benefit, index) => (
                          <span
                            key={index}
                            className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-4 border-t border-border-light">
                      <div className="flex gap-4 text-sm text-text-muted">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {job.posted}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          마감: {job.deadline}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-colors text-sm font-medium">
                          관심등록
                        </button>
                        <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                          지원하기
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center mt-12">
                <button className="border border-primary text-primary px-8 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors font-medium">
                  더 많은 채용정보 보기
                </button>
              </div>
            </>
          ) : (
            /* Resume/Talent Search Section */
            <div className="text-center py-20">
              <Users className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-text-main mb-4">인재 찾기 서비스</h3>
              <p className="text-text-secondary mb-8 max-w-md mx-auto">
                검증된 요양보호사 인재들의 이력서를 확인하고 직접 연락해보세요.
              </p>
              <button className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-medium transition-colors">
                인재 데이터베이스 보기
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}