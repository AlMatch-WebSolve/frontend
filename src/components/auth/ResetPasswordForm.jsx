import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthInput from './AuthInput';
import styles from '../../pages/ResetPasswordPage/ResetPasswordPage.module.css';
import apiClient from '../../api/apiClient';

function ResetPasswordForm({ token }) {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    // 유효성 검사
    if (!newPassword || !confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return false;
    }

    if (newPassword.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
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
      // API 호출: 비밀번호 재설정
      await apiClient.post('/api/auth/password/reset', {
        token: token,
        newPassword: newPassword,
      });

      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');

      // 2초 후 로그인 페이지로 이동
      setTimeout(() => {
        alert('비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다.');
        navigate('/auth');
      }, 2000);
    } catch (err) {
      setLoading(false);

      // 토큰 만료 또는 유효하지 않은 경우
      if (err.response?.status === 400) {
        const message = err.response?.data?.message;
        if (message?.includes('토큰') || message?.includes('INVALID_TOKEN')) {
          setError(
            '토큰이 만료되었거나 유효하지 않습니다. 비밀번호 재설정을 다시 요청해주세요.'
          );
          // 선택사항: 3초 후 비밀번호 재설정 요청 페이지로 이동
          setTimeout(() => {
            // navigate('/forgot-password'); // 비밀번호 재설정 요청 페이지로 이동 (필요시)
          }, 3000);
          return;
        }
      }

      // 기타 에러 메시지
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        '비밀번호 재설정에 실패했습니다. 다시 시도해주세요.';
      setError(errorMessage);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>비밀번호 재설정</h2>

      {error && (
        <div className={styles.errorContainer}>
          <div className={styles.errorMessage}>{error}</div>
          <Link to='/' className={styles.errorGoHomeButton}>
            메인 페이지로 가기
          </Link>
        </div>
      )}
      {success && (
        <div className={styles.successMessage}>
          비밀번호가 성공적으로 변경되었습니다!
        </div>
      )}

      {!error && (
        <>
          <AuthInput
            label='새 비밀번호'
            placeholder='새 비밀번호'
            type='password'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <AuthInput
            label='비밀번호 확인'
            placeholder='비밀번호 확인'
            type='password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button type='submit' className={styles.submitButton} disabled={loading}>
            {loading ? '처리 중...' : '비밀번호 변경'}
          </button>
        </>
      )}
    </form>
  );
}

export default ResetPasswordForm;
