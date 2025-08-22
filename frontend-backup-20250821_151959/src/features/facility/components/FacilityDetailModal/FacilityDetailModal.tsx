import React, { useEffect, useState } from 'react';
import { X, Phone, MapPin, Star, Clock, Users, DollarSign, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui';
import { Button } from '../../../../shared/ui';
import { Badge } from '../../../../shared/ui';
import { Separator } from '../../../../shared/ui';
import { facilityApi } from '../../../../entities/facility/api';
import type { FacilityProfileResponse } from '../../../../entities/facility/types';

interface FacilityDetailModalProps {
  facilityId: number;
  isOpen: boolean;
  onClose: () => void;
  onContact?: (facilityId: number) => void;
  onVisit?: (facilityId: number) => void;
}

export const FacilityDetailModal: React.FC<FacilityDetailModalProps> = ({
  facilityId,
  isOpen,
  onClose,
  onContact,
  onVisit,
}) => {
  const [facility, setFacility] = useState<FacilityProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && facilityId) {
      fetchFacilityDetail();
    }
  }, [isOpen, facilityId]);

  const fetchFacilityDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await facilityApi.get(`/${facilityId}`);
      setFacility(response.data);
    } catch (err) {
      setError('시설 정보를 불러오는 중 오류가 발생했습니다.');
      console.error('Failed to fetch facility detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async () => {
    if (!facility) return;
    
    try {
      // 시설 연락 추적 API 호출
      await facilityApi.post(`/${facility.id}/contact`);
      onContact?.(facility.id);
      
      // 실제 연락처로 이동 또는 연락 모달 표시
      if (facility.contactNumber) {
        window.open(`tel:${facility.contactNumber}`);
      }
    } catch (err) {
      console.error('Failed to track contact:', err);
    }
  };

  const handleVisit = async () => {
    if (!facility) return;
    
    try {
      // 시설 방문 추적 API 호출
      await facilityApi.post(`/${facility.id}/visit`);
      onVisit?.(facility.id);
      
      // 방문 예약 페이지로 이동하거나 외부 링크 열기
      if (facility.websiteUrl) {
        window.open(facility.websiteUrl, '_blank');
      }
    } catch (err) {
      console.error('Failed to track visit:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 모달 컨텐츠 */}
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">시설 상세 정보</h2>
            <p className="text-sm text-gray-600">상세 정보를 확인하고 연락해보세요</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* 컨텐츠 */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-96 text-center p-6">
              <div className="text-red-500 mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">오류 발생</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchFacilityDetail} variant="outline">
                다시 시도
              </Button>
            </div>
          ) : facility ? (
            <div className="p-6 space-y-6">
              {/* 기본 정보 섹션 */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">
                        {facility.facilityName}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">{facility.facilityType}</Badge>
                        <Badge variant="outline">{facility.facilityGrade}등급</Badge>
                      </div>
                    </div>
                    {facility.averageRating && (
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="font-semibold">{facility.averageRating}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{facility.region} {facility.district}</span>
                  </div>
                  
                  {facility.contactNumber && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{facility.contactNumber}</span>
                    </div>
                  )}

                  {facility.operatingHours && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{facility.operatingHours}</span>
                    </div>
                  )}

                  {facility.capacity && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>정원 {facility.capacity}명</span>
                    </div>
                  )}

                  {facility.monthlyFee && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>월 {facility.monthlyFee?.toLocaleString()}원</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 시설 설명 */}
              {facility.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">시설 소개</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {facility.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* 특화 서비스 */}
              {facility.specializedCare && facility.specializedCare.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      특화 서비스
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {facility.specializedCare.map((service, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 편의시설 */}
              {facility.amenities && facility.amenities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">편의시설</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {facility.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          {amenity}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Separator />

              {/* 액션 버튼들 */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  onClick={handleContact}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3"
                  size="lg"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  연락하기
                </Button>
                
                <Button 
                  onClick={handleVisit}
                  variant="outline"
                  className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50 py-3"
                  size="lg"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  방문하기
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};