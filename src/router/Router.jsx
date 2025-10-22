import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import LandingPage from '../pages/LandingPage/LandingPage';
import AuthPage from '../pages/AuthPage/AuthPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage/ResetPasswordPage';
import WorkspacePage from '../pages/WorkspacePage/WorkspacePage';
import SolvePage from '../pages/SolvePage/SolvePage';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/auth' element={<AuthPage />} />
        <Route path='/forgot-password' element={<ForgotPasswordPage />} />
        <Route path='/reset-password' element={<ResetPasswordPage />} />

        <Route element={<MainLayout />}>
          <Route path='/workspace' element={<WorkspacePage />} />
          <Route path='/solve/:solutionId' element={<SolvePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
