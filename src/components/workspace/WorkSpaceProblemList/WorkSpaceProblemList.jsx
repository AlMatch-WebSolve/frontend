import { useState, useEffect, useRef } from 'react';
import styles from './WorkSpaceProblemList.module.css';
import FileCodeIcon from '../../../assets/icons/file-code.svg';
import DotsIcon from '../../../assets/icons/dot-horizontal.svg';

// 언어별 확장자 매핑 객체 추가
const languageExtensions = {
  java: '.java',
  javascript: '.js',
  python: '.py'
};

const WorkSpaceProblemList = ({ id, initialTitle, onFileNameConfirm, top, left, selectedLanguage, onDelete }) => {
  const [fileName, setFileName] = useState(initialTitle || '');
  const [isEditing, setIsEditing] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false); // 드롭다운 메뉴 표시 여부
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    if (inputRef.current && isEditing) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  // 드롭다운 외부 클릭 감지를 위한 이벤트 리스너
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
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
  
  // 드롭다운 토글
  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };

  // 이름 수정 시작
  const handleEdit = () => {
    setIsEditing(true);
    setShowDropdown(false); // 드롭다운 닫기
  };

  // 파일 삭제
  const handleDelete = () => {
    if (onDelete) {
      onDelete(); // 부모 컴포넌트에서 삭제 처리
    }
    setShowDropdown(false); // 드롭다운 닫기
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
        <div className={styles.fileNameContainer}>
          <span className={styles.fileNameDisplay}>{fileName}</span>
          <div className={styles.dropdownContainer} ref={dropdownRef}>
            <button 
              className={styles.dotsButton} 
              onClick={toggleDropdown}
            >
              <img src={DotsIcon} alt="더보기" className={styles.dotsIcon} />
            </button>
            {/* 이름 수정, 파일 삭제 */}
            {showDropdown && (
              <div className={styles.dropdown}>
                <button onClick={handleEdit} className={styles.dropdownItem}>이름 수정</button>
                <button onClick={handleDelete} className={styles.dropdownItem}>파일 삭제</button>
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
};









// const WorkSpaceProblemList = ({ initialTitle, onFileNameConfirm, top, left, selectedLanguage }) => {
//   const [fileName, setFileName] = useState(initialTitle || '');
//   const [isEditing, setIsEditing] = useState(true);
//   const inputRef = useRef(null);
  
//   useEffect(() => {
//     if (inputRef.current && isEditing) {
//       inputRef.current.focus();
//       inputRef.current.select();
//     }
//   }, [isEditing]);
  
//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") {
//       let finalFileName = fileName.trim();
//       // const finalFileName = fileName.trim();

//       if (!finalFileName) {
//         alert("파일 이름을 입력하세요.");
//         return;
//       }

//       // 선택한 언어에 맞는 확장자 추가
//       if (selectedLanguage && languageExtensions[selectedLanguage]) {
//         const extension = languageExtensions[selectedLanguage];
//         if (!finalFileName.endsWith(extension)) {
//           finalFileName += extension;
//           setFileName(finalFileName);
//         }
//       }
      
//       setIsEditing(false);
//       if (onFileNameConfirm) {
//         onFileNameConfirm(finalFileName);
//       }
//     }
//   };
  
//   return (
//     <li className={`${styles.folderItem} ${isEditing ? styles.fileInputItem : ''}`}
//     style={{ top: `${top}px`, left: `${left}px` }}>
//       <span className={styles.fileIcon}>
//         <img src={FileCodeIcon} alt="파일 아이콘" />
//       </span>
      
//       {isEditing ? (
//         <input
//           ref={inputRef}
//           type="text"
//           className={styles.fileNameInput}
//           value={fileName}
//           onChange={(e) => setFileName(e.target.value)}
//           onKeyDown={handleKeyDown}
//           placeholder="파일명 입력 후 Enter"
//         />
//       ) : (
//         <span className={styles.fileNameDisplay}>{fileName}</span>
//       )}
//     </li>
//   );
// };

export default WorkSpaceProblemList;