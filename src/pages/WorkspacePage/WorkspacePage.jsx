import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import WorkSpaceProblemModal from '../../components/workspace/WorkSpaceProblemModal/WorkSpaceProblemModal.jsx';
import WorkSpaceProblemList from '../../components/workspace/WorkSpaceProblemList/WorkSpaceProblemList.jsx';
import WorkSpaceFolderItem from '../../components/workspace/WorkSpaceFolderItem/WorkSpaceFolderItem.jsx';
import '../../styles/global.css';
import styles from './WorkspacePage.module.css';
import apiClient from '../../api/apiClient.js';

function WorkspacePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [folders, setFolders] = useState([]);
  const [problems, setProblems] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [loading, setLoading] = useState(false);

  const toUnified = (foldersArg = folders, problemsArg = problems) => {
    const all = [
      ...foldersArg.map(f => ({ ...f, _kind: 'folder' })),
      ...problemsArg.map(p => ({ ...p, _kind: 'problem' })),
    ];
    return all.sort((a, b) => (a.order ?? a.createdAt ?? 0) - (b.order ?? b.createdAt ?? 0));
  };
  const unified = useMemo(() => toUnified(), [folders, problems]);

  const folderMap = useMemo(() => {
    const m = new Map();
    folders.forEach(f => m.set(f.id, f)); // id는 숫자만 사용
    return m;
  }, [folders]);

  const getFolderDepth = (folderId) => {
    let d = 0;
    let cur = folderMap.get(folderId) || null;
    while (cur && cur.parentId != null) {
      d += 1;
      cur = folderMap.get(cur.parentId) || null;
    }
    return d;
  };
  const getProblemDepth = (p) => (p.folderId != null ? getFolderDepth(p.folderId) + 1 : 0);

  const isDescendantOfFolder = (item, folderId) => {
    if (!folderId) return false;
    let parent = item._kind === 'folder' ? item.parentId : item.folderId;
    while (parent != null) {
      if (parent === folderId) return true;
      parent = folderMap.get(parent)?.parentId ?? null;
    }
    return false;
  };
  const isFolderDescendantId = (childFolderId, ancestorFolderId) => {
    if (!childFolderId || !ancestorFolderId) return false;
    let cur = folderMap.get(childFolderId)?.parentId ?? null;
    while (cur != null) {
      if (cur === ancestorFolderId) return true;
      cur = folderMap.get(cur)?.parentId ?? null;
    }
    return false;
  };

  // 트리
  const buildFlatFromTree = useCallback((nodes, parentId, accFolders, accProblems, orderRef) => {
    if (!Array.isArray(nodes)) return;

    for (const n of nodes) {
      if (n.type === 'FOLDER') {
        const id = Number(n.id);
        const parent = parentId != null ? Number(parentId) : null;

        accFolders.push({
          id,
          name: n.name,
          parentId: parent === 0 ? null : parent, // 만약 서버가 0을 보냈다면 null로 정규화
          isEditing: false,
          createdAt: orderRef.value,
          order: orderRef.value++,
        });

        buildFlatFromTree(n.children || [], id, accFolders, accProblems, orderRef);
      } else if (n.type === 'FILE') {
        const id = Number(n.id);
        const parent = parentId != null ? Number(parentId) : null;

        accProblems.push({
          id,                // UI key = 서버 파일 ID (숫자)
          solutionId: id,    // solve 라우팅에 사용 (숫자)
          problemId: n.problemId ?? null,
          title: n.name,
          folderId: parent === 0 ? null : parent, // 0 방어
          isEditing: false,
          createdAt: orderRef.value,
          order: orderRef.value++,
          selectedLanguage: n.language, // 서버가 주면 사용
        });
      }
    }
  }, []);

  // ---------- GET 경쟁 방지 ----------
  const inflightRef = useRef({ seq: 0, controller: null });

  const fetchTree = useCallback(async () => {
    inflightRef.current.controller?.abort?.(); // 동시 요청 취소
    const seq = ++inflightRef.current.seq;
    const controller = new AbortController();
    inflightRef.current.controller = controller;

    setLoading(true);
    try {
      const res = await apiClient.get('/api/workspace/tree', { signal: controller.signal });
      if (seq !== inflightRef.current.seq) return; // 뒤늦은 응답 무시

      const tree = res.data || [];
      const accFolders = [];
      const accProblems = [];
      const orderRef = { value: 0 };
      buildFlatFromTree(tree, null, accFolders, accProblems, orderRef);
      setFolders(accFolders);
      setProblems(accProblems);
    } catch (e) {
      // 취소는 정상 동작
      if (e.name !== 'CanceledError' && e.code !== 'ERR_CANCELED') {
        console.error('워크스페이스 트리 조회 실패:', e?.response?.data || e);
      }
    } finally {
      if (seq === inflightRef.current.seq) setLoading(false);
    }
  }, [buildFlatFromTree]);

  // 페이지 진입/재진입마다 항상 새로 불러오기
  useEffect(() => {
    setSelectedFolderId(null); // 루트 모드
    fetchTree();
  }, [fetchTree, location.key]);

  useEffect(() => {
    const onFocus = () => { if (!loading) fetchTree(); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchTree, loading]);

  const getErrMsg = (e, fallback) =>
    e?.response?.data?.message || e?.response?.data?.error || e?.message || fallback;

  const toNumericOrNullBody = (key, raw) => {
    const n = Number(raw);
    if (raw == null || !Number.isFinite(n)) return {};            // 루트: 키 생략
    return { [key]: n };                                          // 하위: 숫자만
  };

  // 파일 이름 변경 / 생성 
  const handleSolutionRename = (uiId, newName) => {
    const name = (newName ?? '').trim();
    if (!name) return;
    const target = problems.find(p => p.id === uiId);
    if (!target) return;

    setProblems(prev => prev.map(p => (p.id === uiId ? { ...p, title: name, isEditing: false } : p)));

    if (!target.solutionId) {
      (async () => {
        try {
          // 상위가 temp면 생성 차단
          const parentRaw = target.folderId ?? null;
          const parentNum = Number(parentRaw);
          if (parentRaw != null && !Number.isFinite(parentNum)) {
            alert('상위 폴더를 먼저 생성(이름 확정)해 주세요.');
            setProblems(prev => prev.map(p => p.id === uiId ? { ...p, isEditing: true } : p));
            return;
          }

          const body = {
            problemId: target.problemId,
            ...toNumericOrNullBody('folderId', parentRaw),
          };
          const res = await apiClient.post('/api/solutions', body);
          if (res.status !== 201) throw new Error('솔루션 생성 실패');

          const serverId = Number(res.data?.solutionId ?? res.data?.id);
          if (Number.isFinite(serverId)) {
            try {
              await apiClient.patch(`/api/solutions/${serverId}`, { name });
            } catch (e) {
              console.error('파일명 동기화 실패:', e?.response?.data || e);
              alert(getErrMsg(e, '파일 이름 동기화에 실패했습니다.'));
            }
            // 임시 id → 서버 id로 치환 (id와 solutionId 통일)
            setProblems(prev => prev.map(p =>
              p.id === uiId ? { ...p, id: serverId, solutionId: serverId, title: name } : p
            ));
          }
        } catch (e) {
          console.error('파일 생성 실패:', e?.response?.data || e);
          alert(getErrMsg(e, '파일 생성에 실패했습니다.'));
          // 실패 시 드래프트 제거
          setProblems(prev => prev.filter(p => p.id !== uiId));
        }
      })();
      return;
    }

    (async () => {
      try {
        const res = await apiClient.patch(`/api/solutions/${target.solutionId}`, { name });
        if (res.status < 200 || res.status >= 300) throw new Error('파일 이름 변경 실패');
      } catch (e) {
        console.error('파일 이름 변경 실패:', e?.response?.data || e);
        const msg = e?.response?.status === 404 ? '파일을 찾을 수 없습니다.' : getErrMsg(e, '파일 이름 수정에 실패했습니다.');
        alert(msg);
        fetchTree(); // 서버 실패 시 최신 상태로 동기화
      }
    })();
  };

  // 파일 삭제 
  const handleDeleteSolution = (uiId) => {
    const target = problems.find(p => p.id === uiId);
    if (!target) return;

    // 드래프트면 그냥 UI에서 제거
    if (!target.solutionId) {
      setProblems(prev => prev.filter(p => p.id !== uiId));
      return;
    }

    // 낙관적 업데이트
    const prevProblems = problems;
    setProblems(prev => prev.filter(p => p.id !== uiId));

    (async () => {
      try {
        const res = await apiClient.delete(`/api/solutions/${target.solutionId}`);
        if (res.status < 200 || res.status >= 300) throw new Error('파일 삭제 실패');
      } catch (e) {
        console.error('파일 삭제 실패:', e?.response?.data || e);
        const msg = e?.response?.status === 404 ? '파일을 찾을 수 없습니다.' : getErrMsg(e, '파일 삭제에 실패했습니다.');
        alert(msg);
        // 롤백
        setProblems(prevProblems);
      }
    })();
  };

  // 폴더 이름 확정(생성/수정) 
  const handleFolderNameConfirm = (folderId, newName) => {
    const name = newName && newName.trim() ? newName.trim() : '새 폴더';
    // UI 먼저 업데이트(입력 종료)
    setFolders(prev => prev.map(x => (x.id === folderId ? { ...x, name, isEditing: false } : x)));

    // temp 폴더 → POST로 서버 생성
    if (typeof folderId === 'string' && folderId.startsWith('temp-folder-')) {
      const parentRaw = folders.find(f => f.id === folderId)?.parentId ?? null;
      const parentNum = Number(parentRaw);

      // 상위가 temp(문자열)면 생성 차단
      if (parentRaw != null && !Number.isFinite(parentNum)) {
        alert('상위 폴더를 먼저 확정해 주세요.');
        setFolders(prev => prev.map(f => f.id === folderId ? { ...f, isEditing: true } : f));
        return;
      }

      (async () => {
        try {
          const body = {
            name,
            ...toNumericOrNullBody('parentId', parentRaw), // 루트면 parentId 키 생략
          };
          const res = await apiClient.post('/api/workspace/folders', body);
          if (res.status !== 201) throw new Error('폴더 생성 실패');

          const serverId = Number(res.data?.id ?? res.data?.folderId);
          if (!Number.isFinite(serverId)) return;

          // temp id → 서버 id 치환
          setFolders(prev => prev.map(f => f.id === folderId ? { ...f, id: serverId } : f));
        } catch (e) {
          console.error('폴더 생성 실패:', e?.response?.data || e);
          const msg = e?.response?.status === 400 ? '폴더명이 중복되었습니다.' : getErrMsg(e, '폴더 생성에 실패했습니다.');
          alert(msg);
          // 실패 시 드래프트 제거
          setFolders(prev => prev.filter(f => f.id !== folderId));
        }
      })();
      return;
    }

    // 기존 폴더 → PATCH
    (async () => {
      try {
        const res = await apiClient.patch(`/api/workspace/folders/${folderId}`, { name });
        if (res.status < 200 || res.status >= 300) throw new Error('폴더 이름 변경 실패');
      } catch (e) {
        console.error('폴더 이름 변경 실패:', e?.response?.data || e);
        const msg =
          e?.response?.status === 404
            ? '폴더를 찾을 수 없습니다.'
            : e?.response?.status === 400
              ? '폴더명이 중복되었습니다.'
              : getErrMsg(e, '폴더 이름 수정에 실패했습니다.');
        alert(msg);
        fetchTree(); // 서버 실패 시 최신 상태로 동기화
      }
    })();
  };

  // 폴더 삭제 
  const handleDeleteFolder = (folderId) => {
    // 낙관적 업데이트: 하위 전체 제거
    const unifiedNow = toUnified();
    const nextUnified = unifiedNow.filter(
      (x) => !(x._kind === 'folder' && (x.id === folderId || isDescendantOfFolder(x, folderId))) &&
        !(x._kind === 'problem' && isDescendantOfFolder(x, folderId))
    );
    const withOrder = nextUnified.map((it, idx) => ({ ...it, order: idx }));
    const nextFolders = withOrder.filter(x => x._kind === 'folder').map(({ _kind, ...r }) => r);
    const nextProblems = withOrder.filter(x => x._kind === 'problem').map(({ _kind, ...r }) => r);

    const prevFolders = folders;
    const prevProblems = problems;

    setFolders(nextFolders);
    setProblems(nextProblems);

    if (selectedFolderId === folderId || isFolderDescendantId(selectedFolderId, folderId)) {
      setSelectedFolderId(null);
    }

    (async () => {
      try {
        const res = await apiClient.delete(`/api/workspace/folders/${folderId}`);
        if (res.status < 200 || res.status >= 300) throw new Error('폴더 삭제 실패');
      } catch (e) {
        console.error('폴더 삭제 실패:', e?.response?.data || e);
        const msg = e?.response?.status === 404 ? '폴더를 찾을 수 없습니다.' : getErrMsg(e, '폴더 삭제에 실패했습니다.');
        alert(msg);
        // 롤백
        setFolders(prevFolders);
        setProblems(prevProblems);
      }
    })();
  };

  // 생성
  const handleNewFolder = () => {
    const parentId = selectedFolderId ?? null; // 숫자 또는 null
    const now = Date.now();
    const tempId = `temp-folder-${now}`;
    // 화면에만 보이는 드래프트 추가
    setFolders(prev => [
      ...prev,
      {
        id: tempId,
        name: '새 폴더',
        parentId,
        isEditing: true,
        createdAt: now,
        order: prev.length + problems.length,
      },
    ]);
  };

  const handleNewProblem = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSelectProblem = async (problem) => {
    const rawProblemId = problem.id ?? problem.problemId ?? problem.no;
    const problemId = Number(rawProblemId);
    if (!Number.isFinite(problemId)) {
      alert('문제 ID를 찾을 수 없습니다.');
      return;
    }

    const parentId = selectedFolderId ?? null;
    const now = Date.now();
    const tempId = `temp-sol-${now}`;

    // 화면 드래프트 파일 추가
    setProblems(prev => [
      ...prev,
      {
        id: tempId,
        solutionId: null,       // 서버 미생성
        problemId,
        title: problem.title || `문제 ${rawProblemId}`,
        folderId: parentId,
        isEditing: true,
        createdAt: now,
        order: prev.length + folders.length,
        selectedLanguage: problem.selectedLanguage || 'javascript',
      },
    ]);
    setIsModalOpen(false);
  };

  const handleBackgroundClick = () => setSelectedFolderId(null);

  return (
    <div className={styles.workSpaceBackground}>
      <div className={styles.workSpaceContainer}>
        <div className={styles.workSpaceButtonsHeaderContainer}>
          <span className={styles.workSpaceButtonsRecent}>최근 항목</span>
          <div className={styles.workSpaceButtons}>
            <button className={styles.workSpaceButtonsNewfolder} onClick={handleNewFolder} disabled={loading}>
              새 폴더
            </button>
            <button className={styles.workSpaceButtonsNewproblem} onClick={handleNewProblem} disabled={loading}>
              문제 생성
            </button>
          </div>
        </div>
        <hr className={styles.workSpaceButtonsUnderline} />

        <div onClick={handleBackgroundClick}>
          {loading ? (
            <div className={styles.workSpaceBox}>
              <div className={styles.workSpaceBoxContext}>불러오는 중…</div>
            </div>
          ) : unified.length > 0 ? (
            <ul className={styles.folderList}>
              {unified.map((item) => {
                const depth = item._kind === 'folder' ? getFolderDepth(item.id) : getProblemDepth(item);

                if (item._kind === 'folder') {
                  return (
                    <li key={`row-folder-${item.id}`} className={styles.row} onClick={(e) => e.stopPropagation()}>
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
                            onNameConfirm={(newName) => handleFolderNameConfirm(item.id, newName)}
                            onDelete={() => handleDeleteFolder(item.id)}
                            onFolderClick={setSelectedFolderId}
                          />
                        </div>
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={`row-problem-${item.id}`} className={styles.row} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.rowContent}>
                      <div className={styles.indented} style={{ '--depth': String(depth) }}>
                        <WorkSpaceProblemList
                          id={item.id}                    // = solutionId(서버 생성 전엔 temp 문자열)
                          solutionId={item.solutionId}    // = id(숫자) / temp면 null
                          initialTitle={item.title}
                          selectedLanguage={item.selectedLanguage}
                          isInitialEditing={item.isEditing}
                          autoAttachExtension={!item.solutionId}
                          onFileNameConfirm={(name) => handleSolutionRename(item.id, name)}
                          onDelete={() => handleDeleteSolution(item.id)}
                          onDoubleClick={() => {
                            if (!item.solutionId) {
                              alert('먼저 파일 이름을 확정해 생성해주세요.');
                              return;
                            }
                            navigate(`/solve/${item.solutionId}`);
                          }}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className={styles.workSpaceBox}>
              <div className={styles.workSpaceBoxContext}>새 폴더나 문제를 생성해주세요.</div>
            </div>
          )}
        </div>

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
