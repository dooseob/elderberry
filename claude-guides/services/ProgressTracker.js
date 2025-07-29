/**
 * 진행상황 추적 시스템
 * TodoWrite 도구와 연동하여 실시간 진행상황 모니터링
 * 
 * @author Claude Code + MCP Integration
 * @version 2.0.0
 * @date 2025-07-29
 */

class ProgressTracker {
  constructor() {
    this.activeSessions = new Map();
    this.completedSessions = [];
    this.metrics = {
      totalSessions: 0,
      averageCompletionTime: 0,
      successRate: 0
    };
  }

  /**
   * 진행 추적 시작
   * @param {string} command - 실행 명령어
   * @param {string} task - 작업 설명
   * @returns {string} 추적 ID
   */
  async start(command, task) {
    const trackingId = `${command}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session = {
      id: trackingId,
      command,
      task,
      startTime: Date.now(),
      status: 'started',
      todos: [],
      progress: 0,
      currentStep: '',
      estimatedCompletion: null
    };
    
    this.activeSessions.set(trackingId, session);
    
    // 초기 TODO 생성
    await this.createInitialTodos(trackingId, command, task);
    
    console.log(`📊 진행 추적 시작: ${trackingId} (${command})`);
    return trackingId;
  }

  /**
   * 초기 TODO 생성
   */
  async createInitialTodos(trackingId, command, task) {
    const session = this.activeSessions.get(trackingId);
    if (!session) return;

    // 명령어별 기본 TODO 템플릿
    const todoTemplates = this.getTodoTemplates(command, task);
    
    try {
      // TodoWrite 도구로 TODO 생성 (가상 호출 - 실제로는 Claude Code의 TodoWrite 도구 사용)
      const todos = todoTemplates.map((template, index) => ({
        id: `${trackingId}_${index + 1}`,
        content: template.content,
        status: index === 0 ? 'in_progress' : 'pending',
        priority: template.priority || 'medium'
      }));
      
      session.todos = todos;
      session.totalSteps = todos.length;
      session.currentStep = todos[0]?.content || '시작';
      
      console.log(`📝 TODO 생성 완료: ${todos.length}개 항목`);
      
    } catch (error) {
      console.error('❌ TODO 생성 실패:', error);
    }
  }

  /**
   * 명령어별 TODO 템플릿 생성
   */
  getTodoTemplates(command, task) {
    const baseTemplates = {
      '/max': [
        { content: `작업 복잡도 분석: ${task}`, priority: 'high' },
        { content: '10개 병렬 작업 분할 및 계획', priority: 'high' },
        { content: '5개 MCP 도구 초기화 및 준비', priority: 'high' },
        { content: '5개 서브에이전트 활성화', priority: 'medium' },
        { content: '병렬 작업 실행 및 모니터링', priority: 'high' },
        { content: '결과 통합 및 검증', priority: 'medium' },
        { content: '자동 커밋 및 문서화', priority: 'low' },
        { content: '성능 메트릭 수집 및 학습', priority: 'low' }
      ],
      '/auto': [
        { content: `작업 자동 분석: ${task}`, priority: 'high' },
        { content: '최적화 전략 선택', priority: 'medium' },
        { content: 'MCP 도구 자동 선택', priority: 'medium' },
        { content: '적절한 서브에이전트 선택', priority: 'medium' },
        { content: '5개 병렬 작업 실행', priority: 'high' },
        { content: '결과 검증 및 최적화', priority: 'medium' }
      ],
      '/smart': [
        { content: `지능형 작업 분석: ${task}`, priority: 'high' },
        { content: '스마트 에이전트 선택', priority: 'medium' },
        { content: '3개 협업 작업 실행', priority: 'high' },
        { content: '품질 중심 결과 검증', priority: 'high' }
      ],
      '/rapid': [
        { content: `긴급 작업 처리: ${task}`, priority: 'critical' },
        { content: '빠른 실행 경로 선택', priority: 'high' },
        { content: '1-2개 집중 작업 실행', priority: 'critical' }
      ],
      '/deep': [
        { content: `심층 분석 시작: ${task}`, priority: 'high' },
        { content: 'Sequential Thinking 단계별 분석', priority: 'high' },
        { content: '문제 정의 및 요구사항 분석', priority: 'medium' },
        { content: '해결책 설계 및 구현 계획', priority: 'medium' },
        { content: '검증 방법 및 테스트 계획', priority: 'medium' },
        { content: '상세 문서화 및 가이드 생성', priority: 'low' }
      ],
      '/sync': [
        { content: `동기화 상태 확인: ${task}`, priority: 'high' },
        { content: 'GitHub 저장소 상태 점검', priority: 'medium' },
        { content: 'Memory Bank 동기화', priority: 'medium' },
        { content: 'Filesystem 변경사항 추적', priority: 'medium' },
        { content: '자동 커밋 및 푸시', priority: 'high' },
        { content: '문서 업데이트 동기화', priority: 'low' }
      ]
    };

    return baseTemplates[command] || [
      { content: `작업 실행: ${task}`, priority: 'medium' },
      { content: '결과 검증', priority: 'low' }
    ];
  }

  /**
   * 진행상황 업데이트
   */
  async updateProgress(trackingId, stepIndex, status = 'completed', details = '') {
    const session = this.activeSessions.get(trackingId);
    if (!session) {
      console.warn(`⚠️ 존재하지 않는 추적 세션: ${trackingId}`);
      return;
    }

    // TODO 상태 업데이트
    if (session.todos[stepIndex]) {
      session.todos[stepIndex].status = status;
      
      if (details) {
        session.todos[stepIndex].details = details;
      }
    }

    // 다음 단계 활성화
    if (status === 'completed' && stepIndex + 1 < session.todos.length) {
      session.todos[stepIndex + 1].status = 'in_progress';
      session.currentStep = session.todos[stepIndex + 1].content;
    }

    // 전체 진행률 계산
    const completedSteps = session.todos.filter(todo => todo.status === 'completed').length;
    session.progress = Math.round((completedSteps / session.totalSteps) * 100);

    // 예상 완료 시간 계산
    if (completedSteps > 0) {
      const elapsedTime = Date.now() - session.startTime;
      const avgTimePerStep = elapsedTime / completedSteps;
      const remainingSteps = session.totalSteps - completedSteps;
      session.estimatedCompletion = Date.now() + (avgTimePerStep * remainingSteps);
    }

    console.log(`📈 진행률 업데이트: ${session.progress}% (${completedSteps}/${session.totalSteps})`);

    // TodoWrite 도구 업데이트 (실제로는 Claude Code의 TodoWrite 도구 호출)
    await this.updateTodoWrite(session);
  }

  /**
   * TodoWrite 도구 업데이트
   */
  async updateTodoWrite(session) {
    try {
      // 가상 TodoWrite 업데이트 (실제로는 Claude Code의 TodoWrite 도구 사용)
      console.log(`📝 TodoWrite 업데이트: ${session.id}`);
      
      // 실제 구현에서는 다음과 같이 TodoWrite 도구 호출
      /*
      await claudeCode.callTool('TodoWrite', {
        todos: session.todos
      });
      */
      
    } catch (error) {
      console.error('❌ TodoWrite 업데이트 실패:', error);
    }
  }

  /**
   * 진행 추적 완료
   */
  async complete(trackingId, result) {
    const session = this.activeSessions.get(trackingId);
    if (!session) {
      console.warn(`⚠️ 존재하지 않는 추적 세션: ${trackingId}`);
      return;
    }

    const endTime = Date.now();
    const totalTime = endTime - session.startTime;

    // 세션 완료 처리
    session.status = result.success ? 'completed' : 'failed';
    session.endTime = endTime;
    session.totalTime = totalTime;
    session.result = result;
    session.progress = 100;

    // 모든 TODO를 완료 상태로 변경
    session.todos.forEach(todo => {
      if (todo.status !== 'completed') {
        todo.status = result.success ? 'completed' : 'failed';
      }
    });

    // 완료된 세션으로 이동
    this.activeSessions.delete(trackingId);
    this.completedSessions.push(session);

    // 메트릭 업데이트
    this.updateMetrics(session);

    console.log(`✅ 진행 추적 완료: ${trackingId} (${totalTime}ms)`);

    // 최종 TodoWrite 업데이트
    await this.updateTodoWrite(session);

    return session;
  }

  /**
   * 메트릭 업데이트
   */
  updateMetrics(session) {
    this.metrics.totalSessions++;
    
    // 평균 완료 시간 계산
    const totalTime = this.completedSessions.reduce((sum, s) => sum + (s.totalTime || 0), 0);
    this.metrics.averageCompletionTime = totalTime / this.completedSessions.length;
    
    // 성공률 계산
    const successfulSessions = this.completedSessions.filter(s => s.status === 'completed').length;
    this.metrics.successRate = (successfulSessions / this.completedSessions.length) * 100;
  }

  /**
   * 현재 진행상황 조회
   */
  getProgress(trackingId) {
    const session = this.activeSessions.get(trackingId);
    if (!session) {
      // 완료된 세션에서 찾기
      const completedSession = this.completedSessions.find(s => s.id === trackingId);
      return completedSession || null;
    }

    return {
      id: session.id,
      command: session.command,
      task: session.task,
      progress: session.progress,
      currentStep: session.currentStep,
      status: session.status,
      elapsedTime: Date.now() - session.startTime,
      estimatedCompletion: session.estimatedCompletion,
      todos: session.todos
    };
  }

  /**
   * 모든 활성 세션 조회
   */
  getAllActiveSessions() {
    return Array.from(this.activeSessions.values()).map(session => ({
      id: session.id,
      command: session.command,
      task: session.task,
      progress: session.progress,
      currentStep: session.currentStep,
      elapsedTime: Date.now() - session.startTime
    }));
  }

  /**
   * 전체 메트릭 조회
   */
  getMetrics() {
    return {
      ...this.metrics,
      activeSessions: this.activeSessions.size,
      completedSessions: this.completedSessions.length
    };
  }

  /**
   * 세션 정리 (오래된 완료 세션 제거)
   */
  cleanup(maxAge = 24 * 60 * 60 * 1000) { // 24시간
    const cutoffTime = Date.now() - maxAge;
    
    this.completedSessions = this.completedSessions.filter(session => {
      return (session.endTime || session.startTime) > cutoffTime;
    });
    
    console.log(`🧹 세션 정리 완료: ${this.completedSessions.length}개 세션 유지`);
  }
}

module.exports = { ProgressTracker };