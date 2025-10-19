import React from 'react';
import styles from './ChatWindow/ChatWindow.module.css'; // 이 파일도 새로 만듭니다.

const formatTimestamp = (timestamp) => {
  // 타임스탬프 값이 유효하지 않으면 빈 문자열 반환
  if (!timestamp) return '';

  try {
    const date = new Date(timestamp + 'Z');
    // 한국 시간 기준으로, 오전/오후를 포함한 2자리 시간과 분으로 변환
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    console.error('Invalid timestamp format:', timestamp);
    return ''; // 변환 중 에러 발생 시 빈 문자열 반환
  }
};

/**
 * 채팅 메시지 한 개를 표시하는 컴포넌트
 * @param {object} props
 * @param {boolean} props.isMine - 내가 보낸 메시지인지 여부
 * @param {string} props.nickname - 메시지를 보낸 사람의 닉네임
 * @param {string} props.message - 메시지 내용
 * @param {string} props.timestamp - 메시지 전송 시각
 */
function ChatMessage({ isMine, nickname, message, timestamp }) {
  // isMine prop에 따라 클래스 이름을 동적으로 설정
  const rowClass = isMine
    ? `${styles.messageRow} ${styles.myMessageRow}`
    : styles.messageRow;

  return (
    <div className={rowClass}>
      <div className={styles.messageContent}>
        <span className={styles.nickname}>{nickname}</span>
        <div className={styles.bubbleContainer}>
          {/* isMine이 true일 때 타임스탬프를 메시지 버블보다 먼저 렌더링 (CSS로 순서 변경) */}
          <p className={styles.messageBubble}>{message}</p>
          <span className={styles.timestamp}>{formatTimestamp(timestamp)}</span>
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
