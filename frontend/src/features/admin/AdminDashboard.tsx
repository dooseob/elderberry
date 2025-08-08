import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { Users, FileText, MessageSquare, Building, TrendingUp, AlertCircle } from 'lucide-react';

interface SystemOverviewStats {
  totalMembers: number;
  activeMembers: number;
  adminMembers: number;
  facilityMembers: number;
  coordinatorMembers: number;
  patientFamilyMembers: number;
  jobSeekerMembers: number;
  totalPosts: number;
  totalReviews: number;
  totalFacilities: number;
  totalJobs: number;
  todayRegistrations: number;
  todayPosts: number;
  todayReviews: number;
  pendingApprovals: number;
  systemStatus: string;
  avgResponseTime: number;
  totalDiskUsage: number;
}

interface SystemHealthData {
  overallStatus: string;
  databaseStatus: string;
  redisStatus: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  diskTotal: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<SystemOverviewStats | null>(null);
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, healthResponse] = await Promise.all([
        fetch('/api/admin/statistics/overview', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/admin/system/health', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (statsResponse.ok && healthResponse.ok) {
        const [statsData, healthData] = await Promise.all([
          statsResponse.json(),
          healthResponse.json()
        ]);
        
        setStats(statsData);
        setHealth(healthData);
      }
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
          <p className="text-gray-600 mt-1">시스템 전체 현황을 확인하세요</p>
        </div>
        <Button onClick={fetchDashboardData}>새로고침</Button>
      </div>

      {/* 시스템 상태 */}
      {health && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              시스템 상태
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Badge variant={health.overallStatus === 'UP' ? 'default' : 'destructive'}>
                  {health.overallStatus}
                </Badge>
                <p className="text-sm text-gray-600 mt-1">전체 시스템</p>
              </div>
              <div className="text-center">
                <Badge variant={health.databaseStatus === 'UP' ? 'default' : 'destructive'}>
                  {health.databaseStatus}
                </Badge>
                <p className="text-sm text-gray-600 mt-1">데이터베이스</p>
              </div>
              <div className="text-center">
                <Badge variant={health.redisStatus === 'UP' ? 'default' : 'destructive'}>
                  {health.redisStatus}
                </Badge>
                <p className="text-sm text-gray-600 mt-1">Redis</p>
              </div>
              <div className="text-center">
                <span className="text-lg font-semibold">{health.cpuUsage.toFixed(1)}%</span>
                <p className="text-sm text-gray-600 mt-1">CPU 사용률</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 주요 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 회원</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                활성 회원 {stats.activeMembers.toLocaleString()}명
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">게시글</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                오늘 {stats.todayPosts}개 작성
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">리뷰</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReviews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                오늘 {stats.todayReviews}개 작성
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">시설</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFacilities.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                승인 대기 {stats.pendingApprovals}개
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 회원 유형별 통계 */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              회원 유형별 통계
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.adminMembers}</div>
                <p className="text-sm text-gray-600">관리자</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.facilityMembers}</div>
                <p className="text-sm text-gray-600">시설회원</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.coordinatorMembers}</div>
                <p className="text-sm text-gray-600">코디네이터</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.patientFamilyMembers}</div>
                <p className="text-sm text-gray-600">환자/가족</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{stats.jobSeekerMembers}</div>
                <p className="text-sm text-gray-600">구직자</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{stats.todayRegistrations}</div>
                <p className="text-sm text-gray-600">오늘 가입</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 빠른 액션 */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 액션</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Users className="w-6 h-6" />
              <span>회원 관리</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <FileText className="w-6 h-6" />
              <span>콘텐츠 관리</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Building className="w-6 h-6" />
              <span>시설 승인</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              <span>통계 보기</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;