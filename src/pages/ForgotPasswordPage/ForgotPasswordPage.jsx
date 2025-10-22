import { Link } from 'react-router-dom';
import React from 'react';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
import styles from './ForgotPasswordPage.module.css';

function ForgotPasswordPage() {
  return (
    <div className={styles.forgotPasswordPage}>
      <div className={styles.logoContainer}>
        <h1 className={styles.logo}>WebSolve</h1>
      </div>
      <div className={styles.forgotPasswordContainer}>
        <div className={styles.formWrapper}>
          <ForgotPasswordForm />

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

export default ForgotPasswordPage;
