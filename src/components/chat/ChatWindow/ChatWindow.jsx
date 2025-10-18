import React, { useRef, useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import styles from './ChatWindow.module.css';
import CloseIcon from '../../../assets/icons/CloseIcon.svg';
import SendIcon from '../../../assets/icons/SendIcon.svg';
import ChatMessage from '../ChatMessage';

// 메시지 데이터 예시 (나중에는 state나 props로 관리)
// 실제 사용 시에는 useState로 관리하는 것이 좋습니다.
const initialMessages = [
  {
    id: 1,
    nickname: '닉네임 1',
    message: '코드에 대해 질문있습니다.',
    isMine: false,
  },
  {
    id: 2,
    nickname: '나',
    message: 'AI 코드 리뷰를 활용해보세요.',
    isMine: true,
  },
  {
    id: 3,
    nickname: '닉네임 1',
    message: '오 좋은데요?',
    isMine: false,
  },
  {
    id: 4,
    nickname: '나',
    message: '한번 써보세요. 효율이 좋아요.',
    isMine: true,
  },
  {
    id: 5,
    nickname: '닉네임 1',
    message: '감사합니다!',
    isMine: false,
  },
  {
    id: 6,
    nickname: '닉네임 1',
    message: '정말 도움이 많이 됐습니다. 추가로 질문이 있는데...',
    isMine: false,
  },
  { id: 7, nickname: '나', message: '네 말씀하세요.', isMine: true },
];

function ChatWindow({ onClose }) {
  const nodeRef = useRef(null);
  const chatBodyRef = useRef(null);

  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const newMessage = {
      id: messages.length + 1,
      nickname: '나',
      message: inputValue,
      isMine: true,
    };
    setMessages([...messages, newMessage]);
    setInputValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Enter로 인한 줄바꿈 방지
      handleSendMessage();
    }
  };

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

        <div ref={chatBodyRef} className={styles.chatBodyContainer}>
          <div className={styles.chatBody}>
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                isMine={msg.isMine}
                nickname={msg.nickname}
                message={msg.message}
              />
            ))}
          </div>
        </div>

        <footer className={styles.chatInputArea}>
          <input
            className={styles.chatInput}
            type='text'
            placeholder='메시지를 입력해주세요'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            type='button'
            aria-label='메세지 전송'
            className={styles.sendButton}
            onClick={handleSendMessage}
          >
            <img src={SendIcon} alt='전송' />
          </button>
        </footer>
      </div>
    </Draggable>
  );
}

export default ChatWindow;
