import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthInput from './AuthInput';
import styles from '../../pages/ForgotPasswordPage/ForgotPasswordPage.module.css';
import apiClient from '../../api/apiClient';

function ForgotPasswordForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    // 유효성 검사
    if (!email) {
      setError('이메일을 입력해주세요.');
      return false;
    }

    // 간단한 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('유효한 이메일 형식을 입력해주세요.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // API 호출: 비밀번호 재설정 토큰 요청
      await apiClient.post('/api/auth/password/reset-request', {
        email: email,
      });

      setSuccess(true);
      setEmail('');

      // 2초 후 로그인 페이지로 이동
      setTimeout(() => {
        alert('가입한 이메일로 비밀번호 재설정 링크가 전송되었습니다. 이메일을 확인해주세요.');
        navigate('/auth');
      }, 2000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        '비밀번호 재설정 요청에 실패했습니다. 다시 시도해주세요.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>비밀번호 찾기</h2>
      <p>가입한 이메일을 입력해주세요. <br /> 비밀번호 재설정 링크를 보내드립니다.</p>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && (
        <div className={styles.successMessage}>
          이메일이 성공적으로 전송되었습니다!
        </div>
      )}

      {!error && (
        <>
          <AuthInput
            label='이메일'
            placeholder='가입한 이메일'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type='submit' className={styles.submitButton} disabled={loading}>
            {loading ? '처리 중...' : '재설정 링크 받기'}
          </button>
        </>
      )}
    </form>
  );
}

export default ForgotPasswordForm;
