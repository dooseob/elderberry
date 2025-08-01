/**
 * 레이아웃 컴포넌트 데모 섹션 - 레이아웃 전문가 구현
 * Layout System, Navigation, Responsive 데모
 * 
 * @author 레이아웃 전문가 (서브 에이전트 시스템)
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout, Menu, Smartphone, Tablet, Monitor, Grid } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';

const ResponsiveDemo: React.FC = () => {
  const [activeBreakpoint, setActiveBreakpoint] = useState('desktop');

  const breakpoints = [
    { id: 'mobile', label: 'Mobile', icon: <Smartphone className="w-4 h-4" />, width: '375px' },
    { id: 'tablet', label: 'Tablet', icon: <Tablet className="w-4 h-4" />, width: '768px' },
    { id: 'desktop', label: 'Desktop', icon: <Monitor className="w-4 h-4" />, width: '1024px' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid className="w-5 h-5" />
          반응형 레이아웃
        </CardTitle>
        <CardDescription>다양한 화면 크기에서의 레이아웃 동작</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            {breakpoints.map(bp => (
              <Button
                key={bp.id}
                variant={activeBreakpoint === bp.id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveBreakpoint(bp.id)}
                icon={bp.icon}
              >
                {bp.label}
              </Button>
            ))}
          </div>
          
          <div className="border border-[var(--linear-color-border-default)] rounded-lg p-4 bg-[var(--linear-color-surface-elevated)]">
            <div 
              className="mx-auto bg-white border border-gray-300 rounded shadow-sm overflow-hidden transition-all duration-300"
              style={{ 
                width: breakpoints.find(bp => bp.id === activeBreakpoint)?.width,
                height: '400px'
              }}
            >
              <div className="bg-[var(--linear-color-accent)] text-white p-2 text-sm">
                Header - {breakpoints.find(bp => bp.id === activeBreakpoint)?.label}
              </div>
              <div className="flex h-full">
                {activeBreakpoint !== 'mobile' && (
                  <div className="w-48 bg-gray-100 p-2 text-sm">
                    Sidebar
                  </div>
                )}
                <div className="flex-1 p-2 text-sm">
                  Main Content Area
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const LayoutComponentDemo: React.FC = () => {
  return (
    <div className="layout-component-demo space-y-8">
      <ResponsiveDemo />
      
      <Card>
        <CardHeader>
          <CardTitle>스페이싱 시스템</CardTitle>
          <CardDescription>Linear Design System의 일관된 간격 체계</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'xs', value: '4px', var: '--linear-spacing-xs' },
              { name: 'sm', value: '8px', var: '--linear-spacing-sm' },
              { name: 'md', value: '16px', var: '--linear-spacing-md' },
              { name: 'lg', value: '24px', var: '--linear-spacing-lg' },
              { name: 'xl', value: '32px', var: '--linear-spacing-xl' },
              { name: '2xl', value: '48px', var: '--linear-spacing-2xl' },
              { name: '3xl', value: '64px', var: '--linear-spacing-3xl' },
              { name: '4xl', value: '96px', var: '--linear-spacing-4xl' }
            ].map(spacing => (
              <div key={spacing.name} className="flex items-center gap-4">
                <Badge variant="outline" className="w-12 text-center">
                  {spacing.name}
                </Badge>
                <div 
                  className="bg-[var(--linear-color-accent)] h-4"
                  style={{ width: `var(${spacing.var})` }}
                />
                <code className="text-sm text-[var(--linear-color-text-secondary)]">
                  {spacing.var} ({spacing.value})
                </code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LayoutComponentDemo;