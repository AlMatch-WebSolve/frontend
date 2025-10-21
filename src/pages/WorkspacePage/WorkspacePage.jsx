import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkSpaceProblemModal from '../../components/workspace/WorkSpaceProblemModal/WorkSpaceProblemModal.jsx';
import WorkSpaceProblemList from '../../components/workspace/WorkSpaceProblemList/WorkSpaceProblemList.jsx';
import WorkSpaceFolderItem from '../../components/workspace/WorkSpaceFolderItem/WorkSpaceFolderItem.jsx';
import '../../styles/global.css';
import styles from './WorkspacePage.module.css';
import apiClient from '../../api/apiClient.js';

function WorkspacePage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [folders, setFolders] = useState([]);
  const [problems, setProblems] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 작업 공간 트리 구조 가져오는 함수
  const getWorkspaceTree = async () => {
    const response = await apiClient.get('/api/workspace/tree');
    return response.data;
  };

  useEffect(() => {
    const fetchWorkspaceData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getWorkspaceTree();
  
        // API 응답 데이터를 폴더와 문제 배열로 분리
        const newFolders = [];
        const newProblems = [];
  
        if (Array.isArray(data)) {
          data.forEach(item => {
            if (item.type === 'FOLDER') {
              newFolders.push({
                id: item.id,
                name: item.name,
                parentId: item.parentId || null,
                order: item.order || 0,
              });
            } else {
              newProblems.push({
                id: item.id,
                title: item.name,
                folderId: item.parentId || null,
                problemId: item.problemId || null,
                solutionId: item.id,
                selectedLanguage: item.language || 'java',
                order: item.order || 0,
              });
            }
          });
        }
  
        setFolders(newFolders);
        setProblems(newProblems);
  
      } catch (e) {
        setError('작업 공간 데이터를 불러오는데 실패했습니다.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
  
    fetchWorkspaceData();
  }, []);  

  // 파일명 변경/삭제 핸들러
  const handleSolutionRename = (uiId, newName) => {
    const name = (newName ?? '').trim();
    if (!name) return;
    setProblems(prev =>
      prev.map(p => (p.id === uiId ? { ...p, title: name } : p))
    );
  };

  const handleDeleteSolution = (uiId) => {
    setProblems(prev => prev.filter(p => p.id !== uiId));
  };

  const [dragOverFolderId, setDragOverFolderId] = useState(null);
  const [hoverDropIndex, setHoverDropIndex] = useState(null);
  const [dragMeta, setDragMeta] = useState(null);

  const DRAG_MIME = 'application/json';

  const folderMap = useMemo(() => {
    const m = new Map();
    folders.forEach(f => m.set(f.id, f));
    return m;
  }, [folders]);

  const getFolderDepth = (folderId) => {
    let d = 0;
    let cur = folderMap.get(folderId) || null;
    while (cur && cur.parentId) {
      d += 1;
      cur = folderMap.get(cur.parentId) || null;
    }
    return d;
  };
  const getProblemDepth = (p) => (p.folderId ? getFolderDepth(p.folderId) + 1 : 0);

  // 통합 리스트: order 기준
  const unified = useMemo(() => {
    const all = [
      ...folders.map(f => ({ ...f, _kind: 'folder' })),
      ...problems.map(p => ({ ...p, _kind: 'problem' })),
    ];
    return all.sort((a, b) => (a.order ?? a.createdAt ?? 0) - (b.order ?? b.createdAt ?? 0));
  }, [folders, problems]);

  // 드롭존 컨텍스트(parent)를 미리 계산
  const dropContexts = useMemo(() => {
    const ctx = new Array(unified.length + 1).fill(null);
    for (let i = 0; i <= unified.length; i++) {
      if (i === unified.length) {
        if (unified.length === 0) ctx[i] = { parentId: null };
        else {
          const last = unified[unified.length - 1];
          ctx[i] = { parentId: last._kind === 'folder' ? last.parentId ?? null : last.folderId ?? null };
        }
      } else {
        const next = unified[i];
        ctx[i] = { parentId: next._kind === 'folder' ? next.parentId ?? null : next.folderId ?? null };
      }
    }
    return ctx; // { parentId }
  }, [unified]);

  // 조상-자손 체크(폴더 기준)
  const isAncestorFolder = (ancestorId, folderId) => {
    if (!ancestorId || !folderId) return false;
    let cur = folderMap.get(folderId)?.parentId ?? null;
    while (cur) {
      if (cur === ancestorId) return true;
      cur = folderMap.get(cur)?.parentId ?? null;
    }
    return false;
  };

  // 아이템이 특정 폴더의 자손인가 (폴더/파일 모두)
  const isDescendantOfFolder = (item, folderId) => {
    if (!folderId) return false;
    let parent = item._kind === 'folder' ? item.parentId : item.folderId;
    while (parent) {
      if (parent === folderId) return true;
      parent = folderMap.get(parent)?.parentId ?? null;
    }
    return false;
  };

  // 폴더의 서브트리 블록 인덱스 범위 수집 (통합 리스트 기준, 연속 블록)
  const collectSubtreeRange = (items, folderId) => {
    const start = items.findIndex(x => x._kind === 'folder' && x.id === folderId);
    if (start < 0) return null;
    let end = start;
    for (let i = start + 1; i < items.length; i++) {
      if (isDescendantOfFolder(items[i], folderId)) {
        end = i;
      } else {
        break;
      }
    }
    return { start, end };
  };

  // 순서 재부여 
  const reassignOrder = (items) => items.map((it, idx) => ({ ...it, order: idx }));

  // 공통: 드래그 시작
  const handleDragStart = (type, id, e) => {
    const payload = { type, id };
    setDragMeta(payload);
    e.dataTransfer.setData(DRAG_MIME, JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
  };

  const findUnifiedIndex = (type, id) =>
    unified.findIndex(x => x._kind === type && x.id === id);

  // 사이 드롭존: 재정렬 + 부모 지정(컨텍스트)
  const handleDragOverDropZone = (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    setHoverDropIndex(index);
  };
  const handleDragLeaveDropZone = (index) => {
    setHoverDropIndex(prev => (prev === index ? null : prev));
  };
  const handleDropOnDropZone = (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    setHoverDropIndex(null);

    const raw = e.dataTransfer.getData(DRAG_MIME);
    const payload = raw ? JSON.parse(raw) : dragMeta;
    if (!payload) return;

    const ctxParentId = dropContexts[index]?.parentId ?? null; // 폴더 id 또는 null(루트)
    const curIdx = findUnifiedIndex(payload.type, payload.id);
    if (curIdx < 0) return;

    // 이동 소스가 폴더면 서브트리 블록 전체 이동
    let items = unified.slice();
    let movingBlock = null;

    if (payload.type === 'folder') {
      const range = collectSubtreeRange(items, payload.id);
      if (!range) return;
      movingBlock = items.slice(range.start, range.end + 1);
      items.splice(range.start, range.end - range.start + 1);
      // 드롭존 인덱스 보정 (앞에서 잘라내면 뒤쪽 인덱스가 줄어듦)
      const target = index > range.start ? index - (range.end - range.start + 1) : index;

      // 폴더 부모 바꾸기 (블록의 첫 아이템이 폴더 자신)
      movingBlock = movingBlock.map((it, i) =>
        i === 0 ? { ...it, parentId: ctxParentId } : it
      );

      // 파일 아래 파일 금지
      const next = [...items.slice(0, target), ...movingBlock, ...items.slice(target)];
      const withOrder = reassignOrder(next);

      setFolders(withOrder.filter(x => x._kind === 'folder').map(({ _kind, ...r }) => r));
      setProblems(withOrder.filter(x => x._kind === 'problem').map(({ _kind, ...r }) => r));
      return;
    }

    // 문제(파일)인 경우: 단일 이동
    const moving = items[curIdx];
    items.splice(curIdx, 1);
    const target = index > curIdx ? index - 1 : index;

    // 파일 아래 파일 금지: 컨텍스트 부모는 폴더 또는 루트(null)만 허용
    const next = [
      ...items.slice(0, target),
      { ...moving, folderId: ctxParentId },
      ...items.slice(target),
    ];
    const withOrder = reassignOrder(next);
    setFolders(withOrder.filter(x => x._kind === 'folder').map(({ _kind, ...r }) => r));
    setProblems(withOrder.filter(x => x._kind === 'problem').map(({ _kind, ...r }) => r));
  };

  const renderDropZone = (index) => (
    <li
      key={`drop-${index}`}
      className={`${styles.dropZone} ${hoverDropIndex === index ? styles.dropZoneActive : ''}`}
      onDragOver={(e) => handleDragOverDropZone(index, e)}
      onDragLeave={() => handleDragLeaveDropZone(index)}
      onDrop={(e) => handleDropOnDropZone(index, e)}
    />
  );

  // 폴더 위로 드롭: 그 폴더의 첫 자식으로 넣기 (바로 아래)
  const handleDragOverFolder = (targetFolderId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const raw = e.dataTransfer.getData(DRAG_MIME);
      if (!raw) { setDragOverFolderId(targetFolderId); return; }
      const { type, id } = JSON.parse(raw) || {};
      if (type === 'folder') {
        if (id === targetFolderId) return;
        if (isAncestorFolder(id, targetFolderId)) return;
      }
      setDragOverFolderId(targetFolderId);
    } catch {
      setDragOverFolderId(targetFolderId);
    }
  };
  const handleDragLeaveFolder = (targetFolderId, e) => {
    e.stopPropagation();
    setDragOverFolderId(prev => (prev === targetFolderId ? null : prev));
  };
  const handleDropOnFolder = (targetFolderId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);

    const raw = e.dataTransfer.getData(DRAG_MIME);
    const payload = raw ? JSON.parse(raw) : dragMeta;
    if (!payload) return;

    // 타깃 폴더의 바로 아래 위치 산정
    let items = unified.slice();
    const folderIdx = items.findIndex(x => x._kind === 'folder' && x.id === targetFolderId);
    if (folderIdx < 0) return;
    let insertPos = folderIdx + 1; // 첫 자식으로

    if (payload.type === 'folder') {
      if (payload.id === targetFolderId) return;
      if (isAncestorFolder(payload.id, targetFolderId)) return;

      const range = collectSubtreeRange(items, payload.id);
      if (!range) return;

      const block = items.slice(range.start, range.end + 1);
      items.splice(range.start, range.end - range.start + 1);

      // 잘라낸 위치보다 앞에서 잘랐으면 insertPos 보정
      if (range.start < insertPos) insertPos -= (range.end - range.start + 1);

      // 폴더 자신만 부모 변경
      block[0] = { ...block[0], parentId: targetFolderId };

      const next = [...items.slice(0, insertPos), ...block, ...items.slice(insertPos)];
      const withOrder = reassignOrder(next);
      setFolders(withOrder.filter(x => x._kind === 'folder').map(({ _kind, ...r }) => r));
      setProblems(withOrder.filter(x => x._kind === 'problem').map(({ _kind, ...r }) => r));
      return;
    }

    // 파일이면 단일 이동
    const curIdx = items.findIndex(x => x._kind === 'problem' && x.id === payload.id);
    if (curIdx < 0) return;
    const moving = items[curIdx];
    items.splice(curIdx, 1);
    if (curIdx < insertPos) insertPos -= 1;

    const next = [
      ...items.slice(0, insertPos),
      { ...moving, folderId: targetFolderId },
      ...items.slice(insertPos),
    ];
    const withOrder = reassignOrder(next);
    setFolders(withOrder.filter(x => x._kind === 'folder').map(({ _kind, ...r }) => r));
    setProblems(withOrder.filter(x => x._kind === 'problem').map(({ _kind, ...r }) => r));
  };

  // 루트 배경에 드롭: 루트로 빼기
  const handleListDragOver = (e) => e.preventDefault();
  const handleListDropToRoot = (e) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData(DRAG_MIME);
    const payload = raw ? JSON.parse(raw) : dragMeta;
    if (!payload) return;

    let items = unified.slice();

    if (payload.type === 'folder') {
      const range = collectSubtreeRange(items, payload.id);
      if (!range) return;
      const block = items.slice(range.start, range.end + 1);
      items.splice(range.start, range.end - range.start + 1);
      block[0] = { ...block[0], parentId: null };
      const next = [...items, ...block];
      const withOrder = reassignOrder(next);
      setFolders(withOrder.filter(x => x._kind === 'folder').map(({ _kind, ...r }) => r));
      setProblems(withOrder.filter(x => x._kind === 'problem').map(({ _kind, ...r }) => r));
      return;
    }

    const idx = items.findIndex(x => x._kind === 'problem' && x.id === payload.id);
    if (idx < 0) return;
    const moving = items[idx];
    items.splice(idx, 1);
    const next = [...items, { ...moving, folderId: null }];
    const withOrder = reassignOrder(next);
    setFolders(withOrder.filter(x => x._kind === 'folder').map(({ _kind, ...r }) => r));
    setProblems(withOrder.filter(x => x._kind === 'problem').map(({ _kind, ...r }) => r));
  };

  // 새 폴더/문제 생성 (맨 아래로 append)
  const nextOrder = unified.length;
  const handleNewFolder = async () => {
    let parentId = selectedFolderId ?? null;
    const parent = parentId ? folderMap.get(parentId) : null;

    if (!parentId || String(parentId).startsWith('temp-') || parent?._pending) {
      parentId = null; // 서버에 임시/미확정 폴더를 부모로 보내지 않음
    }

    const tempId = `temp-${Date.now()}`;
    const now = Date.now();

    setFolders(prev => [
      ...prev,
      {
        id: tempId,
        name: '새 폴더',
        parentId,
        isEditing: true,
        _pending: true,
        createdAt: now,
        order: nextOrder,
      },
    ]);

    try {
      // parentId가 있을 때만 body에 포함 (null 보내지 않기)
      const body = parentId ? { name: '새 폴더', parentId } : { name: '새 폴더' };

      const res = await apiClient.post('/api/workspace/folders', body);
      if (res.status < 200 || res.status >= 300) {
        throw new Error(`폴더 생성 실패 (status: ${res.status})`);
      }

      const data = res.data;
      const serverId =
        data?.id ?? data?.folderId ?? data?.data?.id ?? data?.result?.id ?? null;

      setFolders(prev =>
        prev.map(f =>
          f.id === tempId ? { ...f, id: serverId || tempId, _pending: false } : f
        )
      );
    } catch (e) {
      // 서버 500일 때 원인 보려고 로그 남기기
      console.error('Create folder error:', e?.response?.data || e);
      // 롤백
      setFolders(prev => prev.filter(f => f.id !== tempId));
      alert(e?.response?.data?.message || e?.message || '폴더 생성에 실패했습니다.');
    }
  };


  const handleFolderNameConfirm = async (folderId, newName) => {
    const f = folders.find(x => x.id === folderId);
    if (!f) return;
    const name = newName && newName.trim() ? newName.trim() : '새 폴더';
    const isTemp = !folderId || String(folderId).startsWith('temp-');

    if (f._pending || isTemp) {
      setFolders(prev => prev.map(x => (x.id === folderId ? { ...x, name, isEditing: false } : x)));
      return;
    }
    try {
      const res = await apiClient.patch(`/api/workspace/folders/${folderId}`, { name });
      if (res.status < 200 || res.status >= 300) throw new Error(`폴더 이름 변경 실패 (status: ${res.status})`);
      setFolders(prev => prev.map(x => (x.id === folderId ? { ...x, name, isEditing: false } : x)));
    } catch (e) {
      setFolders(prev => prev.map(x => (x.id === folderId ? { ...x, name, isEditing: false } : x)));
      alert(e?.response?.data?.message || e?.message || '폴더 이름 수정에 실패했습니다.');
    }
  };

  const handleDeleteFolder = async (folderId) => {
    try {
      if (!folderId) return;
      const f = folders.find(x => x.id === folderId);
      if (String(folderId).startsWith('temp-') || f?._pending) {
        setFolders(prev => prev.filter(x => x.id !== folderId));
        if (selectedFolderId === folderId) setSelectedFolderId(null);
        return;
      }
      const res = await apiClient.delete(`/api/workspace/folders/${folderId}`);
      if (res.status < 200 || res.status >= 300) throw new Error(`폴더 삭제 실패 (status: ${res.status})`);
      // 폴더 삭제 시 그 하위 트리(폴더/파일)도 같이 제거하려면 여기서 필터링 추가 가능
      setFolders(prev => prev.filter(x => x.id !== folderId));
      if (selectedFolderId === folderId) setSelectedFolderId(null);
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || '폴더 삭제에 실패했습니다.');
    }
  };

  const handleNewProblem = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleSelectProblem = async (problem) => {
    const rawProblemId = problem.id ?? problem.problemId ?? problem.no;
    const problemId = Number(rawProblemId);
    if (!Number.isFinite(problemId)) {
      console.error('문제 ID 추출 실패:', problem);
      alert('문제 ID를 찾을 수 없습니다.');
      return;
    }
    const now = Date.now();
    const uiId = `temp-sol-${now}-${Math.random().toString(36).slice(2, 9)}`;
    const folderId = selectedFolderId ?? null;
    const selectedLanguage = problem.selectedLanguage || 'java';

    setProblems(prev => [
      ...prev,
      {
        id: uiId,                 // UI key
        solutionId: null,         // 서버 id 아직 없음
        problemId,                // 올바른 문제 ID 저장
        title: problem.title || `문제 ${problem.id}`,
        folderId,
        isEditing: true,
        createdAt: now,
        order: unified.length,
        selectedLanguage,
      },
    ]);
    setIsModalOpen(false);

    // 서버에 솔루션 생성
    try {
      const f = folderId != null ? folderMap.get(folderId) : null;
      const isTemp = folderId != null && String(folderId).startsWith('temp-');
      const isPending = f?._pending === true;
      const safeBody = (!folderId || isTemp || isPending)
        ? { problemId }
        : { problemId, folderId };

      const res = await apiClient.post('/api/solutions', safeBody);
      if (res.status !== 201) throw new Error(`솔루션 생성 실패 (status: ${res.status})`);
      const data = res.data || {};
      let serverSolutionId = data.solutionId ?? null;
      const serverFileName = data.fileName ?? null;
      if (!serverSolutionId && res.headers?.location) {
        const m = String(res.headers.location).match(/\/api\/solutions\/(\d+)$/);
        if (m) serverSolutionId = Number(m[1]);
      }

      // solutionId 갱신
      setProblems(prev =>
        prev.map(p =>
          p.id === uiId
            ? {
              ...p,
              solutionId: serverSolutionId ?? null,
              title: serverFileName || p.title,
            }
            : p
        )
      );
    } catch (e) {
      console.error('Create solution error:', e?.response?.data || e);
      // 실패 시 롤백
      setProblems(prev => prev.filter(p => p.id !== uiId));
      alert(e?.response?.data?.message || e?.message || '파일 생성에 실패했습니다.');
    }
  };

  return (
    <div className={styles.workSpaceBackground}>
      <div className={styles.workSpaceContainer}>
        <div className={styles.workSpaceButtonsHeaderContainer}>
          <span className={styles.workSpaceButtonsRecent}>최근 항목</span>
          <div className={styles.workSpaceButtons}>
            <button className={styles.workSpaceButtonsNewfolder} onClick={() => setSelectedFolderId(null) || handleNewFolder()}>
              새 폴더
            </button>
            <button className={styles.workSpaceButtonsNewproblem} onClick={handleNewProblem}>
              문제 생성
            </button>
          </div>
        </div>
        <hr className={styles.workSpaceButtonsUnderline} />
  
        {/* 1. 로딩 중일 때 메시지 */}
        {loading && <div className={styles.loadingMessage || styles.workSpaceBox}>작업 공간을 불러오는 중...</div>}
        
        {/* 2. 에러 발생 시 메시지 */}
        {error && <div className={styles.errorMessage || styles.workSpaceBox}>{error}</div>}
        
        {/* 3. 로딩도 아니고 에러도 아닐 때, 실제 내용 표시 */}
        {!loading && !error && (
          <> {/* 여러 요소를 반환하기 위해 Fragment 사용 */}
            {unified.length > 0 ? (
              <ul className={styles.folderList} onDragOver={handleListDragOver} onDrop={handleListDropToRoot}>
                {renderDropZone(0)}
                {unified.map((item, index) => {
                  const depth = item._kind === 'folder' ? getFolderDepth(item.id) : getProblemDepth(item);
  
                  if (item._kind === 'folder') {
                    return (
                      <React.Fragment key={`row-folder-${item.id}`}>
                        <li
                          className={`${styles.row} ${item.id === dragOverFolderId ? styles.dragOver : ''}`}
                          draggable
                          onDragStart={(e) => handleDragStart('folder', item.id, e)}
                          onDragOver={(e) => handleDragOverFolder(item.id, e)}
                          onDragLeave={(e) => handleDragLeaveFolder(item.id, e)}
                          onDrop={(e) => handleDropOnFolder(item.id, e)}
                        >
                          {/* 줄은 li.row::after가, 들여쓰기는 안쪽에서만 */}
                          <div className={styles.rowContent}>
                            <div
                              className={styles.indented}
                              style={{ '--depth': String(depth) }}
                              onClick={() => setSelectedFolderId(item.id)}
                            >
                              <WorkSpaceFolderItem
                                id={item.id}
                                initialName={item.name}
                                isInitialEditing={item.isEditing}
                                pending={item._pending}
                                onNameConfirm={(newName) => handleFolderNameConfirm(item.id, newName)}
                                onDelete={() => handleDeleteFolder(item.id)}
                                onFolderClick={setSelectedFolderId}
                              />
                            </div>
                          </div>
                        </li>
                        {renderDropZone(index + 1)}
                      </React.Fragment>
                    );
                  }
  
                  return (
                    <React.Fragment key={`row-problem-${item.id}`}>
                      <li
                        className={styles.row}
                        draggable
                        onDragStart={(e) => handleDragStart('problem', item.id, e)}
                      >
                        <div className={styles.rowContent}>
                          <div className={styles.indented} style={{ '--depth': String(depth) }}>
                            <WorkSpaceProblemList
                              id={item.id}
                              problemId={item.problemId}
                              solutionId={item.solutionId}
                              initialTitle={item.title}
                              selectedLanguage={item.selectedLanguage}
                              isInitialEditing={item.isEditing}
                              onFileNameConfirm={(name) => handleSolutionRename(item.id, name)}
                              onDelete={() => handleDeleteSolution(item.id)}
                              onDoubleClick={() => {
                                if (!item.problemId) return;
                                navigate(`/solve/${item.problemId}`, {
                                  state: { solutionId: item.solutionId ?? null }
                                });
                              }}
                            />
                          </div>
                        </div>
                      </li>
                      {renderDropZone(index + 1)}
                    </React.Fragment>
                  );
                })}
              </ul>
            ) : (
              <div className={styles.workSpaceBox}>
                <div className={styles.workSpaceBoxContext}>새 폴더나 문제를 생성해주세요.</div>
              </div>
            )}
          </>
        )}
  
        <WorkSpaceProblemModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSelectProblem={handleSelectProblem}
        />
      </div>
    </div>
  );
}

export default WorkspacePage;