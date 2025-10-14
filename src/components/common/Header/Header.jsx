import Logo from '../../../assets/images/Logo.svg';
import ChatIcon from '../../../assets/icons/ChatIcon.svg';
import SettingIcon from '../../../assets/icons/SettingIcon.svg';
import styles from '../Header/Header.module.css';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <Link to='/workspace' aria-label='WorkspacePage로 이동'>
          <img src={Logo} alt="로고" />
        </Link>
        <div className={styles.navIcons}>
          <button
            type='button'
            aria-label='채팅 열기'
            className={styles.navBtn}
          >
            <img src={ChatIcon} alt="채팅" />
          </button>
          <button
            type='button'
            aria-label='설정 열기'
            className={styles.navBtn}
          >
            <img src={SettingIcon} alt="설정" />
          </button>
        </div>
      </div>
    </header>
  );
}
export default Header;
