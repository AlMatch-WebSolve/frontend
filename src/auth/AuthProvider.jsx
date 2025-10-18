import React, { useState, useCallback, useEffect, useMemo } from 'react';
import apiClient from '../api/apiClient';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await apiClient.get('/api/auth/me');
        setIsLoggedIn(true);
        setUser(response.data.user);
      } catch (error) {
        console.error('로그인 상태 확인 실패:', error);
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkLoginStatus();
  }, []); // 컴포넌트가 처음 마운트될 때만 실행

  const login = useCallback(async (email, password, rememberMe) => {
    try {
      const response = await apiClient.post('/api/auth/login/', {
        email,
        password,
        rememberMe,
      });
      setIsLoggedIn(true);
      setUser(response.data.user); // 1. 로그인 성공 시 사용자 정보 저장
      return { success: true };
    } catch (error) {
      console.error('로그인 실패:', error);
      return { success: false, error };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.error('로그아웃 API 호출 실패:', error);
    } finally {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  const signup = useCallback(async (nickname, email, password) => {
    try {
      await apiClient.post('/api/auth/signup/', { nickname, email, password });
      return { success: true };
    } catch (error) {
      console.error('회원가입 실패:', error);
      return { success: false, error };
    }
  }, []);

  const value = useMemo(
    () => ({
      isLoggedIn,
      user, 
      loading,
      login,
      logout,
      signup,
    }),
    [isLoggedIn, user, loading, login, logout, signup],
  );

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
