import { useState, useEffect, useCallback, useMemo } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Header from '../components/common/Header/Header';
import ChatWindow from '../components/chat/ChatWindow/ChatWindow';
import { useAuth } from '../hooks/useAuth';

const API_BASE_URL =
  'http://ec2-52-78-83-137.ap-northeast-2.compute.amazonaws.com:8080';

const MainLayout = () => {
  const { isLoggedIn, loading, user } = useAuth(); // 인증 상태와 로딩 상태 가져오기
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        await fetch(`${API_BASE_URL}/api/chat/health`);
        setServerStatus('online');
      } catch {
        setServerStatus('offline');
      }
    };
    checkServerHealth();
  }, []);

  // 함수를 useCallback으로 감싸서, 처음 한 번만 생성되도록 최적화
  const handleToggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev);
  }, []); // 의존성 배열이 비어있으므로 재생성되지 않음

  const currentUser = useMemo(
    () => ({ userId: user.userId, userNickname: user.name }),
    [user.userId, user.name],
  );

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
          currentUser={currentUser}
          serverStatus={serverStatus}
        />
      )}
    </>
  );
};

export default MainLayout;
