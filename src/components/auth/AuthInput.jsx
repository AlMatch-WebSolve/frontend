import styles from '../../pages/AuthPage/AuthPage.module.css';

function AuthInput({ label, type, placeholder, value, onChange }) {
  return (
    <div className={styles.inputContainer}>
      <label>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export default AuthInput;
