import { Link } from 'react-router-dom';

function WorkspacePage() {
  return (
    <div>
      <h1>워크스페이스 페이지</h1>
      <p>내 문제/폴더 목록이 보이는 곳입니다.</p>
      <Link to='/solve/2741'>
        {' '}
        {/* 2741은 임시 문제 ID */}
        <button>A+B 문제 풀러가기</button>
      </Link>
    </div>
  );
}

export default WorkspacePage;
