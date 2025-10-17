import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// import './WorkspacePage.module.css';
import WorkSpaceProblemModal from '../../components/workspace/WorkSpaceProblemModal';
import WorkSpaceProblemList from '../../components/workspace/WorkSpaceProblemList.jsx';
import '../../styles/global.css';
import styles from './WorkspacePage.module.css';

function WorkspacePage() {

  // 모달 열림/닫힘 상태 관리
  const [IsModalOpen, setIsModalOpen] = useState(false);
  const [folders, setFolders] = useState([]);

  // 새 폴더 버튼 클릭 핸들러
  const handleNewFolder = () => {
    console.log('새 폴더 버튼 클릭 됨');
    // 폴더 생성 로직 추가
    setFolders(prev => [...prev, { name: "새 폴더"}]);
  };

  // 문제 생성 버튼 클릭 핸들러
  const handleNewProblem = () => {
    setIsModalOpen(true);
    // 문제 생성 모달 로직 추가
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const [selectedProblems, setSelectedProblems] = useState([]);

  const handleSelectProblem = (problem) => {
    setSelectedProblems(prev => [...prev, problem]);
  };

  return (
    <div className={styles.workSpaceBackground}>
      <div className={styles.workSpaceContainer}>
        {/* 헤더 버튼 컴포넌트 */}
        <div className={styles.workSpaceButtonsHeaderContainer}>
          {/* 최근 항목 버튼 */}
          <span
            className={styles.workSpaceButtonsRecent}>최근 항목</span>

          {/* 오른쪽 버튼(새 폴더, 문제 생성) */}
          <div className={styles.workSpaceButtons}>
            <button
              className={styles.workSpaceButtonsNewfolder}
              onClick={handleNewFolder}
            >
              새 폴더
            </button>
            <button
              className={styles.workSpaceButtonsNewproblem}
              onClick={handleNewProblem}
            >
              문제 생성
            </button>
          </div>

        </div>
        <hr className={styles.workSpaceButtonsUnderline} />

        {/* 메인 박스 컴포넌트 또는 선택된 문제 */}
        {selectedProblems.length > 0 || folders.length > 0 ? (
          <ul className={styles.folderList}>
            {/* 폴더 목록 렌더링 */}
            {folders.map((folder, index) => (
              <div key={`folder-${index}`} className={styles.folderItem}>
                {folder.name}
              </div>
            ))}
            {/* 문제 목록 렌더링 */}
            {selectedProblems.map((problem, index) => (
              <WorkSpaceProblemList
                key={`problem-${index}`}
                initialTitle={problem.title}
                selectedLanguage={problem.selectedLanguage}
                onFileNameConfirm={(name) => console.log(`파일 이름 확정: ${name}`)}
              />
            ))}
          </ul>
        ) : (
          <div className={styles.workSpaceBox}>
            <div className={styles.workSpaceBoxContext}>
              새 폴더나 문제를 생성해주세요.
            </div>
          </div>
        )}

        {/* {selectedProblems.length > 0 ? (
          <ul className={styles.folderList}>
            {selectedProblems.map((problem, index) => (
              <WorkSpaceProblemList
                key={index}
                initialTitle={problem.title}
                selectedLanguage={problem.selectedLanguage}
                onFileNameConfirm={(name) => console.log(`파일 이름 확정: ${name}`)}
              />
            ))}
          </ul>
        ) : (
          <div className={styles.workSpaceBox}>
            <div className={styles.workSpaceBoxContext}>
              새 폴더나 문제를 생성해주세요.

            </div>
          </div>
        )} */}






        {/* 문제 생성 모달 */}
        <WorkSpaceProblemModal
          isOpen={IsModalOpen}
          onClose={handleCloseModal}
          onSelectProblem={handleSelectProblem}
        />
      </div>
    </div>
  );
}

export default WorkspacePage;