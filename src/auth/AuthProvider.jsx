import React, { useState, useCallback, useEffect, useMemo } from 'react';
import apiClient from '../api/apiClient';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
      setLoading(false);
      return;
    }

    const checkLoginStatus = async () => {
      try {
        console.log('1️⃣ [AuthProvider] 로그인 상태 확인을 시작합니다...');
        const response = await apiClient.get('/api/auth/me');
        console.log('2️⃣ [AuthProvider] /me API 응답 성공:', response);

        setIsLoggedIn(true);
        setUser(response.data);
      } catch (error) {
        console.error('2️⃣-a [AuthProvider] /me API 응답 실패:', error);
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
      const response = await apiClient.post('/api/auth/login', {
        email,
        password,
        rememberMe,
      });
      console.log('✅ 로그인 성공! API에서 받은 user 객체:', response.data);
      setIsLoggedIn(true);
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
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
      localStorage.removeItem('user');
    }
  }, []);

  const signup = useCallback(async (nickname, email, password) => {
    try {
      await apiClient.post('/api/auth/signup', { nickname, email, password });
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

  console.log('3️⃣ [AuthProvider] Context로 전달할 최종 값:', {
    isLoggedIn,
    user,
    loading,
  });

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
