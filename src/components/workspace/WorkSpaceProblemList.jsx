import { useState, useEffect, useRef } from 'react';
import styles from './WorkSpaceProblemList.module.css';
import FileCodeIcon from '../../assets/icons/file-code.svg';

// 언어별 확장자 매핑 객체 추가
const languageExtensions = {
  java: '.java',
  javascript: '.js',
  python: '.py'
};

const WorkSpaceProblemList = ({ initialTitle, onFileNameConfirm, top, left, selectedLanguage }) => {
  const [fileName, setFileName] = useState(initialTitle || '');
  const [isEditing, setIsEditing] = useState(true);
  const inputRef = useRef(null);
  
  useEffect(() => {
    if (inputRef.current && isEditing) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      let finalFileName = fileName.trim();
      // const finalFileName = fileName.trim();

      if (!finalFileName) {
        alert("파일 이름을 입력하세요.");
        return;
      }

      // 선택한 언어에 맞는 확장자 추가
      if (selectedLanguage && languageExtensions[selectedLanguage]) {
        const extension = languageExtensions[selectedLanguage];
        if (!finalFileName.endsWith(extension)) {
          finalFileName += extension;
          setFileName(finalFileName);
        }
      }
      
      setIsEditing(false);
      if (onFileNameConfirm) {
        onFileNameConfirm(finalFileName);
      }
    }
  };
  
  return (
    <li className={`${styles.folderItem} ${isEditing ? styles.fileInputItem : ''}`}
    style={{ top: `${top}px`, left: `${left}px` }}>
      <span className={styles.fileIcon}>
        <img src={FileCodeIcon} alt="파일 아이콘" />
      </span>
      
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          className={styles.fileNameInput}
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="파일명 입력 후 Enter"
        />
      ) : (
        <span className={styles.fileNameDisplay}>{fileName}</span>
      )}
    </li>
  );
};

export default WorkSpaceProblemList;