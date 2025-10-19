import { useState, useCallback } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Header from '../components/common/Header/Header';
import ChatWindow from '../components/chat/ChatWindow/ChatWindow';
import { useAuth } from '../hooks/useAuth';

const MainLayout = () => {
  const { isLoggedIn, loading, user } = useAuth(); // 인증 상태와 로딩 상태 가져오기
  const [isChatOpen, setIsChatOpen] = useState(false);

  // 함수를 useCallback으로 감싸서, 처음 한 번만 생성되도록 최적화
  const handleToggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev);
  }, []); // 의존성 배열이 비어있으므로 재생성되지 않음

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to='/auth' replace />;
  }

  if (!user) {
    return <div>사용자 정보를 불러오는 중...</div>;
  }

  return (
    <>
      <Header onChatButtonClick={handleToggleChat} />
      <main>
        {/* 이 부분에 WorkspacePage나 SolvePage가 렌더링 됩니다. */}
        <Outlet />
      </main>
      {isChatOpen && (
        <ChatWindow
          onClose={handleToggleChat}
          currentUser={{ userId: user.userId, userNickname: user.name }}
        />
      )}
    </>
  );
};

export default MainLayout;
