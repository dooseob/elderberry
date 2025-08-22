import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { TrendingUp, TrendingDown, Users, Activity, DollarSign, Calendar } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period?: string;
  };
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  loading?: boolean;
}

export function StatCard({ 
  title, 
  value, 
  change, 
  icon, 
  color = 'blue', 
  loading = false 
}: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200'
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="mt-4 h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="mt-2 h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <div className="flex items-center mt-2">
              {change.type === 'increase' ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                change.type === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change.value > 0 ? '+' : ''}{change.value}%
              </span>
              {change.period && (
                <span className="text-sm text-gray-500 ml-1">
                  {change.period}
                </span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

interface MetricGridProps {
  metrics: Array<{
    id: string;
    title: string;
    value: string | number;
    change?: {
      value: number;
      type: 'increase' | 'decrease';
      period?: string;
    };
    icon?: React.ReactNode;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  }>;
  loading?: boolean;
  className?: string;
}

export function MetricGrid({ metrics, loading = false, className = '' }: MetricGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {metrics.map((metric) => (
        <StatCard
          key={metric.id}
          title={metric.title}
          value={metric.value}
          change={metric.change}
          icon={metric.icon}
          color={metric.color}
          loading={loading}
        />
      ))}
    </div>
  );
}

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  disabled?: boolean;
}

export function QuickAction({ 
  title, 
  description, 
  icon, 
  action, 
  color = 'blue', 
  disabled = false 
}: QuickActionProps) {
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    yellow: 'bg-yellow-600 hover:bg-yellow-700',
    red: 'bg-red-600 hover:bg-red-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    indigo: 'bg-indigo-600 hover:bg-indigo-700'
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg text-white ${colorClasses[color]} ${
          disabled ? 'opacity-50' : ''
        }`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          <Button
            onClick={action}
            disabled={disabled}
            className="mt-4"
            size="sm"
          >
            시작하기
          </Button>
        </div>
      </div>
    </Card>
  );
}

interface QuickActionsGridProps {
  actions: Array<{
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    action: () => void;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
    disabled?: boolean;
  }>;
  className?: string;
}

export function QuickActionsGrid({ actions, className = '' }: QuickActionsGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      {actions.map((action) => (
        <QuickAction
          key={action.id}
          title={action.title}
          description={action.description}
          icon={action.icon}
          action={action.action}
          color={action.color}
          disabled={action.disabled}
        />
      ))}
    </div>
  );
}

interface ActivityFeedItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ActivityFeedProps {
  activities: ActivityFeedItem[];
  loading?: boolean;
  className?: string;
}

export function ActivityFeed({ activities, loading = false, className = '' }: ActivityFeedProps) {
  const getTypeStyles = (type: ActivityFeedItem['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4 mt-1"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-8">최근 활동이 없습니다.</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <Badge className={getTypeStyles(activity.type)}>
                {activity.type.toUpperCase()}
              </Badge>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <span className="text-xs text-gray-500">
                    {activity.timestamp}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {activity.description}
                </p>
                {activity.user && (
                  <p className="text-xs text-gray-500 mt-1">
                    by {activity.user.name}
                  </p>
                )}
                {activity.action && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={activity.action.onClick}
                    className="mt-2"
                  >
                    {activity.action.label}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

// 기본 대시보드 레이아웃
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}

// 사전 정의된 메트릭 아이콘
export const MetricIcons = {
  users: <Users className="w-6 h-6" />,
  activity: <Activity className="w-6 h-6" />,
  revenue: <DollarSign className="w-6 h-6" />,
  calendar: <Calendar className="w-6 h-6" />
};
