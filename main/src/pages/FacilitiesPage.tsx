import { useState } from 'react';
import { Search, MapPin, Star, Phone, Clock, Users, Heart, Filter } from 'lucide-react';

interface Facility {
  id: number;
  name: string;
  type: string;
  address: string;
  phone: string;
  rating: number;
  reviewCount: number;
  capacity: number;
  available: number;
  distance: string;
  image: string;
  features: string[];
  description: string;
}

const mockFacilities: Facility[] = [
  {
    id: 1,
    name: "서울 실버케어센터",
    type: "요양원",
    address: "서울시 강남구 테헤란로 123",
    phone: "02-1234-5678",
    rating: 4.8,
    reviewCount: 127,
    capacity: 50,
    available: 3,
    distance: "1.2km",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    features: ["24시간 간병", "물리치료", "영양관리", "의료진 상주"],
    description: "전문적인 요양 서비스와 따뜻한 돌봄을 제공하는 프리미엄 요양원입니다."
  },
  {
    id: 2,
    name: "행복한 노인의집",
    type: "주간보호센터",
    address: "서울시 서초구 반포대로 456",
    phone: "02-2345-6789",
    rating: 4.6,
    reviewCount: 89,
    capacity: 30,
    available: 7,
    distance: "2.1km",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    features: ["주간보호", "레크리에이션", "송영서비스", "건강관리"],
    description: "어르신들의 활기찬 하루를 위한 다양한 프로그램을 운영합니다."
  },
  {
    id: 3,
    name: "평화 요양병원",
    type: "요양병원",
    address: "서울시 송파구 올림픽로 789",
    phone: "02-3456-7890",
    rating: 4.9,
    reviewCount: 203,
    capacity: 80,
    available: 1,
    distance: "3.5km",
    image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    features: ["전문의료진", "재활치료", "응급의료", "가족상담"],
    description: "의료진과 간병인이 함께하는 전문적인 의료 요양 서비스를 제공합니다."
  }
];

export default function FacilitiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('전체');
  const [showFilters, setShowFilters] = useState(false);

  const facilityTypes = ['전체', '요양원', '주간보호센터', '요양병원', '재가센터'];

  const filteredFacilities = mockFacilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facility.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === '전체' || facility.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-text-main mb-4">시설찾기</h1>
          <p className="text-text-secondary text-lg mb-8">
            우리 지역의 믿을 수 있는 요양시설을 찾아보세요
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl border-2 border-primary shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                <input
                  type="text"
                  placeholder="시설명 또는 지역을 검색하세요"
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
              <div className="mt-6 pt-6 border-t border-border-light">
                <div className="flex flex-wrap gap-2">
                  <span className="text-text-secondary font-medium mr-4">시설 유형:</span>
                  {facilityTypes.map((type) => (
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
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-text-main">
              검색 결과 ({filteredFacilities.length}개)
            </h2>
            <select className="px-4 py-2 border border-border-light rounded-lg text-text-secondary">
              <option>거리순</option>
              <option>평점순</option>
              <option>리뷰순</option>
            </select>
          </div>

          {/* Facility Cards */}
          <div className="grid gap-6">
            {filteredFacilities.map((facility) => (
              <div key={facility.id} className="bg-white border border-border-light rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="md:flex">
                  {/* Image */}
                  <div className="md:w-80 h-64 md:h-auto">
                    <img
                      src={facility.image}
                      alt={facility.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-text-main">{facility.name}</h3>
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium">
                            {facility.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-text-muted text-sm mb-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {facility.address}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {facility.phone}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-text-main">{facility.rating}</span>
                          <span className="text-text-muted text-sm">({facility.reviewCount})</span>
                        </div>
                        <div className="text-text-muted text-sm">{facility.distance}</div>
                      </div>
                    </div>

                    <p className="text-text-secondary mb-4">{facility.description}</p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {facility.features.map((feature, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-text-muted px-3 py-1 rounded-full text-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Stats and Actions */}
                    <div className="flex justify-between items-center">
                      <div className="flex gap-6 text-sm">
                        <div className="flex items-center gap-1 text-text-muted">
                          <Users className="w-4 h-4" />
                          정원 {facility.capacity}명
                        </div>
                        <div className="flex items-center gap-1 text-primary">
                          <Heart className="w-4 h-4" />
                          입소 가능 {facility.available}명
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-colors text-sm font-medium">
                          상세보기
                        </button>
                        <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                          문의하기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="border border-primary text-primary px-8 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors font-medium">
              더 많은 시설 보기
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}