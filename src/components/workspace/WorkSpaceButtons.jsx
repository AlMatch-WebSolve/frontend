import React from 'react';
import styles from './WorkSpaceButtons.module.css';

// 컴포넌트명 수정
const WorkSpaceButtons = ({ onNewFolder, onNewProblem }) => {
  return (
    <div className={styles.workSpaceButtonsHeaderContainer}>
      {/* 최근 항목 버튼 */}
      <span
        className={styles.workSpaceButtonsRecent}>최근 항목</span>

      {/* 오른쪽 버튼(새 폴더, 문제 생성) */}
      <div>
        <button 
          className={styles.workSpaceButtonsNewfolder} 
          onClick={onNewFolder}
        >
          새 폴더
        </button>
        <button 
          className={styles.workSpaceButtonsNewproblem} 
          onClick={onNewProblem}
        >
          문제 생성
        </button>
      </div>

      <hr className={styles.workSpaceButtonsUnderline} />
    </div>
  );
};

export default WorkSpaceButtons;