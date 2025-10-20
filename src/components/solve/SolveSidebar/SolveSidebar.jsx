import React, { useState } from 'react';
import styles from './SolveSidebar.module.css';
import SidebarIcon from '../../../assets/icons/SidebarIcon.svg';
import MyFolderIcon from '../../../assets/icons/MyFolderIcon.svg';
import AddProblemIcon from '../../../assets/icons/AddProblemIcon.svg';
import AddFolderIcon from '../../../assets/icons/AddFolderIcon.svg';
import AddFileIcon from '../../../assets/icons/AddFileIcon.svg';
import FolderIcon from '../../../assets/icons/FolderIcon.svg';
import FileIcon from '../../../assets/icons/FileIcon.svg';
import MoreIcon from '../../../assets/icons/MoreIcon.svg';

// 와이어프레임에 표시된 파일 구조를 위한 임시 데이터
const mockFileStructure = [
  {
    id: 'folder1',
    type: 'folder',
    name: '알고리즘 1주차',
    files: [
      { id: 'file1', type: 'file', name: 'Python.py' },
      { id: 'file2', type: 'file', name: 'Python.py' },
      { id: 'file3', type: 'file', name: 'Javascript.js' },
      { id: 'file4', type: 'file', name: 'Javascript.js' },
    ],
  },
  {
    id: 'folder2',
    type: 'folder',
    name: '알고리즘 2주차',
    files: [{ id: 'file5', type: 'file', name: 'Java.java' }],
  },
];

function SolveSidebar() {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const innerWrapperClasses = `${styles.sidebarInnerWrapper} ${
    isExpanded ? styles.expanded : styles.collapsed
  }`;

  return (
    <div className={styles.sidebarContainer}>
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
            <ul className={styles.fileListContainer}>
              {mockFileStructure.map((folder, index) => (
                <li key={folder.id}>
                  <div className={styles.itemNameWrapper}>
                    <div className={styles.folderItem}>
                      <img src={FolderIcon} alt='폴더' />
                      <span>{folder.name}</span>
                    </div>
                    <button className={styles.menuButton}>
                      <img src={MoreIcon} alt='더보기' />
                    </button>
                  </div>
                  <ul className={styles.nestedList}>
                    {folder.files.map((file) => (
                      <li key={file.id}>
                        <div className={styles.itemNameWrapper}>
                          <div className={styles.fileItem}>
                            <img src={FileIcon} alt='파일' />
                            <span>{file.name}</span>
                          </div>
                          <button className={styles.menuButton}>
                            <img src={MoreIcon} alt='더보기' />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {index < mockFileStructure.length - 1 && (
                    <div className={styles.divider} />
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default SolveSidebar;
