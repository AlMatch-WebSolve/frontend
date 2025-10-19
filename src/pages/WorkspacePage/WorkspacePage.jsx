import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import WorkSpaceProblemModal from '../../components/workspace/WorkSpaceProblemModal/WorkSpaceProblemModal.jsx';
import WorkSpaceProblemList from '../../components/workspace/WorkSpaceProblemList/WorkSpaceProblemList.jsx';
import WorkSpaceFolderItem from '../../components/workspace/WorkSpaceFolderItem/WorkSpaceFolderItem.jsx';
import '../../styles/global.css';
import styles from './WorkspacePage.module.css';
// import { createFolder, deleteFolder, updateFolderName } from '../../api/folder.js';
import apiClient from '../../api/apiClient';

// 아이템 높이와 초기 위치 설정
const ITEM_HEIGHT = 0; // 아이템 높이
const INITIAL_TOP = 0; // 첫 아이템의 Y 위치
const INITIAL_LEFT = 0; // 아이템의 X 위치

function WorkspacePage() {
  // 모달 열림/닫힘 상태 관리
  const [IsModalOpen, setIsModalOpen] = useState(false);
  const [folders, setFolders] = useState([]);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);

  const handleFolderClick = (folderId) => {
    setCurrentFolderId(folderId); // 클릭한 폴더를 현재 폴더로 설정
  };

  const handleBackToRoot = () => {
    setCurrentFolderId(null); // 루트 레벨로 돌아가기
  };

  // 새 폴더 버튼 클릭 핸들러
  const handleNewFolder = async () => {
    try {
      // API 호출로 새 폴더 생성
      const folderData = {
        name: "새 폴더",
        parentId: currentFolderId // 현재 열린 폴더의 ID를 부모 ID로 설정
      };
      
      // const createdFolder = await createFolder(folderData);
      const createdFolder = await apiClient.post('/api/workspace/folders', folderData);
      
      // API 응답으로 받은 데이터로 상태 업데이트
      const newFolder = {
        id: createdFolder.id,
        name: createdFolder.name,
        isEditing: true, // 생성 시 이름 편집 모드로 시작
        parentId: createdFolder.parentId
      };
      
      setFolders(prev => [...prev, newFolder]);
    } catch (error) {
      alert('폴더 생성에 실패했습니다.');
      console.error(error);
    }
  };
  //   const newFolder = {
  //     id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  //     name: "새 폴더",
  //     isEditing: true, // 생성 시 이름 편집 모드로 시작
  //     parentId: currentFolderId // 현재 열린 폴더의 ID를 부모 ID로 설정
  //   };
  //   setFolders(prev => [...prev, newFolder]);
  // };

  // 폴더 이름 확정 핸들러
  const handleFolderNameConfirm = async (folderId, newName) => {
    try {
      // await updateFolderName(folderId, newName);
      await apiClient.put(`/api/workspace/folders/${folderId}`, { newName });
      setFolders(prev => 
        prev.map(folder => 
          folder.id === folderId 
            ? { ...folder, name: newName, isEditing: false } 
            : folder
        )
      );
    } catch (error) {
      alert('폴더 이름 수정에 실패했습니다.');
      console.error(error);
    }
  };

  // 폴더 삭제 핸들러
  const handleDeleteFolder = async (folderId) => {
    try {
      // await deleteFolder(folderId);
      await apiClient.delete(`/api/workspace/folders/${folderId}`);
      setFolders(prev => prev.filter(folder => folder.id !== folderId));
    } catch (error) {
      alert('폴더 삭제에 실패했습니다.');
      console.error(error);
    }
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
    const newProblem = {
      ...problem,
      id: `problem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      folderId: currentFolderId, // 현재 열린 폴더 ID 저장
      isEditing: true // 새로 생성된 문제는 편집 모드로 시작
    };
    setSelectedProblems(prev => [...prev, newProblem]);
    setIsModalOpen(false);
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
            {/* 폴더 내부에 있을 때 표시할 헤더 */}
            {currentFolderId && (
              <div className={styles.folderHeader}>
                <button onClick={handleBackToRoot} className={styles.backButton}>
                  처음으로
                </button>
                <span className={styles.currentFolderName}>
                  {`[${folders.find(f => f.id === currentFolderId)?.name || '폴더'}]`}
                </span>
              </div>
            )}
            
            {/* 폴더 목록 렌더링 - 루트에서만 표시 */}
            {folders
              .filter(folder => folder.parentId === currentFolderId)
              .map((folder, index) => (
                <WorkSpaceFolderItem
                  key={folder.id}
                  id={folder.id}
                  initialName={folder.name}
                  isInitialEditing={folder.isEditing}
                  top={INITIAL_TOP + (index * ITEM_HEIGHT)}
                  left={INITIAL_LEFT}
                  onNameConfirm={(newName) => handleFolderNameConfirm(folder.id, newName)}
                  onDelete={() => handleDeleteFolder(folder.id)}
                  onFolderClick={handleFolderClick}
                />
              ))}
            
            {/* 문제 목록 렌더링 - 현재 폴더에 맞게 필터링 */}
            {selectedProblems
              .filter(problem => 
                currentFolderId === null 
                  ? !problem.folderId 
                  : problem.folderId === currentFolderId
              )
              .map((problem, index) => (
                <WorkSpaceProblemList
                  key={problem.id}
                  id={problem.id}
                  initialTitle={problem.title}
                  selectedLanguage={problem.selectedLanguage}
                  isInitialEditing={problem.isEditing} // 문제의 isEditing 상태를 prop으로 전달
                  top={INITIAL_TOP + (currentFolderId === null ? folders.length * ITEM_HEIGHT : 0) + (index * ITEM_HEIGHT)}
                  left={INITIAL_LEFT}
                  onFileNameConfirm={(name) => {
                    // 이름 변경 및 편집 상태 업데이트
                    setSelectedProblems(prev => 
                      prev.map(item => 
                        item.id === problem.id 
                          ? {...item, title: name, isEditing: false} // isEditing 상태를 false로 업데이트
                          : item
                      )
                    );
                  }}
                  onDelete={() => {
                    console.log('삭제 요청된 ID:', problem.id);
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