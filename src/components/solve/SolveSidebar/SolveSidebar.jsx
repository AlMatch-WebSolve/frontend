import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import ArrowRightIcon from '../../../assets/icons/ArrowRightIcon.svg';
import ArrowDownIcon from '../../../assets/icons/ArrowDownIcon.svg';
import WorkSpaceProblemModal from '../../../components/workspace/WorkSpaceProblemModal/WorkSpaceProblemModal';
import { useNavigate } from 'react-router-dom';

// name이 null/undefined일 경우를 대비한 방어 코드
const sortFileTree = (a, b) => {
  if (a.type === 'FOLDER' && b.type === 'FILE') {
    return -1;
  }
  if (a.type === 'FILE' && b.type === 'FOLDER') {
    return 1;
  }
  const nameA = a.name || '';
  const nameB = b.name || '';
  return nameA.localeCompare(nameB);
};

// [수정됨] '새 폴더', '새 파일' 기능 추가
const ContextMenu = ({
  item,
  onStartRename,
  onDelete,
  onAddNewFolder,
  onAddNewFile,
  style,
}) => {
  const handleRenameClick = (e) => {
    e.stopPropagation();
    onStartRename(); // 'prompt' 대신 부모의 rename 시작 함수 호출
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm(`'${item.name}' 항목을 정말 삭제하시겠습니까?`)) {
      onDelete(item); // 'id' 대신 'item' 객체 전체 전달
    }
  };

  // '새 폴더' 클릭
  const handleNewFolderClick = (e) => {
    e.stopPropagation();
    onAddNewFolder(item.id); // 부모 폴더 ID 전달
  };

  // '새 파일' 클릭
  const handleNewFileClick = (e) => {
    e.stopPropagation();
    onAddNewFile(item.id); // 부모 폴더 ID 전달
  };

  return (
    <div
      className={styles.contextMenu}
      style={style}
      onClick={(e) => e.stopPropagation()}
    >
      {/* [신규] 폴더일 때만 '새로 만들기' 메뉴 표시 */}
      {item.type === 'FOLDER' && (
        <>
          <button onClick={handleNewFolderClick}>새 폴더</button>
          <button onClick={handleNewFileClick}>새 파일</button>
          {/* <div className={styles.divider} /> */}
        </>
      )}
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
  onSubmitCreate,
  collapsedFolders,
  onToggleCollapse,
}) => {
  const navigate = useNavigate();

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (item.type === 'FILE' && item.id) {
      // solutionId 기반 페이지 이동
      navigate(`/solve/${item.id}`);
    }
  };

  let currentBaseName = item.name;
  let currentExtension = '';

  // 'isNew'가 아닐 때만 확장자 분리
  if (item.type === 'FILE' && !item.isNew) {
    const lastDotIndex = item.name.lastIndexOf('.');
    if (lastDotIndex > 0) {
      currentBaseName = item.name.substring(0, lastDotIndex);
      currentExtension = item.name.substring(lastDotIndex);
    }
  }

  const isEditing = item.id === editingItemId;
  const [tempName, setTempName] = useState(currentBaseName);
  const inputRef = useRef(null);
  const isSubmitting = useRef(false);

  const isCollapsed = collapsedFolders.has(item.id);

  const handleMenuButtonClick = (e) => {
    e.stopPropagation();
    console.log('Clicked item info:', item);
    onMenuClick(item, e);
  };

  // 'isNew' 상태 및 'item.name' (e.g. '새 폴더') 반영
  useEffect(() => {
    if (isEditing) {
      let nameToEdit;
      if (item.isNew) {
        nameToEdit = item.name; // '새 폴더'
      } else {
        nameToEdit = currentBaseName; // '파일명' (확장자 제외)
      }
      setTempName(nameToEdit);
      inputRef.current?.focus();
      inputRef.current?.select();
      isSubmitting.current = false;
    }
  }, [isEditing, currentBaseName, item.isNew, item.name]);

  const handleInputChange = (e) => {
    setTempName(e.target.value);
  };

  // 'isNew' 플래그에 따라 생성/수정 분기
  const handleSubmit = (e) => {
    e?.stopPropagation();
    e?.preventDefault();

    if (isSubmitting.current) {
      return; // 이미 제출 중이면 무시
    }
    isSubmitting.current = true;

    const newBaseName = tempName.trim();
    // 폴더는 확장자 안 붙임
    const finalNewName =
      item.type === 'FOLDER' ? newBaseName : newBaseName + currentExtension;

    if (newBaseName) {
      if (item.isNew) {
        // [신규] 생성 API 호출
        onSubmitCreate(item, finalNewName);
      } else if (finalNewName !== item.name) {
        // [수정됨] item 객체 전체 전달
        onSubmitRename(item, finalNewName);
      } else {
        onCancelRename();
      }
    } else {
      onCancelRename(); // 이름이 비어있으면 취소
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      onCancelRename(); // 수정 취소
    }
  };

  // 새 항목 생성 중(이름이 비어있으면) 블러 시 취소
  const handleBlur = () => {
    if (item.isNew && tempName.trim() === '') {
      onCancelRename();
    } else {
      handleSubmit(null);
    }
  };

  // 1. 아이템이 'FOLDER'일 경우
  if (item.type === 'FOLDER') {
    const handleToggleClick = (e) => {
      e.stopPropagation(); // 상위 div의 클릭 이벤트 방지
      onToggleCollapse(item.id);
    };

    return (
      <li>
        <div className={styles.itemNameWrapper}>
          <div className={styles.folderItem}>
            <button
              onClick={handleToggleClick}
              className={styles.collapseButton} // 새 CSS 클래스
            >
              <img
                src={isCollapsed ? ArrowRightIcon : ArrowDownIcon}
                alt={isCollapsed ? '펼치기' : '접기'}
              />
            </button>
            <img src={FolderIcon} alt='폴더' />
            {isEditing ? (
              <input
                ref={inputRef}
                type='text'
                value={tempName}
                placeholder='새 폴더'
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                onClick={(e) => e.stopPropagation()}
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
        {/* 자식 렌더링 */}
        {item.children && item.children.length > 0 && !isCollapsed && (
          <ul className={styles.nestedList}>
            {/* [수정됨] key 경고 수정 및 props 재귀 전달 */}
            {item.children.map((child, index) => (
              <FileTreeItem
                key={child.id || `child-${index}`}
                item={child}
                onMenuClick={onMenuClick}
                editingItemId={editingItemId}
                onSubmitRename={onSubmitRename}
                onCancelRename={onCancelRename}
                onSubmitCreate={onSubmitCreate}
                collapsedFolders={collapsedFolders}
                onToggleCollapse={onToggleCollapse}
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
        <div className={styles.itemNameWrapper}>
          <div className={styles.fileItem} onDoubleClick={handleDoubleClick}>
            <span className={styles.collapseIcon} />
            <img src={FileIcon} alt='파일' />
            {isEditing ? (
              <input
                ref={inputRef}
                type='text'
                value={tempName} // 확장자 제외된 이름
                placeholder='새 파일'
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                onClick={(e) => e.stopPropagation()}
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

  return null;
};

// 트리에 새 아이템을 끝에 추가 (WorkspacePage 로직)
const addItemToTree = (tree, parentId, itemToAdd) => {
  if (parentId === null) {
    return [...tree, itemToAdd].sort(sortFileTree);
  }
  return tree.map((item) => {
    if (item.id === parentId) {
      const newChildren = [...(item.children || []), itemToAdd].sort(
        sortFileTree,
      );
      return {
        ...item,
        children: newChildren,
      };
    }
    if (item.children) {
      return {
        ...item,
        children: addItemToTree(item.children, parentId, itemToAdd),
      };
    }
    return item;
  });
};

// 임시 아이템을 실제 아이템으로 교체하고 정렬 (WorkspacePage 로직)
const replaceItemInTree = (tree, tempId, realItem) => {
  return tree
    .map((item) => {
      if (item.id === tempId) {
        return realItem;
      }
      if (item.children) {
        return {
          ...item,
          children: replaceItemInTree(item.children, tempId, realItem),
        };
      }
      return item;
    })
    .sort(sortFileTree); // [수정됨] API 응답 후 정렬
};

// 생성 취소 시 임시 아이템 제거
const removeTemporaryItem = (tree, tempId) => {
  return tree
    .filter((item) => item.id !== tempId)
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: removeTemporaryItem(item.children, tempId),
        };
      }
      return item;
    });
};

// currentProblemId를 prop으로 받음
function SolveSidebar({ currentProblemId }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [fileTree, setFileTree] = useState([]);
  const [userLanguage, setUserLanguage] = useState('JAVA');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [openMenuItem, setOpenMenuItem] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [collapsedFolders, setCollapsedFolders] = useState(new Set());

  // 파일 생성 시 부모 폴더 ID 임시 저장
  const [createFileParentId, setCreateFileParentId] = useState(null);

  const scrollContainerRef = useRef(null);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleFolderCollapse = useCallback((folderId) => {
    setCollapsedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId); // 펼치기
      } else {
        next.add(folderId); // 접기
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const res = await apiClient.get('/api/users/me/settings');
        console.log('📡 /api/users/me 응답 데이터:', res.data);

        setUserLanguage(res.data?.language || 'JAVA');
      } catch (err) {
        console.error('언어 설정 불러오기 실패:', err);
      }
    };
    fetchUserPreferences();
  }, []);

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
    setCreateFileParentId(null); // 모달 닫을 때 부모 ID 초기화
  };

  // '문제 추가' (모달) API 호출 로직
  const handleSelectProblem = async (problemData) => {
    // 1. problemId 추출 (WorkspacePage 로직과 동일)
    const rawProblemId =
      problemData.id ?? problemData.problemId ?? problemData.no;
    const problemId = Number(rawProblemId);

    // problemId 유효성 검사
    if (!Number.isFinite(problemId)) {
      console.error('문제 ID 추출 실패:', problemData);
      alert('선택한 문제의 ID를 찾을 수 없습니다.');
      handleCloseModal(); // 모달 닫기
      return;
    }
    // 2. API 요청 body (folderId가 null이면 키 자체를 제거)
    try {
      const body = {
        problemId,
        folderId: createFileParentId,
      };
      const response = await apiClient.post('/api/solutions', body);

      // 3. 응답 ({ solutionId, fileName }) 처리
      const { solutionId, fileName } = response.data;
      const newFileItem = {
        id: solutionId,
        name: fileName,
        type: 'FILE',
        children: [],
      };

      // 4. 트리에 '끝에' 추가 (정렬은 addItemToTree가 안함)
      setFileTree((prevTree) =>
        addItemToTree(prevTree, createFileParentId, newFileItem),
      );
    } catch (err) {
      console.error('Failed to create file:', err);
      alert('파일 생성에 실패했습니다.');
    } finally {
      handleCloseModal();
    }
  };

  // 파일 추가 아이콘 클릭 핸들러
  const handleCreateFileFromCurrentProblem = async () => {
    if (!currentProblemId) {
      alert(
        '현재 열려있는 문제가 없습니다. 먼저 문제를 선택(혹은 추가)해주세요.',
      );
      return;
    }
    handleCancelCreate(editingItemId); // 다른 작업 취소

    try {
      // 1. API 호출 (루트(null)에 생성)
      const response = await apiClient.post('/api/solutions', {
        problemId: currentProblemId,
        folderId: null,
      });

      // 2. 응답 처리
      const { solutionId, fileName } = response.data;
      const newFileItem = {
        id: solutionId,
        name: fileName,
        type: 'FILE',
        children: [],
      };

      // 3. 트리에 끝에 추가
      setFileTree((prevTree) => addItemToTree(prevTree, null, newFileItem));
    } catch (err) {
      console.error('Failed to create file from current problem:', err);
      alert('파일 생성에 실패했습니다. 이미 추가된 문제일 수 있습니다.');
    }
  };

  // 바깥 클릭/스크롤 시 '생성 중'인 항목 취소
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuItem(null);
      setMenuPosition(null);
      if (editingItemId) {
        handleCancelCreate(editingItemId); // [수정됨]
      }
    };

    const handleScroll = () => {
      setOpenMenuItem(null);
      setMenuPosition(null);
      if (editingItemId) {
        handleCancelCreate(editingItemId); // [수정됨]
      }
    };

    const scrollableContainer = scrollContainerRef.current;

    if (openMenuItem || editingItemId) {
      document.addEventListener('click', handleClickOutside);
    }

    if (scrollableContainer) {
      scrollableContainer.addEventListener('scroll', handleScroll);
      // 스크롤 방지 로직 제거 (사용성 문제)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      if (scrollableContainer) {
        scrollableContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [openMenuItem, editingItemId]);

  // 메뉴 열기 전, '생성 중'인 항목 취소
  const handleMenuClick = (item, event) => {
    event.stopPropagation();
    handleCancelCreate(editingItemId);

    if (openMenuItem && openMenuItem.id === item.id) {
      setOpenMenuItem(null);
      setMenuPosition(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setOpenMenuItem(item);
      setMenuPosition({
        top: rect.bottom - 5,
        left: rect.right - 25,
      });
    }
  };

  /* (재귀) 삭제 함수 */
  const removeItemFromTree = (tree, idToRemove) => {
    return tree
      .filter((item) => item.id !== idToRemove)
      .map((item) => {
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: removeItemFromTree(item.children, idToRemove),
          };
        }
        return item;
      });
  };

  /* (재귀) 이름 변경 함수 */
  const updateItemNameInTree = (tree, idToUpdate, newName) => {
    return tree
      .map((item) => {
        if (item.id === idToUpdate) {
          return { ...item, name: newName };
        }
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: updateItemNameInTree(item.children, idToUpdate, newName),
          };
        }
        return item;
      })
      .sort(sortFileTree); // 이름 변경 후 정렬
  };

  /* 삭제 핸들러 */
  const handleDelete = async (itemToDelete) => {
    setOpenMenuItem(null);
    setMenuPosition(null);
    const { id, type } = itemToDelete;
    try {
      if (type === 'FOLDER') {
        await apiClient.delete(`/api/workspace/folders/${id}`);
      } else if (type === 'FILE') {
        await apiClient.delete(`/api/solutions/${id}`);
      } else {
        console.error('알 수 없는 타입입니다:', type);
        alert('삭제에 실패했습니다.');
        return;
      }
      setFileTree((prevTree) => removeItemFromTree(prevTree, id));
      alert('삭제되었습니다.');
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  /* 이름 변경 핸들러 */
  const handleRename = async (itemToRename, newName) => {
    const { id, type } = itemToRename;
    try {
      if (type === 'FOLDER') {
        await apiClient.patch(`/api/workspace/folders/${id}`, {
          name: newName,
        });
      } else if (type === 'FILE') {
        await apiClient.patch(`/api/solutions/${id}`, { name: newName });
      } else {
        console.error('알 수 없는 타입입니다:', type);
        alert('이름 변경에 실패했습니다.');
        return;
      }
      setFileTree((prevTree) => updateItemNameInTree(prevTree, id, newName));
      setTimeout(() => setEditingItemId(null), 0);
    } catch (err) {
      console.error('Failed to rename item:', err);
      alert('이름 변경에 실패했습니다. 다시 시도해주세요.');
      setTimeout(() => setEditingItemId(null), 0);
    }
  };

  // 생성 취소 핸들러
  const handleCancelCreate = (tempId) => {
    if (!tempId) return;
    setFileTree((prev) => removeTemporaryItem(prev, tempId));
    setEditingItemId(null);
  };

  // 새 폴더 생성 API 호출
  const handleCreateFolder = async (tempItem, newName) => {
    const { id: tempId, parentId } = tempItem;
    try {
      // 1. API 호출 (POST)하고 'response'를 받음
      const response = await apiClient.post('/api/workspace/folders', {
        name: newName,
        parentId: parentId, // null 또는 폴더 ID
      });
      // 2. [수정됨] WorkspacePage.jsx와 동일하게 서버 응답에서 ID 추출
      const serverId = Number(response.data?.id ?? response.data?.folderId);

      // 3. [수정됨] ID가 없다면 오류 처리
      if (!Number.isFinite(serverId)) {
        throw new Error('POST /folders 응답에서 새 폴더 ID를 받지 못했습니다.');
      }

      // 4. [신규] 응답받은 ID와 이름으로 '실제 폴더' 객체를 만듦
      const realFolder = {
        ...tempItem, // (type, children, parentId 등)
        id: serverId, // 임시 ID를 실제 ID로 교체
        name: response.data.name || newName, // 서버가 준 이름 사용
        isNew: false, // 더 이상 '새 항목'이 아님
      };

      // 5. 'replaceItemInTree'를 사용해 임시 폴더(tempId)를 실제 폴더(realFolder)로 교체
      setFileTree((prev) => replaceItemInTree(prev, tempId, realFolder));

      setTimeout(() => setEditingItemId(null), 0);
    } catch (err) {
      console.error('Failed to create folder:', err);
      alert('폴더 생성에 실패했습니다.');
      setTimeout(() => handleCancelCreate(tempId), 0);
    }
  };

  // FileTreeItem에서 호출할 생성 핸들러 (폴더 전용)
  const handleCreateItem = (tempItem, newName) => {
    if (tempItem.type === 'FOLDER') {
      handleCreateFolder(tempItem, newName);
    }
  };

  // '폴더 추가' (루트) 아이콘 클릭
  const handleAddNewFolderToRoot = () => {
    handleCancelCreate(editingItemId);
    const tempId = crypto.randomUUID();
    const newFolder = {
      id: tempId,
      name: '새 폴더',
      type: 'FOLDER',
      children: [],
      parentId: null,
      isNew: true, // 임시 항목 플래그
    };
    setFileTree((prev) => addItemToTree(prev, null, newFolder));
    setEditingItemId(tempId);
  };

  // '문제 추가' (루트) 버튼 클릭
  const handleOpenModalForRoot = () => {
    handleCancelCreate(editingItemId);
    setCreateFileParentId(null); // 부모 ID: 루트
    handleOpenModal();
  };

  // '새 폴더' (컨텍스트 메뉴) 클릭
  const handleAddNewFolderInParent = (parentId) => {
    handleCancelCreate(editingItemId);
    const tempId = crypto.randomUUID();
    const newFolder = {
      id: tempId,
      name: '새 폴더',
      type: 'FOLDER',
      children: [],
      parentId: parentId,
      isNew: true,
    };
    setFileTree((prev) => addItemToTree(prev, parentId, newFolder));
    setEditingItemId(tempId);
  };

  // '새 파일' (컨텍스트 메뉴) 클릭
  const handleAddNewFileInParent = (folderId) => {
    handleCancelCreate(editingItemId);
    setCreateFileParentId(folderId); // 부모 ID: 해당 폴더
    handleOpenModal();
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
    // [수정됨] 생성 중일 때는 "파일 없음" 숨기기
    if (fileTree.length === 0 && !editingItemId) {
      return <li>파일이 없습니다.</li>;
    }

    return (
      <ul ref={scrollContainerRef} className={styles.fileListContainer}>
        {fileTree.map((rootItem, index) => (
          <React.Fragment key={rootItem.id || `root-${index}`}>
            <FileTreeItem
              item={rootItem}
              onMenuClick={handleMenuClick}
              editingItemId={editingItemId}
              onSubmitRename={handleRename}
              onCancelRename={() => handleCancelCreate(rootItem.id)}
              onSubmitCreate={handleCreateItem}
              collapsedFolders={collapsedFolders}
              onToggleCollapse={toggleFolderCollapse}
            />
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
              className={styles.sideBarCollapseButton}
              title={isExpanded ? '사이드바 접기' : '사이드바 펼치기'}
              onClick={toggleSidebar}
            >
              <img src={SidebarIcon} alt='사이드바' />
            </button>
          </div>

          {isExpanded && (
            <>
              {/* 2. 문제 추가 버튼 [수정됨] onClick 핸들러 연결 */}
              <div className={styles.buttonContainer}>
                <button
                  className={styles.addProblemButton}
                  onClick={handleOpenModalForRoot}
                >
                  <img src={AddProblemIcon} alt='문제 추가'></img>
                  <span>문제 추가</span>
                </button>
                <div className={styles.iconButtonWrapper}>
                  <button
                    className={styles.iconButton}
                    onClick={handleAddNewFolderToRoot}
                  >
                    <img src={AddFolderIcon} alt='폴더 추가' />
                  </button>
                  <button
                    className={styles.iconButton}
                    onClick={handleCreateFileFromCurrentProblem}
                  >
                    <img src={AddFileIcon} alt='파일 추가' />
                  </button>
                </div>
              </div>
              {/* 3. 파일 목록 */}
              <ul className={styles.fileListContainer}>{renderFileList()}</ul>
            </>
          )}
        </div>

        {/* ContextMenu에 신규 props 전달 */}
        {openMenuItem && menuPosition && (
          <ContextMenu
            item={openMenuItem}
            onStartRename={() => {
              setEditingItemId(openMenuItem.id);
              setOpenMenuItem(null);
              setMenuPosition(null);
            }}
            onDelete={handleDelete}
            onAddNewFolder={handleAddNewFolderInParent}
            onAddNewFile={handleAddNewFileInParent}
            style={{
              position: 'fixed',
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              zIndex: 1001,
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
