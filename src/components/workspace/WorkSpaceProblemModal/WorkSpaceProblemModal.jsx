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

  // 모달이 열릴 때 모든 페이지의 데이터를 가져오는 useEffect
  useEffect(() => {
    if (!isOpen) return;

    const fetchAllPages = async () => {
      setIsLoading(true);
      let combinedProblems = [];

      try {
        // [1] 먼저 1페이지를 호출해서 전체 페이지 수를 파악
        const { data: firstPageData } = await apiClient.get('/api/problems', {
          params: { page: 1, size: ITEMS_PER_PAGE },
        });

        // 1페이지 문제 목록 추가
        combinedProblems = combinedProblems.concat(
          firstPageData.problems || [],
        );
        const totalPages = firstPageData.totalPages || 1;

        // [2] 2페이지부터 나머지 페이지를 *동시에* 요청
        if (totalPages > 1) {
          const pageFetchPromises = [];
          for (let page = 2; page <= totalPages; page++) {
            pageFetchPromises.push(
              apiClient.get('/api/problems', {
                params: { page, size: ITEMS_PER_PAGE },
              }),
            );
          }

          // [3] 모든 요청이 완료되면 결과를 합침
          const responses = await Promise.all(pageFetchPromises);
          responses.forEach((response) => {
            combinedProblems = combinedProblems.concat(
              response.data.problems || [],
            );
          });
        }

        // [4] 가져온 모든 데이터를 정규화
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
        // API 호출이 모두 완료된 후 상태 초기화
        setCurrentPage(1);
        setSearchTerm('');
        setIsSearching(false);
      }
    };

    fetchAllPages();
  }, [isOpen]); // 모달이 열릴 때만 실행

  // 검색어(searchTerm)가 바뀔 때마다 필터링을 실행하는 useEffect
  useEffect(() => {
    // 로딩 중이 아닐 때만 필터링 실행
    if (isLoading) return;

    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setIsSearching(false);
      setFilteredProblems(allProblems);
    } else {
      setIsSearching(true);

      const results = allProblems.filter(
        (problem) =>
          problem.no.toString().includes(term) || // 번호
          problem.title.toLowerCase().includes(term) || // 문제
          problem.level.toString().toLowerCase().includes(term) || // 난이도 (LV. 1)
          problem.algorithm.toLowerCase().includes(term), // 알고리즘
      );
      setFilteredProblems(results);
    }
    setCurrentPage(1);
  }, [searchTerm, allProblems, isLoading]); // isLoading 추가

  if (!isOpen) return null;

  const currentProblemsList = filteredProblems;
  const totalPages = Math.max(
    1,
    Math.ceil(currentProblemsList.length / ITEMS_PER_PAGE),
  );

  const displayProblems = currentProblemsList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleAddProblem = (problem) => {
    const completeData = { ...problem, selectedLanguage };
    if (onSelectProblem) onSelectProblem(completeData);
    onClose();
  };

  const renderTableBody = () => {
    const renderFillerRows = (startKey, rowCount) => {
      const rows = [];
      // rowCount만큼 빈 <tr>을 생성
      for (let i = 0; i < rowCount; i++) {
        rows.push(
          <tr key={`filler-${startKey + i}`} className={styles.fillerRow}>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
          </tr>,
        );
      }
      return rows;
    };

    if (isLoading) {
      return (
        <React.Fragment>
          <tr key='loading-msg'>
            <td colSpan='5' className={styles.centeredCell}>
              전체 문제 목록을 불러오는 중...
            </td>
          </tr>
          {renderFillerRows(0, ITEMS_PER_PAGE - 1)}
        </React.Fragment>
      );
    }

    if (displayProblems.length === 0) {
      return (
        <React.Fragment>
          <tr key='empty-msg'>
            {' '}
            <td colSpan='5' className={styles.centeredCell}>
              {isSearching ? '검색 결과가 없습니다.' : '문제가 없습니다.'}
            </td>
          </tr>
          {renderFillerRows(0, ITEMS_PER_PAGE - 1)}
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
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
                <img src={PlusIcon} alt='추가' />
              </button>
            </td>
          </tr>
        ))}
        {renderFillerRows(
          displayProblems.length,
          ITEMS_PER_PAGE - displayProblems.length,
        )}
      </React.Fragment>
    );
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* 모달 헤더 */}
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>알고리즘 문제 목록</span>
          <button className={styles.closeBtn} onClick={onClose}>
            <img src={CloseIcon} alt='닫기' />
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
            <tbody>{renderTableBody()}</tbody>
          </table>

          {/* 페이지네이션 */}
          <div className={styles.modalFooter}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
            />

            {/* 언어 선택 */}
            <div className={styles.languageSelector}>
              <span className={styles.languageLabel}>언어 선택</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className={styles.languageDropdown}
              >
                <option value='java'>Java</option>
                <option value='javascript'>JavaScript</option>
                <option value='python'>Python</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkSpaceProblemModal;
