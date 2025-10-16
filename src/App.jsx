import Router from './router/Router';
import { AuthProvider } from './auth/AuthProvider';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;
