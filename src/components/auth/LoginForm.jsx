import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthInput from './AuthInput';
import styles from '../../pages/AuthPage/AuthPage.module.css';

function LoginForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // 폼 제출 시 페이지가 새로고침되는 것을 방지합니다.

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('로그인 성공:', data);
        localStorage.setItem('accessToken', data.accessToken); // 받은 accessToken을 로컬 스토리지에 저장

        const storedToken = localStorage.getItem('accessToken');
        console.log('localStorage에 저장된 accessToken:', storedToken);

        alert('로그인에 성공했습니다!');
        navigate('/workspace');
      } else {
        throw new Error(data.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      alert(error.message); // 사용자에게 에러 메시지를 보여줍니다.
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
        <input type="checkbox" id="stayLoggedIn" />
        <label htmlFor="stayLoggedIn">로그인 상태 유지</label>
      </div>
      <button type="submit" className={styles.submitButton}>
        로그인하기
      </button>
    </form>
  );
}

export default LoginForm;
