import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import LandingPage from '../pages/LandingPage/LandingPage';
import AuthPage from '../pages/AuthPage/AuthPage';
import WorkspacePage from '../pages/WorkspacePage/WorkspacePage';
import SolvePage from '../pages/SolvePage/SolvePage';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/auth' element={<AuthPage />} />

        <Route element={<MainLayout />}>
          <Route path='/workspace' element={<WorkspacePage />} />
          <Route path='/solve/:problemId' element={<SolvePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
