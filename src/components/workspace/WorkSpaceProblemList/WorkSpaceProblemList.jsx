import React, { useEffect, useRef, useState } from 'react';
import styles from './WorkSpaceProblemList.module.css';
import FileCodeIcon from '../../../assets/icons/file-code.svg';
import DotsIcon from '../../../assets/icons/dot-horizontal.svg';
import apiClient from '../../../api/apiClient.js';

// 언어별 확장자 매핑
const languageExtensions = {
  java: '.java',
  javascript: '.js',
  python: '.py',
};

// 숫자가 아니면 임시/로컬로 간주해 서버 호출을 막습니다.
const isServerSolutionId = (val) => /^\d+$/.test(String(val ?? '').trim());

const WorkSpaceProblemList = ({
  id,
  solutionId,
  initialTitle,
  onFileNameConfirm, // 부모에 최종 이름 전달
  top,
  left,
  selectedLanguage,
  onDelete, // 부모에 삭제 반영 요청
  isInitialEditing = false,
}) => {
  const [fileName, setFileName] = useState(initialTitle || '');
  const [isEditing, setIsEditing] = useState(isInitialEditing);
  const [showDropdown, setShowDropdown] = useState(false);
  const [busy, setBusy] = useState(false); // PATCH/DELETE 진행 중

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

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

  // 파일명 확정(Enter)
  const handleKeyDown = async (e) => {
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

    // 선택된 언어 확장자 자동 부착
    if (selectedLanguage && languageExtensions[selectedLanguage]) {
      const ext = languageExtensions[selectedLanguage];
      if (!finalFileName.endsWith(ext)) {
        finalFileName += ext;
        setFileName(finalFileName);
      }
    }

    setIsEditing(false);

    // 서버 id가 아니면(=임시/로컬 id) 서버 호출 없이 부모만 업데이트
    if (!isServerSolutionId(solutionId)) {
      onFileNameConfirm?.(finalFileName);
      return;
    }

    // 서버 PATCH
    const prev = fileName;
    setBusy(true);
    try {
      // 낙관적 반영
      setFileName(finalFileName);

      const res = await apiClient.patch(`/api/solutions/${String(solutionId).trim()}`, { name: finalFileName });
      if (res.status !== 200) throw new Error(`파일 이름 변경 실패 (status: ${res.status})`);

      onFileNameConfirm?.(finalFileName);
    } catch (err) {
      // 롤백
      console.error('Rename solution error:', err?.response?.data || err);
      setFileName(prev);
      alert(err?.response?.data?.message || err?.message || '파일 이름 수정에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const toggleDropdown = () => setShowDropdown((p) => !p);

  const handleEdit = () => {
    setIsEditing(true);
    setShowDropdown(false);
  };

  // 삭제
  const handleDeleteClick = async () => {
    setShowDropdown(false);

    if (!isServerSolutionId(solutionId)) {
      onDelete?.();
      return;
    }

    setBusy(true);
    try {
      // const res = await apiClient.delete(`/api/solutions/${solutionId}`);
      const res = await apiClient.delete(`/api/solutions/${String(solutionId).trim()}`);
      if (res.status !== 200) throw new Error(`파일 삭제 실패 (status: ${res.status})`);
      onDelete?.();
    } catch (err) {
      console.error('Delete solution error:', err?.response?.data || err);
      alert(err?.response?.data?.message || err?.message || '파일 삭제에 실패했습니다.');
    } finally {
      setBusy(false);
    }
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
          disabled={busy}
        />
      ) : (
        <div className={styles.fileNameContainer}>
          <span className={styles.fileNameDisplay} title={fileName}>
            {fileName}
          </span>

          <div className={styles.dropdownContainer} ref={dropdownRef}>
            <button
              type="button"
              className={styles.dotsButton}
              onClick={toggleDropdown}
              aria-haspopup="menu"
              aria-expanded={showDropdown}
              aria-label="파일 메뉴 열기"
              disabled={busy}
            >
              <img src={DotsIcon} alt="더보기" className={styles.dotsIcon} />
            </button>

            {showDropdown && (
              <div role="menu" className={styles.dropdown}>
                <button
                  role="menuitem"
                  onClick={handleEdit}
                  className={styles.dropdownItem}
                  disabled={busy}
                >
                  이름 수정
                </button>
                <button
                  role="menuitem"
                  onClick={handleDeleteClick}
                  className={styles.dropdownItem}
                  disabled={busy}
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
