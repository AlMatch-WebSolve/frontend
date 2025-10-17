import React, { useState } from 'react';
import SubmissionHistory from '../SubmissionHistory';
import ProblemViewer from '../ProblemViewer';
import styles from './ProblemPanel.module.css';

function ProblemPanel() {
  const [tab, setTab] = useState('problem');

  return (
    <div className={styles.panel}>
      <div className={styles.tabs} role='tablist' aria-label='문제/제출 내역'>
        <button
          role='tab'
          aria-selected={tab === 'problem'}
          aria-controls='panel-problem'
          id='tab-problem'
          className={`${styles.tabBtn} ${styles.tabBtnSpacing}`}
          onClick={() => setTab('problem')}
        >
          문제
        </button>
        <button
          role='tab'
          aria-selected={tab === 'history'}
          aria-controls='panel-history'
          id='tab-history'
          className={styles.tabBtn}
          onClick={() => setTab('history')}
        >
          제출 내역
        </button>
      </div>

      <div className={styles.content}>
        {tab === 'problem' ? (
          <section
            role='tabpanel'
            aria-labelledby='tab-problem'
            id='panel-problem'
            className={styles.fill}
          >
            <ProblemViewer />
          </section>
        ) : (
          <section
            role='tabpanel'
            aria-labelledby='tab-history'
            id='panel-history'
            className={styles.fill}
          >
            <SubmissionHistory />
          </section>
        )}
      </div>
    </div>
  );
}

export default ProblemPanel;
