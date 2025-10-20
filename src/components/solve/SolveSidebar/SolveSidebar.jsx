import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import styles from './SolveSidebar.module.css';
import SidebarIcon from '../../../assets/icons/SidebarIcon.svg';
import MyFolderIcon from '../../../assets/icons/MyFolderIcon.svg';
import AddProblemIcon from '../../../assets/icons/AddProblemIcon.svg';
import AddFolderIcon from '../../../assets/icons/AddFolderIcon.svg';
import AddFileIcon from '../../../assets/icons/AddFileIcon.svg';
import FolderIcon from '../../../assets/icons/FolderIcon.svg';
import FileIcon from '../../../assets/icons/FileIcon.svg';
import MoreIcon from '../../../assets/icons/MoreIcon.svg';

const FileTreeItem = ({ item }) => {
  // 1. 아이템이 'FOLDER'일 경우
  if (item.type === 'FOLDER') {
    return (
      <li>
        {/* 폴더 아이템 렌더링 */}
        <div className={styles.itemNameWrapper}>
          <div className={styles.folderItem}>
            <img src={FolderIcon} alt='폴더' />
            <span>{item.name}</span>
          </div>
          <button className={styles.menuButton}>
            <img src={MoreIcon} alt='더보기' />
          </button>
        </div>
        {/* 자식(children)이 있으면 중첩 리스트(ul)를 렌더링합니다. */}
        {item.children && item.children.length > 0 && (
          <ul className={styles.nestedList}>
            {/* 자식들을 순회하며 FileTreeItem 컴포넌트를 재귀적으로 호출 */}
            {item.children.map((child) => (
              <FileTreeItem key={child.id} item={child} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  // 2. 아이템이 'FILE'일 경우
  if (item.type === 'FILE') {
    return (
      <li>
        {/* 파일 아이템 렌더링 */}
        <div className={styles.itemNameWrapper}>
          <div className={styles.fileItem}>
            <img src={FileIcon} alt='파일' />
            <span>{item.name}</span>
          </div>
          <button className={styles.menuButton}>
            <img src={MoreIcon} alt='더보기' />
          </button>
        </div>
        {/* 파일은 자식이 없으므로 여기서 렌더링이 끝납니다. */}
      </li>
    );
  }

  // type이 FOLDER나 FILE이 아닌 경우 null 반환
  return null;
};

function SolveSidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [fileTree, setFileTree] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    const fetchFileTree = async () => {
      try {
        setIsLoading(true); // 로딩 시작
        setError(null);
        // API 호출
        const response = await apiClient.get('/api/workspace/tree');
        // 응답 데이터를 state에 저장 (보통 response.data에 담겨옴)
        setFileTree(response.data || []);
      } catch (err) {
        console.error('Failed to fetch workspace tree:', err);
        setError(err); // 에러 state에 저장
      } finally {
        setIsLoading(false); // 로딩 종료
      }
    };

    fetchFileTree();
  }, []);

  const innerWrapperClasses = `${styles.sidebarInnerWrapper} ${
    isExpanded ? styles.expanded : styles.collapsed
  }`;

  const renderFileList = () => {
    if (isLoading) {
      return <li>파일 목록을 불러오는 중...</li>;
    }
    if (error) {
      return <li>오류가 발생했습니다.</li>;
    }
    if (fileTree.length === 0) {
      return <li>파일이 없습니다.</li>;
    }

    return fileTree.map((rootItem, index) => (
      // React.Fragment를 사용해 key와 divider 로직을 분리
      <React.Fragment key={rootItem.id}>
        <FileTreeItem item={rootItem} />
        {/* 최상위 아이템(폴더) 사이에만 구분선(divider) 추가 */}
        {index < fileTree.length - 1 && <div className={styles.divider} />}
      </React.Fragment>
    ));
  };

  return (
    <div className={styles.sidebarContainer}>
      {/* 실제 콘텐츠를 담는 '내부 래퍼' */}
      <div className={innerWrapperClasses}>
        {/* 1. 헤더 */}
        <div className={styles.sidebarHeader}>
          {isExpanded && (
            <div className={styles.myFileContainer}>
              <img src={MyFolderIcon} alt='내 파일' />
              <span>내 파일</span>
            </div>
          )}
          <button
            className={styles.collapseButton}
            title={isExpanded ? '사이드바 접기' : '사이드바 펼치기'}
            onClick={toggleSidebar}
          >
            <img src={SidebarIcon} alt='사이드바' />
          </button>
        </div>

        {isExpanded && (
          <>
            {/* 2. 문제 추가 버튼 */}
            <div className={styles.buttonContainer}>
              <button className={styles.addProblemButton}>
                <img src={AddProblemIcon} alt='문제 추가'></img>
                <span>문제 추가</span>
              </button>
              <div className={styles.iconButtonWrapper}>
                <button className={styles.iconButton}>
                  <img src={AddFolderIcon} alt='폴더 추가' />
                </button>
                <button className={styles.iconButton}>
                  <img src={AddFileIcon} alt='파일 추가' />
                </button>
              </div>
            </div>
            {/* 3. 파일 목록 */}
            <ul className={styles.fileListContainer}>{renderFileList()}</ul>
          </>
        )}
      </div>
    </div>
  );
}

export default SolveSidebar;
