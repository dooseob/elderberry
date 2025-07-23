import { HealthAssessment } from '@/types/health';

export interface CoordinatorMatch {
  coordinatorId: string;
  name: string;
  matchScore: number;
  matchReason: string;
  experienceYears: number;
  successfulCases: number;
  customerSatisfaction: number;
  specialtyAreas: string[];
  compatibleCareGrades: number[];
  languageSkills: CoordinatorLanguageSkill[];
  availableWeekends: boolean;
  availableEmergency: boolean;
  workingRegions: string[];
  currentActiveCases: number;
  maxSimultaneousCases: number;
  workloadRatio: number;
}

export interface CoordinatorLanguageSkill {
  language: string;
  proficiencyLevel: string;
  isNative: boolean;
  certificationLevel?: string;
}

export interface MatchingPreference {
  preferredLanguage?: string;
  preferredRegion?: string;
  needsWeekendAvailability?: boolean;
  needsEmergencyAvailability?: boolean;
  minCustomerSatisfaction?: number;
  maxResults?: number;
  countryCode?: string;
  needsProfessionalConsultation?: boolean;
}

export interface CoordinatorMatchingStatistics {
  totalActiveCoordinators: number;
  averageCustomerSatisfaction: number;
  availableCoordinators: number;
  totalSuccessfulMatches: number;
  overallMatchingSuccessRate: number;
  averageResponseTime: number;
}

export interface MatchingSimulationRequest {
  healthAssessmentCount: number;
  coordinatorCount: number;
  simulationType: 'RANDOM' | 'REALISTIC' | 'STRESS_TEST';
  includeLanguageMatching?: boolean;
  includeSpecialtyMatching?: boolean;
  includeWorkloadOptimization?: boolean;
}

export interface MatchingSimulationResult {
  totalHealthAssessments: number;
  totalCoordinators: number;
  successfulMatches: number;
  failedMatches: number;
  averageMatchingScore: number;
  matchingSuccessRate: number;
  executionTimeMs: number;
  simulationTime: string;
}

class CoordinatorMatchingApi {
  private baseUrl = '/api/coordinator-matching';

  async findMatches(assessmentId: number, preference?: MatchingPreference): Promise<CoordinatorMatch[]> {
    const params = new URLSearchParams();
    if (preference) {
      Object.entries(preference).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/${assessmentId}/matches?${params}`);
    if (!response.ok) {
      throw new Error(`매칭 조회 실패: ${response.status}`);
    }
    return response.json();
  }

  async getStatistics(): Promise<CoordinatorMatchingStatistics> {
    const response = await fetch(`${this.baseUrl}/statistics`);
    if (!response.ok) {
      throw new Error(`통계 조회 실패: ${response.status}`);
    }
    return response.json();
  }

  async runSimulation(request: MatchingSimulationRequest): Promise<MatchingSimulationResult> {
    const response = await fetch(`${this.baseUrl}/simulation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`시뮬레이션 실행 실패: ${response.status}`);
    }
    return response.json();
  }

  async getCoordinatorDetails(coordinatorId: string): Promise<CoordinatorMatch> {
    const response = await fetch(`${this.baseUrl}/coordinator/${coordinatorId}`);
    if (!response.ok) {
      throw new Error(`코디네이터 정보 조회 실패: ${response.status}`);
    }
    return response.json();
  }
}

export const coordinatorMatchingApi = new CoordinatorMatchingApi(); 