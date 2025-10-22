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
  const bodyRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const normalize = (s = '') => s.replace(/\r\n?/g, '\n').replace(/(?:[^\n])$/, '$&\n');
  const displayNormalize = (s = '') => s.replace(/\r\n?/g, '\n').replace(/\n$/, '');

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTo({
        top: bodyRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [testcases]);

  // ESC로 닫히지 않도록(생성 중에는 완전 차단)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (isAiLoading && (e.key === 'Escape' || e.keyCode === 27)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [isAiLoading]);

  useEffect(() => {
    if (!solutionId) return;
    let alive = true;
    (async () => {
      setIsLoading(true);
      try {
        const { data } = await apiClient.get(
          `/api/solutions/${solutionId}/testcases`
        );
        if (!alive) return;
        let normalIdx = 1;
        let aiIdx = 1;
        const mapped = (Array.isArray(data) ? data : []).map((tc) => {
          const isAi = String(tc?.type || '').toUpperCase() === 'AI_GENERATED';
          const name = isAi ? `AI 테스트 ${aiIdx++}` : `테스트 ${normalIdx++}`;
          return {
            id: 0, // 아래서 다시 부여
            input: displayNormalize(tc?.input ?? ''),
            output: displayNormalize(tc?.output ?? ''),
            name,
          };
        });
        const finalList = mapped.map((tc, i) => ({ ...tc, id: i + 1 }));
        setTestcases(finalList.length
          ? finalList
          : [{ id: 1, input: '', output: '', name: '테스트 1' }]);
      } catch (err) {
        const status = err?.response?.status;
        console.error('[TC LOAD] 실패:', status, err?.response?.data);
        if (status === 404) {
          alert('존재하지 않는 솔루션이거나 권한이 없습니다. (404)');
          onClose?.();
        } else {
          // 실패해도 입력은 가능하게 기본 1개 유지
          setTestcases([{ id: 1, input: '', output: '', name: '테스트 1' }]);
        }
      } finally {
        if (alive) setIsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [solutionId, onClose]);

  // 일반 테스트케이스 추가
  const addTestcase = () => {
    const newId = testcases.length + 1;
    setTestcases([
      ...testcases,
      { id: newId, input: '', output: '', name: `테스트 ${newId}` },
    ]);
  };

  // AI 테스트케이스 생성
  const handleGenerateAi = async () => {
    if (!solutionId || isAiLoading) return; // 디바운스: 응답 올 때까지 재클릭 방지
    setIsAiLoading(true);
    try {
      const { data } = await apiClient.post('/api/ai/testcases', {
        solutionId: Number(solutionId),
        count: 1,
      });
      // data 예시: [{ input, output, description }]
      const aiCount = testcases.filter(tc => tc.name.startsWith('AI 테스트')).length;
      const baseLen = testcases.length;
      const appended = (Array.isArray(data) ? data : []).map((tc, idx) => ({
        id: baseLen + idx + 1,
        input: displayNormalize(tc?.input ?? ''),
        output: displayNormalize(tc?.output ?? ''),
        name: `AI 테스트 ${aiCount + idx + 1}`,
      }));
      setTestcases(prev => [...prev, ...appended]);
    } catch (err) {
      const status = err?.response?.status;
      console.error('[AI TC CREATE] 실패:', status, err?.response?.data);
      alert('AI 테스트케이스 생성 중 오류가 발생했습니다.');
    } finally {
      setIsAiLoading(false);
    }
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
    if (!solutionId) {
      alert('solutionId가 없습니다.');
      return;
    }

    const payload = testcases.map(({ input, output }) => ({
      input: normalize(input),
      output: normalize(output),
    }))
      .filter(t => t.input.trim() !== '' && t.output.trim() !== '');

    if (payload.length === 0) {
      alert('최소 1개 이상의 입력 또는 출력이 필요합니다.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await apiClient.post(
        `/api/solutions/${solutionId}/testcases`,
        payload,
      );
      if (res.status !== 201) {
        throw new Error(`Unexpected status: ${res.status}`);
      }
      onClose(); // 저장 후 닫기
    } catch (error) {
      const status = error?.response?.status;
      if (status === 404) alert('존재하지 않는 솔루션입니다. (404)');
      else alert('테스트케이스 저장 중 오류가 발생했습니다.');
      console.log(error);
    } finally {
      setIsSaving(false);
    }
  };

  // 닫기 가드: AI 생성 중에는 닫히지 않도록
  const handleRequestClose = () => {
    if (isAiLoading) return;
    onClose?.();
  };

  return (
    <div className={styles.modalOverlay} onClick={handleRequestClose}>
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <p className={styles.modalTitle}>테스트케이스 추가</p>
          <button className={styles.closeButton} onClick={handleRequestClose}>
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
                    value={tc.output}
                    onChange={(e) =>
                      handleChange(tc.id, 'output', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className={styles.ioDivider}></div>

              <div className={styles.itemButtons}>
                <button className={styles.iconButton} onClick={addTestcase} disabled={isAiLoading || isSaving || isLoading}>
                  <img src={PlusIcon} alt='추가' />
                </button>
                <button
                  className={styles.iconButton}
                  onClick={() => removeTestcase(tc.id)}
                  disabled={isAiLoading || isSaving || isLoading}
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
            onClick={handleGenerateAi}
            disabled={isAiLoading || isSaving || isLoading}
          >
            <img src={AiPlusIcon} alt='추가' /> <p>AI 테스트케이스 추가</p>
          </button>
          <button
            className={`${styles.button} ${styles.saveButton}`}
            onClick={handleSave}
            disabled={isSaving || isAiLoading}
          >
            저장
          </button>
        </div>

        {/* AI 생성 중 차단 오버레이 */}
        {isAiLoading && (
          <div className={styles.blockingBackdrop} role="dialog" aria-modal="true" aria-labelledby="ai-blocking-title">
            <div className={styles.blockingBox}>
              <div id="ai-blocking-title" className={styles.blockingTitle}>테스트케이스 생성 중…</div>
              <div className={styles.blockingSpinner} aria-hidden="true" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TestcaseModal;
