import React, { useState } from 'react';
import TestCaseResults from './TestCaseResults';
import SubmissionResult from './SubmissionResult';
import styles from './ResultPanel.module.css';

function ResultPanel() {
  const [tab, setTab] = useState('test');

  return (
    <div className={styles.panel}>
      <div className={styles.tabs} role="tablist" aria-label="코드/AI 코드 리뷰">
        <button
          role='tab'
          aria-selected={tab === 'test'}
          aria-controls="panelTest"
          id="tabTest"
          onClick={() => setTab('test')}
          className={styles.tabBtn}
        >
          테스트 결과
        </button>
        <button
          role='tab'
          aria-selected={tab === 'submit'}
          aria-controls="panelSubmit"
          id="tabSubmit"
          onClick={() => setTab('submit')}
          className={styles.tabBtn}
        >
          제출 결과
        </button>
      </div>

      <div className={styles.content}>
        {tab === 'test' ? (
          <section
            id="panelTest"
            role="tabpanel"
            aria-labelledby="tabTest"
            className={styles.fill}
          >
            <TestCaseResults />
          </section>
        ) : (
          <section
            id="panelSubmit"
            role="tabpanel"
            aria-labelledby="tabSubmit"
            className={styles.fill}
          >
            <SubmissionResult />
          </section>
        )}
      </div>
    </div>
  )
}

export default ResultPanel
