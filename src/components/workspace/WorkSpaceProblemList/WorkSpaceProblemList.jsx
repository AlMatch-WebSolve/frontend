import React, { useEffect, useRef, useState } from 'react';
import styles from './WorkSpaceProblemList.module.css';
import FileCodeIcon from '../../../assets/icons/FileIcon.svg';
import DotsIcon from '../../../assets/icons/DotsIcon.svg';

// 언어별 확장자 매핑
const languageExtensions = {
  java: '.java',
  javascript: '.js',
  python: '.py',
};

const WorkSpaceProblemList = ({
  id,
  solutionId,            // 서버 솔루션 ID (없으면 임시 파일)
  initialTitle,
  onFileNameConfirm,      // 부모에 최종 이름만 전달 (서버 요청은 부모가 담당)
  top,
  left,
  selectedLanguage,
  onDelete,               // 부모에 삭제 요청 이벤트만 전달 (서버 요청은 부모가 담당)
  isInitialEditing = false,
  onDoubleClick,          // 열기
}) => {
  const [fileName, setFileName] = useState(initialTitle || '');
  const [isEditing, setIsEditing] = useState(isInitialEditing);
  const [showDropdown, setShowDropdown] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => { setFileName(initialTitle || ''); }, [initialTitle]);

  // 편집 시작 시 자동 포커스
  useEffect(() => {
    if (inputRef.current && isEditing) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = (e) => {
    if (isEditing) return;
    onDoubleClick?.(e);
  };

  // 이름 변경 확정(Enter) - 확장자 부착 → 부모 콜백만 호출
  const handleKeyDown = (e) => {
    if (e.key !== 'Enter') {
      if (e.key === 'Escape') {
        setIsEditing(false);
        setFileName((initialTitle || '').trim());
      }
      return;
    }

    let finalFileName = (fileName || '').trim();
    if (!finalFileName) {
      alert('파일 이름을 입력하세요.');
      return;
    }

    // Enter 시에만 확장자 자동 부착
    if (selectedLanguage && languageExtensions[selectedLanguage]) {
      const ext = languageExtensions[selectedLanguage];
      if (!finalFileName.endsWith(ext)) {
        finalFileName += ext;
        setFileName(finalFileName);
      }
    }

    setIsEditing(false);
    onFileNameConfirm?.(finalFileName); // 실제 PATCH/POST는 부모가 수행
  };

  const toggleDropdown = () => setShowDropdown((p) => !p);

  const handleEdit = () => {
    setIsEditing(true);
    setShowDropdown(false);
  };

  // 삭제 클릭 → Confirm → 부모 콜백만 호출
  const handleDeleteClick = () => {
    setShowDropdown(false);
    const ok = window.confirm('파일을 삭제하시겠습니까?');
    if (!ok) return;
    onDelete?.(); // 실제 DELETE 및 롤백은 부모가 담당
  };

  return (
    <div
      className={`${styles.folderItem} ${isEditing ? styles.fileInputItem : ''}`}
      style={{ top: `${top}px`, left: `${left}px` }}
    >
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
          aria-label="파일명 입력"
        />
      ) : (
        <div
          className={styles.fileNameContainer}
          onDoubleClick={handleOpen}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') handleOpen(e); }}
          title={fileName}
        >
          <span className={styles.fileNameDisplay} title={fileName}>
            {fileName}
          </span>

          <div className={styles.dropdownContainer} ref={dropdownRef}>
            <button
              type="button"
              className={styles.dotsButton}
              onClick={(e) => { e.stopPropagation(); toggleDropdown(); }}
              aria-haspopup="menu"
              aria-expanded={showDropdown}
              aria-label="파일 메뉴 열기"
            >
              <img src={DotsIcon} alt="더보기" className={styles.dotsIcon} />
            </button>

            {showDropdown && (
              <div role="menu" className={styles.dropdown}>
                <button
                  role="menuitem"
                  onClick={handleEdit}
                  className={styles.dropdownItem}
                >
                  이름 수정
                </button>
                <button
                  role="menuitem"
                  onClick={handleDeleteClick}
                  className={styles.dropdownItem}
                >
                  파일 삭제
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkSpaceProblemList;
