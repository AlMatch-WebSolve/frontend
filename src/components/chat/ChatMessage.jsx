import React from 'react';
import styles from './ChatWindow/ChatWindow.module.css'; // 이 파일도 새로 만듭니다.

function ChatMessage({ isMine, nickname, message }) {
  // isMine prop에 따라 클래스 이름을 동적으로 설정
  const rowClass = isMine
    ? `${styles.messageRow} ${styles.myMessageRow}`
    : styles.messageRow;

  return (
    <div className={rowClass}>
      <div className={styles.messageContent}>
        <span className={styles.nickname}>{nickname}</span>
        <p className={styles.messageBubble}>{message}</p>
      </div>
    </div>
  );
}

export default ChatMessage;
