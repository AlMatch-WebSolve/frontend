import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import SolveSidebar from '../../components/solve/SolveSidebar/SolveSidebar';
import CodingPanel from '../../components/solve/CodingPanel/CodingPanel';
import ResultPanel from '../../components/solve/ResultPanel/ResultPanel';
import ProblemPanel from '../../components/problems/ProblemPanel/ProblemPanel';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
import styles from './SolvePage.module.css';
import apiClient from '../../api/apiClient';

function SolvePage() {
  const { solutionId } = useParams();
  const numericSolutionId = useMemo(() => Number(solutionId), [solutionId]);

  const [codingTab, setCodingTab] = useState('code');
  const [submitRan, setSubmitRan] = useState(false);
  const [submitResult, setSubmitResult] = useState({ url: '' });
  const [resultActiveTab, setResultActiveTab] = useState('test');
  const [showSubmitFirst, setShowSubmitFirst] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [solution, setSolution] = useState(null);

  const problemId = useMemo(
    () => (solution?.problemInfo?.id != null ? Number(solution.problemInfo.id) : null),
    [solution]
  );

  useEffect(() => {
    if (!Number.isFinite(numericSolutionId)) {
      setSolution(null);
      setErr('유효하지 않은 솔루션 ID입니다.');
      return;
    }

    let alive = true;
    setLoading(true);
    setErr(null);
    setSolution(null);
    setSubmitRan(false);
    setSubmitResult({ url: '' });
    setResultActiveTab('test');

    (async () => {
      try {
        const res = await apiClient.get(`/api/solutions/${numericSolutionId}`);
        if (!alive) return;
        setSolution(res.data || null);
      } catch (e) {
        if (!alive) return;
        const status = e?.response?.status;
        setErr(status === 404 ? '솔루션을 찾을 수 없습니다. (404)' : '솔루션 조회 실패');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [numericSolutionId]);

  const handleAfterSubmit = ({ url }) => {
    setSubmitRan(true);
    setSubmitResult({ url });
    setResultActiveTab('submit');
  };

  return (
    <div className={styles.ideLayout}>
      <SolveSidebar />

      <div className={styles.problemContainer}>
        {loading ? (
          <div className={styles.infoBox}>솔루션 불러오는 중…</div>
        ) : err ? (
          <div className={styles.errorBox}>{err}</div>
        ) : solution?.problemInfo ? (
          <ProblemPanel
            problem={solution.problemInfo}
            problemId={problemId ?? undefined}
          />
        ) : (
          <div className={styles.infoBox}>문제 정보를 확인 중입니다…</div>
        )}
      </div>

      <div className={styles.solveContainer}>
        <CodingPanel
          onTabChange={setCodingTab}
          solutionId={numericSolutionId}
          problemId={problemId ?? undefined}
          initialCode={solution?.code}
          fileName={solution?.fileName}
          onAfterSubmit={handleAfterSubmit}
          hasSubmitted={submitRan}
          onRequireSubmit={() => setShowSubmitFirst(true)}
        />
        {codingTab === 'code' ? (
          <ResultPanel
            submitRan={submitRan}
            submitResult={submitResult}
            activeTab={resultActiveTab}
            onGoAiReview={() => setCodingTab('review')}
          />
        ) : null}
      </div>

      <ConfirmModal
        open={showSubmitFirst}
        lines={['AI 코드 리뷰를 보려면 먼저 코드를 제출해 주세요.']}
        onCancel={() => setShowSubmitFirst(false)}
        onConfirm={() => setShowSubmitFirst(false)}
        onClose={() => setShowSubmitFirst(false)}
      />
    </div>
  );
}

export default SolvePage;
