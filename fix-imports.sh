#!/bin/bash

# 엘더베리 프로젝트 import 경로 일괄 수정 스크립트
# ../../../shared/ui/ -> @/shared/ui 패턴으로 변경하고 default import를 named import로 수정

cd /mnt/c/Users/human-10/elderberry/frontend/src

echo "🔧 Import 경로 수정 시작..."

# 핵심 빌드 에러 파일들부터 처리
files_to_fix=(
  "features/facility/components/FacilityCard.tsx"
  "features/facility/components/FacilityDetailModal.tsx" 
  "features/facility/components/FacilityList.tsx"
  "features/facility/components/FacilitySearchFilters.tsx"
  "features/facility/components/MatchingCompletionForm.tsx"
  "features/facility/components/RecommendationResults.tsx"
  "features/health/steps/ReviewStep.tsx"
  "features/health/steps/AdditionalInfoStep.tsx"
  "features/health/steps/AdlCommunicationStep.tsx"
  "features/health/steps/AdlEatingStep.tsx"
  "features/health/steps/AdlToiletStep.tsx"
  "features/health/steps/BasicInfoStep.tsx"
  "features/health/steps/LtciGradeStep.tsx"
  "features/mypage/components/AccountSettings.tsx"
  "features/mypage/components/ActivityHistory.tsx"
  "features/mypage/components/JobApplications.tsx"
  "features/mypage/components/MatchingHistory.tsx"
  "features/mypage/components/MyReviews.tsx"
  "features/mypage/components/ProfileOverview.tsx"
  "features/mypage/MyPage.tsx"
  "features/reviews/ReviewListPage.tsx"
)

for file in "${files_to_fix[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 $file 수정 중..."
    
    # Card import 패턴 수정
    sed -i "s|import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../shared/ui/Card'|import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/ui'|g" "$file"
    sed -i "s|import Card, { CardHeader, CardTitle, CardContent } from '../../../shared/ui/Card'|import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui'|g" "$file"
    sed -i "s|import Card, { CardContent } from '../../../shared/ui/Card'|import { Card, CardContent } from '@/shared/ui'|g" "$file"
    sed -i "s|import { Card } from '../../../shared/ui/Card'|import { Card } from '@/shared/ui'|g" "$file"
    
    # Button import 패턴 수정
    sed -i "s|import Button from '../../../shared/ui/Button'|import { Button } from '@/shared/ui'|g" "$file"
    sed -i "s|import { Button } from '../../../shared/ui/Button'|import { Button } from '@/shared/ui'|g" "$file"
    
    # 기타 컴포넌트들
    sed -i "s|import RadioGroup, { type RadioOption } from '../../../shared/ui/RadioGroup'|import { RadioGroup, type RadioOption } from '@/shared/ui'|g" "$file"
    sed -i "s|import RadioGroup from '../../../shared/ui/RadioGroup'|import { RadioGroup } from '@/shared/ui'|g" "$file"
    sed -i "s|import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner'|import { LoadingSpinner } from '@/shared/ui'|g" "$file"
    
  else
    echo "⚠️  $file 파일을 찾을 수 없습니다."
  fi
done

echo "✅ Import 경로 수정 완료!"
echo "🔨 빌드 테스트를 실행해주세요: npm run build"