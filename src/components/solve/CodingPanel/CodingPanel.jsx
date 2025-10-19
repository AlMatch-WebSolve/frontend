import React, { useState, useEffect } from 'react';
import CodeEditor from '../CodeEditor';
import AiReviewView from '../AiReviewView';
import styles from './CodingPanel.module.css';

function CodingPanel({ onTabChange }) {
  const [tab, setTab] = useState('code');

  useEffect(() => {
    onTabChange?.(tab);
  }, [tab, onTabChange]);

  const isReview = tab === 'review';
  const panelClass = `${styles.panelBase} ${isReview ? styles.panelReview : styles.panelFixed}`;

  return (
    <div className={panelClass}>
      <div
        className={styles.tabs}
        role='tablist'
        aria-label='코드/AI 코드 리뷰'
      >
        <button
          role='tab'
          aria-selected={tab === 'code'}
          aria-controls='panel-code'
          id='tab-code'
          className={`${styles.tabBtn} ${styles.tabBtnSpacing}`}
          onClick={() => setTab('code')}
        >
          코드
        </button>
        <button
          role='tab'
          aria-selected={tab === 'review'}
          aria-controls='panel-review'
          id='tab-review'
          className={styles.tabBtn}
          onClick={() => setTab('review')}
        >
          AI 코드 리뷰
        </button>
      </div>

      <div className={styles.content}>
        {tab === 'code' ? (
          <section
            role='tabpanel'
            aria-labelledby='tab-code'
            id='panel-code'
            className={styles.fill}
          >
            <CodeEditor />
          </section>
        ) : (
          <section
            role='tabpanel'
            aria-labelledby='tab-review'
            id='panel-review'
            className={styles.fill}
          >
            <AiReviewView />
          </section>
        )}
      </div>
    </div>
  );
}

export default CodingPanel;
