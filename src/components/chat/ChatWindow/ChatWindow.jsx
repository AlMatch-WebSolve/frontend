import React, { useRef, useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import styles from './ChatWindow.module.css';
import CloseIcon from '../../../assets/icons/CloseIcon.svg';
import SendIcon from '../../../assets/icons/SendIcon.svg';
import ChatMessage from '../ChatMessage';

const API_BASE_URL =
  'http://ec2-3-39-239-40.ap-northeast-2.compute.amazonaws.com:8080';
const WEBSOCKET_URL =
  'ws://ec2-3-39-239-40.ap-northeast-2.compute.amazonaws.com:8080/ws';

// 임시 유저아이디, 닉네임  설정
const MY_USER_ID = 123; // 예시: 현재 접속한 사용자의 ID
const MY_NICKNAME = '나'; // 예시: 현재 접속한 사용자의 닉네임

function ChatWindow({ onClose }) {
  const nodeRef = useRef(null);
  const chatContainerRef = useRef(null);
  const clientRef = useRef(null); // STOMP 클라이언트 인스턴스를 저장하기 위한 ref

  const reconnectAttempts = useRef(0); // 재연결 시도 횟수 추적
  const MAX_RECONNECT_ATTEMPTS = 3; // 최대 재연결 시도 횟수

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  // 서버의 상태를 관리: 'checking'(확인중), 'online'(온라인), 'offline'(오프라인)
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    // Health Check와 WebSocket 연결을 처리하는 비동기 함수
    const connectToServer = async () => {
      try {
        // 1. HTTP GET 요청으로 서버 Health Check 수행
        console.log('채팅 서버 상태를 확인합니다...');
        const response = await fetch(`${API_BASE_URL}/api/chat/health`);

        if (!response.ok) {
          throw new Error(`Health check failed: ${response.status}`);
        }

        const healthText = await response.text();
        console.log('Health Check 성공:', healthText);
        setServerStatus('online'); // 서버가 정상임을 상태에 저장

        const sock = new SockJS(`${API_BASE_URL}/ws`);
        // 2. Health Check 성공 시에만 WebSocket 연결 시도
        const client = new Client({
          webSocketFactory: () => sock,
          debug: (str) => {
            console.log(new Date(), str);
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,

          onConnect: (frame) => {
            setIsConnected(true);
            console.log('STOMP 서버에 연결되었습니다:', frame);
            reconnectAttempts.current = 0; // 성공 시 카운터 리셋

            // 구독 및 JOIN 메시지 발행
            client.subscribe('/topic/public', (message) => {
              const receivedMessage = JSON.parse(message.body);
              setMessages((prevMessages) => [...prevMessages, receivedMessage]);
            });
            const joinMessage = {
              userId: MY_USER_ID,
              userNickname: MY_NICKNAME,
              message: `${MY_NICKNAME}님이 입장하셨습니다.`,
              type: 'JOIN',
            };
            client.publish({
              destination: '/app/chat.addUser',
              body: JSON.stringify(joinMessage),
            });
          },

          onStompError: (frame) => {
            console.error('STOMP 오류:', frame.headers['message'], frame.body);
          },

          onDisconnect: (frame) => {
            setIsConnected(false);
            console.log('STOMP 서버와의 연결이 끊어졌습니다:', frame);

            reconnectAttempts.current += 1;
            console.log(
              `재연결을 시도합니다... (${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})`,
            );
            if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
              console.error(
                '최대 재연결 횟수에 도달했습니다. 연결을 중단합니다.',
              );
              // 클라이언트를 비활성화하여 더 이상 자동 재연결을 시도하지 않도록 막습니다.
              client.deactivate();
              // 서버 상태를 'offline'으로 명확히 설정하여 사용자에게 알립니다.
              setServerStatus('offline');
            }
          },
        });

        client.activate();
        clientRef.current = client;
      } catch (error) {
        // 3. Health Check 실패 시
        console.error('채팅 서버에 연결할 수 없습니다:', error);
        setServerStatus('offline'); // 서버가 오프라인임을 상태에 저장
        setIsConnected(false);
      }
    };

    connectToServer();

    // 컴포넌트 언마운트 시 정리 함수
    return () => {
      if (clientRef.current && clientRef.current.connected) {
        const leaveMessage = {
          userId: MY_USER_ID,
          userNickname: MY_NICKNAME,
          message: `${MY_NICKNAME}님이 퇴장하셨습니다.`,
          type: 'LEAVE',
        };
        clientRef.current.publish({
          destination: '/app/chat.sendMessage',
          body: JSON.stringify(leaveMessage),
        });
        clientRef.current.deactivate();
      }
    };
  }, []); // 마운트 시 한 번만 실행

  // 새 메시지가 추가될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 메시지 전송 함수
  const handleSendMessage = () => {
    if (inputValue.trim() === '' || !clientRef.current?.connected) {
      alert('메시지를 입력해주세요 또는 연결 상태를 확인하세요.');
      return;
    }

    const messageToSend = {
      userId: MY_USER_ID,
      userNickname: MY_NICKNAME,
      message: inputValue,
      type: 'CHAT',
    };

    // 7. 메시지 발행 (서버로 전송)
    clientRef.current.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(messageToSend),
    });

    setInputValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Enter로 인한 줄바꿈 방지
      handleSendMessage();
    }
  };

  const getPlaceholderText = () => {
    if (serverStatus === 'checking') return '서버 상태 확인 중...';
    if (serverStatus === 'offline') return '채팅 서버에 연결할 수 없습니다.';
    if (!isConnected) return '채팅 서버에 연결 중...';
    return '메시지를 입력해주세요';
  };

  const isInputDisabled = !isConnected || serverStatus !== 'online';

  return (
    // Draggable 컴포넌트로 감싸기
    <Draggable nodeRef={nodeRef} handle='.chat-window-handle'>
      <div ref={nodeRef} className={styles.chatWindow}>
        {/* 'handle'로 지정된 이 부분만 드래그가 가능해짐 */}
        <header className={`${styles.chatHeader} chat-window-handle`}>
          <button className={styles.tab}>채팅</button>
          <div className='connection-status'>
            <span className={isConnected ? 'connected' : 'disconnected'}></span>
          </div>
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

        <div ref={chatContainerRef} className={styles.chatBodyContainer}>
          <div className={styles.chatBody}>
            {messages.map((msg, index) => {
              if (msg.type === 'JOIN' || msg.type === 'LEAVE') {
                return (
                  <div key={index} className={styles.systemMessage}>
                    <span>{msg.message}</span>
                  </div>
                );
              } else {
                return (
                  <ChatMessage
                    key={index}
                    isMine={msg.userId === MY_USER_ID}
                    nickname={msg.userNickname}
                    message={msg.message}
                    timestamp={msg.timestamp}
                  />
                );
              }
            })}
          </div>
        </div>

        <footer className={styles.chatInputArea}>
          <input
            className={styles.chatInput}
            type='text'
            placeholder={getPlaceholderText()}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isInputDisabled}
          />
          <button
            type='button'
            aria-label='메세지 전송'
            className={styles.sendButton}
            onClick={handleSendMessage}
            disabled={isInputDisabled}
          >
            <img src={SendIcon} alt='전송' />
          </button>
        </footer>
      </div>
    </Draggable>
  );
}

export default ChatWindow;
