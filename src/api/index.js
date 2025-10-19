// src/api/index.js
import axios from 'axios';

// API 기본 설정
const api = axios.create({
  baseURL: 'http://ec2-52-78-83-137.ap-northeast-2.compute.amazonaws.com:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;