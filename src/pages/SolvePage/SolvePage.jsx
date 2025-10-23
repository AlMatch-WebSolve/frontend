import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import SolveSidebar from '../../components/solve/SolveSidebar/SolveSidebar';
import CodingPanel from '../../components/solve/CodingPanel/CodingPanel';
import ResultPanel from '../../components/solve/ResultPanel/ResultPanel';
import ProblemPanel from '../../components/problems/ProblemPanel/ProblemPanel';
import styles from './SolvePage.module.css';
import apiClient from '../../api/apiClient';
import TestCaseModal from '../../components/solve/TestCaseModal/TestCaseModal';

// Split defaults
const LEFT_MIN = 300;   // 왼쪽(문제) 최소 너비
const RIGHT_MIN = 600;  // 오른쪽(IDE) 최소 너비
const INIT_LEFT = 500;  // 초기 왼쪽 폭

const TOP_INIT = 524;   // 초기 CodingPanel 높이
const TOP_MIN = 200;    // 최소 CodingPanel 높이
const BOT_MIN = 200;    // 최소 ResultPanel 높이

function SolvePage() {
  const { solutionId } = useParams();
  const numericSolutionId = useMemo(() => Number(solutionId), [solutionId]);

  // Coding/Review 탭 상태
  const [codingTab, setCodingTab] = useState('code');

  // 제출/결과 패널 상태
  const [submitRan, setSubmitRan] = useState(false);
  const [submitResult, setSubmitResult] = useState({ url: '' });
  const [resultActiveTab, setResultActiveTab] = useState('test');

  // 솔루션 조회 상태
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [solution, setSolution] = useState(null);

  // 테스트 실행 상태
  const [ran, setRan] = useState(false);
  const [tests, setTests] = useState([]);
  const [testing, setTesting] = useState(false);

  // 모달
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openTestCaseModal = () => setIsModalOpen(true);
  const closeTestCaseModal = () => setIsModalOpen(false);

  // 문제 ID 파생
  const problemId = useMemo(
    () => (solution?.problemInfo?.id != null ? Number(solution.problemInfo.id) : null),
    [solution],
  );

  // 솔루션 조회
  useEffect(() => {
    if (!Number.isFinite(numericSolutionId)) {
      setSolution(null);
      setErr('유효하지 않은 솔루션 ID입니다.');
      return;
    }

    let alive = true;
    setLoading(true);
    setErr(null);
    setSolution(null);
    setSubmitRan(false);
    setSubmitResult({ url: '' });
    setResultActiveTab('test');

    (async () => {
      try {
        const res = await apiClient.get(`/api/solutions/${numericSolutionId}`);
        if (!alive) return;
        setSolution(res.data || null);
      } catch (e) {
        if (!alive) return;
        const status = e?.response?.status;
        setErr(status === 404 ? '솔루션을 찾을 수 없습니다. (404)' : '솔루션 조회 실패');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [numericSolutionId]);

  // 테스트 실행
  const handleRunTests = async (code, lang, solId) => {
    if (!solId) solId = numericSolutionId;
    setTesting(true);
    try {
      const normalized = (code ?? '').replace(/\r\n?/g, '\n');
      const language = lang || 'java';

      const { data } = await apiClient.post('/api/execute/test/solution', {
        solutionId: solId,
        code: normalized,
        language,
      });

      const mapped = (data?.results ?? []).map((r, i) => ({
        id: r.testCaseId ?? i,
        type: r.type ?? '',
        input: r.input ?? '',
        expected: r.expectedOutput ?? '',
        output: r.actualOutput ?? '',
        pass: !!r.isPassed,
        error: r.error ?? null,
        executionTime: r.executionTime ?? null,
      }));

      setTests(mapped);
      setRan(true);
      setResultActiveTab('test');
    } catch (err) {
      const status = err?.response?.status;
      if (status === 400) {
        alert('잘못된 요청(지원하지 않는 언어 등)입니다. (400)');
      } else if (status === 404) {
        alert('솔루션을 찾을 수 없습니다. (404)');
      } else {
        console.error('테스트 실행 실패:', err);
        alert('테스트 실행에 실패했습니다.');
      }
    } finally {
      setTesting(false);
    }
  };

  // 제출 후 콜백
  const handleAfterSubmit = ({ url }) => {
    setSubmitRan(true);
    setSubmitResult({ url });
    setResultActiveTab('submit');
  };

  // Resizable Split Logic

  // 가로 분할(문제/IDE)
  const [leftW, setLeftW] = useState(INIT_LEFT);
  const containerRef = useRef(null);
  const sidebarWrapRef = useRef(null);
  const leftWrapRef = useRef(null);
  const hDrag = useRef({ active: false, startX: 0, startW: INIT_LEFT });

  // 세로 분할(Coding/Result)
  const [topH, setTopH] = useState(TOP_INIT);
  const rightPanelRef = useRef(null);
  const topWrapRef = useRef(null);
  const vDrag = useRef({ active: false, startY: 0, startH: TOP_INIT });

  // 가로 가능한 전체 폭 계산(좌측 사이드바 제외)
  const totalAvailableWidth = () => {
    const cont = containerRef.current;
    const side = sidebarWrapRef.current;
    const dwFallback = 10; // divider 히트존 가로폭(실제 보이는 선은 0)
    if (!cont || !side) return 0;
    const cw = cont.getBoundingClientRect().width;
    const sw = side.getBoundingClientRect().width;
    return cw - sw - dwFallback;
  };
  const clampLeft = (raw) => {
    const total = totalAvailableWidth();
    const maxLeft = Math.max(LEFT_MIN, total - RIGHT_MIN);
    return Math.max(LEFT_MIN, Math.min(raw, maxLeft));
  };

  // 세로 가능한 전체 높이 계산(오른쪽 패널 내부)
  const totalAvailableHeight = () => {
    const right = rightPanelRef.current;
    if (!right) return 0;
    const rh = right.getBoundingClientRect().height;
    const dhFallback = 10; // vDivider 히트존 높이
    return rh - dhFallback;
  };
  const clampTop = (raw) => {
    const total = totalAvailableHeight();
    const maxTop = Math.max(TOP_MIN, total - BOT_MIN);
    return Math.max(TOP_MIN, Math.min(raw, maxTop));
  };

  // 창 리사이즈 시 현재 값 보정
  useEffect(() => {
    const onResize = () => {
      setLeftW((w) => clampLeft(w));
      setTopH((h) => clampTop(h));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 가로 드래그
  const onHMouseDown = (e) => {
    hDrag.current.active = true;
    hDrag.current.startX = e.clientX;
    hDrag.current.startW =
      leftWrapRef.current?.getBoundingClientRect().width ?? leftW;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  };
  const onHMouseMove = (e) => {
    if (!hDrag.current.active) return;
    const dx = e.clientX - hDrag.current.startX;
    setLeftW(clampLeft(hDrag.current.startW + dx));
  };
  const onHMouseUp = () => {
    if (!hDrag.current.active) return;
    hDrag.current.active = false;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  };

  // 세로 드래그
  const onVMouseDown = (e) => {
    vDrag.current.active = true;
    vDrag.current.startY = e.clientY;
    vDrag.current.startH =
      topWrapRef.current?.getBoundingClientRect().height ?? topH;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'row-resize';
  };
  const onVMouseMove = (e) => {
    if (!vDrag.current.active) return;
    const dy = e.clientY - vDrag.current.startY;
    setTopH(clampTop(vDrag.current.startH + dy));
  };
  const onVMouseUp = () => {
    if (!vDrag.current.active) return;
    vDrag.current.active = false;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  };

  // 글로벌 마우스 이벤트 등록
  useEffect(() => {
    window.addEventListener('mousemove', onHMouseMove);
    window.addEventListener('mouseup', onHMouseUp);
    window.addEventListener('mousemove', onVMouseMove);
    window.addEventListener('mouseup', onVMouseUp);
    return () => {
      window.removeEventListener('mousemove', onHMouseMove);
      window.removeEventListener('mouseup', onHMouseUp);
      window.removeEventListener('mousemove', onVMouseMove);
      window.removeEventListener('mouseup', onVMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isReview = codingTab === 'review';

  return (
    <div ref={containerRef} className={`${styles.container} ide-layout`}>
      {/* 좌측 고정 사이드바(폭 측정용) */}
      <div ref={sidebarWrapRef} className={styles.sidebarWrap}>
        <SolveSidebar currentProblemId={problemId} />
      </div>

      {/* 왼쪽: 문제 패널 */}
      <div
        ref={leftWrapRef}
        className={styles.leftPanel}
        style={{ width: `${leftW}px` }}
      >
        <div className={styles.problemContainer}>
          {loading ? (
            <div className={`${styles.infoBox} info-box`}>솔루션 불러오는 중…</div>
          ) : err ? (
            <div className={`${styles.errorBox} err-box`}>{err}</div>
          ) : solution?.problemInfo ? (
            <ProblemPanel
              problem={solution.problemInfo}
              problemId={problemId ?? undefined}
            />
          ) : (
            <div className={`${styles.infoBox} info-box`}>문제 정보를 확인 중입니다…</div>
          )}
        </div>
      </div>

      {/* 가운데: 세로 구분선 */}
      <div
        className={styles.divider}
        onMouseDown={onHMouseDown}
        aria-hidden="true"
      >
        <span className={styles.dividerHit} />
      </div>

      {/* 오른쪽: IDE 패널 */}
      <div ref={rightPanelRef} className={`${styles.rightPanel} solve-container`}>
        {/* 위: CodingPanel */}
        <div
          ref={topWrapRef}
          className={styles.topPanel}
          style={
            isReview
              ? { flex: '1 1 auto', minHeight: 0 }
              : { height: `${topH}px`, minHeight: `${TOP_MIN}px` }
          }
        >
          <CodingPanel
            onTabChange={setCodingTab}
            solutionId={numericSolutionId}
            problemId={problemId ?? undefined}
            initialCode={solution?.code}
            fileName={solution?.fileName}
            onAfterSubmit={handleAfterSubmit}
            hasSubmitted={submitRan}
            onTest={(code, lang) => handleRunTests(code, lang, numericSolutionId)}
          />
        </div>

        {/* 위/아래 구분선 — 코드 탭에서만 */}
        {!isReview && (
          <div
            className={styles.vDivider}
            onMouseDown={onVMouseDown}
            aria-hidden="true"
          >
            <span className={styles.vDividerHit} />
          </div>
        )}

        {/* 아래: ResultPanel */}
        {!isReview && (
          <div
            className={styles.bottomPanel}
            style={{ flex: '1 1 auto', minHeight: `${BOT_MIN}px` }}
          >
            <ResultPanel
              ran={ran}
              tests={tests}
              submitRan={submitRan}
              submitResult={submitResult}
              activeTab={resultActiveTab}
              onOpenTestCaseModal={openTestCaseModal}
            />
          </div>
        )}
      </div>

      {/* 테스트케이스 모달 */}
      {isModalOpen && (
        <TestCaseModal onClose={closeTestCaseModal} solutionId={numericSolutionId} />
      )}
    </div>
  );
}

export default SolvePage;
