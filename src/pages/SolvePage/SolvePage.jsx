import React, { useState } from 'react';
import SolveSidebar from '../../components/solve/SolveSidebar';
import CodingPanel from '../../components/solve/CodingPanel';
import ResultPanel from '../../components/solve/ResultPanel';
import ProblemPanel from '../../components/problems/ProblemPanel';

function SolvePage() {
  const [codingTab, setCodingTab] = useState('code');

  return (
    <div className='ide' style={{ display: 'flex' }}>
      <SolveSidebar />
      <div className='problemPanel'>
        <ProblemPanel />
      </div>
      <div className="idePanel" style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <CodingPanel onTabChange={setCodingTab} />
        {codingTab === 'code' ? (
          <ResultPanel />
        ) : null}
      </div>
    </div>
  );
}

export default SolvePage;
