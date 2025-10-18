import { Link } from 'react-router-dom';
import styles from './LandingPage.module.css';
import NextIcon from '../../assets/icons/NextIcon.svg';

function LandingPage() {
  return (
    <div className={styles.landingContainer}>
      {/* 메인 슬로건 */}
      <h1 className={styles.slogan}>
        AI와 함께하는 제일 스마트한 알고리즘 학습
      </h1>

      {/* '/test' 경로로 이동하는 버튼 */}
      <Link to='/test' className={styles.ctaButton}>
        <span className={styles.buttonLabel}>채팅 소켓</span>
        
      </Link>

    </div>
  );
}

export default LandingPage;
