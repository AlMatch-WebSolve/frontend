import React, { useState, useEffect } from 'react';
import TestCaseResults from '../TestCaseResults/TestCaseResults';
import SubmissionResult from '../SubmissionResult/SubmissionResult';
import Button from '../../common/Button';
import styles from './ResultPanel.module.css';

function ResultPanel({
  ran = false,
  tests = [],
  submitRan = false,
  submitResult = {},
  activeTab = 'test',
  onOpenTestCaseModal = () => { }
}) {
  const [tab, setTab] = useState('test');

  useEffect(() => {
    if (activeTab === 'test' || activeTab === 'submit') setTab(activeTab);
  }, [activeTab]);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div className={styles.tabs} role="tablist" aria-label="테스트 결과/제출 결과">
          <button
            role='tab'
            aria-selected={tab === 'test'}
            aria-controls="panel-test"
            id="tab-test"
            className={styles.tabBtn}
            onClick={() => setTab('test')}
          >
            테스트 결과
          </button>
          <button
            role='tab'
            aria-selected={tab === 'submit'}
            aria-controls="panel-submit"
            id="tab-submit"
            className={styles.tabBtn}
            onClick={() => setTab('submit')}
          >
            제출 결과
          </button>
        </div>
        <div className={styles.testcaseBtn}>
          <Button onClick={onOpenTestCaseModal}>테스트케이스 추가</Button>
        </div>
      </div>

      <div className={styles.content}>
        {tab === 'test' ? (
          <section role="tabpanel" aria-labelledby="tab-test" id="panel-test" className={styles.fill}>
            <TestCaseResults ran={ran} tests={tests} />
          </section>
        ) : (
          <section role="tabpanel" aria-labelledby="tab-submit" id="panel-submit" className={styles.fill}>
            <SubmissionResult
              ran={submitRan}
              url={submitResult?.url}
            />
          </section>
        )}
      </div>
    </div>
  )
}

export default ResultPanel
