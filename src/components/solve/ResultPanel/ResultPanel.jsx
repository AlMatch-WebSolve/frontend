import React, { useState } from 'react';
import TestCaseResults from '../TestCaseResults/TestCaseResults';
import SubmissionResult from '../SubmissinResult/SubmissionResult';
import styles from './ResultPanel.module.css';

function ResultPanel() {
  const [tab, setTab] = useState('test');

  return (
    <div className={styles.panel}>
      <div
        className={styles.tabs}
        role='tablist'
        aria-label='테스트 결과/제출 결과'
      >
        <button
          role='tab'
          aria-selected={tab === 'test'}
          aria-controls='panel-test'
          id='tab-test'
          className={styles.tabBtn}
          onClick={() => setTab('test')}
        >
          테스트 결과
        </button>
        <button
          role='tab'
          aria-selected={tab === 'submit'}
          aria-controls='panel-submit'
          id='tab-submit'
          className={styles.tabBtn}
          onClick={() => setTab('submit')}
        >
          제출 결과
        </button>
      </div>

      <div className={styles.content}>
        {tab === 'test' ? (
          <section
            role='tabpanel'
            aria-labelledby='tab-test'
            id='panel-test'
            className={styles.fill}
          >
            <TestCaseResults />
          </section>
        ) : (
          <section
            role='tabpanel'
            aria-labelledby='tab-submit'
            id='panel-submit'
            className={styles.fill}
          >
            <SubmissionResult />
          </section>
        )}
      </div>
    </div>
  );
}

export default ResultPanel;
