import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthInput from './AuthInput';
import styles from '../../pages/AuthPage/AuthPage.module.css';
import { useAuth } from '../../hooks/useAuth';

function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth(); // AuthContext의 login 함수 사용

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // 폼 제출 시 페이지가 새로고침되는 것을 방지합니다.

    try {
      await login(email, password, rememberMe);

      alert('로그인에 성공했습니다!');
      navigate('/workspace');
    } catch (error) {
      console.error('로그인 에러:', error);
      alert(error.response?.data?.message || '로그인에 실패했습니다.');
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>로그인</h2>
      <AuthInput
        placeholder="이메일"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <AuthInput
        placeholder="비밀번호"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className={styles.stayLoggedIn}>
        <input
          type="checkbox"
          id="stayLoggedIn"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        <label htmlFor="stayLoggedIn">로그인 상태 유지</label>
      </div>
      <button type="submit" className={styles.submitButton}>
        로그인하기
      </button>
    </form>
  );
}

export default LoginForm;
