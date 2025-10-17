import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import styles from './ChatWindow.module.css';
import CloseIcon from '../../../assets/icons/CloseIcon.svg';
import SendIcon from '../../../assets/icons/SendIcon.svg';

function ChatWindow({ onClose }) {
  const nodeRef = useRef(null);

  return (
    // Draggable 컴포넌트로 감싸기
    <Draggable nodeRef={nodeRef} handle='.chat-window-handle'>
      <div ref={nodeRef} className={styles.chatWindow}>
        {/* 'handle'로 지정된 이 부분만 드래그가 가능해짐 */}
        <header className={`${styles.chatHeader} chat-window-handle`}>
          <button className={styles.tab}>채팅</button>
          <div className={styles.icon}>
            <button
              type='button'
              aria-label='채팅 닫기'
              className={styles.navBtn}
              onClick={onClose}
            >
              <img src={CloseIcon} alt='닫기' />
            </button>
          </div>
        </header>
        <div className={styles.chatBodyContainer}>
          <div className={styles.chatBody}>
            {/* 상대방 메시지 */}
            <div className={styles.messageRow}>
              <div className={styles.messageContent}>
                <span className={styles.nickname}>닉네임 1</span>
                <p className={styles.messageBubble}>
                  코드에 대해 질문있습니다.
                </p>
              </div>
            </div>

            {/* 내 메시지 */}
            <div className={`${styles.messageRow} ${styles.myMessageRow}`}>
              <div className={styles.messageContent}>
                <span className={styles.nickname}>닉네임 1</span>
                <p className={styles.messageBubble}>
                  AI 코드 리뷰를 활용해보세요.
                </p>
              </div>
            </div>
            <div className={`${styles.messageRow} ${styles.myMessageRow}`}>
              <div className={styles.messageContent}>
                <span className={styles.nickname}>닉네임 1</span>
                <p className={styles.messageBubble}>
                  AI 코드 리뷰를 활용해보세요.
                </p>
              </div>
            </div>
            {/* 상대방 메시지 */}
            <div className={styles.messageRow}>
              <div className={styles.messageContent}>
                <span className={styles.nickname}>닉네임 1</span>
                <p className={styles.messageBubble}>
                  코드에 대해 질문있습니다.
                </p>
              </div>
            </div>
            <div className={`${styles.messageRow} ${styles.myMessageRow}`}>
              <div className={styles.messageContent}>
                <span className={styles.nickname}>닉네임 1</span>
                <p className={styles.messageBubble}>
                  AI 코드 리뷰를 활용해보세요.
                </p>
              </div>
            </div>
            {/* 상대방 메시지 */}
            <div className={styles.messageRow}>
              <div className={styles.messageContent}>
                <span className={styles.nickname}>닉네임 1</span>
                <p className={styles.messageBubble}>
                  코드에 대해 질문있습니다.
                </p>
              </div>
            </div>
            <div className={`${styles.messageRow} ${styles.myMessageRow}`}>
              <div className={styles.messageContent}>
                <span className={styles.nickname}>닉네임 1</span>
                <p className={styles.messageBubble}>
                  AI 코드 리뷰를 활용해보세요.
                </p>
              </div>
            </div>
            <div className={`${styles.messageRow} ${styles.myMessageRow}`}>
              <div className={styles.messageContent}>
                <span className={styles.nickname}>닉네임 1</span>
                <p className={styles.messageBubble}>
                  AI 코드 리뷰를 활용해보세요.
                </p>
              </div>
            </div>
            {/* 상대방 메시지 */}
            <div className={styles.messageRow}>
              <div className={styles.messageContent}>
                <span className={styles.nickname}>닉네임 1</span>
                <p className={styles.messageBubble}>
                  코드에 대해 질문있습니다.
                </p>
              </div>
            </div>
            <div className={`${styles.messageRow} ${styles.myMessageRow}`}>
              <div className={styles.messageContent}>
                <span className={styles.nickname}>닉네임 1</span>
                <p className={styles.messageBubble}>
                  AI 코드 리뷰를 활용해보세요.
                </p>
              </div>
            </div>
          </div>
        </div>
        <footer className={styles.chatInputArea}>
          <input
            className={styles.chatInput}
            type='text'
            placeholder='메시지를 입력해주세요'
          />
          <button
            type='button'
            aria-label='메세지 전송'
            className={styles.sendButton}
          >
            <img src={SendIcon} alt='전송' />
          </button>
        </footer>
      </div>
    </Draggable>
  );
}

export default ChatWindow;
