import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import './WorkspacePage.module.css';
import WorkSpaceButtons from '../../components/workspace/WorkSpaceButtons.jsx';
import WorkSpaceBox from '../../components/workspace/WorkSpaceBox.jsx';
import WorkSpaceProblemModal from '../../components/workspace/WorkSpaceProblemModal';
import '../../styles/global.css';

function WorkspacePage() {

  // 모달 열림/닫힘 상태 관리
  const [IsModalOpen, setIsModalOpen] = useState(false);

  // 새 폴더 버튼 클릭 핸들러
  const handleNewFolder = () => {
    console.log('새 폴더 버튼 클릭 됨');
    // 폴더 생성 로직 추가
  };

  // 문제 생성 버튼 클릭 핸들러
  const handleNewProblem = () => {
    console.log('문제 생성 버튼 클릭 됨');
    setIsModalOpen(true);
    // 문제 생성 모달 로직 추가
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };





  return (
    <div className = { StyleSheet.workspaceContainer }>
      <h1>워크스페이스 페이지</h1>

      {/* 헤더 버튼 컴포넌트 */}
      <WorkSpaceButtons
        onNewFolder={handleNewFolder}
        onNewProblem={handleNewProblem}
      />

      {/* 메인 박스 컴포넌트 */}
      <WorkSpaceBox/>

      {/* 문제 생성 모달 */}
      <WorkSpaceProblemModal
        isOpen={IsModalOpen}
        onClose={handleCloseModal}
      />

      <p>내 문제/폴더 목록이 보이는 곳입니다.</p>
      <Link to="/solve/123"> {/* 123은 임시 문제 ID */}
        <button>A+B 문제 풀러가기</button>
      </Link>
    </div>
  );
}

export default WorkspacePage;
