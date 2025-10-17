import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import styles from './ChatWindow.module.css';

function ChatWindow({ onClose }) {
  const nodeRef = useRef(null);
  return (
    // Draggable 컴포넌트로 감싸기
    <Draggable nodeRef={nodeRef} handle=".chat-header-handle">
      <div ref={nodeRef} className={styles.chatWindow}>
        {/* 'handle'로 지정된 이 부분만 드래그가 가능해짐 */}
        <div className={`${styles.chatHeader} chat-header-handle`}>
          <span>채 팅</span>
          <button onClick={onClose} className={styles.closeBtn}>
            ✕
          </button>
        </div>
        <div className={styles.chatBody}>
          {/* 채팅 메시지가 표시될 영역 */}
          <p>무엇이든 물어보세요!</p>
        </div>
        <div className={styles.chatInput}>
          <input type="text" placeholder="메시지를 입력하세요..." />
          <button>전송</button>
        </div>
      </div>
    </Draggable>
  );
}

export default ChatWindow;
