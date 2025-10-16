import React, {useState} from 'react';
import styles from './WorkSpaceProblemModal.module.css';
import Pagination from './WorkSpacePagination';
import CloseIcon from '../../assets/icons/x-02.svg';
import SearchIcon from '../../assets/icons/search-01.svg';
import PlusIcon from '../../assets/icons/plus-01.svg';

const WorkSpaceProblemModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
  
    // --- 문제 데이터와 페이지네이션 로직은 ProblemModal이 관리 ---
    const [currentPage, setCurrentPage] = useState(1);
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
    const handleAddProblem = (problemTitle) => {
      console.log(`${problemTitle} 문제가 추가되었습니다.`);
      // TODO: 부모 컴포넌트에 선택된 문제 정보를 전달하는 로직 추가
      onClose(); // 문제 선택 후 모달 닫기
    };
    // ---
  
    return (
      <div className={styles.modalOverlay}> {/* 배경 오버레이를 위해 최상위 div 추가 */}
        <div className={styles.modalContent}>
  
          {/* 모달 헤더 */}
          <div className={styles.modalHeader}>
            <span className={styles.modalTitle}>알고리즘 문제 목록</span>
          </div>
  
          {/* 모달 닫기 버튼 */}
          <button className={styles.closeBtn} onClick={onClose}>
            <img src={CloseIcon} alt="닫기" />
          </button>
  
          {/* 모달 언더라인 */}
          <hr className={styles.modalUnderline} />
  
          {/* 모달 문제 검색 */}
          <div className={styles.searchContainer}>
            <input type="search" id="problemSearch" className={styles.problemSearchInput} placeholder="문제 검색"/>
            <button className={styles.searchButton}>
              <img src={SearchIcon} className={styles.search01} alt="검색" />
            </button>
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
              {currentProblems.map((problem) => (
                <tr key={problem.no}>
                  <td>{problem.no}</td>
                  <td>{problem.title}</td>
                  <td>{problem.level}</td>
                  <td>{problem.algorithm}</td>
                  <td>
                    <button 
                      className={styles.problemAddBtn} 
                      onClick={() => handleAddProblem(problem.title)} // 클릭 시 문제 추가
                    >
                      <img src={PlusIcon} alt="추가" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
  
          {/* 여기에서 분리한 Pagination 컴포넌트를 사용 */}
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
          />
          
        </div>
      </div>
    );
  };
  
  export default WorkSpaceProblemModal;