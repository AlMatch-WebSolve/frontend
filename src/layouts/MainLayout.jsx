import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header/Header';

const MainLayout = () => {
  return (
    <>
      <Header />
      <main>
        {/* 이 부분에 각 페이지 컴포넌트가 렌더링 됩니다. */}
        <Outlet />
      </main>
    </>
  );
};

export default MainLayout;
