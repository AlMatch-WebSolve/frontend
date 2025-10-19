import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import SolveSidebar from '../../components/solve/SolveSidebar';
import CodingPanel from '../../components/solve/CodingPanel/CodingPanel';
import ResultPanel from '../../components/solve/ResultPanel/ResultPanel';
import ProblemPanel from '../../components/problems/ProblemPanel/ProblemPanel';
import styles from './SolvePage.module.css';

function SolvePage() {
  const { problemId } = useParams();
  const [codingTab, setCodingTab] = useState('code');

  const [resultActiveTab, setResultActiveTab] = useState('test');

  return (
    <div className={styles.ideLayout}>
      <SolveSidebar />
      <div className={styles.problemContainer}>
        <ProblemPanel problemId={Number(problemId)} />
      </div>
      <div className={styles.solveContainer}>
        <CodingPanel onTabChange={setCodingTab} />
        {codingTab === 'code' ? (
          <ResultPanel activeTab={resultActiveTab} />
        ) : null}
      </div>
    </div>
  );
}

export default SolvePage;
