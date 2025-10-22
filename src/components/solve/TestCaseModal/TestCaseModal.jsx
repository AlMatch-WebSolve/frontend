import React, { useState, useRef, useEffect } from 'react';
import styles from './TestCaseModal.module.css';
import CloseIcon from '../../../assets/icons/CloseIcon.svg';
import PlusIcon from '../../../assets/icons/PlusIcon.svg';
import MinusIcon from '../../../assets/icons/MinusIcon.svg';
import AiPlusIcon from '../../../assets/icons/AiPlusIcon.svg';
import apiClient from '../../../api/apiClient';

function TestcaseModal({ onClose, solutionId }) {
  // 테스트케이스 목록을 상태로 관리
  const [testcases, setTestcases] = useState([
    { id: 1, input: '', output: '', name: '테스트 1' },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTo({
        top: bodyRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [testcases]);

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

    // 1. 삭제 후 남은 리스트
    const updated = testcases.filter((tc) => tc.id !== idToRemove);

    // 2. 일반 테스트와 AI 테스트 각각 이름만 재정렬
    let normalIndex = 1;
    let aiIndex = 1;

    const reordered = updated.map((tc) => {
      if (tc.name.startsWith('AI 테스트')) {
        return { ...tc, name: `AI 테스트 ${aiIndex++}` };
      } else {
        return { ...tc, name: `테스트 ${normalIndex++}` };
      }
    });

    // 3. ID도 배열 순서대로 다시 매기기
    const finalList = reordered.map((tc, i) => ({ ...tc, id: i + 1 }));
    setTestcases(finalList);
  };

  // 입력/출력 변경 핸들러
  const handleChange = (id, field, value) => {
    setTestcases((prev) =>
      prev.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc)),
    );
  };

  // 저장 핸들러 (POST 요청)
  const handleSave = async () => {
    try {
      setIsSaving(true);

      const payload = testcases.map(({ input, output }) => ({
        input,
        output,
      }));

      // const res = await apiClient.post(
      //   `/api/solutions/${solutionId}/testcases`,
      //   payload,
      // );

      // ${solutionId}
      const res = await fetch(`/api/solutions/2741/testcases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      console.log('✅ 저장 성공:', res.data);

      onClose(); // 저장 후 닫기
    } catch (error) {
      console.error('❌ 저장 실패:', error);
      alert('테스트케이스 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <p className={styles.modalTitle}>테스트케이스 추가</p>
          <button className={styles.closeButton} onClick={onClose}>
            <img src={CloseIcon} alt='닫기' />
          </button>
        </div>

        <div className={styles.modalBody} ref={bodyRef}>
          {testcases.map((tc) => (
            <div className={styles.testcaseItem} key={tc.id}>
              <span className={styles.itemTitle}>{tc.name}</span>
              <div className={styles.ioContainer}>
                <div className={styles.ioGroup}>
                  <label className={styles.ioLabel}>입력</label>
                  <textarea
                    className={styles.ioTextarea}
                    value={tc.input}
                    onChange={(e) =>
                      handleChange(tc.id, 'input', e.target.value)
                    }
                  />
                </div>

                <div className={styles.ioGroup}>
                  <label className={styles.ioLabel}>출력</label>
                  <textarea
                    className={styles.ioTextarea}
                    value={tc.input}
                    onChange={(e) =>
                      handleChange(tc.id, 'input', e.target.value)
                    }
                  />
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
            <img src={AiPlusIcon} alt='추가'></img> <p>AI 테스트케이스 추가</p>
          </button>
          <button
            className={`${styles.button} ${styles.saveButton}`}
            onClick={handleSave}
            disabled={isSaving}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestcaseModal;
