import React from 'react';
import styles from './SubmissionResult.module.css';

function SubmissionResult({ ran = false, url = '', onGoAiReview }) {
  if (!ran) {
    return (
      <div className={styles.submitContainer}>
        <div className={styles.submitInner}>
          제출된 결과가 없습니다.
        </div>
      </div>
    );
  }

  const openBoj = () => {
    if (!url) return;
    window.open(url, '_blank', 'noopener');
  };

  return (
    <div className={styles.submitContainer}>
      <div className={styles.reviewInner}>
        <p className={styles.reviewTitle}>AI 코드 개선점을 제안합니다.</p>
        <p className={styles.reviewDesc}>
          피드백을 확인하고 코드를 다듬어보세요.
        </p>

        <button
          type="button"
          onClick={() => onGoAiReview?.()}
          aria-label="AI 코드 리뷰로 이동"
          className={styles.reviewBtn}
        >
          <span className={styles.reviewLabel}>AI 코드 리뷰 하러가기</span>
        </button>
      </div>
      <div className={styles.submitInner}>
        <p className={styles.submitTitle}>BOJ에 제출이 완료되었습니다.</p>
        <p className={styles.submitDesc}>
          실제 문제 제출 링크로 이동하시려면 아래 버튼을 클릭해주세요.
        </p>

        <button
          type="button"
          onClick={openBoj}
          aria-label="BOJ 제출 페이지로 이동"
          className={styles.submitBtn}
        >
          <span className={styles.submitLabel}>BOJ에 제출하러 가기</span>
        </button>
      </div>
    </div>
  );
}

export default SubmissionResult;
