import React, { useState } from 'react';
import SolveSidebar from '../../components/solve/SolveSidebar/SolveSidebar';
import CodingPanel from '../../components/solve/CodingPanel/CodingPanel';
import ResultPanel from '../../components/solve/ResultPanel/ResultPanel';
import ProblemPanel from '../../components/problems/ProblemPanel/ProblemPanel';
import styles from './SolvePage.module.css';

function SolvePage() {
  const [codingTab, setCodingTab] = useState('code');

  return (
    <div className={styles.ideLayout}>
      <SolveSidebar />
      <div className={styles.problemContainer}>
        <ProblemPanel />
      </div>
      <div className={styles.solveContainer}>
        <CodingPanel onTabChange={setCodingTab} />
        {codingTab === 'code' ? <ResultPanel /> : null}
      </div>
    </div>
  );
}

export default SolvePage;
