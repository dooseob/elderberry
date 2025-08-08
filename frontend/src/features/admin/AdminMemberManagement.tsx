import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { Input } from '../../shared/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../shared/ui/Dialog';
import { 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Edit, 
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface AdminMember {
  id: number;
  email: string;
  name: string;
  phoneNumber?: string;
  role: string;
  isJobSeeker: boolean;
  isActive: boolean;
  emailVerified: boolean;
  language?: string;
  region?: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface AdminMemberDetail extends AdminMember {
  updatedAt: string;
  postsCount: number;
  reviewsCount: number;
  facilitiesCount: number;
}

const MemberRoleLabels: Record<string, { label: string; color: string }> = {
  ADMIN: { label: '관리자', color: 'bg-red-100 text-red-800' },
  FACILITY: { label: '시설회원', color: 'bg-blue-100 text-blue-800' },
  COORDINATOR: { label: '코디네이터', color: 'bg-green-100 text-green-800' },
  USER_DOMESTIC: { label: '국내 사용자', color: 'bg-purple-100 text-purple-800' },
  USER_OVERSEAS: { label: '해외 사용자', color: 'bg-indigo-100 text-indigo-800' },
  JOB_SEEKER_DOMESTIC: { label: '국내 구직자', color: 'bg-orange-100 text-orange-800' },
  JOB_SEEKER_OVERSEAS: { label: '해외 구직자', color: 'bg-yellow-100 text-yellow-800' }
};

const AdminMemberManagement: React.FC = () => {
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<AdminMemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchMembers();
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { isActive: statusFilter })
      });

      const response = await fetch(`/api/admin/members?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMembers(data.content);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('회원 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberDetail = async (memberId: number) => {
    try {
      const response = await fetch(`/api/admin/members/${memberId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const memberDetail = await response.json();
        setSelectedMember(memberDetail);
      }
    } catch (error) {
      console.error('회원 상세 정보 로드 실패:', error);
    }
  };

  const updateMemberStatus = async (memberId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/members/${memberId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          isActive,
          reason: isActive ? '계정 활성화' : '계정 비활성화'
        })
      });

      if (response.ok) {
        fetchMembers(); // 목록 새로고침
        if (selectedMember?.id === memberId) {
          fetchMemberDetail(memberId); // 상세 정보 새로고침
        }
      }
    } catch (error) {
      console.error('회원 상태 변경 실패:', error);
    }
  };

  const updateMemberRole = async (memberId: number, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/members/${memberId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          role: newRole,
          reason: '관리자에 의한 역할 변경'
        })
      });

      if (response.ok) {
        fetchMembers(); // 목록 새로고침
        if (selectedMember?.id === memberId) {
          fetchMemberDetail(memberId); // 상세 정보 새로고침
        }
      }
    } catch (error) {
      console.error('회원 역할 변경 실패:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">회원 관리</h1>
        <p className="text-gray-600 mt-1">시스템 회원을 관리하고 모니터링하세요</p>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="이름, 이메일 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="역할 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체</SelectItem>
                {Object.entries(MemberRoleLabels).map(([role, { label }]) => (
                  <SelectItem key={role} value={role}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체</SelectItem>
                <SelectItem value="true">활성</SelectItem>
                <SelectItem value="false">비활성</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchMembers} variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              필터 적용
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 회원 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>회원 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={MemberRoleLabels[member.role]?.color || 'bg-gray-100 text-gray-800'}>
                          {MemberRoleLabels[member.role]?.label || member.role}
                        </Badge>
                        <Badge variant={member.isActive ? 'default' : 'destructive'}>
                          {member.isActive ? '활성' : '비활성'}
                        </Badge>
                        {member.emailVerified && (
                          <Badge variant="secondary">인증됨</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => fetchMemberDetail(member.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>회원 상세 정보</DialogTitle>
                        </DialogHeader>
                        {selectedMember && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-500">이름</label>
                                <p>{selectedMember.name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">이메일</label>
                                <p>{selectedMember.email}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">전화번호</label>
                                <p>{selectedMember.phoneNumber || '-'}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">지역</label>
                                <p>{selectedMember.region || '-'}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">가입일</label>
                                <p>{formatDate(selectedMember.createdAt)}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">최종 수정일</label>
                                <p>{formatDate(selectedMember.updatedAt)}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center p-4 bg-gray-50 rounded">
                                <div className="text-2xl font-bold">{selectedMember.postsCount}</div>
                                <div className="text-sm text-gray-600">게시글</div>
                              </div>
                              <div className="text-center p-4 bg-gray-50 rounded">
                                <div className="text-2xl font-bold">{selectedMember.reviewsCount}</div>
                                <div className="text-sm text-gray-600">리뷰</div>
                              </div>
                              <div className="text-center p-4 bg-gray-50 rounded">
                                <div className="text-2xl font-bold">{selectedMember.facilitiesCount}</div>
                                <div className="text-sm text-gray-600">시설</div>
                              </div>
                            </div>

                            <div className="flex space-x-4">
                              <div className="flex-1">
                                <label className="text-sm font-medium text-gray-500">역할 변경</label>
                                <Select 
                                  value={selectedMember.role} 
                                  onValueChange={(value) => updateMemberRole(selectedMember.id, value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(MemberRoleLabels).map(([role, { label }]) => (
                                      <SelectItem key={role} value={role}>{label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex flex-col justify-end">
                                <Button
                                  variant={selectedMember.isActive ? 'destructive' : 'default'}
                                  onClick={() => updateMemberStatus(selectedMember.id, !selectedMember.isActive)}
                                >
                                  {selectedMember.isActive ? (
                                    <>
                                      <UserX className="w-4 h-4 mr-2" />
                                      비활성화
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="w-4 h-4 mr-2" />
                                      활성화
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant={member.isActive ? 'destructive' : 'default'}
                      size="sm"
                      onClick={() => updateMemberStatus(member.id, !member.isActive)}
                    >
                      {member.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              페이지 {currentPage + 1} / {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage >= totalPages - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMemberManagement;