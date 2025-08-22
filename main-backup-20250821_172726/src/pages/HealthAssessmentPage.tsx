import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, AlertCircle, Heart, Brain, Activity, Shield, User, Calendar, FileText, Download } from 'lucide-react';

interface AssessmentQuestion {
  id: number;
  category: string;
  question: string;
  type: 'radio' | 'checkbox' | 'scale' | 'text';
  options?: string[];
  required: boolean;
}

interface AssessmentResult {
  category: string;
  score: number;
  maxScore: number;
  level: 'excellent' | 'good' | 'fair' | 'poor';
  recommendations: string[];
}

const assessmentQuestions: AssessmentQuestion[] = [
  // 기본 정보
  {
    id: 1,
    category: '기본정보',
    question: '연령대를 선택해주세요',
    type: 'radio',
    options: ['65-70세', '71-75세', '76-80세', '81-85세', '86세 이상'],
    required: true
  },
  {
    id: 2,
    category: '기본정보',
    question: '성별을 선택해주세요',
    type: 'radio',
    options: ['남성', '여성'],
    required: true
  },
  
  // 신체 건강
  {
    id: 3,
    category: '신체건강',
    question: '계단을 오르내리는 것이 어려우신가요?',
    type: 'radio',
    options: ['전혀 어렵지 않다', '약간 어렵다', '매우 어렵다', '불가능하다'],
    required: true
  },
  {
    id: 4,
    category: '신체건강',
    question: '혼자서 목욕이나 샤워를 하실 수 있나요?',
    type: 'radio',
    options: ['혼자 가능', '부분적 도움 필요', '전적으로 도움 필요'],
    required: true
  },
  {
    id: 5,
    category: '신체건강',
    question: '현재 복용 중인 약물이 있나요?',
    type: 'checkbox',
    options: ['고혈압약', '당뇨약', '심장약', '관절염약', '기타', '복용하지 않음'],
    required: true
  },
  
  // 인지 건강
  {
    id: 6,
    category: '인지건강',
    question: '최근 기억력에 문제를 느끼시나요?',
    type: 'radio',
    options: ['전혀 없다', '가끔 있다', '자주 있다', '매우 심하다'],
    required: true
  },
  {
    id: 7,
    category: '인지건강',
    question: '오늘이 몇 월 며칠인지 아시나요?',
    type: 'radio',
    options: ['정확히 안다', '대략 안다', '잘 모르겠다'],
    required: true
  },
  
  // 정신 건강
  {
    id: 8,
    category: '정신건강',
    question: '최근 우울하거나 슬픈 기분이 드시나요?',
    type: 'scale',
    options: ['1', '2', '3', '4', '5'], // 1: 전혀 없음, 5: 매우 심함
    required: true
  },
  {
    id: 9,
    category: '정신건강',
    question: '밤에 잠을 잘 주무시나요?',
    type: 'radio',
    options: ['매우 잘 잔다', '보통이다', '자주 깬다', '거의 못 잔다'],
    required: true
  },
  
  // 사회적 지원
  {
    id: 10,
    category: '사회적지원',
    question: '가족이나 친구들과 얼마나 자주 만나시나요?',
    type: 'radio',
    options: ['매일', '주 2-3회', '주 1회', '월 1-2회', '거의 만나지 않음'],
    required: true
  }
];

export default function HealthAssessmentPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState<AssessmentResult[]>([]);

  const categories = ['기본정보', '신체건강', '인지건강', '정신건강', '사회적지원'];
  const currentCategory = categories[Math.floor(currentStep / 2)];
  const progress = ((currentStep + 1) / assessmentQuestions.length) * 100;

  const handleAnswer = (questionId: number, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextStep = () => {
    if (currentStep < assessmentQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeAssessment();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeAssessment = () => {
    // 간단한 점수 계산 로직 (실제로는 더 복잡한 알고리즘 사용)
    const mockResults: AssessmentResult[] = [
      {
        category: '신체건강',
        score: 75,
        maxScore: 100,
        level: 'good',
        recommendations: [
          '규칙적인 가벼운 운동을 권장합니다',
          '균형잡힌 식단을 유지하세요',
          '정기적인 건강검진을 받으시기 바랍니다'
        ]
      },
      {
        category: '인지건강',
        score: 85,
        maxScore: 100,
        level: 'excellent',
        recommendations: [
          '현재 인지기능이 양호합니다',
          '독서나 퍼즐 등 두뇌 활동을 지속하세요',
          '사회적 활동 참여를 권장합니다'
        ]
      },
      {
        category: '정신건강',
        score: 60,
        maxScore: 100,
        level: 'fair',
        recommendations: [
          '스트레스 관리가 필요합니다',
          '가족이나 친구들과의 소통을 늘리세요',
          '필요시 전문가 상담을 고려해보세요'
        ]
      }
    ];
    
    setResults(mockResults);
    setIsCompleted(true);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'excellent': return '우수';
      case 'good': return '양호';
      case 'fair': return '보통';
      case 'poor': return '주의';
      default: return '평가중';
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-text-main mb-2">건강평가 완료</h1>
            <p className="text-text-secondary">
              종합적인 건강 상태 평가 결과를 확인하세요
            </p>
          </div>

          {/* Results */}
          <div className="space-y-6 mb-8">
            {results.map((result, index) => (
              <div key={index} className="bg-white rounded-2xl border border-border-light p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-text-main">{result.category}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(result.level)}`}>
                    {getLevelText(result.level)}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-text-muted mb-2">
                    <span>점수</span>
                    <span>{result.score}/{result.maxScore}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(result.score / result.maxScore) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-text-main mb-2">권장사항</h4>
                  <ul className="space-y-1">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-text-secondary text-sm">
                        <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors">
              <Download className="w-4 h-4" />
              결과 다운로드
            </button>
            <button className="flex items-center gap-2 border border-primary text-primary px-6 py-3 rounded-lg font-medium hover:bg-primary hover:text-white transition-colors">
              <Calendar className="w-4 h-4" />
              전문가 상담 예약
            </button>
            <button 
              onClick={() => {
                setCurrentStep(0);
                setAnswers({});
                setIsCompleted(false);
                setResults([]);
              }}
              className="flex items-center gap-2 bg-gray-100 text-text-muted px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              다시 평가하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = assessmentQuestions[currentStep];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-main mb-2">건강평가</h1>
          <p className="text-text-secondary mb-6">
            종합적인 건강 상태를 평가하여 맞춤형 케어 계획을 제안해드립니다
          </p>
          
          {/* Progress */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-text-muted mb-2">
              <span>{currentCategory}</span>
              <span>{currentStep + 1}/{assessmentQuestions.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl border border-border-light p-8 mb-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              {currentQuestion.category === '기본정보' && <User className="w-5 h-5 text-primary" />}
              {currentQuestion.category === '신체건강' && <Heart className="w-5 h-5 text-primary" />}
              {currentQuestion.category === '인지건강' && <Brain className="w-5 h-5 text-primary" />}
              {currentQuestion.category === '정신건강' && <Activity className="w-5 h-5 text-primary" />}
              {currentQuestion.category === '사회적지원' && <Shield className="w-5 h-5 text-primary" />}
              <span className="text-primary font-medium">{currentQuestion.category}</span>
            </div>
            <h2 className="text-xl font-bold text-text-main mb-2">
              {currentQuestion.question}
              {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.type === 'radio' && currentQuestion.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-3 p-4 border border-border-light rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={option}
                  checked={answers[currentQuestion.id] === option}
                  onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-text-main">{option}</span>
              </label>
            ))}

            {currentQuestion.type === 'checkbox' && currentQuestion.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-3 p-4 border border-border-light rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(answers[currentQuestion.id]) && (answers[currentQuestion.id] as string[]).includes(option)}
                  onChange={(e) => {
                    const currentAnswers = (answers[currentQuestion.id] as string[]) || [];
                    if (e.target.checked) {
                      handleAnswer(currentQuestion.id, [...currentAnswers, option]);
                    } else {
                      handleAnswer(currentQuestion.id, currentAnswers.filter(a => a !== option));
                    }
                  }}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-text-main">{option}</span>
              </label>
            ))}

            {currentQuestion.type === 'scale' && (
              <div className="flex justify-between items-center p-4">
                <span className="text-sm text-text-muted">전혀 없음</span>
                <div className="flex gap-4">
                  {currentQuestion.options?.map((option, index) => (
                    <label key={index} className="flex flex-col items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={option}
                        checked={answers[currentQuestion.id] === option}
                        onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-sm font-medium">{option}</span>
                    </label>
                  ))}
                </div>
                <span className="text-sm text-text-muted">매우 심함</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 border border-border-light text-text-muted rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            이전
          </button>
          
          <button
            onClick={nextStep}
            disabled={!answers[currentQuestion.id]}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === assessmentQuestions.length - 1 ? '평가 완료' : '다음'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}