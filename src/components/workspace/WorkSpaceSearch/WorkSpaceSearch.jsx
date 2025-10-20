import React, { useState } from 'react';
import styles from './WorkSpaceSearch.module.css';
import SearchIcon from '../../../assets/icons/SearchIcon.svg';


const WorkSpaceSearch = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // 엔터를 치지 않아도 우선 보여주기
  const handleSearchChange = (e) => {
    const term = e.target.value; 
    setSearchTerm(term);        
    onSearch(term);             
  };
  
  const handleSearchSubmit = () => {
    onSearch(searchTerm);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  return (
    <div className={styles.searchContainer}>
      <input 
        type="search" 
        className={styles.searchInput}
        placeholder="문제 검색"
        value={searchTerm}
        onChange={handleSearchChange}
        onKeyDown={handleKeyDown}
      />
      <button 
        className={styles.searchButton}
        onClick={handleSearchSubmit}
      >
        <img src={SearchIcon} alt="검색" />
      </button>
    </div>
  );
};

export default WorkSpaceSearch;