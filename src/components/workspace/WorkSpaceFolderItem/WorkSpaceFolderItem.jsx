import React, { useEffect, useRef, useState } from 'react';
import styles from './WorkSpaceFolderItem.module.css';
import FolderIcon from '../../../assets/icons/FolderIcon.svg';
import ArrowRightIcon from '../../../assets/icons/ArrowRightIcon.svg';
import ArrowDownIcon from '../../../assets/icons/ArrowDownIcon.svg';
import DotsIcon from '../../../assets/icons/DotsIcon.svg';

const WorkSpaceFolderItem = ({
  id,
  initialName,
  isInitialEditing,
  isCollapsed,
  onToggleCollapse,
  onNameConfirm, // 부모에게 최종 이름만 전달 (서버 요청은 부모가 담당)
  onDelete, // 부모에게 삭제 요청 이벤트만 전달 (서버 요청은 부모가 담당)
  top,
  left,
  onFolderClick,
  pending, // 부모가 전달: 서버 미확정이면 true (UI 비활성화 등에서만 사용)
}) => {
  const [isEditing, setIsEditing] = useState(isInitialEditing || false);
  const [name, setName] = useState(initialName || '');
  const [showDropdown, setShowDropdown] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setName(initialName || '');
  }, [initialName]);

  useEffect(() => {
    if (inputRef.current && isEditing) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isTempId = typeof id === 'string' && id.startsWith('temp-');
  const isPending = !!pending || isTempId;

  // API 호출 제거: 부모 콜백만 호출
  const commitRename = (finalName) => {
    const trimmed = (finalName ?? '').trim();
    if (!trimmed) {
      alert('폴더 이름을 입력하세요.');
      return;
    }
    setIsEditing(false);
    // 부모가 실제 PATCH/POST를 처리하고, 성공 시 상태를 반영
    onNameConfirm?.(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') commitRename(name);
    if (e.key === 'Escape') {
      setIsEditing(false);
      setName(initialName || '');
    }
  };

  const handleBlur = () => {
    // 자동 저장을 원치 않으면 commit 호출하지 않고 편집만 종료
    setIsEditing(false);
    if (!name.trim()) setName(initialName || '');
  };

  const toggleDropdown = () => setShowDropdown((v) => !v);

  const handleEdit = () => {
    if (isPending) return; // 필요 시 임시상태에서 편집 비활성화
    setIsEditing(true);
    setShowDropdown(false);
  };

  // API 호출 제거: 부모 콜백만 호출
  const handleDeleteClick = () => {
    if (!window.confirm('폴더를 삭제할까요? 하위 파일/폴더도 함께 삭제됩니다.'))
      return;
    onDelete?.();
    setShowDropdown(false);
  };

  const handleFolderClick = (e) => {
    if (isEditing) return;
    if (dropdownRef.current?.contains(e.target)) return;
    onFolderClick?.(id);
  };

  const handleToggleClick = (e) => {
    e.stopPropagation();
    onToggleCollapse(id);
  };

  const handleRowClick = (e) => {
    if (isEditing || dropdownRef.current?.contains(e.target)) return;
    onFolderClick?.(id);
  };

  return (
    <div
      className={styles['folder-item']}
      style={{ top: `${top}px`, left: `${left}px` }}
      onClick={handleRowClick}
    >
      <button onClick={handleToggleClick} className={styles.collapseButton}>
        <img
          src={isCollapsed ? ArrowRightIcon : ArrowDownIcon}
          alt={isCollapsed ? '펼치기' : '접기'}
          className={styles.collapseIcon}
        />
      </button>

      <span className={styles['folder-icon']}>
        <img src={FolderIcon} alt='폴더 아이콘' />
      </span>

      {isEditing ? (
        <input
          ref={inputRef}
          type='text'
          className={styles['folder-name-input']}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder='폴더명 입력 후 Enter'
          aria-label='폴더명 입력'
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className={styles['name-and-dots-container']}>
          <span className={styles['folder-name-display']}>{name}</span>
          <div className={styles['dropdown-container']} ref={dropdownRef}>
            <button
              className={styles['dots-button']}
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown();
              }}
              aria-haspopup='menu'
              aria-expanded={showDropdown}
              aria-label='폴더 더보기'
              disabled={isPending} // 임시/보류 상태면 더보기 비활성화하고 싶다면 유지
            >
              <img
                src={DotsIcon}
                alt='더보기'
                className={styles['dots-icon']}
              />
            </button>

            {showDropdown && (
              <div className={styles.dropdown} role='menu'>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }} // 행 클릭 방지
                  className={styles['dropdown-item']}
                  role='menuitem'
                  disabled={isPending}
                >
                  이름 수정
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick();
                  }} // 행 클릭 방지
                  className={styles['dropdown-item']}
                  role='menuitem'
                  disabled={isPending}
                >
                  폴더 삭제
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkSpaceFolderItem;
