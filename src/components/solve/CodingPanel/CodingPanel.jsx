import React, { useState, useEffect } from 'react';
import CodeEditor from '../CodeEditor/CodeEditor';
import AiReviewView from '../AiReviewView/AiReviewView';
import Button from '../../common/Button';
import SubmitIcon from '../../../assets/icons/SubmitIcon.svg';
import ConfirmModal from '../../common/ConfirmModal/ConfirmModal';
import SaveModal from '../../common/SaveModal/SaveModal';
import styles from './CodingPanel.module.css';
import apiClient from '../../../api/apiClient.js';

const extToLang = (fileName = '') => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'java': return 'java';
    case 'py': return 'python';
    case 'js': return 'javascript';
    default: return 'java'; // 기본값
  }
};

function CodingPanel({
  solutionId,
  problemId,
  language,
  onTabChange,
  onSolutionLoaded,
  onTest,
  hasSubmitted = false,
  onAfterSubmit
}) {
  const [tab, setTab] = useState('code');

  // 서버 데이터
  const [fileName, setFileName] = useState('');
  const [code, setCode] = useState('');

  // 에디터 언어
  const [editorLanguage, setEditorLanguage] = useState(language || 'java');

  // UI 상태
  const [loading, setLoading] = useState(false); // GET 로딩
  const [saving, setSaving] = useState(false); // PUT 로딩
  const isBusy = loading || saving;

  // 모달 상태
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveMessage, setSaveMessage] = useState('코드가 저장되었습니다.');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('먼저 코드를 제출해주세요.');

  // 제출
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitLink, setSubmitLink] = useState('');

  // 탭 변경 통지
  useEffect(() => {
    onTabChange?.(tab);
  }, [tab, onTabChange]);

  // 솔루션 상세 조회
  useEffect(() => {
    if (!solutionId) return;
    let alive = true;

    (async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get(`/api/solutions/${solutionId}`);
        if (!alive) return;

        setFileName(data.fileName ?? '');
        setCode(data.code ?? '');

        // 언어 결정
        if (!language) {
          setEditorLanguage(extToLang(data.fileName));
        } else {
          setEditorLanguage(language);
        }

        onSolutionLoaded?.(data);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 404) {
          alert('솔루션을 찾을 수 없습니다. (404)');
        } else {
          console.error('솔루션 상세 조회 실패:', err);
          alert('솔루션을 불러오지 못했습니다.');
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [solutionId, language, onSolutionLoaded]);

  // 에디터 변경/핫세이브
  const handleChange = (next) => setCode(next);

  // 공용 저장 함수 (버튼 저장/핫세이브 공용)
  const saveWith = async (codeToSave, { toast = true } = {}) => {
    if (!solutionId) {
      alert('solutionId가 아직 준비되지 않았습니다.');
      return;
    }
    if (isBusy) return; // 중복 저장 방지
    setSaving(true);
    try {
      const res = await apiClient.put(`/api/solutions/${solutionId}`, {
        code: codeToSave,
        language: editorLanguage,
      });
      if (res.status === 200) {
        if (toast) {
          setSaveMessage('코드가 저장되었습니다.');
          setShowSaveModal(true);
        }
      } else {
        throw new Error(`Unexpected status: ${res.status}`);
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) alert('솔루션을 찾을 수 없습니다. (404)');
      else {
        console.error('코드 저장 실패:', err);
        alert('코드 저장에 실패했습니다.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Ctrl+S 
  const handleHotSave = async (current) => {
    const next = typeof current === 'string' ? current : code;
    if (next !== code) setCode(next);
    await saveWith(next);
  };

  // 초기화
  const handleResetClick = () => setShowResetConfirm(true);
  const cancelReset = () => setShowResetConfirm(false);
  const confirmReset = async () => {
    if (!solutionId) {
      alert('solutionId가 아직 준비되지 않았습니다.');
      return setShowResetConfirm(false);
    }
    setSaving(true);
    try {
      const res = await apiClient.put(`/api/solutions/${solutionId}`, {
        code: '',
        language: editorLanguage,
      });
      if (res.status === 200) {
        setCode('');
        setSaveMessage('코드를 초기화했습니다.');
        setShowSaveModal(true);
      } else {
        throw new Error(`Unexpected status: ${res.status}`);
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) alert('솔루션을 찾을 수 없습니다. (404)');
      else {
        console.error('코드 초기화 실패:', err);
        alert('코드 초기화에 실패했습니다.');
      }
    } finally {
      setSaving(false);
      setShowResetConfirm(false);
    }
  };

  const handleSaveClick = async () => {
    await saveWith(code);
  };

  const closeSaveModal = () => setShowSaveModal(false);
  const afterSaveModalAutoClose = () => setShowSaveModal(false);

  // 테스트
  const handleTest = async () => {
    if (onTest) return onTest(code, editorLanguage, solutionId);
  };

  // 제출
  const normalizeCode = (s = '') => s.replace(/\r\n?/g, '\n');
  const copyToClipboard = async (text) => navigator.clipboard?.writeText?.(text);
  const handleJudge = async () => {
    const normalized = normalizeCode(code);

    // 서버 저장
    await saveWith(normalized, { toast: false });
    try {
      await copyToClipboard(normalized);
    } catch (e) {
      console.warn('클립보드 복사 실패:', e);
    }

    // 제출 링크
    const url = problemId ? `https://www.acmicpc.net/submit/${problemId}` : '';
    setSubmitLink(url);
    setShowSubmitConfirm(true);
  };

  const cancelSubmit = () => setShowSubmitConfirm(false);

  const confirmSubmit = async () => {
    onAfterSubmit?.({ url: submitLink, problemId });
    if (submitLink) {
      window.open(submitLink, '_blank', 'noopener,noreferrer');
    }
    setShowSubmitConfirm(false);
  };


  const isReview = tab === 'review';
  const panelClass = `${styles.panelBase} ${isReview ? styles.panelReview : styles.panelFixed}`;

  return (
    <div className={panelClass}>
      <div className={styles.panelHeader}>
        <div className={styles.tabs} role="tablist" aria-label="코드/AI 코드 리뷰">
          <button
            role="tab"
            aria-selected={tab === 'code'}
            aria-controls="panel-code"
            id="tab-code"
            className={`${styles.tabBtn} ${styles.tabBtnSpacing}`}
            onClick={() => setTab('code')}
          >
            코드
          </button>
          <button
            role="tab"
            aria-selected={tab === 'review'}
            aria-controls="panel-review"
            id="tab-review"
            aria-disabled={!hasSubmitted}
            className={styles.tabBtn}
            onClick={() => {
              if (!hasSubmitted) {
                setReviewMessage('먼저 코드를 제출해주세요.');
                setShowReviewModal(true);
                return;
              }
              setTab('review');
              onTabChange?.('review');
            }}
          >
            AI 코드 리뷰
          </button>
        </div>

        {tab === 'code' && (
          <div className={styles.btns}>
            <Button onClick={handleResetClick} disabled={saving || !solutionId || loading}>
              초기화
            </Button>
            <Button onClick={handleSaveClick} disabled={saving || !solutionId || loading}>
              저장
            </Button>
            <Button onClick={handleTest}>테스트</Button>
            <Button onClick={handleJudge} className={styles.submitBtn}>
              제출
              <img src={SubmitIcon} alt="제출" />
            </Button>
          </div>
        )}
      </div>

      <div className={styles.content}>
        {tab === 'code' ? (
          <section role="tabpanel" aria-labelledby="tab-code" id="panel-code" className={styles.fill}>
            <CodeEditor
              language={editorLanguage}
              value={code}
              onChange={handleChange}
              onHotSave={handleHotSave}
            />
          </section>
        ) : (
          <section role="tabpanel" aria-labelledby="tab-review" id="panel-review" className={styles.fill}>
            <AiReviewView
              solutionId={solutionId}
              active={true}
            />
          </section>
        )}
      </div>

      {/* 초기화 확인 모달 */}
      <ConfirmModal
        open={showResetConfirm}
        lines={['현재 파일의 코드가 모두 삭제됩니다.', '계속하시겠습니까?']}
        onCancel={cancelReset}
        onConfirm={confirmReset}
        onClose={cancelReset}
      />

      {/* 저장/초기화 공용 토스트 모달 */}
      <SaveModal
        open={showSaveModal}
        onClose={closeSaveModal}
        onAfterAutoClose={afterSaveModalAutoClose}
        message={saveMessage}
        duration={1500}
      />

      {/* 제출 유도 토스트 모달 */}
      <SaveModal
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onAfterAutoClose={() => setShowReviewModal(false)}
        message={reviewMessage}
        duration={1500}
      />

      {/* 제출 확인 모달: 복사 안내 + 이동 여부 */}
      <ConfirmModal
        open={showSubmitConfirm}
        lines={['코드를 복사했습니다.', '제출하러 가시겠습니까?']}
        onCancel={cancelSubmit}
        onConfirm={confirmSubmit}
        onClose={cancelSubmit}
      />
    </div>
  );
}

export default CodingPanel;
