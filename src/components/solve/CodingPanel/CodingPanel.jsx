import React, { useState, useEffect } from 'react';
import CodeEditor from '../CodeEditor/CodeEditor';
import AiReviewView from '../AiReviewView';
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

function CodingPanel({ solutionId, language, onTabChange, onSolutionLoaded }) {
  const [tab, setTab] = useState('code');

  // 서버 데이터
  const [fileName, setFileName] = useState('');
  const [code, setCode] = useState('');

  // 에디터 언어(우선순위: props.language > fileName 추론 > 'java')
  const [editorLanguage, setEditorLanguage] = useState(language || 'java');

  // UI 상태
  const [loading, setLoading] = useState(false); // GET 로딩
  const [saving, setSaving] = useState(false); // PUT 로딩

  // 모달 상태
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveMessage, setSaveMessage] = useState('코드가 저장되었습니다.');

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

        // 예시 응답: { solutionId, fileName, code, problemInfo: {...} }
        setFileName(data.fileName ?? '');
        setCode(data.code ?? '');

        // 언어 결정: props.language가 없으면 파일 확장자로 추론
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
  const handleHotSave = () => {
    // 필요 시 연결(현재는 의도적으로 비워둠)
    // handleSaveClick();
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

  // 저장
  const handleSaveClick = async () => {
    if (!solutionId) return alert('solutionId가 아직 준비되지 않았습니다.');
    setSaving(true);
    try {
      const res = await apiClient.put(`/api/solutions/${solutionId}`, {
        code,
        language: editorLanguage,
      });
      if (res.status === 200) {
        setSaveMessage('코드가 저장되었습니다.');
        setShowSaveModal(true);
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

  const closeSaveModal = () => setShowSaveModal(false);
  const afterSaveModalAutoClose = () => setShowSaveModal(false);

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
            className={styles.tabBtn}
            onClick={() => setTab('review')}
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

            {/* 연결 제거된 버튼들 (요구사항) */}
            <Button disabled>테스트</Button>
            <Button className={styles.submitBtn} disabled>
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
              language={editorLanguage} // 자동 추론 or 외부 지정
              value={code}
              onChange={handleChange}
              onHotSave={handleHotSave}
            />
          </section>
        ) : (
          <section role="tabpanel" aria-labelledby="tab-review" id="panel-review" className={styles.fill}>
            <AiReviewView />
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

      {/* 저장/초기화 공용 토스트 */}
      <SaveModal
        open={showSaveModal}
        onClose={closeSaveModal}
        onAfterAutoClose={afterSaveModalAutoClose}
        message={saveMessage}
        duration={1000}
      />
    </div>
  );
}

export default CodingPanel;
