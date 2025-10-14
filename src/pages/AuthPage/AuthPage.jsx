import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import LoginForm from '../../components/auth/LoginForm';
import SignupForm from '../../components/auth/SignupForm';
import styles from './AuthPage.module.css';

function AuthPage() {
  // isLoginView가 true이면 로그인 폼, false이면 회원가입 폼을 보여줍니다.
  const [isLoginView, setIsLoginView] = useState(true);

  // 뷰를 전환하는 함수
  const toggleView = () => {
    setIsLoginView(!isLoginView);
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.logoContainer}>
        <h1 className={styles.logo}>WebSolve</h1>
      </div>
      <div className={styles.authContainer}>
        <div className={styles.formWrapper}>
          {/* isLoginView 값에 따라 적절한 폼을 보여줍니다. */}
          {isLoginView ? <LoginForm /> : <SignupForm />}

          <div className={styles.divider} />
          <div className={styles.toggleLink}>
            {isLoginView ? (
              <span>
                아직 계정이 없나요?{' '}
                <button onClick={toggleView}>회원가입</button>
              </span>
            ) : (
              <span>
                이미 계정이 있나요? <button onClick={toggleView}>로그인</button>
              </span>
            )}
          </div>
          <Link to="/workspace">
            <button className={styles.tempLoginButton}>
              (임시) 로그인 성공
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
