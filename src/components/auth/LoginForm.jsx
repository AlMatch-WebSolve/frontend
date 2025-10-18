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

    // 1. AuthProvider의 login 함수를 호출하고 그 결과를 변수에 저장합니다.
    const result = await login(email, password, rememberMe);

    // 2. 반환된 결과 객체의 success 속성을 확인합니다.
    if (result.success) {
      // 3. 성공했을 때만 성공 알림을 띄우고 페이지를 이동합니다.
      alert('로그인에 성공했습니다!');
      navigate('/workspace');
    } else {
      // 4. 실패했을 경우, 백엔드에서 보낸 에러 메시지를 사용자에게 보여줍니다.
      // result.error 객체에 서버의 응답이 들어있습니다.
      alert(result.error?.response?.data?.message || '로그인에 실패했습니다.');
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>로그인</h2>
      <AuthInput
        placeholder='이메일'
        type='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <AuthInput
        placeholder='비밀번호'
        type='password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className={styles.stayLoggedIn}>
        <input
          type='checkbox'
          id='stayLoggedIn'
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        <label htmlFor='stayLoggedIn'>로그인 상태 유지</label>
      </div>
      <button type='submit' className={styles.submitButton}>
        로그인하기
      </button>
    </form>
  );
}

export default LoginForm;
