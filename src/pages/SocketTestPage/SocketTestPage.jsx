import { useState } from 'react';
import styles from './SocketTestPage.module.css';
import Header from '../../components/common/Header/Header';
import ChatWindow from '../../components/chat/ChatWindow/ChatWindow';

function SocketTestPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleToggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };
  return (
    <>
      <Header onChatButtonClick={handleToggleChat} />
      <div className={styles.landingContainer}>
        {/* 메인 슬로건 */}
        <h1 className={styles.slogan}>채팅테스트 페이지 </h1>
      </div>
      {isChatOpen && <ChatWindow onClose={handleToggleChat} />}
    </>
  );
}

export default SocketTestPage;
