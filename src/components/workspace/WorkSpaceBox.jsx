import React from 'react';
import styles from './WorkSpaceBox.module.css';

// 워크스페이스 중간 점선 박스
const WorkSpaceBox = () => {
    return (
        <div className={styles.workSpaceBox}>
            <div className={styles.workSpaceBoxBorder}></div>

            <div className={styles.workSpaceBoxContext}>
                새 폴더나 문제를 생성해주세요.
                
            </div>
        </div>
    )
}

export default WorkSpaceBox;