import React, { useState } from 'react';
import AuthInput from './AuthInput';
import styles from '../../pages/AuthPage/AuthPage.module.css';
import { useAuth } from '../../hooks/useAuth';

function SignupForm({ onSignupSuccess }) {
  const { signup } = useAuth();
  const [name, setName] = useState(''); // 추후 nickname으로 변경 예정
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    const result = await signup(name, email, password);

    if (result.success) {
      alert('회원가입에 성공했습니다! 이제 로그인 해주세요.');
      onSignupSuccess();
    } else {
      alert(
        result.error?.response?.data?.message ||
          '회원가입 중 오류가 발생했습니다.',
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
