import React, { useState } from 'react';
import AuthInput from './AuthInput';
import styles from '../../pages/AuthPage/AuthPage.module.css';

function SignupForm({ onSignupSuccess }) {
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
      const requestBody = { name, email, password };
      console.log('서버로 보내는 요청 데이터:', requestBody);

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 비밀번호 확인 필드는 서버에 보내지 않습니다.
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('서버로부터 받은 응답 데이터:', data);

      if (response.ok) {
        // 회원가입 성공 (HTTP 201)
        // 서버가 보내준 성공 메시지를 alert으로 띄워줍니다.
        alert(data.message || '회원가입에 성공했습니다!');
        onSignupSuccess(); // 로그인 폼으로 전환
      } else {
        // 회원가입 실패 (HTTP 400 등)
        // 서버가 보내준 에러 메시지를 data 객체에서 꺼내 사용합니다.
        throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('회원가입 에러:', error);
      alert(error.message); // 사용자에게 구체적인 에러 메시지를 보여줍니다.
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
