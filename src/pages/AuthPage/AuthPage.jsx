import { Link } from 'react-router-dom';

function AuthPage() {
  return (
    <div>
      <h1>로그인 / 회원가입 페이지</h1>
      {/* 실제로는 로그인 성공 후 자동으로 이동하게 됩니다. */}
      <Link to='/workspace'>
        <button>(임시) 로그인 성공</button>
      </Link>
    </div>
  );
}

export default AuthPage;
