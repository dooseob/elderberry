/**
 * PlannedSearchPage - 계획적 준비 요양원 검색 페이지
 * 건강평가부터 시작하는 체계적인 맞춤형 시설 찾기 과정
 * 
 * @version 1.0.0 - User Journey Focused
 * @author MaxModeAgent
 * 
 * 핵심 기능:
 * - 건강평가 간소화 버전 또는 전체 버전 선택
 * - 단계별 진행 상황 표시
 * - 평가 결과 기반 맞춤 추천
 * - 여러 시설 비교 분석
 * - 방문 일정 관리
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  Heart,
  Brain,
  Activity,
  Shield,
  Star,
  Calendar,
  BarChart3,
  FileText,
  Award,
  Lightbulb,
  Users
} from 'lucide-react';

import { Button } from '../shared/ui';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../shared/ui';
import { useAuthStore } from '../stores/authStore';
import { useSEO } from '../hooks/useSEO';

interface AssessmentStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  estimatedTime: string;
  isCompleted: boolean;
  isRequired: boolean;
}

const ASSESSMENT_STEPS: AssessmentStep[] = [
  {
    id: 'basic-info',
    title: '기본 정보',
    description: '나이, 성별, 거주지역 등 기본적인 정보',
    icon: User,
    estimatedTime: '2분',
    isCompleted: false,
    isRequired: true
  },
  {
    id: 'health-condition',
    title: '건강 상태',
    description: '현재 건강 상태, 복용 중인 약물, 알레르기 등',
    icon: Heart,
    estimatedTime: '3분',
    isCompleted: false,
    isRequired: true
  },
  {
    id: 'cognitive-assessment',
    title: '인지 능력',
    description: '기억력, 판단력, 의사소통 능력 평가',
    icon: Brain,
    estimatedTime: '4분',
    isCompleted: false,
    isRequired: true
  },
  {
    id: 'daily-activities',
    title: '일상생활 수행능력',
    description: '식사, 세안, 이동, 화장실 이용 등 ADL 평가',
    icon: Activity,
    estimatedTime: '5분',
    isCompleted: false,
    isRequired: true
  },
  {
    id: 'care-preferences',
    title: '돌봄 선호도',
    description: '선호하는 돌봄 방식, 시설 유형, 특별 요구사항',
    icon: Shield,
    estimatedTime: '3분',
    isCompleted: false,
    isRequired: false
  }
];

const PlannedSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  
  // SEO 최적화
  useSEO({
    title: '체계적 요양원 준비 - 건강평가로 시작하는 맞춤 검색 | Elderberry',
    description: '건강평가부터 시작하는 체계적인 요양원 찾기. 15-20분의 정밀 평가로 가장 적합한 시설을 추천받으세요.',
    keywords: '건강평가, 요양원 준비, 맞춤 추천, 체계적 검색, ADL 평가',
    canonicalUrl: 'https://elderberry.co.kr/planned-search'
  });

  const [currentView, setCurrentView] = useState<'intro' | 'assessment-overview' | 'progress'>('intro');
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<'quick' | 'comprehensive' | null>(null);
  const [assessmentSteps, setAssessmentSteps] = useState<AssessmentStep[]>(ASSESSMENT_STEPS);

  // 회원가입 유도 (비로그인 사용자)
  const handleStartAssessment = (type: 'quick' | 'comprehensive') => {
    if (!isAuthenticated) {
      if (window.confirm('정확한 맞춤 추천을 위해서는 회원가입이 필요합니다. 지금 가입하시겠습니까?')) {
        navigate(`/auth/signup?redirect=/planned-search&assessment=${type}`);
      }
      return;
    }

    setSelectedAssessmentType(type);
    
    if (type === 'quick') {
      // 빠른 평가는 필수 항목만
      const quickSteps = assessmentSteps.filter(step => step.isRequired);
      setAssessmentSteps(quickSteps);
    }
    
    setCurrentView('assessment-overview');
  };

  const handleStartFullAssessment = () => {
    navigate('/health-assessment');
  };

  // 인트로 화면
  const IntroView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* 헤더 */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-6">
          <Target className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          체계적으로 준비하기
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          건강평가부터 시작하는 가장 정확하고 체계적인 요양원 찾기 과정입니다.
          시간을 투자하는 만큼 더 정확한 매칭을 받을 수 있습니다.
        </p>
      </div>

      {/* 평가 유형 선택 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* 빠른 평가 */}
        <Card className="border-2 border-green-200 hover:border-green-300 transition-all cursor-pointer group"
              onClick={() => handleStartAssessment('quick')}>
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">10분</div>
                <div className="text-sm text-green-500">빠른 평가</div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              핵심 평가
            </h3>
            <p className="text-gray-600 mb-6">
              꼭 필요한 핵심 항목만으로 빠르게 평가합니다.
              급하지는 않지만 시간이 제한적인 분께 적합합니다.
            </p>

            <div className="space-y-2 mb-6">
              {['기본정보 + 건강상태', '인지능력 간단 체크', '일상생활 수행능력', '3-5곳 맞춤 추천'].map((item, idx) => (
                <div key={idx} className="flex items-center text-sm text-green-700">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {item}
                </div>
              ))}
            </div>

            <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
              빠른 평가 시작하기
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* 종합 평가 */}
        <Card className="border-2 border-blue-200 hover:border-blue-300 transition-all cursor-pointer group"
              onClick={() => handleStartAssessment('comprehensive')}>
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">20분</div>
                <div className="text-sm text-blue-500">종합 평가</div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              정밀 평가 <Award className="w-5 h-5 inline text-yellow-500" />
            </h3>
            <p className="text-gray-600 mb-6">
              모든 영역을 세밀하게 평가하여 가장 정확한 매칭을 제공합니다.
              시간이 충분하고 최고의 결과를 원하시는 분께 추천합니다.
            </p>

            <div className="space-y-2 mb-6">
              {['상세 건강상태 분석', '종합 인지능력 평가', '세부 ADL 측정', '돌봄 선호도 조사', '5-8곳 정밀 매칭'].map((item, idx) => (
                <div key={idx} className="flex items-center text-sm text-blue-700">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {item}
                </div>
              ))}
            </div>

            <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
              정밀 평가 시작하기
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 왜 건강평가가 중요한가? */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-8">
          <div className="flex items-center mb-6">
            <Lightbulb className="w-8 h-8 text-purple-600 mr-3" />
            <h3 className="text-2xl font-bold text-purple-900">
              왜 건강평가가 중요할까요?
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-purple-800 mb-3">정확한 매칭</h4>
              <p className="text-purple-700 text-sm mb-4">
                건강상태와 돌봄 필요도에 정확히 맞는 시설을 찾아드립니다.
                잘못된 선택으로 인한 재입소나 불만족을 방지할 수 있습니다.
              </p>

              <h4 className="font-semibold text-purple-800 mb-3">비용 효율성</h4>
              <p className="text-purple-700 text-sm">
                필요한 서비스 수준에 맞는 시설을 선택하여 불필요한 비용을 절약하고,
                동시에 필요한 케어는 놓치지 않을 수 있습니다.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-purple-800 mb-3">장기요양등급</h4>
              <p className="text-purple-700 text-sm mb-4">
                건강평가 결과를 바탕으로 장기요양등급 신청을 도와드리며,
                등급에 따른 정부 지원을 최대한 활용할 수 있게 안내합니다.
              </p>

              <h4 className="font-semibold text-purple-800 mb-3">안심과 확신</h4>
              <p className="text-purple-700 text-sm">
                전문적인 평가를 통해 가족 모두가 확신을 가지고 
                결정할 수 있는 근거를 제공합니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 하단 통계 */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div>
          <div className="text-3xl font-bold text-blue-600 mb-1">94%</div>
          <div className="text-sm text-gray-600">평가 후 만족도</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-green-600 mb-1">2,847</div>
          <div className="text-sm text-gray-600">완료된 평가</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-purple-600 mb-1">7일</div>
          <div className="text-sm text-gray-600">평균 매칭 기간</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-orange-600 mb-1">86%</div>
          <div className="text-sm text-gray-600">첫 추천 선택율</div>
        </div>
      </div>
    </motion.div>
  );

  // 평가 개요 화면
  const AssessmentOverviewView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => setCurrentView('intro')}
          className="mb-4"
        >
          ← 뒤로 가기
        </Button>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {selectedAssessmentType === 'quick' ? '빠른 평가' : '정밀 평가'} 진행 과정
        </h2>
        <p className="text-xl text-gray-600">
          다음 단계들을 순서대로 진행합니다. 언제든지 중단하고 나중에 이어서 할 수 있습니다.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {assessmentSteps.map((step, index) => (
          <Card key={step.id} className="border-2 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {index + 1}. {step.title}
                      {step.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-600 font-medium">
                    {step.estimatedTime}
                  </div>
                  {step.isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500 mt-1" />
                  ) : (
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full mt-1" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <div className="flex items-center text-blue-700 mb-3">
          <Shield className="w-5 h-5 mr-2" />
          <span className="font-semibold">개인정보 보호 안내</span>
        </div>
        <p className="text-sm text-blue-600">
          모든 건강정보는 암호화되어 안전하게 저장되며, 매칭 목적으로만 사용됩니다.
          평가 완료 후 언제든지 데이터를 수정하거나 삭제할 수 있습니다.
        </p>
      </div>

      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={() => setCurrentView('intro')}
        >
          다시 선택하기
        </Button>
        <Button
          variant="primary"
          onClick={handleStartFullAssessment}
          className="px-8"
        >
          <FileText className="w-4 h-4 mr-2" />
          평가 시작하기
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {currentView === 'intro' && <IntroView />}
          {currentView === 'assessment-overview' && <AssessmentOverviewView />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PlannedSearchPage;