import AuthInput from './AuthInput';
import styles from '../../pages/AuthPage/AuthPage.module.css';

function LoginForm() {
  return (
    <form className={styles.form}>
      <h2>로그인</h2>
      <AuthInput placeholder="이메일" type="email" />
      <AuthInput placeholder="비밀번호" type="password" />
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
