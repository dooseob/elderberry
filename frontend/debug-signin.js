// 브라우저 콘솔에서 실행할 디버깅 스크립트
// http://localhost:5174/auth/signin 페이지에서 개발자 도구 콘솔에 붙여넣기

console.log('🔍 SignIn 페이지 디버깅 스크립트 시작');

// 1. 테스트 버튼 찾기
function findTestButton() {
  const button = document.querySelector('[data-testid="test-account-button"]');
  console.log('🔍 테스트 버튼 발견:', button ? '✅ 있음' : '❌ 없음');
  if (button) {
    console.log('   버튼 텍스트:', button.textContent);
    console.log('   버튼 상태:', button.disabled ? '비활성화' : '활성화');
  }
  return button;
}

// 2. 렌더링 성능 모니터링
let renderCount = 0;
const observer = new MutationObserver((mutations) => {
  renderCount++;
  console.log(`🔄 DOM 변경 감지 #${renderCount}:`, mutations.length, '개 변경');
});

// 3. 테스트 실행
async function testAutoFill() {
  console.log('🧪 자동 입력 테스트 시작');
  
  const button = findTestButton();
  if (!button) {
    console.log('❌ 테스트 버튼을 찾을 수 없습니다');
    return;
  }
  
  // DOM 변경 모니터링 시작
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true
  });
  
  // 성능 측정 시작
  const startTime = performance.now();
  console.log('⏱️ 성능 측정 시작');
  
  // 버튼 클릭
  try {
    console.log('🖱️ 테스트 버튼 클릭...');
    button.click();
    
    // 3초 후 결과 확인
    setTimeout(() => {
      const endTime = performance.now();
      const emailInput = document.querySelector('[data-testid="signin-email"] input');
      const passwordInput = document.querySelector('[data-testid="signin-password"] input');
      
      console.log('\n📊 테스트 결과:');
      console.log('   소요시간:', Math.round(endTime - startTime), 'ms');
      console.log('   DOM 변경 횟수:', renderCount);
      console.log('   이메일 값:', emailInput ? emailInput.value : '❌ 찾을 수 없음');
      console.log('   비밀번호 값:', passwordInput ? (passwordInput.value ? '✅ 입력됨' : '❌ 빈값') : '❌ 찾을 수 없음');
      
      // 페이지 응답성 확인
      const isResponsive = document.title && document.title.includes('Elderberry');
      console.log('   페이지 응답성:', isResponsive ? '✅ 정상' : '❌ 문제');
      
      observer.disconnect();
    }, 3000);
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error);
    observer.disconnect();
  }
}

// 즉시 실행
console.log('\n🚀 테스트 실행을 위해 testAutoFill() 함수를 호출하세요');
console.log('또는 5초 후 자동 실행됩니다...');

// 5초 후 자동 실행
setTimeout(() => {
  console.log('\n🤖 자동 테스트 시작');
  testAutoFill();
}, 5000);

// 전역 함수로 노출
window.testAutoFill = testAutoFill;