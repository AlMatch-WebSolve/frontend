import React, { useEffect, useRef, useState, useMemo } from 'react'; // useMemo 추가
import styles from './WorkSpaceProblemList.module.css';
import FileCodeIcon from '../../../assets/icons/FileIcon.svg';
import DotsIcon from '../../../assets/icons/DotsIcon.svg';

// 언어별 확장자 매핑 (확장자 소문자로 통일하여 비교)
const languageExtensions = {
  java: '.java',
  javascript: '.js',
  python: '.py',
};

// Known extensions for parsing (소문자로 변환하여 비교)
const allKnownExtensions = Object.values(languageExtensions).map(ext => ext.toLowerCase());

// 파일 이름 파싱 헬퍼 함수
const parseFileName = (fullFileName) => {
  if (!fullFileName) return { baseName: '', currentExt: '' };

  const lastDotIndex = fullFileName.lastIndexOf('.');
  if (lastDotIndex > 0) {
    const potentialExt = fullFileName.substring(lastDotIndex).toLowerCase();
    if (allKnownExtensions.includes(potentialExt)) {
      return {
        baseName: fullFileName.substring(0, lastDotIndex),
        currentExt: fullFileName.substring(lastDotIndex), // 실제 확장자는 원래 대소문자 유지
      };
    }
  }
  return { baseName: fullFileName, currentExt: '' }; // 확장자 없으면 이름 전체가 baseName
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
  // initialTitle을 파싱하여 기본 이름과 확장자를 가져온다. (컴포넌트 마운트 시 한 번만 계산)
  const { baseName: initialBaseName, currentExt: initialActualExt } = useMemo(
    () => parseFileName(initialTitle),
    [initialTitle]
  );

  // fileNameInput: input 필드에 현재 표시되거나, 편집 모드 종료 후 최종 표시될 파일명
  const [fileNameInput, setFileNameInput] = useState(initialTitle || '');
  const [isEditing, setIsEditing] = useState(isInitialEditing);
  const [showDropdown, setShowDropdown] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // 현재 파일에 '실제로' 붙어있는 확장자 (예: ".py"). 이를 통해 변경되지 않으면 유지.
  const currentDisplayedExtensionRef = useRef(initialActualExt);

  // initialTitle이 변경될 때 (부모로부터 새로운 제목을 받을 때) 로컬 상태 업데이트
  useEffect(() => {
    const { baseName, currentExt } = parseFileName(initialTitle);
    setFileNameInput(initialTitle || ''); // 일단 전체 파일명으로 설정
    currentDisplayedExtensionRef.current = currentExt; // 실제 확장자 업데이트
  }, [initialTitle]);

  // 편집 시작 시 자동 포커스
  useEffect(() => {
    if (inputRef.current && isEditing) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);


  // 드롭다운 외부 클릭 감지 (기존 코드)
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

    let inputBaseName = (fileNameInput || '').trim(); // 사용자가 input 필드에 입력한 값
    if (!inputBaseName) {
      alert('파일 이름을 입력하세요.');
      return;
    }

    // --- 최종 파일명 구성 로직 ---
    let finalExtension = '';
    const lastDotOfInput = inputBaseName.lastIndexOf('.');
    let userProvidedExtInInput = ''; // 사용자가 입력 값에 확장자를 포함했을 경우
    
    // 사용자가 입력한 값(`inputBaseName`)에 이미 확장자가 포함되어 있는지 확인
    if (lastDotOfInput > 0) {
        const potentialExt = inputBaseName.substring(lastDotOfInput).toLowerCase();
        if (allKnownExtensions.includes(potentialExt)) {
            userProvidedExtInInput = inputBaseName.substring(lastDotOfInput); // 사용자가 입력한 확장자의 원래 대소문자
            inputBaseName = inputBaseName.substring(0, lastDotOfInput); // 확장자를 제외한 순수 파일명만 남김
        }
    }
    
    // 최종적으로 어떤 확장자를 붙일 것인지 결정:
    if (userProvidedExtInInput) {
        // 1. 사용자가 명시적으로 입력한 확장자가 있다면 그것을 사용 (예: "내파일.java"로 입력)
        finalExtension = userProvidedExtInInput;
    } else if (currentDisplayedExtensionRef.current) {
        // 2. 현재 파일이 가지고 있던 확장자(초기 로딩 시 파싱된)를 사용 (예: "내파일" -> "내파일.py")
        finalExtension = currentDisplayedExtensionRef.current;
    } else if (selectedLanguage && languageExtensions[selectedLanguage]) {
        // 3. 그것도 없으면, `selectedLanguage`에 기반한 확장자를 사용
        finalExtension = languageExtensions[selectedLanguage];
    }

    let finalFullFileName = inputBaseName;
    if (finalExtension && !finalFullFileName.toLowerCase().endsWith(finalExtension.toLowerCase())) {
        finalFullFileName += finalExtension; // 결정된 최종 확장자 추가
    }
    
    setIsEditing(false); // 편집 모드 종료
    setFileNameInput(finalFullFileName); // 로컬 상태(화면 표시용)를 최종 파일명으로 업데이트
    onFileNameConfirm?.(finalFullFileName); // 상위 컴포넌트로 최종 파일명 전달
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
          value={fileNameInput}
          onChange={(e) => setFileNameInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
              if (isEditing) {
                  let inputBaseName = (fileNameInput || '').trim();
                  if (!inputBaseName) {
                      alert('파일 이름을 입력하세요.');
                      if (inputRef.current) inputRef.current.focus();
                      return;
                  }
                  
                  // handleKeyDown과 동일한 최종 파일명 구성 로직
                  let finalExtension = '';
                  const lastDotOfInput = inputBaseName.lastIndexOf('.');
                  let userProvidedExtInInput = '';
                  if (lastDotOfInput > 0) {
                      const potentialExt = inputBaseName.substring(lastDotOfInput).toLowerCase();
                      if (allKnownExtensions.includes(potentialExt)) {
                          userProvidedExtInInput = inputBaseName.substring(lastDotOfInput);
                          inputBaseName = inputBaseName.substring(0, lastDotOfInput);
                      }
                  }
                  
                  if (userProvidedExtInInput) {
                      finalExtension = userProvidedExtInInput;
                  } else if (currentDisplayedExtensionRef.current) {
                      finalExtension = currentDisplayedExtensionRef.current;
                  } else if (selectedLanguage && languageExtensions[selectedLanguage]) {
                      finalExtension = languageExtensions[selectedLanguage];
                  }

                  let finalFullFileName = inputBaseName;
                  if (finalExtension && !finalFullFileName.toLowerCase().endsWith(finalExtension.toLowerCase())) {
                      finalFullFileName += finalExtension;
                  }
                  
                  setIsEditing(false);
                  setFileNameInput(finalFullFileName);
                  onFileNameConfirm?.(finalFullFileName);
              }
          }}
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
          title={fileNameInput}
        >
          <span className={styles.fileNameDisplay} title={fileNameInput}>
            {fileNameInput}
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