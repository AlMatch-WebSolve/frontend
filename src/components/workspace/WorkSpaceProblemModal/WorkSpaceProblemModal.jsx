import React, {useState} from 'react';
import styles from './WorkSpaceProblemModal.module.css';
import Pagination from '../WorkSpacePagination/WorkSpacePagination';
import WorkSpaceSearch from '../WorkSpaceSearch/WorkSpaceSearch';
import CloseIcon from '../../../assets/icons/x-02.svg';
import PlusIcon from '../../../assets/icons/plus-01.svg';

const WorkSpaceProblemModal = ({ isOpen, onClose, onSelectProblem }) => {
  // 모든 useState는 컴포넌트 최상단에 위치
  const [currentPage, setCurrentPage] = useState(1);
  const [_searchTerm, setSearchTerm] = useState('');
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('java') // 기본값을 Java로 설정
  
  // 조건부 렌더링은 useState 이후에
  if (!isOpen) return null;

  const totalPages = 3; // 페이지 수를 설정
  
  // 문제 데이터 (실제로는 API에서 가져오거나 상위 컴포넌트에서 props로 받을 수 있음)
  const problemsByPage = [
    [ // 1페이지 문제 목록
      { no: 1, title: "문제 1", level: "LV. 1", algorithm: "이분 탐색, 정렬 1" },
      { no: 2, title: "문제 2", level: "LV. 1", algorithm: "시뮬레이션, 구현 1" },
      { no: 3, title: "문제 3", level: "LV. 1", algorithm: "BFS 1" },
      { no: 4, title: "문제 4", level: "LV. 2", algorithm: "이분 탐색, 정렬 1" },
      { no: 5, title: "문제 5", level: "LV. 2", algorithm: "누적합 1" },
      { no: 6, title: "문제 6", level: "LV. 3", algorithm: "시뮬레이션 1" }
    ],
    [ // 2페이지 문제 목록
      { no: 7, title: "문제 7", level: "LV. 1", algorithm: "이분 탐색, 정렬 2" },
      { no: 8, title: "문제 8", level: "LV. 1", algorithm: "시뮬레이션, 구현 2" },
      { no: 9, title: "문제 9", level: "LV. 1", algorithm: "BFS 2" },
      { no: 10, title: "문제 10", level: "LV. 2", algorithm: "이분 탐색, 정렬 2" },
      { no: 11, title: "문제 11", level: "LV. 2", algorithm: "누적합 2" },
      { no: 12, title: "문제 12", level: "LV. 3", algorithm: "시뮬레이션 2" }
    ],
    [ // 3페이지 문제 목록
      { no: 13, title: "문제 13", level: "LV. 1", algorithm: "이분 탐색, 정렬 3" },
      { no: 14, title: "문제 14", level: "LV. 1", algorithm: "시뮬레이션, 구현 3" },
      { no: 15, title: "문제 15", level: "LV. 1", algorithm: "BFS 3" },
      { no: 16, title: "문제 16", level: "LV. 2", algorithm: "이분 탐색, 정렬 3" },
      { no: 17, title: "문제 17", level: "LV. 2", algorithm: "누적합 3" },
      { no: 18, title: "문제 18", level: "LV. 3", algorithm: "시뮬레이션 3" }
    ]
  ];
  
  // 현재 페이지에 해당하는 문제 목록
  const currentProblems = problemsByPage[currentPage - 1] || [];
  
  // 현재 표시할 문제 목록 (검색 중이면 검색 결과, 아니면 현재 페이지 문제)
  const displayProblems = isSearching 
    ? filteredProblems 
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
    // 문자열이면 객체로 변환
    const problemObj = typeof problem === 'string' 
      ? { title: problem } 
      : problem;
    
    // 선택한 언어 정보 추가
    const completeData = {
      ...problemObj,
      selectedLanguage: selectedLanguage
    };
    
    console.log('최종 전달 데이터:', completeData);
    
    if (onSelectProblem) {
      onSelectProblem(completeData);
    }
    onClose();
  };

  
  // 검색 핸들러 함수
  const handleSearch = (term) => {
    console.log('검색어:', term);
    
    if (!term.trim()) {
      // 검색어가 없으면 검색 모드 해제
      setIsSearching(false);
      return;
    }
    
    // 검색 모드 활성화
    setIsSearching(true);
    setSearchTerm(term);
    
    // 모든 페이지의 문제를 검색
    const results = [];
    problemsByPage.forEach(page => {
      page.forEach(problem => {
        // 번호, 제목, 난이도, 알고리즘 중 하나라도 검색어를 포함하면 결과에 추가
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
    // ---
  
    return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* 모달 헤더 */}
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>알고리즘 문제 목록</span>
        </div>

        {/* 모달 닫기 버튼 */}
        <button className={styles.closeBtn} onClick={onClose}>
          <img src={CloseIcon} alt="닫기" />
        </button>

        {/* 모달 언더라인 - 필요 없으면 제거 가능 */}
        <hr className={styles.modalUnderline} />

        {/* 검색 컴포넌트를 감싸는 div */}
        <div className={styles.searchComponentWrapper}>
          <WorkSpaceSearch onSearch={handleSearch} />
        </div>

        {/* 알고리즘 문제 목록 표 */}
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
                      // onClick={() => handleAddProblem(problem.title)}
                      
                    >
                      <img src={PlusIcon} alt="추가" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                  {isSearching ? "검색 결과가 없습니다." : "문제가 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* 페이지네이션 (검색 중에는 숨김) */}

        {!isSearching && (
          <div className={styles.modalFooter}>
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
            />
            
            {/* 언어 선택 부분 */}
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
        )}

        {/* 검색 결과 정보 (검색 중에만 표시) */}
        {isSearching && (
          <div className={styles.searchInfo}>
            검색 결과: {filteredProblems.length}개
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkSpaceProblemModal;