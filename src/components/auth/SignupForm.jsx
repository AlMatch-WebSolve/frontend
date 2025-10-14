import AuthInput from './AuthInput';
import styles from '../../pages/AuthPage/AuthPage.module.css';

function SignupForm() {
  return (
    <form className={styles.form}>
      <h2>회원가입</h2>
      <AuthInput label="닉네임" type="text" />
      <AuthInput label="이메일" type="email" />
      <AuthInput label="비밀번호" type="password" />
      <AuthInput label="비밀번호 확인" type="password" />
      <button type="submit" className={styles.submitButton}>
        회원가입하기
      </button>
    </form>
  );
}

export default SignupForm;