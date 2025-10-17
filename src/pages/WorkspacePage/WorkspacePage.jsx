import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// import './WorkspacePage.module.css';
import WorkSpaceProblemModal from '../../components/workspace/WorkSpaceProblemModal/WorkSpaceProblemModal';
import WorkSpaceProblemList from '../../components/workspace/WorkSpaceProblemList/WorkSpaceProblemList.jsx';
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
    // 선택한 문제에 고유 ID 추가
    const newProblem = {
      ...problem,
      id: `problem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // 완전히 고유한 ID 생성
      // id: `problem-${Date.now()}` // 타임스탬프로 고유 ID 생성
    };
    setSelectedProblems(prev => [...prev, newProblem]); // problem 대신 newProblem
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
            {selectedProblems.map((problem) => (
              <WorkSpaceProblemList
                key={problem.id} // ID를 key로 사용
                id={problem.id} // ID를 prop으로 전달
                initialTitle={problem.title}
                selectedLanguage={problem.selectedLanguage}
                onFileNameConfirm={(name) => {
                  // 이름 변경 처리
                  setSelectedProblems(prev => 
                    prev.map(item => 
                      item.id === problem.id 
                        ? {...item, title: name} 
                        : item
                    )
                  );
                }}
                onDelete={() => {
                  console.log('삭제 요청된 ID:', problem.id);
                  // ID로 삭제
                  setSelectedProblems(prev => prev.filter(item => item.id !== problem.id));
                }}
              />
            ))}




            {/* {selectedProblems.map((problem) => (
              <WorkSpaceProblemList
                key={problem.id}
                id={problem.id}
                // key={`problem-${index}`}
                initialTitle={problem.title}
                selectedLanguage={problem.selectedLanguage}
                onFileNameConfirm={(name) => console.log(`파일 이름 확정: ${name}`)}
                // 여기 onDelete prop 추가
                onDelete={() => {
                  setSelectedProblems(prev => prev.filter((_, i) => i !== index));
                }}
              />
            ))} */}

          </ul>
        ) : (
          <div className={styles.workSpaceBox}>
            <div className={styles.workSpaceBoxContext}>
              새 폴더나 문제를 생성해주세요.
            </div>
          </div>
        )}

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