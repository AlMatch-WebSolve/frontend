import { Link } from 'react-router-dom';
import styles from './LandingPage.module.css';
import NextIcon from '../../assets/icons/NextIcon.svg';

function LandingPage() {
  return (
    <div className={styles.landingContainer}>
      {/* 메인 슬로건 */}
      <h1 className={styles.slogan}>
        AI와 함께하는 가장 스마트한 알고리즘 학습
      </h1>

      {/* '/auth' 경로로 이동하는 버튼 */}
      <Link to="/auth" className={styles.ctaButton}>
        <span className={styles.buttonLabel}>시작하기</span>
        <img src={NextIcon} alt="다음으로" className={styles.buttonIcon} />
      </Link>
    </div>
  );
}

export default LandingPage;
