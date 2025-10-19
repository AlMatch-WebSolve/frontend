import React, { useRef, useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import styles from './ChatWindow.module.css';
import CloseIcon from '../../../assets/icons/CloseIcon.svg';
import SendIcon from '../../../assets/icons/SendIcon.svg';
import ChatMessage from '../ChatMessage';

const WEBSOCKET_URL = import.meta.env.VITE_WS_URL || '/ws';
const MAX_RECONNECT_ATTEMPTS = 3;

function ChatWindow({ onClose, currentUser, serverStatus }) {
  console.log(
    `%c[ChatWindow] Component Rendered at ${new Date().toLocaleTimeString()}`,
    'color: dodgerblue; font-weight: bold;',
  );

  const nodeRef = useRef(null);
  const chatContainerRef = useRef(null);
  const clientRef = useRef(null); // STOMP 클라이언트 인스턴스를 저장하기 위한 ref
  const reconnectAttempts = useRef(0); // 재연결 시도 횟수 추적
  const hasAddedJoinMessage = useRef(false);

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  // 서버의 상태를 관리: 'checking'(확인중), 'online'(온라인), 'offline'(오프라인)

  useEffect(() => {
    // WebSocket 연결을 위한 useEffect
    // currentUser 정보가 없거나 서버가 온라인 상태가 아니면 연결하지 않음.
    if (!currentUser?.userId || serverStatus !== 'online') {
      return;
    }
    const groupLabel = `[Effect 2] Starting connection for user: ${currentUser.userNickname}`;
    console.groupCollapsed(groupLabel);

    const client = new Client({
      webSocketFactory: () => new SockJS(WEBSOCKET_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('[STOMP] Connected!');
        console.log('[JOIN] Sending JOIN message...');
        setIsConnected(true);
        reconnectAttempts.current = 0;

        setTimeout(() => {
          if (!hasAddedJoinMessage.current) {
            const joinMessage = {
              userId: currentUser.userId,
              userNickname: currentUser.userNickname,
              message: `${currentUser.userNickname}님이 입장하셨습니다.`,
              type: 'JOIN',
              timestamp: new Date().toISOString(),
            };
            client.publish({
              destination: '/app/chat.addUser',
              body: JSON.stringify(joinMessage),
            });
            // setMessages([joinMessage]);
            hasAddedJoinMessage.current = true;
            console.log('[JOIN] Message sent');
          }
        }, 100); // 100ms 딜레이 후 입장 메시지 전송

        client.subscribe('/topic/public', (message) => {
          const received = JSON.parse(message.body);
          console.log('✅ Received from Server:', received);

          setMessages((prev) => {
            const isDuplicate = prev.some(
              (msg) => msg.timestamp === received.timestamp,
            );
            return isDuplicate ? prev : [...prev, received];
          });
        });
      },

      onStompError: (frame) => {
        console.error(
          `[STOMP Error] Broker reported error: ${frame.headers['message']}`,
        );
        console.error(`[STOMP Error] Additional details: ${frame.body}`);
      },

      onDisconnect: () => {
        setIsConnected(false);
        reconnectAttempts.current += 1;
        if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
          if (client) client.deactivate();
        }
      },
    });

    // 생성된 인스턴스를 즉시 clientRef에 할당합니다.
    // 이제 handleSendMessage가 항상 최신 client를 참조할 수 있습니다.
    clientRef.current = client;
    client.activate();

    // 정리(Cleanup) 함수
    return () => {
      console.groupCollapsed(
        `[Cleanup] Cleaning up for user: ${currentUser.userNickname}`,
      );
      const clientToDisconnect = clientRef.current;
      if (clientToDisconnect) {
        if (clientToDisconnect.connected) {
          console.log(
            '[Cleanup] Client is connected. Sending LEAVE message...',
          );
          const leaveMessage = {
            userId: currentUser.userId,
            userNickname: currentUser.userNickname,
            message: `${currentUser.userNickname}님이 퇴장하셨습니다.`,
            type: 'LEAVE',
          };
          try {
            clientToDisconnect.publish({
              destination: '/app/chat.addUser',
              body: JSON.stringify(leaveMessage),
            });
            console.log('[Cleanup] LEAVE message sent.');
          } catch (err) {
            console.error('[Cleanup] Failed to publish LEAVE message:', err);
          }

          // deactivate 전에 로그 먼저 찍기
          console.log('[Cleanup] Deactivating client...');
          clientToDisconnect.deactivate();
          console.log('[Cleanup] Client deactivated.');
        } else {
          console.log('[Cleanup] Client already disconnected. Deactivating...');
          clientToDisconnect.deactivate();
        }
      } else {
        console.warn('[Cleanup] No clientRef found — nothing to clean up.');
      }
      // join 메시지 초기화
      hasAddedJoinMessage.current = false;

      console.groupEnd(); // Cleanup 그룹 종료
      console.groupEnd(); // Effect 그룹 종료
    };
  }, [currentUser, serverStatus]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    const client = clientRef.current;
    if (inputValue.trim() === '' || !client?.connected) {
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
