import React, { useState } from 'react';
import AuthInput from './AuthInput';
import styles from '../../pages/AuthPage/AuthPage.module.css';
import { useAuth } from '../../hooks/useAuth';

function SignupForm({ onSignupSuccess }) {
  const { signup } = useAuth(); // AuthContext의 signup 함수 사용
  const [name, setName] = useState(''); // 추후 nickname으로 변경 예정
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 간단한 유효성 검사
    if (password !== passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await signup(name, email, password); // signup 함수 호출
      alert(response.data.message || '회원가입에 성공했습니다!');
      onSignupSuccess(); // 성공 시 로그인 폼으로 전환
    } catch (error) {
      console.error('회원가입 에러:', error);
      alert(
        error.response?.data?.message || '회원가입 중 오류가 발생했습니다.',
      );
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>회원가입</h2>
      <AuthInput
        label='닉네임'
        type='text'
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <AuthInput
        label='이메일'
        type='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <AuthInput
        label='비밀번호'
        type='password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <AuthInput
        label='비밀번호 확인'
        type='password'
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
      />
      <button type='submit' className={styles.submitButton}>
        회원가입하기
      </button>
    </form>
  );
}

export default SignupForm;
