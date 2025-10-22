import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import SolveSidebar from '../../components/solve/SolveSidebar/SolveSidebar';
import CodingPanel from '../../components/solve/CodingPanel/CodingPanel';
import ResultPanel from '../../components/solve/ResultPanel/ResultPanel';
import ProblemPanel from '../../components/problems/ProblemPanel/ProblemPanel';
import styles from './SolvePage.module.css';
import apiClient from '../../api/apiClient';

function SolvePage() {
  const [codingTab, setCodingTab] = useState('code');
  const [resultActiveTab, setResultActiveTab] = useState('test');

  const { problemId } = useParams();
  const location = useLocation();
  const solutionId = location.state?.solutionId ?? null;

  const [problemErr, setProblemErr] = useState(null);
  const [problemLoaded, setProblemLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await apiClient.get(`/api/problems/${problemId}`);
        if (!alive) return;
        setProblemLoaded(true);
      } catch (e) {
        setProblemErr(
          e?.response?.status === 404
            ? '문제를 찾을 수 없습니다. (404)'
            : '문제 조회 실패',
        );
      }
    })();
    return () => {
      alive = false;
    };
  }, [problemId]);

  return (
    <div className={styles.ideLayout}>
      <SolveSidebar />

      <div className={styles.problemContainer}>
        {problemErr ? (
          <div className={styles.errorBox}>{problemErr}</div>
        ) : (
          problemLoaded && <ProblemPanel problemId={Number(problemId)} />
        )}
      </div>

      <div className={styles.solveContainer}>
        <CodingPanel
          onTabChange={setCodingTab}
          solutionId={Number(solutionId)}
          problemId={Number(problemId)}
        />
        {codingTab === 'code' ? (
          <ResultPanel activeTab={resultActiveTab} />
        ) : null}
      </div>
    </div>
  );
}
export default SolvePage;
