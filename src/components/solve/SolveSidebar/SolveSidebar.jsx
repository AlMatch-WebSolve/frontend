import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../../api/apiClient';
import styles from './SolveSidebar.module.css';
import SidebarIcon from '../../../assets/icons/SidebarIcon.svg';
import MyFolderIcon from '../../../assets/icons/MyFolderIcon.svg';
import AddProblemIcon from '../../../assets/icons/AddProblemIcon.svg';
import AddFolderIcon from '../../../assets/icons/AddFolderIcon.svg';
import AddFileIcon from '../../../assets/icons/AddFileIcon.svg';
import FolderIcon from '../../../assets/icons/FolderIcon.svg';
import FileIcon from '../../../assets/icons/FileIcon.svg';
import MoreIcon from '../../../assets/icons/MoreIcon.svg';
import WorkSpaceProblemModal from '../../../components/workspace/WorkSpaceProblemModal/WorkSpaceProblemModal';

const sortFileTree = (a, b) => {
  // 1. 타입 비교 (폴더 우선)
  if (a.type === 'FOLDER' && b.type === 'FILE') {
    return -1; // a(폴더)가 b(파일)보다 앞
  }
  if (a.type === 'FILE' && b.type === 'FOLDER') {
    return 1; // a(파일)가 b(폴더)보다 뒤
  }

  // 2. 타입이 같은 경우 : 이름을 기준으로 오름차순 정렬
  return a.name.localeCompare(b.name);
};

const ContextMenu = ({ item, onStartRename, onDelete, style }) => {
  const handleRenameClick = (e) => {
    e.stopPropagation(); // 이벤트 버블링 중단
    onStartRename();
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // 이벤트 버블링 중단
    if (window.confirm(`'${item.name}' 항목을 정말 삭제하시겠습니까?`)) {
      onDelete(item);
    }
  };

  return (
    <div
      className={styles.contextMenu}
      style={style}
      onClick={(e) => e.stopPropagation()}
    >
      <button onClick={handleRenameClick}>이름 변경</button>
      <button onClick={handleDeleteClick}>파일 삭제</button>
    </div>
  );
};

const FileTreeItem = ({
  item,
  onMenuClick,
  editingItemId,
  onSubmitRename,
  onCancelRename,
}) => {
  let currentBaseName = item.name;
  let currentExtension = '';

  if (item.type === 'FILE') {
    const lastDotIndex = item.name.lastIndexOf('.');
    if (lastDotIndex > 0) {
      currentBaseName = item.name.substring(0, lastDotIndex);
      currentExtension = item.name.substring(lastDotIndex);
    }
  }

  const isEditing = item.id === editingItemId; // 현재 아이템이 수정 중인지 확인
  const [tempName, setTempName] = useState(currentBaseName);
  const inputRef = useRef(null);

  // "..." 버튼 클릭 시 실행될 함수
  const handleMenuButtonClick = (e) => {
    e.stopPropagation(); // 이벤트 버블링 중단
    console.log('Clicked item info:', item);
    onMenuClick(item, e); // item 객체와 event 객체를 통째로 전달
  };

  useEffect(() => {
    if (isEditing) {
      setTempName(currentBaseName); // 수정 시작 시 이름을 현재 이름으로 리셋
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing, currentBaseName]);

  const handleInputChange = (e) => {
    setTempName(e.target.value);
  };

  const handleSubmit = (e) => {
    e?.stopPropagation();
    e?.preventDefault();

    const newBaseName = tempName.trim();
    const finalNewName = newBaseName + currentExtension;

    if (newBaseName && finalNewName !== item.name) {
      onSubmitRename(item.id, finalNewName); // 부모의 API 호출 함수 실행
    } else {
      onCancelRename(); // 이름이 비어있거나 변경되지 않았으면 취소
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      onCancelRename(); // 수정 취소
    }
  };

  const handleBlur = () => {
    handleSubmit(null); // 포커스 잃으면 제출
  };

  // 1. 아이템이 'FOLDER'일 경우
  if (item.type === 'FOLDER') {
    return (
      <li>
        {/* 폴더 아이템 렌더링 */}
        <div className={styles.itemNameWrapper}>
          <div className={styles.folderItem}>
            <img src={FolderIcon} alt='폴더' />
            {isEditing ? (
              <input
                ref={inputRef}
                type='text'
                value={tempName}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                onClick={(e) => e.stopPropagation()} // 클릭 전파 방지
                className={styles.renameInput} //
              />
            ) : (
              <span>{item.name}</span>
            )}
          </div>
          {!isEditing && (
            <button
              className={styles.menuButton}
              onClick={handleMenuButtonClick}
            >
              <img src={MoreIcon} alt='더보기' />
            </button>
          )}
        </div>
        {/* 자식(children)이 있으면 중첩 리스트(ul)를 렌더링 */}
        {item.children && item.children.length > 0 && (
          <ul className={styles.nestedList}>
            {/* 자식들을 순회하며 FileTreeItem 컴포넌트를 재귀적으로 호출 */}
            {item.children.map((child) => (
              <FileTreeItem
                key={child.id}
                item={child}
                onMenuClick={onMenuClick}
                editingItemId={editingItemId}
                onSubmitRename={onSubmitRename}
                onCancelRename={onCancelRename}
              />
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
            {isEditing ? (
              <input
                ref={inputRef}
                type='text'
                value={tempName}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                onClick={(e) => e.stopPropagation()} // 클릭 전파 방지
                className={styles.renameInput}
              />
            ) : (
              <span>{item.name}</span>
            )}
          </div>
          {!isEditing && (
            <button
              className={styles.menuButton}
              onClick={handleMenuButtonClick}
            >
              <img src={MoreIcon} alt='더보기' />
            </button>
          )}
        </div>
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [openMenuItem, setOpenMenuItem] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const scrollContainerRef = useRef(null);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    const fetchFileTree = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.get('/api/workspace/tree');
        const data = response.data || [];

        data.sort(sortFileTree);
        setFileTree(data);
      } catch (err) {
        console.error('Failed to fetch workspace tree:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFileTree();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSelectProblem = (problemData) => {
    // 1. fileTree 상태에 맞는 새 파일 객체 생성
    const newFile = {
      id: crypto.randomUUID(), // 임시 고유 ID 생성
      name: `${problemData.title}.${problemData.selectedLanguage}`, // 예: "문제제목.java"
      type: 'FILE',
      children: [], // 파일은 자식이 없음
    };

    // 2. fileTree 상태 업데이트 (새 파일을 목록 맨 위에 추가)
    setFileTree((prevTree) => {
      const newTree = [...prevTree, newFile];
      newTree.sort(sortFileTree);
      return newTree;
    });

    // 3. 모달 닫기
    handleCloseModal();
  };

  useEffect(() => {
    // 메뉴가 열려있을 때만 "바깥 클릭" 리스너를 추가
    const handleClickOutside = () => {
      setOpenMenuItem(null);
      setMenuPosition(null);
    };

    const handleScroll = () => {
      setOpenMenuItem(null);
      setMenuPosition(null);
      setEditingItemId(null);
    };

    const scrollableContainer = scrollContainerRef.current;

    if (openMenuItem || editingItemId) {
      document.addEventListener('click', handleClickOutside);
    }

    if (scrollableContainer) {
      scrollableContainer.addEventListener('scroll', handleScroll);
      if (openMenuItem || editingItemId) {
        scrollableContainer.style.overflowY = 'hidden';
      } else {
        scrollableContainer.style.overflowY = 'auto';
      }
    }

    // cleanup 함수
    // 컴포넌트가 unmount되거나 openMenuId가 바뀌기 전에 기존 리스너를 반드시 제거!
    return () => {
      document.removeEventListener('click', handleClickOutside);

      if (scrollableContainer) {
        scrollableContainer.removeEventListener('scroll', handleScroll);
        scrollableContainer.style.overflowY = 'auto';
      }
    };
  }, [openMenuItem, editingItemId]); // openMenuId가 변경될 때마다 이 effect가 재실행됨

  const handleMenuClick = (item, event) => {
    // 클릭 이벤트가 document까지 전파되어 handleClickOutside가 즉시 실행되는 것을 막음
    event.stopPropagation();
    setEditingItemId(null);

    // 이미 열린 메뉴의 버튼을 다시 클릭한 경우 (메뉴 닫기)
    if (openMenuItem && openMenuItem.id === item.id) {
      setOpenMenuItem(null);
      setMenuPosition(null);
    } else {
      // 새 메뉴 열기
      const rect = event.currentTarget.getBoundingClientRect(); // 버튼의 위치 정보
      setOpenMenuItem(item);
      setMenuPosition({
        top: rect.bottom - 5,
        left: rect.right - 25,
      });
    }
  };

  /* (재귀) 트리에서 특정 id를 가진 아이템을 삭제하는 함수 */
  const removeItemFromTree = (tree, idToRemove) => {
    // 1. 현재 깊이(tree)에서 id가 일치하는 아이템을 filter
    return tree
      .filter((item) => item.id !== idToRemove)
      .map((item) => {
        // 2. 만약 자식이 있으면, 자식 배열에 대해서도 재귀적으로 이 함수를 호출
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: removeItemFromTree(item.children, idToRemove),
          };
        }
        return item; // 자식이 없으면 그대로 반환
      });
  };

  /* (재귀) 트리에서 특정 id를 가진 아이템의 이름을 변경하는 함수 */
  const updateItemNameInTree = (tree, idToUpdate, newName) => {
    return tree.map((item) => {
      // 1. 현재 아이템 id가 일치하면, 이름을 새 이름으로 교체
      if (item.id === idToUpdate) {
        return { ...item, name: newName };
      }
      // 2. 일치하지 않고 자식이 있다면, 자식 배열에 대해 재귀 호출
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: updateItemNameInTree(item.children, idToUpdate, newName),
        };
      }
      return item; // 일치하지도 않고 자식도 없으면 그대로 반환
    });
  };

  /* 파일/폴더 삭제 핸들러 */
  const handleDelete = async (itemToDelete) => {
    setOpenMenuItem(null); // 메뉴 닫기
    setMenuPosition(null);

    const { id, type } = itemToDelete;

    try {
      // 1. API 호출 (DELETE)
      if (type === 'FOLDER') {
        // 1-1. 폴더 삭제 API
        await apiClient.delete(`/api/workspace/folders/${id}`);
      } else if (type === 'FILE') {
        // 1-2. 파일 삭제 API
        await apiClient.delete(`/api/solutions/${id}`);
      } else {
        // 예외 처리
        console.error('알 수 없는 타입입니다:', type);
        alert('삭제에 실패했습니다.');
        return;
      }
      setFileTree((prevTree) => removeItemFromTree(prevTree, id)); // 'id' 사용
      alert('삭제되었습니다.');
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  /* 파일/폴더 이름 변경 핸들러 */
  const handleRename = async (itemToRename, newName) => {
    setEditingItemId(null);

    const { id, type } = itemToRename;

    try {
      // 1. API 호출 (PATCH) - body에 { name: newName } 전송
      if (type === 'FOLDER') {
        // 1-1. 폴더 이름 변경 API (PATCH)
        await apiClient.patch(`/api/workspace/folders/${id}`, {
          name: newName,
        });
      } else if (type === 'FILE') {
        // 1-2. 파일 이름 변경 API (PATCH)
        await apiClient.patch(`/api/solutions/${id}`, { name: newName });
      } else {
        // 예외 처리
        console.error('알 수 없는 타입입니다:', type);
        alert('이름 변경에 실패했습니다.');
        return;
      }
      // 2. API 성공 시, React 상태(fileTree)를 재귀적으로 업데이트
      setFileTree((prevTree) => updateItemNameInTree(prevTree, id, newName));

      alert('이름이 변경되었습니다.');
    } catch (err) {
      console.error('Failed to rename item:', err);
      alert('이름 변경에 실패했습니다. 다시 시도해주세요.');
      setEditingItemId(null); // 실패 시에도 인풋 창 닫기
    }
  };

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

    return (
      <ul ref={scrollContainerRef} className={styles.fileListContainer}>
        {fileTree.map((rootItem, index) => (
          // React.Fragment를 사용해 key와divider 로직을 분리
          <React.Fragment key={rootItem.id}>
            <FileTreeItem
              item={rootItem}
              onMenuClick={handleMenuClick}
              editingItemId={editingItemId}
              onSubmitRename={handleRename}
              onCancelRename={() => setEditingItemId(null)}
            />
            {/* 최상위 아이템(폴더) 사이에만 구분선(divider) 추가 */}
            {rootItem.type === 'FOLDER' && index < fileTree.length - 1 && (
              <div className={styles.divider} />
            )}
          </React.Fragment>
        ))}
      </ul>
    );
  };

  return (
    <>
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
                <button
                  className={styles.addProblemButton}
                  onClick={handleOpenModal}
                >
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

        {openMenuItem && menuPosition && (
          <ContextMenu
            item={openMenuItem}
            onStartRename={() => {
              setEditingItemId(openMenuItem.id);
              setOpenMenuItem(null);
              setMenuPosition(null);
            }}
            onDelete={handleDelete}
            style={{
              position: 'fixed', // 뷰포트 기준
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              zIndex: 1001, // z-index를 sidebar(1000)보다 높게 설정
            }}
          />
        )}

        <WorkSpaceProblemModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSelectProblem={handleSelectProblem}
        />
      </div>
    </>
  );
}

export default SolveSidebar;
