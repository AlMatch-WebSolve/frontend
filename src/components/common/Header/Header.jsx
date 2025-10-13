import Logo from '../../../assets/images/Logo.svg';
import ChatIcon from '../../../assets/icons/ChatIcon.svg';
import SettingIcon from '../../../assets/icons/SettingIcon.svg';
import styles from '../Header/Header.module.css';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <Link to='/workspace' aria-label='시작페이지로 이동'>
          <img src={Logo} alt="로고" className={styles.logo} />
        </Link>
        <div className={styles.navIcons}>
          <button
            type='button'
            aria-label='채팅 열기'
            className={styles.navbtn}
          >
            <img src={ChatIcon} alt="채팅" className={styles.chatting} />
          </button>
          <button
            type='button'
            aria-label='설정 열기'
            className={styles.navbtn}
          >
            <img src={SettingIcon} alt="설정" className={styles.setting} />
          </button>
        </div>
      </div>
    </header>
  );
}
export default Header;
