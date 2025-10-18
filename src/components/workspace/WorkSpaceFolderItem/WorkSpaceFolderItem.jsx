// WorkSpaceFolderItem.jsx
import React, { useState, useEffect, useRef } from 'react';
import styles from './WorkSpaceFolderItem.module.css';
import FolderIcon from '../../../assets/icons/folder.svg';
import DotsIcon from '../../../assets/icons/dot-horizontal.svg';

const WorkSpaceFolderItem = ({ id, initialName, isInitialEditing, onNameConfirm, onDelete, top, left, onFolderClick  }) => {
  const [isEditing, setIsEditing] = useState(isInitialEditing || false);
  const [name, setName] = useState(initialName || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    if (inputRef.current && isEditing) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
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
      const finalName = name.trim();
      if (!finalName) {
        alert("폴더 이름을 입력하세요.");
        return;
      }
      
      setIsEditing(false);
      if (onNameConfirm) {
        onNameConfirm(finalName);
      }
    }
  };
  
  const handleBlur = () => {
    const finalName = name.trim();
    if (!finalName) {
      setName(initialName);
    } else {
      setIsEditing(false);
      if (onNameConfirm) {
        onNameConfirm(finalName);
      }
    }
  };
  
  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowDropdown(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setShowDropdown(false);
  };

  const handleFolderClick = (e) => {
    // 드롭다운이나 이름 편집 중에는 클릭 이벤트 무시
    if (!isEditing && !dropdownRef.current?.contains(e.target)) {
      onFolderClick(id);
    }
  };
  
  return (
    <li 
      className={styles['folder-item']} 
      style={{ top: `${top}px`, left: `${left}px` }}
      onClick={handleFolderClick}
    >
      <span className={styles['folder-icon']}>
        <img src={FolderIcon} alt="폴더 아이콘" />
      </span>
      
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          className={styles['folder-name-input']}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="폴더명 입력 후 Enter"
        />
      ) : (
        <div className={styles['file-name-container']}>
          <span className={styles['folder-name-display']}>{name}</span>
          <div className={styles['dropdown-container']} ref={dropdownRef}>
            <button 
              className={styles['dots-button']} 
              onClick={toggleDropdown}
            >
              <img src={DotsIcon} alt="더보기" className={styles['dots-icon']} />
            </button>
            
            {showDropdown && (
              <div className={styles.dropdown}>
                <button onClick={handleEdit} className={styles['dropdown-item']}>이름 수정</button>
                <button onClick={handleDelete} className={styles['dropdown-item']}>폴더 삭제</button>
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
};

export default WorkSpaceFolderItem;