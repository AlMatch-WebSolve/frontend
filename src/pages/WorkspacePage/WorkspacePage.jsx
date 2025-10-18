import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import WorkSpaceProblemModal from '../../components/workspace/WorkSpaceProblemModal/WorkSpaceProblemModal.jsx';
import WorkSpaceProblemList from '../../components/workspace/WorkSpaceProblemList/WorkSpaceProblemList.jsx';
import WorkSpaceFolderItem from '../../components/workspace/WorkSpaceFolderItem/WorkSpaceFolderItem.jsx';
import '../../styles/global.css';
import styles from './WorkspacePage.module.css';

// 아이템 높이와 초기 위치 설정
const ITEM_HEIGHT = 0; // 아이템 높이
const INITIAL_TOP = 0; // 첫 아이템의 Y 위치
const INITIAL_LEFT = 0; // 아이템의 X 위치

function WorkspacePage() {
  // 모달 열림/닫힘 상태 관리
  const [IsModalOpen, setIsModalOpen] = useState(false);
  const [folders, setFolders] = useState([]);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  // 새 폴더 버튼 클릭 핸들러
  const handleNewFolder = () => {
    console.log('새 폴더 버튼 클릭 됨');
    // 폴더 생성 로직 - 고유 ID와 편집 모드 추가
    const newFolder = {
      id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: "새 폴더",
      isEditing: true // 생성 시 이름 편집 모드로 시작
    };
    setFolders(prev => [...prev, newFolder]);
  };

  // 폴더 이름 확정 핸들러
  const handleFolderNameConfirm = (folderId, newName) => {
    setFolders(prev => 
      prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, name: newName, isEditing: false } 
          : folder
      )
    );
  };

  // 폴더 삭제 핸들러
  const handleDeleteFolder = (folderId) => {
    setFolders(prev => prev.filter(folder => folder.id !== folderId));
  };

  // 문제 생성 버튼 클릭 핸들러
  const handleNewProblem = () => {
    setIsModalOpen(true);
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSelectProblem = (problem) => {
    // 선택한 문제에 고유 ID 추가
    const newProblem = {
      ...problem,
      id: `problem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // 완전히 고유한 ID 생성
    };
    setSelectedProblems(prev => [...prev, newProblem]); // newProblem 추가
  };

  return (
    <div className={styles.workSpaceBackground}>
      <div className={styles.workSpaceContainer}>
        {/* 헤더 버튼 컴포넌트 */}
        <div className={styles.workSpaceButtonsHeaderContainer}>
          {/* 최근 항목 버튼 */}
          <span className={styles.workSpaceButtonsRecent}>최근 항목</span>

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
            {/* 폴더 목록 렌더링 - 맨 위에 배치 */}
            {folders.map((folder, index) => (
              <WorkSpaceFolderItem
                key={folder.id}
                id={folder.id}
                initialName={folder.name}
                isInitialEditing={folder.isEditing}
                top={INITIAL_TOP + (index * ITEM_HEIGHT)}
                left={INITIAL_LEFT}
                onNameConfirm={(newName) => handleFolderNameConfirm(folder.id, newName)}
                onDelete={() => handleDeleteFolder(folder.id)}
              />
            ))}
            
            {/* 문제 목록 렌더링 - 폴더 아래에 배치 */}
            {selectedProblems.map((problem, index) => (
              <WorkSpaceProblemList
                key={problem.id}
                id={problem.id}
                initialTitle={problem.title}
                selectedLanguage={problem.selectedLanguage}
                top={INITIAL_TOP + (folders.length * ITEM_HEIGHT) + (index * ITEM_HEIGHT)} // 폴더 아래에 배치
                left={INITIAL_LEFT}
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