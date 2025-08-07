#!/usr/bin/env node

const axios = require('axios');

async function debugLogin() {
  try {
    const response = await axios.post('http://localhost:8080/api/auth/login', {
      email: 'test.domestic@example.com',
      password: 'Password123!'
    });
    
    console.log('로그인 응답:', JSON.stringify(response.data, null, 2));
    console.log('토큰 존재:', !!response.data.token);
    
  } catch (error) {
    console.error('로그인 에러:', error.message);
    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
    }
  }
}

debugLogin();