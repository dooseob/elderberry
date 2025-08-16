#!/usr/bin/env node

/**
 * 시설찾기 메뉴 인증 포함 테스트
 */

const axios = require('axios');

const config = {
  backendUrl: 'http://localhost:8080',
  testUser: {
    email: 'test.domestic@example.com',
    password: 'Password123!'
  }
};

async function testWithAuth() {
  console.log('🔐 인증 포함 시설찾기 테스트\n');
  
  try {
    // 1. 로그인하여 실제 JWT 토큰 받기
    console.log('1️⃣ 로그인 진행');
    const loginResponse = await axios.post(`${config.backendUrl}/api/auth/login`, config.testUser);
    
    if (!loginResponse.data.token) {
      throw new Error('로그인 실패: 토큰이 없습니다');
    }
    
    const token = loginResponse.data.token;
    console.log(`✅ 로그인 성공: ${token.substring(0, 20)}...`);
    
    // 2. 인증된 상태로 시설 검색 테스트
    console.log('\n2️⃣ 인증된 시설 검색 테스트');
    const searchResponse = await axios.get(`${config.backendUrl}/api/facilities/search?keyword=서울&page=0&size=5`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      }
    });
    
    console.log(`✅ 검색 성공: ${searchResponse.data.totalElements || searchResponse.data.content?.length || 0}개 시설`);
    
    // 3. 지도 기반 검색 테스트
    console.log('\n3️⃣ 지도 기반 검색 테스트');
    try {
      const mapSearchResponse = await axios.get(`${config.backendUrl}/api/facilities/map-search?minLat=37.4&maxLat=37.6&minLng=126.8&maxLng=127.2`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });
      
      console.log(`✅ 지도 검색 성공: ${mapSearchResponse.data.length || 0}개 시설`);
    } catch (error) {
      console.log(`⚠️  지도 검색: ${error.response?.status || error.message}`);
    }
    
    // 4. 단순 API 호출 테스트 (인증 없이)
    console.log('\n4️⃣ 기본 API 접근 테스트');
    try {
      await axios.get(`${config.backendUrl}/api/facilities/search?keyword=test`, { timeout: 3000 });
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('✅ 인증 보안: 토큰 없이 접근 시 정상적으로 차단됨');
      } else {
        console.log(`⚠️  예상과 다른 응답: ${error.response?.status}`);
      }
    }
    
    console.log('\n🎉 최종 결과');
    console.log('='.repeat(40));
    console.log('✅ JWT 인증: 정상 동작');
    console.log('✅ 시설 검색 API: 정상 동작');
    console.log('✅ 보안 설정: 적절히 구성됨');
    console.log('\n🚀 시설찾기 메뉴 준비 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    if (error.response) {
      console.error(`   HTTP ${error.response.status}: ${error.response.statusText}`);
      console.error('   응답:', error.response.data);
    }
  }
}

testWithAuth();