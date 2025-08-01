/**
 * 타이포그래피 데모 섹션 - 타이포그래피 전문가 구현
 * Font System, Sizes, Heights, Weights 데모
 * 
 * @author 타이포그래피 전문가 (서브 에이전트 시스템)
 */

import React from 'react';
import { Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import Badge from '../../ui/Badge';

const FontSizesDemo: React.FC = () => {
  const fontSizes = [
    { name: 'xs', class: 'text-xs', description: '12px - 캡션, 라벨' },
    { name: 'sm', class: 'text-sm', description: '14px - 작은 텍스트' },
    { name: 'base', class: 'text-base', description: '16px - 기본 텍스트' },
    { name: 'lg', class: 'text-lg', description: '18px - 큰 텍스트' },
    { name: 'xl', class: 'text-xl', description: '20px - 소제목' },
    { name: '2xl', class: 'text-2xl', description: '24px - 제목' },
    { name: '3xl', class: 'text-3xl', description: '30px - 큰 제목' },
    { name: '4xl', class: 'text-4xl', description: '36px - 대형 제목' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>폰트 크기</CardTitle>
        <CardDescription>다양한 텍스트 크기와 사용 용도</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fontSizes.map((size) => (
            <div key={size.name} className="flex items-baseline gap-4 pb-3 border-b border-[var(--linear-color-border-subtle)] last:border-b-0">
              <Badge variant="outline" className="shrink-0 w-12 text-center">
                {size.name}
              </Badge>
              <div className={`${size.class} text-[var(--linear-color-text-primary)] flex-1`}>
                The quick brown fox jumps over the lazy dog
              </div>
              <div className="text-sm text-[var(--linear-color-text-secondary)] shrink-0">
                {size.description}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const FontWeightsDemo: React.FC = () => {
  const fontWeights = [
    { name: 'normal', class: 'font-normal', value: '400', description: '일반 텍스트' },
    { name: 'medium', class: 'font-medium', value: '500', description: '약간 굵은 텍스트' },
    { name: 'semibold', class: 'font-semibold', value: '600', description: '세미볼드' },
    { name: 'bold', class: 'font-bold', value: '700', description: '굵은 텍스트' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>폰트 가중치</CardTitle>
        <CardDescription>Inter 폰트의 다양한 굵기</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fontWeights.map((weight) => (
            <div key={weight.name} className="flex items-baseline gap-4 pb-3 border-b border-[var(--linear-color-border-subtle)] last:border-b-0">
              <Badge variant="outline" className="shrink-0 w-20 text-center">
                {weight.name}
              </Badge>
              <div className={`${weight.class} text-lg text-[var(--linear-color-text-primary)] flex-1`}>
                Linear Design System Typography
              </div>
              <div className="text-sm text-[var(--linear-color-text-secondary)] shrink-0">
                {weight.value} - {weight.description}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const LineHeightsDemo: React.FC = () => {
  const lineHeights = [
    { name: 'tight', class: 'leading-tight', value: '1.25', description: '제목용' },
    { name: 'normal', class: 'leading-normal', value: '1.5', description: '기본 텍스트' },
    { name: 'relaxed', class: 'leading-relaxed', value: '1.625', description: '읽기 편한 텍스트' }
  ];

  const sampleText = "Linear Design System은 LCH 색공간을 기반으로 한 현대적인 디자인 시스템입니다. 일관성 있는 사용자 경험과 접근성을 제공하며, 다양한 테마와 커스터마이징 옵션을 지원합니다.";

  return (
    <Card>
      <CardHeader>
        <CardTitle>라인 높이</CardTitle>
        <CardDescription>텍스트 가독성을 위한 줄 간격</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {lineHeights.map((lineHeight) => (
            <div key={lineHeight.name} className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {lineHeight.name}
                </Badge>
                <span className="text-sm text-[var(--linear-color-text-secondary)]">
                  {lineHeight.value} - {lineHeight.description}
                </span>
              </div>
              <div className={`${lineHeight.class} text-[var(--linear-color-text-primary)] p-4 bg-[var(--linear-color-surface-elevated)] rounded-lg`}>
                {sampleText}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const TextAlignmentDemo: React.FC = () => {
  const alignments = [
    { name: '왼쪽 정렬', class: 'text-left', icon: <AlignLeft className="w-4 h-4" /> },
    { name: '가운데 정렬', class: 'text-center', icon: <AlignCenter className="w-4 h-4" /> },
    { name: '오른쪽 정렬', class: 'text-right', icon: <AlignRight className="w-4 h-4" /> }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>텍스트 정렬</CardTitle>
        <CardDescription>다양한 텍스트 정렬 옵션</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alignments.map((alignment) => (
            <div key={alignment.name} className="space-y-2">
              <div className="flex items-center gap-2">
                {alignment.icon}
                <span className="font-medium text-[var(--linear-color-text-primary)]">
                  {alignment.name}
                </span>
              </div>
              <div className={`${alignment.class} text-[var(--linear-color-text-primary)] p-4 bg-[var(--linear-color-surface-elevated)] rounded-lg`}>
                Linear Design System으로 만든 아름다운 인터페이스
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const TypographyDemo: React.FC = () => {
  return (
    <div className="typography-demo space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            Inter 폰트 패밀리
          </CardTitle>
          <CardDescription>
            Google Fonts의 Inter를 사용한 모던하고 읽기 쉬운 타이포그래피
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-4xl font-bold text-[var(--linear-color-text-primary)]">
              Aa Bb Cc Dd Ee Ff Gg Hh
            </div>
            <div className="text-2xl font-semibold text-[var(--linear-color-text-primary)]">
              1234567890 !@#$%^&*()
            </div>
            <div className="text-lg text-[var(--linear-color-text-secondary)]">
              가나다라마바사아자차카타파하
            </div>
            <div className="text-sm text-[var(--linear-color-text-tertiary)]">
              The quick brown fox jumps over the lazy dog. 
              Linear Design System provides consistent typography across all components.
            </div>
          </div>
        </CardContent>
      </Card>

      <FontSizesDemo />
      <FontWeightsDemo />
      <LineHeightsDemo />
      <TextAlignmentDemo />
    </div>
  );
};

export default TypographyDemo;