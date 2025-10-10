import { Link, useParams } from 'react-router-dom';

function SolvePage() {
  // URL에 있는 문제 ID를 가져올 수 있습니다.
  const { problemId } = useParams();

  return (
    <div>
      <h1>문제 풀이 페이지</h1>
      <p>현재 풀고 있는 문제 ID: {problemId}</p>
      <Link to="/workspace">
        <button>← 목록으로 돌아가기</button>
      </Link>
      <Link to="/">
        <button>시작으로 돌아가기</button>
      </Link>
    </div>
  );
}

export default SolvePage;
