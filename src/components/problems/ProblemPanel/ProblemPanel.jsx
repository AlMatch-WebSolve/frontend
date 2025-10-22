import React from 'react';
import ProblemViewer from '../ProblemViewer/ProblemViewer';
import styles from './ProblemPanel.module.css';

function ProblemPanel({ problem, problemId }) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <p className={styles.panelTitle}>문제</p>
      </div>
      <div className={styles.content}>
        <section className={styles.fill}>
          <ProblemViewer problem={problem} problemId={problemId} />
        </section>
      </div>
    </div>
  );
}

export default ProblemPanel;
