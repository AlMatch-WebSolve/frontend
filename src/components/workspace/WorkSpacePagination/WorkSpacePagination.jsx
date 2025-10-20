import React from 'react';
import styles from './WorkSpacePagination.module.css';
import PrevIcon from '../../../assets/icons/PrevbtnIcon.svg';
import NextIcon from '../../../assets/icons/NextbtnIcon.svg';

const WorkSpacePagination = ({ currentPage, totalPages, onPrevPage, onNextPage }) => {
  return (
    <div className={styles.pagination}>
      <div className={styles.paginationInfo}>
        {/* 앞 페이지 버튼 */}
        <button
          className={styles.paginationPrev}
          onClick={onPrevPage}
          disabled={currentPage === 1} // 첫 페이지면 비활성화
        >
          <img src={PrevIcon} alt="이전 페이지" className={styles.prevIcon}/>
        </button>

        {/* 페이지 표시 */}
        <span className={styles.pageInfo}>{currentPage} / {totalPages}</span>

        {/* 다음 페이지 버튼 */}
        <button
          className={styles.paginationNext}
          onClick={onNextPage}
          disabled={currentPage === totalPages} // 마지막 페이지면 비활성화
        >
          <img src={NextIcon} alt="다음 페이지" className={styles.nextIcon} />
        </button>
      </div>
    </div>
  );
};

export default WorkSpacePagination;