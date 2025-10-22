import React, { useState, useEffect } from 'react';
import styles from './WorkSpaceProblemModal.module.css';
import Pagination from '../WorkSpacePagination/WorkSpacePagination';
import WorkSpaceSearch from '../WorkSpaceSearch/WorkSpaceSearch';
import CloseIcon from '../../../assets/icons/CloseIcon.svg';
import PlusIcon from '../../../assets/icons/PlusIcon.svg';
import apiClient from '../../../api/apiClient.js';

// 클라이언트 페이징용
const ITEMS_PER_PAGE = 6;

const WorkSpaceProblemModal = ({ isOpen, onClose, onSelectProblem }) => {
  // --- 상태 변수 (클라이언트 사이드 로직 기반) ---
  const [allProblems, setAllProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState('java');
  const [isLoading, setIsLoading] = useState(true);

  // 서버/UI/모달 간 언어 매핑
  const SERVER_TO_MODAL = { JAVA: 'java', JAVASCRIPT: 'javascript', PYTHON: 'python' };
  const UI_TO_MODAL = { Java: 'java', JavaScript: 'javascript', Python: 'python' };
  const MODAL_TO_SERVER = { java: 'JAVA', javascript: 'JAVASCRIPT', python: 'PYTHON' };
  const MODAL_TO_UI = { java: 'Java', javascript: 'JavaScript', python: 'Python' };

  // 모달이 열릴 때: 사용자 설정 언어 동기화 + 문제 전부 로드
  useEffect(() => {
    if (!isOpen) return;

    const fetchAllPages = async () => {
      setIsLoading(true);
      let combinedProblems = [];

      try {
        // (1) 현재 사용자 설정의 언어를 먼저 동기화
        try {
          const { data: settings } = await apiClient.get('/api/users/me/settings');
          const raw = String(settings?.language ?? '').trim().toUpperCase();
          const initModalLang = SERVER_TO_MODAL[raw] ?? 'java';
          setSelectedLanguage(initModalLang);
        } catch (e) {
          console.warn('모달 오픈시 언어 설정 조회 실패', e?.response?.status);
        }

        // (2) 1페이지 호출해서 전체 페이지 수 파악
        const { data: firstPageData } = await apiClient.get('/api/problems', {
          params: { page: 1, size: ITEMS_PER_PAGE },
        });

        combinedProblems = combinedProblems.concat(firstPageData.problems || []);
        const totalPages = firstPageData.totalPages || 1;

        // (3) 2페이지 이후는 동시 요청
        if (totalPages > 1) {
          const pageFetchPromises = [];
          for (let page = 2; page <= totalPages; page++) {
            pageFetchPromises.push(
              apiClient.get('/api/problems', { params: { page, size: ITEMS_PER_PAGE } })
            );
          }
          const responses = await Promise.all(pageFetchPromises);
          responses.forEach((response) => {
            combinedProblems = combinedProblems.concat(response.data.problems || []);
          });
        }

        // (4) 정규화
        const normalized = combinedProblems.map((p) => ({
          no: p.id,
          title: p.title,
          level: `LV. ${p.level}`,
          algorithm: Array.isArray(p.tags) ? p.tags.join(', ') : '',
        }));

        setAllProblems(normalized);
      } catch (e) {
        console.error('모든 문제 목록 조회 실패:', e);
        setAllProblems([]);
      } finally {
        setIsLoading(false);
        setCurrentPage(1);
        setSearchTerm('');
        setIsSearching(false);
      }
    };

    fetchAllPages();
  }, [isOpen]);

  // Settings 쪽에서 브로드캐스트한 언어 변경을 즉시 반영
  useEffect(() => {
    const handler = (e) => {
      const uiLanguage = e?.detail?.uiLanguage; // 'Java' | 'JavaScript' | 'Python'
      const next = UI_TO_MODAL[uiLanguage] ?? 'java';
      setSelectedLanguage(next);
    };
    window.addEventListener('settings:languageChanged', handler);
    return () => window.removeEventListener('settings:languageChanged', handler);
  }, []);

  // 언어를 서버에 저장하고, 전체 UI로 브로드캐스트하는 유틸
  const persistLanguage = async (modalLang) => {
    const serverLang = MODAL_TO_SERVER[modalLang] ?? String(modalLang).toUpperCase();
    try {
      // 1) 현재 설정 가져와서 theme 보존
      const { data: settings } = await apiClient.get('/api/users/me/settings');
      const currentThemeRaw = String(settings?.theme ?? 'LIGHT').trim().toUpperCase();
      const themeForPut = currentThemeRaw === 'DARK' ? 'DARK' : 'LIGHT';

      // 2) theme + language 함께 PUT (백엔드가 전체 업데이트만 받는 경우 대비)
      await apiClient.put(
        '/api/users/me/settings',
        { theme: themeForPut, language: serverLang },
        { headers: { 'Content-Type': 'application/json' } }
      );
    } catch (e) {
      console.warn('언어 설정 저장 실패:', e?.response?.status, e?.response?.data);
    } finally {
      // 3) 즉시 UI 동기화 (설정 모달도 바로 반영)
      try {
        const uiLanguage = MODAL_TO_UI[modalLang] ?? 'Java';
        window.dispatchEvent(new CustomEvent('settings:languageChanged', {
          detail: { uiLanguage },
        }));
      } catch { }
    }
  };

  // 검색어가 바뀔 때마다 필터링
  useEffect(() => {
    if (isLoading) return;

    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setIsSearching(false);
      setFilteredProblems(allProblems);
    } else {
      setIsSearching(true);
      const results = allProblems.filter(
        (problem) =>
          problem.no.toString().includes(term) ||
          problem.title.toLowerCase().includes(term) ||
          problem.level.toString().toLowerCase().includes(term) ||
          problem.algorithm.toLowerCase().includes(term)
      );
      setFilteredProblems(results);
    }
    setCurrentPage(1);
  }, [searchTerm, allProblems, isLoading]);

  if (!isOpen) return null;

  const currentProblemsList = filteredProblems;
  const totalPages = Math.max(1, Math.ceil(currentProblemsList.length / ITEMS_PER_PAGE));
  const displayProblems = currentProblemsList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  const handleSearch = (term) => setSearchTerm(term);

  const handleAddProblem = (problem) => {
    const completeData = { ...problem, selectedLanguage };
    if (onSelectProblem) onSelectProblem(completeData);
    (async () => {
      await persistLanguage(selectedLanguage); // 문제 추가 시에도 동기화
      onClose();
    })();
  };

  // 닫기 버튼도 현재 선택 언어를 서버에 저장하고 브로드캐스트
  const handleClose = async () => {
    await persistLanguage(selectedLanguage);
    onClose();
  };

  const renderTableBody = () => {
    const renderFillerRows = (startKey, rowCount) => {
      const rows = [];
      for (let i = 0; i < rowCount; i++) {
        rows.push(
          <tr key={`filler-${startKey + i}`} className={styles.fillerRow}>
            <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
          </tr>,
        );
      }
      return rows;
    };

    if (isLoading) {
      return (
        <>
          <tr key="loading-msg">
            <td colSpan="5" className={styles.centeredCell}>전체 문제 목록을 불러오는 중...</td>
          </tr>
          {renderFillerRows(0, ITEMS_PER_PAGE - 1)}
        </>
      );
    }

    if (displayProblems.length === 0) {
      return (
        <>
          <tr key="empty-msg">
            <td colSpan="5" className={styles.centeredCell}>
              {isSearching ? '검색 결과가 없습니다.' : '문제가 없습니다.'}
            </td>
          </tr>
          {renderFillerRows(0, ITEMS_PER_PAGE - 1)}
        </>
      );
    }

    return (
      <>
        {displayProblems.map((problem) => (
          <tr key={problem.no}>
            <td>{problem.no}</td>
            <td>{problem.title}</td>
            <td>{problem.level}</td>
            <td>{problem.algorithm}</td>
            <td>
              <button
                className={styles.problemAddBtn}
                onClick={() => handleAddProblem(problem)}
              >
                <img src={PlusIcon} alt="추가" />
              </button>
            </td>
          </tr>
        ))}
        {renderFillerRows(displayProblems.length, ITEMS_PER_PAGE - displayProblems.length)}
      </>
    );
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* 헤더 */}
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>알고리즘 문제 목록</span>
          <button className={styles.closeBtn} onClick={handleClose}>
            <img src={CloseIcon} alt="닫기" />
          </button>
        </div>

        <div className={styles.content}>
          {/* 검색 */}
          <div className={styles.searchComponentWrapper}>
            <WorkSpaceSearch onSearch={handleSearch} />
          </div>

          {/* 표 */}
          <table className={styles.problemTable}>
            <thead>
              <tr>
                <th>번호</th><th>문제</th><th>난이도</th><th>알고리즘</th><th>추가</th>
              </tr>
            </thead>
            <tbody>{renderTableBody()}</tbody>
          </table>

          {/* 하단 */}
          <div className={styles.modalFooter}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
            />

            {/* 언어 선택 (모달 내부 선택도 동기화 원함 시 이 select를 노출/사용) */}
            <div className={styles.languageSelector}>
              <span className={styles.languageLabel}>언어 선택</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className={styles.languageDropdown}
              >
                <option value="java">Java</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkSpaceProblemModal;
