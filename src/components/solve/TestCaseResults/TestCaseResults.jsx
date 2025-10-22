import React from 'react';
import styles from './TestCaseResults.module.css';

function TestCaseResults({ ran = false, tests = [] }) {
  if (!ran) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyText}>테스트 결과가 출력됩니다.</div>
      </div>
    );
  }

  return (
    <div className={styles.resultsWrap}>
      {tests.map((t, i) => (
        <section key={t.id ?? i} className={styles.section}>
          <p className={styles.sectionTitle}>테스트 {i + 1}</p>

          <div className={styles.row}>
            <label className={styles.label}>입력값</label>
            <div className={styles.field}>
              <span className={styles.value}>{t.input ?? ''}</span>
            </div>

            <label className={styles.label}>실행 결과</label>
            <div
              className={`${styles.runResult} ${t.pass ? styles.pass : styles.fail
                }`}
            >
              {t.pass ? '통과!' : '실패!'}
            </div>
          </div>

          <div className={styles.row}>
            <label className={styles.label}>기댓값</label>
            <div className={styles.field}>
              <span className={styles.value}>{t.expected ?? ''}</span>
            </div>

            <label className={styles.label}>출력값</label>
            <div className={styles.field}>
              <span className={styles.value}>{t.output ?? ''}</span>
            </div>
          </div>

          {i !== tests.length - 1 && <hr className={styles.divider} />}
        </section>
      ))}
    </div>
  );
}

export default TestCaseResults;
