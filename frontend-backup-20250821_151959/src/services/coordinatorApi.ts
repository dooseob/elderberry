import { HealthAssessment } from '../../../entities/health';

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
    // Backend expects POST /api/coordinator-matching/match with healthAssessmentId param and preference body
    const params = new URLSearchParams();
    params.append('healthAssessmentId', String(assessmentId));
    
    const response = await fetch(`${this.baseUrl}/match?${params}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(preference || {}),
    });
    
    if (!response.ok) {
      throw new Error(`매칭 조회 실패: ${response.status}`);
    }
    return response.json();
  }

  async getCoordinatorsByLanguage(languageCode: string, countryCode?: string, needsProfessionalConsultation?: boolean): Promise<CoordinatorMatch[]> {
    // Backend: GET /api/coordinator-matching/language/{languageCode}
    const params = new URLSearchParams();
    if (countryCode) params.append('countryCode', countryCode);
    if (needsProfessionalConsultation !== undefined) {
      params.append('needsProfessionalConsultation', String(needsProfessionalConsultation));
    }

    const response = await fetch(`${this.baseUrl}/language/${languageCode}?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`언어별 코디네이터 조회 실패: ${response.status}`);
    }
    return response.json();
  }

  async getCoordinatorsBySpecialty(specialty: string): Promise<any[]> {
    // Backend: GET /api/coordinator-matching/specialty/{specialty}
    const response = await fetch(`${this.baseUrl}/specialty/${specialty}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`전문분야별 코디네이터 조회 실패: ${response.status}`);
    }
    return response.json();
  }

  async getAvailableCoordinators(): Promise<any[]> {
    // Backend: GET /api/coordinator-matching/available
    const response = await fetch(`${this.baseUrl}/available`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`가용 코디네이터 조회 실패: ${response.status}`);
    }
    return response.json();
  }

  async getStatistics(): Promise<CoordinatorMatchingStatistics> {
    // Backend: GET /api/coordinator-matching/statistics (Admin only)
    const response = await fetch(`${this.baseUrl}/statistics`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`통계 조회 실패: ${response.status}`);
    }
    return response.json();
  }

  async runSimulation(request: MatchingSimulationRequest): Promise<MatchingSimulationResult> {
    // Backend: POST /api/coordinator-matching/simulate (Admin only)
    const response = await fetch(`${this.baseUrl}/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`시뮬레이션 실행 실패: ${response.status}`);
    }
    return response.json();
  }

  // This endpoint doesn't exist in backend - keeping for potential future use
  async getCoordinatorDetails(coordinatorId: string): Promise<CoordinatorMatch> {
    // Note: This endpoint is not implemented in backend yet
    const response = await fetch(`${this.baseUrl}/coordinator/${coordinatorId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`코디네이터 정보 조회 실패: ${response.status}`);
    }
    return response.json();
  }
}

export const coordinatorMatchingApi = new CoordinatorMatchingApi(); 