import { Navigate, Outlet } from 'react-router-dom';
import Header from '../components/common/Header/Header';
import { useAuth } from '../hooks/useAuth';

const MainLayout = () => {
  const { isLoggedIn, loading } = useAuth(); // 인증 상태와 로딩 상태 가져오기

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      <Header />
      <main>
        {/* 이 부분에 WorkspacePage나 SolvePage가 렌더링 됩니다. */}
        <Outlet />
      </main>
    </>
  );
};

export default MainLayout;
