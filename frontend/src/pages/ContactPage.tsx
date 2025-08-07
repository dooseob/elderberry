/**
 * Contact Page - 문의 및 상담 페이지
 * FSD 아키텍처: pages 레이어
 * 
 * @version 1.0.0
 * @description 고객 문의, 상담 신청, 연락처 정보를 제공하는 페이지
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../shared/ui';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  contactPreference: 'email' | 'phone';
  urgency: 'low' | 'medium' | 'high';
}

interface ContactMethodProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  contact: string;
  available: string;
}

const ContactMethod: React.FC<ContactMethodProps> = ({ 
  icon, title, description, contact, available 
}) => (
  <div className="contact-method bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="contact-icon mb-4 text-blue-600">
      {icon}
    </div>
    <h3 className="font-semibold text-lg text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-3">{description}</p>
    <div className="contact-info">
      <div className="font-medium text-gray-900 mb-1">{contact}</div>
      <div className="text-sm text-gray-500">{available}</div>
    </div>
  </div>
);

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    contactPreference: 'email',
    urgency: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 실제 API 호출 로직이 들어갈 곳
      await new Promise(resolve => setTimeout(resolve, 2000)); // 시뮬레이션
      
      console.log('문의 접수:', formData);
      setSubmitted(true);
      
      // 폼 초기화
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        contactPreference: 'email',
        urgency: 'medium'
      });
    } catch (error) {
      console.error('문의 접수 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="contact-page min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <Card className="max-w-md mx-4 p-8 text-center">
          <div className="text-green-600 mb-4">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" className="mx-auto">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">문의가 접수되었습니다</h2>
          <p className="text-gray-600 mb-6">
            소중한 문의를 주셔서 감사합니다. <br />
            영업일 기준 24시간 내에 답변드리겠습니다.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/')}
              className="w-full"
            >
              홈으로 돌아가기
            </Button>
            <Button 
              onClick={() => setSubmitted(false)}
              className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              추가 문의하기
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="contact-page min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header Section */}
      <section className="header-section bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              문의하기
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              궁금한 점이 있으시면 언제든지 연락주세요. <br />
              <span className="font-semibold">전문 상담사가 친절하게 안내해드립니다.</span>
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-6xl py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Methods */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">연락 방법</h2>
            <div className="space-y-6">
              <ContactMethod
                icon={
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                }
                title="전화 상담"
                description="즉시 상담이 필요하시면 전화로 문의해주세요"
                contact="1588-1234"
                available="평일 09:00 - 18:00"
              />

              <ContactMethod
                icon={
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                  </svg>
                }
                title="이메일 문의"
                description="상세한 문의사항은 이메일로 보내주세요"
                contact="contact@elderberry.co.kr"
                available="24시간 접수 가능"
              />

              <ContactMethod
                icon={
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                }
                title="카카오톡 상담"
                description="간편하게 카카오톡으로 상담받으세요"
                contact="@엘더베리"
                available="평일 09:00 - 18:00"
              />

              <ContactMethod
                icon={
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                }
                title="방문 상담"
                description="직접 방문하셔서 상담받으실 수 있습니다"
                contact="서울시 강남구 테헤란로 123"
                available="평일 09:00 - 18:00 (예약 필수)"
              />
            </div>

            {/* Emergency Contact */}
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center mb-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-red-600 mr-2">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <h3 className="font-semibold text-red-800">긴급 상황</h3>
              </div>
              <p className="text-red-700 text-sm mb-2">
                응급상황이나 긴급한 도움이 필요하시면:
              </p>
              <p className="font-bold text-red-800">119 (응급실) 또는 1588-9999 (24시간)</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">온라인 문의</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="성함을 입력해주세요"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이메일 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="이메일 주소를 입력해주세요"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      연락처
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="010-1234-5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      선호 연락 방법
                    </label>
                    <select
                      value={formData.contactPreference}
                      onChange={(e) => handleInputChange('contactPreference', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="email">이메일</option>
                      <option value="phone">전화</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      문의 제목 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="문의 제목을 입력해주세요"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      우선순위
                    </label>
                    <select
                      value={formData.urgency}
                      onChange={(e) => handleInputChange('urgency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">일반</option>
                      <option value="medium">보통</option>
                      <option value="high">급함</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    문의 내용 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="문의하실 내용을 자세히 입력해주세요"
                    rows={6}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">개인정보 수집 및 이용 동의</span>
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    문의 처리를 위해 이름, 이메일, 연락처 정보를 수집하며, 
                    문의 완료 후 3개월간 보관 후 삭제됩니다.
                  </p>
                  <label className="flex items-center text-sm">
                    <input type="checkbox" required className="mr-2" />
                    개인정보 수집 및 이용에 동의합니다 (필수)
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? '전송 중...' : '문의하기'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    이전 페이지
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="faq-section bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">자주 묻는 질문</h2>
            <p className="text-lg text-gray-600">
              궁금하신 내용이 있다면 먼저 확인해보세요
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "서비스 이용료가 있나요?",
                answer: "기본적인 시설 검색과 정보 확인은 무료입니다. 전문 코디네이터 상담과 맞춤형 추천 서비스는 별도 요금이 있습니다."
              },
              {
                question: "건강 평가는 어떻게 진행되나요?",
                answer: "온라인으로 간편하게 진행할 수 있으며, 필요시 전문가와의 화상 또는 대면 상담도 가능합니다. 평가 결과는 개인정보보호법에 따라 안전하게 관리됩니다."
              },
              {
                question: "요양원 입소까지 얼마나 걸리나요?",
                answer: "시설 상황과 어르신의 상태에 따라 다르지만, 평균적으로 상담 후 1-2주 내에 입소가 가능합니다."
              },
              {
                question: "지방에도 서비스가 제공되나요?",
                answer: "전국 대부분의 지역에서 서비스를 제공하고 있으며, 지역별 전문 코디네이터가 배치되어 있습니다."
              }
            ].map((item, index) => (
              <details key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <summary className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600">
                  {item.question}
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;