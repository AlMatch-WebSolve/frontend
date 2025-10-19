import React, { useState } from 'react';
import styles from './TestCaseModal.module.css';
import CloseIcon from '../../../assets/icons/CloseIcon.svg';
import PlusIcon from '../../../assets/icons/PlusIcon.svg';
import MinusIcon from '../../../assets/icons/MinusIcon.svg';
import AiPlusIcon from '../../../assets/icons/AiPlusIcon.svg';

function TestcaseModal({ onClose }) {
  // 테스트케이스 목록을 상태로 관리
  const [testcases, setTestcases] = useState([
    { id: 1, input: '', output: '', name: '테스트 1' },
  ]);

  // 일반 테스트케이스 추가
  const addTestcase = () => {
    const newId = testcases.length + 1;
    setTestcases([
      ...testcases,
      { id: newId, input: '', output: '', name: `테스트 ${newId}` },
    ]);
  };

  // AI 테스트케이스 추가
  const addAiTestcase = () => {
    const aiCount = testcases.filter((tc) =>
      tc.name.startsWith('AI 테스트'),
    ).length;
    const newId = testcases.length + 1;
    setTestcases([
      ...testcases,
      { id: newId, input: '', output: '', name: `AI 테스트 ${aiCount + 1}` },
    ]);
  };

  // 테스트케이스 삭제 (1개 남으면 삭제 안됨)
  const removeTestcase = (idToRemove) => {
    if (testcases.length <= 1) return; // 최소 1개 유지
    setTestcases(testcases.filter((tc) => tc.id !== idToRemove));
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>테스트케이스 추가</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <img src={CloseIcon} alt='닫기' />
          </button>
        </div>

        <div className={styles.headerDivider}></div>

        <div className={styles.modalBody}>
          {testcases.map((tc, index) => (
            <div className={styles.testcaseItem} key={tc.id}>
              <span className={styles.itemTitle}>{tc.name}</span>
              <div className={styles.ioContainer}>
                <div className={styles.ioGroup}>
                  <label className={styles.ioLabel}>입력</label>
                  <textarea className={styles.ioTextarea} />
                </div>

                <div className={styles.ioGroup}>
                  <label className={styles.ioLabel}>출력</label>
                  <textarea className={styles.ioTextarea} />
                </div>
              </div>

              <div className={styles.ioDivider}></div>

              <div className={styles.itemButtons}>
                <button className={styles.iconButton} onClick={addTestcase}>
                  <img src={PlusIcon} alt='추가' />
                </button>
                <button
                  className={styles.iconButton}
                  onClick={() => removeTestcase(tc.id)}
                >
                  <img src={MinusIcon} alt='삭제' />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.modalFooter}>
          <button
            className={`${styles.button} ${styles.aiButton}`}
            onClick={addAiTestcase}
          >
            <img src={AiPlusIcon} alt='추가'></img> AI 테스트케이스 추가
          </button>
          <button className={`${styles.button} ${styles.saveButton}`}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestcaseModal;
