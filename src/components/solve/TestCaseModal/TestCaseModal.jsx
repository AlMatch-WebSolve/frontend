import React, { useState } from 'react';
import styles from './TestCaseModal.module.css';

function TestcaseModal({ onClose }) {
  // 테스트케이스 목록을 상태로 관리
  const [testcases, setTestcases] = useState([
    { id: 1, input: '', output: '' },
  ]);

  // 테스트케이스 추가
  const addTestcase = () => {
    const newId = testcases.length + 1;
    setTestcases([...testcases, { id: newId, input: '', output: '' }]);
  };

  // 테스트케이스 삭제
  const removeTestcase = (idToRemove) => {
    // 1개일 때는 삭제 안 함
    if (testcases.length <= 1) return;
    setTestcases(testcases.filter((tc) => tc.id !== idToRemove));
  };

  return (
    // CSS Modules는 클래스 이름을 styles.kebabCase -> styles.camelCase로 자동 변환
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()} // 모달 클릭 시 닫히지 않게
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>테스트케이스 추가</h2>
          <button className={styles.closeButton} onClick={onClose}>
            &times; {/* 간단한 X 아이콘 */}
          </button>
        </div>

        <div className={styles.modalBody}>
          {testcases.map((tc, index) => (
            <div className={styles.testcaseItem} key={tc.id}>
              <div className={styles.itemHeader}>
                <span className={styles.itemTitle}>테스트 {index + 1}</span>
                <div className={styles.itemButtons}>
                  <button className={styles.iconButton} onClick={addTestcase}>
                    {/* <FaPlus size={12} /> */} +
                  </button>
                  <button
                    className={styles.iconButton}
                    onClick={() => removeTestcase(tc.id)}
                  >
                    {/* <FaMinus size={12} /> */} -
                  </button>
                </div>
              </div>
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
            </div>
          ))}
        </div>

        <div className={styles.modalFooter}>
          <button className={`${styles.button} ${styles.aiButton}`}>
            + AI 테스트케이스 추가
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
