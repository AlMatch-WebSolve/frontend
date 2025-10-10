import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div>
      <h1>랜딩 페이지</h1>
      <p>AI와 함께하는 가장 스마트한 알고리즘 학습</p>
      <Link to="/auth">
        <button>시작하기 →</button>
      </Link>
    </div>
  );
}

export default LandingPage;
