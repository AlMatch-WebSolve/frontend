import React, { useRef, useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import styles from './ChatWindow.module.css';
import CloseIcon from '../../../assets/icons/CloseIcon.svg';
import SendIcon from '../../../assets/icons/SendIcon.svg';
import ChatMessage from '../ChatMessage';

// --- 설정 (Configuration) ---
// 상세 STOMP 로그를 보려면 이 값을 true로 변경하세요.
const ENABLE_STOMP_DEBUG = false;
const API_BASE_URL =
  'http://ec2-52-78-83-137.ap-northeast-2.compute.amazonaws.com:8080';
const MAX_RECONNECT_ATTEMPTS = 3;

function ChatWindow({ onClose, currentUser }) {
  console.log(
    `%c[ChatWindow] Component Rendered at ${new Date().toLocaleTimeString()}`,
    'color: dodgerblue; font-weight: bold;',
  );

  const nodeRef = useRef(null);
  const chatContainerRef = useRef(null);
  const clientRef = useRef(null); // STOMP 클라이언트 인스턴스를 저장하기 위한 ref
  const reconnectAttempts = useRef(0); // 재연결 시도 횟수 추적

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  // 서버의 상태를 관리: 'checking'(확인중), 'online'(온라인), 'offline'(오프라인)
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    // 이 Effect 스코프에서만 사용할 client 변수를 선언합니다.
    let client;
    console.groupCollapsed(`[ChatWindow] Connecting... 🚀`);

    // 서버가 살아있는지 먼저 확인 (Health Check)
    const connectToServer = async () => {
      try {
        console.log('1. Health Check starting...');
        const response = await fetch(`${API_BASE_URL}/api/chat/health`);
        if (!response.ok)
          throw new Error(`Health check failed: ${response.status}`);

        console.log('2. Health Check successful.');
        setServerStatus('online');
      } catch (error) {
        console.error('1a. Health Check failed. Aborting connection.', error);
        setServerStatus('offline');
        console.groupEnd(); // 에러 발생 시 그룹 닫기
        return; // Health Check 실패 시 더 이상 진행하지 않음
      }

      // Health Check 성공 시 STOMP 클라이언트 설정 및 활성화
      // new Client()를 지역 변수인 client에 할당합니다.
      client = new Client({
        webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
        debug: (str) => {
          if (ENABLE_STOMP_DEBUG) {
            console.log(new Date(), str);
          }
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,

        onConnect: (frame) => {
          console.log('3. STOMP Connected!', frame);
          console.groupEnd(); // Connecting 그룹 닫기
          console.groupCollapsed(`[ChatWindow] Connection Active 🟢`);
          console.log('Subscribing to /topic/public and sending JOIN message.');
          console.groupEnd();

          setIsConnected(true);
          reconnectAttempts.current = 0; // 연결 성공 시 재시도 횟수 초기화

          // 구독 및 JOIN 메시지 발행
          client.subscribe('/topic/public', (message) => {
            const receivedMessage = JSON.parse(message.body);
            console.log(
              '✅ 서버로부터 받은 실제 메시지 객체:',
              receivedMessage,
            );
            setMessages((prevMessages) => [...prevMessages, receivedMessage]);
          });
          const joinMessage = {
            userId: currentUser.userId,
            userNickname: currentUser.userNickname,
            message: `${currentUser.userNickname}님이 입장하셨습니다.`,
            type: 'JOIN',
          };
          client.publish({
            destination: '/app/chat.addUser',
            body: JSON.stringify(joinMessage),
          });
        },

        onStompError: (frame) => {
          console.error('STOMP 오류:', frame.headers['message'], frame.body);
          console.groupEnd(); // 에러 발생 시에도 그룹 닫기
        },

        onDisconnect: (frame) => {
          setIsConnected(false);
          console.warn('STOMP Disconnected.', frame);
          reconnectAttempts.current += 1;

          if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
            console.error('Max reconnect attempts reached. Stopping.');
            client.deactivate();
            setServerStatus('offline');
          } else {
            console.log(
              `Attempting to reconnect... (${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})`,
            );
          }
        },
      });

      client.activate();
      clientRef.current = client;
    };

    connectToServer();

    // 컴포넌트가 사라질 때 실행되는 정리(Cleanup) 함수
    return () => {
      console.log(
        `%c[ChatWindow] Cleanup function called at ${new Date().toLocaleTimeString()}`,
        'color: red; font-weight: bold;',
      );
      console.groupCollapsed(`[ChatWindow] Disconnecting... 🔴`);

      if (client) {
        console.log('Deactivating client instance...');

        // LEAVE 메시지는 연결된 상태일 때만 보내는 것이 좋습니다.
        if (client.connected) {
          const leaveMessage = {
            userId: currentUser.userId,
            userNickname: currentUser.userNickname,
            message: `${currentUser.userNickname}님이 퇴장하셨습니다.`,
            type: 'LEAVE',
          };
          client.publish({
            destination: '/app/chat.addUser',
            body: JSON.stringify(leaveMessage),
          });
        }

        client.deactivate();
        console.log('Deactivation command sent.');
      } else {
        console.log('No client instance to deactivate.');
      }
      console.groupEnd();
    };
  }, []); // 마운트 시 한 번만 실행

  // 새 메시지가 추가될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() === '' || !clientRef.current?.connected) {
      alert('메시지를 입력해주세요 또는 연결 상태를 확인하세요.');
      return;
    }

    const messageToSend = {
      userId: currentUser.userId,
      userNickname: currentUser.userNickname,
      message: inputValue,
      type: 'CHAT',
    };

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
              // timestamp가 고유하다는 보장이 없으므로, index를 조합하여 사용합니다.
              const uniqueKey = msg.timestamp
                ? `${msg.timestamp}-${index}`
                : index;

              if (msg.type === 'JOIN' || msg.type === 'LEAVE') {
                return (
                  <div key={uniqueKey} className={styles.systemMessage}>
                    <span>{msg.message}</span>
                  </div>
                );
              } else {
                return (
                  <ChatMessage
                    key={uniqueKey}
                    isMine={msg.userId === currentUser.userId}
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
