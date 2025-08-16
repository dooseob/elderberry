/**
 * Simplified App Test with Basic Node.js HTTP request
 * 브라우저 없이 HTTP 응답 확인
 */

const http = require('http');

function testApp() {
  const options = {
    hostname: 'localhost',
    port: 5173,
    path: '/',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    console.log('✅ HTTP Status:', res.statusCode);
    console.log('📋 Headers:', JSON.stringify(res.headers, null, 2));
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📄 Response Length:', data.length);
      
      if (data.includes('<div id="root">')) {
        console.log('✅ Found React root element');
      } else {
        console.log('❌ React root element not found');
      }
      
      if (data.includes('<!DOCTYPE html>')) {
        console.log('✅ Valid HTML document');
      } else {
        console.log('❌ Invalid HTML document');
      }
      
      // HTML 내용 미리보기
      console.log('\n📄 HTML Preview (first 500 chars):');
      console.log(data.substring(0, 500));
      
      // script 태그 확인
      const scriptMatches = data.match(/<script[^>]*>/g);
      console.log('\n🔧 Script tags found:', scriptMatches ? scriptMatches.length : 0);
      
      if (scriptMatches) {
        scriptMatches.forEach((script, index) => {
          console.log(`  ${index + 1}. ${script}`);
        });
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Request failed:', err.message);
  });

  req.on('timeout', () => {
    console.error('⏰ Request timeout');
    req.destroy();
  });

  req.end();
}

console.log('🚀 Testing simplified Elderberry app on http://localhost:5173');
testApp();