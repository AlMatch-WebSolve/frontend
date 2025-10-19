import React, { useState } from 'react';
import SolveSidebar from '../../components/solve/SolveSidebar';
import CodingPanel from '../../components/solve/CodingPanel/CodingPanel';
import ResultPanel from '../../components/solve/ResultPanel/ResultPanel';
import ProblemPanel from '../../components/problems/ProblemPanel/ProblemPanel';
import styles from './SolvePage.module.css';
import TestCaseModal from '../../components/solve/TestCaseModal/TestCaseModal';

function SolvePage() {
  const [codingTab, setCodingTab] = useState('code');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openTestCaseModal = () => setIsModalOpen(true);
  const closeTestCaseModal = () => setIsModalOpen(false);

  return (
    <div className={styles.ideLayout}>
      <SolveSidebar />
      <div className={styles.problemContainer}>
        <ProblemPanel />
      </div>
      <div className={styles.solveContainer}>
        <button
          onClick={openTestCaseModal}
          style={{ margin: '10px', padding: '5px 10px', width: '150px' }}
        >
          테스트케이스 모달 열기 (임시)
        </button>
        <CodingPanel onTabChange={setCodingTab} />
        {codingTab === 'code' ? <ResultPanel /> : null}

        {isModalOpen && (
          <>
            <TestCaseModal onClose={closeTestCaseModal} />
          </>
        )}
      </div>
    </div>
  );
}

export default SolvePage;
