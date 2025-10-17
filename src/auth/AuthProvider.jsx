import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  // 사용자가 로그인했는지 여부를 상태로 관리
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // 서버에 쿠키를 보내 현재 로그인 상태인지 확인
        await apiClient.get('/api/auth/me'); // 서버의 상태 확인 API
        setIsLoggedIn(true);
      } catch (error) {
        console.error('로그인 상태 확인 실패:', error);
        setIsLoggedIn(false);
      } finally {
        setLoading(false); // 상태 확인이 끝나면 로딩 종료
      }
    };

    checkLoginStatus();
  }, []); // 컴포넌트가 처음 마운트될 때만 실행

  const login = async (email, password, rememberMe) => {
    await apiClient.post('/api/auth/login', { email, password, rememberMe });
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await apiClient.post('/api/auth/logout');
    setIsLoggedIn(false);
  };

  const signup = async (name, email, password) => {
    return apiClient.post('/api/auth/signup', { name, email, password });
  };

  const value = { isLoggedIn, login, logout, signup, loading };

  // 첫 로그인 상태 확인이 끝나기 전까지는 로딩 화면을 보여줌
  if (loading) {
    return <div>로딩 중...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
