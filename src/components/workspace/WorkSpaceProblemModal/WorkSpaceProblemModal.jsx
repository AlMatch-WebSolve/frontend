import React, { useState, useEffect } from 'react';
import styles from './WorkSpaceProblemModal.module.css';
import Pagination from '../WorkSpacePagination/WorkSpacePagination';
import WorkSpaceSearch from '../WorkSpaceSearch/WorkSpaceSearch';
import CloseIcon from '../../../assets/icons/CloseIcon.svg';
import PlusIcon from '../../../assets/icons/PlusIcon.svg';
import apiClient from '../../../api/apiClient.js';

const WorkSpaceProblemModal = ({ isOpen, onClose, onSelectProblem }) => {
  // 모든 useState는 컴포넌트 최상단에 위치
  const [currentPage, setCurrentPage] = useState(1);
  const [_searchTerm, setSearchTerm] = useState('');
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('java'); // 기본값을 Java로 설정
  const [searchResultPage, setSearchResultPage] = useState(1);
  const itemsPerPage = 6; // 페이지당 표시할 항목 수

  // 서버 데이터로 교체
  const [problemsByPage, setProblemsByPage] = useState([]);

  // 훅은 조기 리턴보다 위에서 호출하고, 내부에서 isOpen 가드
  useEffect(() => {
    if (!isOpen) return;

    const fetchProblems = async () => {
      try {
        const { data } = await apiClient.get('/api/problems'); // GET /api/problems
        const normalized = Array.isArray(data)
          ? data.map((p) => ({
            no: p.id,
            title: p.title,
            level: `LV. ${p.level}`,
            algorithm: Array.isArray(p.tags) ? p.tags.join(', ') : '',
          }))
          : [];

        // 페이지 단위로 나누기 (itemsPerPage 유지)
        const pages = [];
        for (let i = 0; i < normalized.length; i += itemsPerPage) {
          pages.push(normalized.slice(i, i + itemsPerPage));
        }
        setProblemsByPage(pages);

        // 모달 열릴 때 초기화 (기존 변수명 그대로)
        setCurrentPage(1);
        setIsSearching(false);
        setFilteredProblems([]);
        setSearchResultPage(1);
      } catch (e) {
        console.error('문제 목록 조회 실패:', e);
        setProblemsByPage([]); // 실패 시 빈 페이지
      }
    };

    fetchProblems();
  }, [isOpen, itemsPerPage]);

  // 조건부 렌더링은 useState/useEffect 이후에
  if (!isOpen) return null;

  // 페이지 수는 서버 데이터 기준으로 동적 계산 (변수명 유지)
  const totalPages = Math.max(1, problemsByPage.length);


  // 현재 페이지에 해당하는 문제 목록 (변수명 유지)
  const currentProblems = problemsByPage[currentPage - 1] || [];

  // 현재 표시할 문제 목록 (검색 중이면 검색 결과, 아니면 현재 페이지 문제)
  const displayProblems = isSearching
    ? filteredProblems.slice(
      (searchResultPage - 1) * itemsPerPage,
      searchResultPage * itemsPerPage
    )
    : currentProblems;

  // 이전 페이지로 이동
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // 다음 페이지로 이동
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // 문제 추가 버튼 클릭 핸들러 (문제 선택 시 모달 닫는 역할)
  const handleAddProblem = (problem) => {
    const problemObj = typeof problem === 'string' ? { title: problem } : problem;
    const completeData = { ...problemObj, selectedLanguage };
    if (onSelectProblem) onSelectProblem(completeData);
    onClose();
  };

  // 검색 핸들러 함수 (기존 로직/변수명 유지, 대상만 problemsByPage 전체로)
  const handleSearch = (term) => {
    if (!term.trim()) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchTerm(term);
    setSearchResultPage(1);

    const results = [];
    problemsByPage.forEach((page) => {
      page.forEach((problem) => {
        if (
          problem.no.toString().includes(term) ||
          problem.title.toLowerCase().includes(term.toLowerCase()) ||
          problem.level.toLowerCase().includes(term.toLowerCase()) ||
          problem.algorithm.toLowerCase().includes(term.toLowerCase())
        ) {
          results.push(problem);
        }
      });
    });

    setFilteredProblems(results);
  };

  // 검색 결과 페이지네이션 핸들러
  const handleSearchPrevPage = () => {
    if (searchResultPage > 1) {
      setSearchResultPage(searchResultPage - 1);
    }
  };

  const handleSearchNextPage = () => {
    const maxPage = Math.ceil(filteredProblems.length / itemsPerPage);
    if (searchResultPage < maxPage) {
      setSearchResultPage(searchResultPage + 1);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* 모달 헤더 */}
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>알고리즘 문제 목록</span>
          <button className={styles.closeBtn} onClick={onClose}>
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
                <th>번호</th>
                <th>문제</th>
                <th>난이도</th>
                <th>알고리즘</th>
                <th>추가</th>
              </tr>
            </thead>
            <tbody>
              {displayProblems.length > 0 ? (
                displayProblems.map((problem) => (
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
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                    {isSearching ? '검색 결과가 없습니다.' : '문제가 없습니다.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* 페이지네이션 */}
          <div className={styles.modalFooter}>
            {isSearching ? (
              <Pagination
                currentPage={searchResultPage}
                totalPages={Math.max(1, Math.ceil(filteredProblems.length / itemsPerPage))}
                onPrevPage={handleSearchPrevPage}
                onNextPage={handleSearchNextPage}
              />
            ) : (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
              />
            )}

            {/* 언어 선택 */}
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
