import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import ResetPasswordForm from '../../components/auth/ResetPasswordForm';
import styles from './ResetPasswordPage.module.css';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isValidToken, setIsValidToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = searchParams.get('token');

  useEffect(() => {
    // 토큰이 없으면 로그인 페이지로 리디렉션
    if (!token) {
      alert('유효한 토큰이 없습니다.');
      navigate('/auth');
      return;
    }

    // TODO: 백엔드에서 토큰 유효성 검증 API 호출
    // 현재는 토큰이 존재하면 유효하다고 가정
    setIsValidToken(true);
    setLoading(false);
  }, [token, navigate]);

  if (loading) {
    return (
      <div className={styles.resetPasswordPage}>
        <div className={styles.logoContainer}>
          <h1 className={styles.logo}>WebSolve</h1>
        </div>
        <div className={styles.resetPasswordContainer}>
          <div className={styles.formWrapper}>
            <p>로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className={styles.resetPasswordPage}>
        <div className={styles.logoContainer}>
          <h1 className={styles.logo}>WebSolve</h1>
        </div>
        <div className={styles.resetPasswordContainer}>
          <div className={styles.formWrapper}>
            <h2>유효하지 않은 토큰</h2>
            <p>비밀번호 재설정 토큰이 유효하지 않거나 만료되었습니다.</p>
            <Link to='/auth' className={styles.backLink}>
              로그인 페이지로 이동
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.resetPasswordPage}>
      <div className={styles.logoContainer}>
        <h1 className={styles.logo}>WebSolve</h1>
      </div>
      <div className={styles.resetPasswordContainer}>
        <div className={styles.formWrapper}>
          <ResetPasswordForm token={token} />

          <div className={styles.divider} />
          <div className={styles.toggleLink}>
            <span>
              이미 비밀번호를 기억하시나요?{' '}
              <Link to='/auth' className={styles.toggleButton}>
                로그인하기
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;