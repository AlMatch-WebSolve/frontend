import React, { useEffect, useMemo, useState } from 'react';
import apiClient from '../../../api/apiClient';
import CopyIcon from '../../../assets/icons/CopyIcon.svg';
import CheckIcon from '../../../assets/icons/CheckIcon.svg';
import styles from './ProblemViewer.module.css';

function Chip({ children }) {
  return <span className={styles.chip}>{children}</span>;
}

// API → 뷰 모델 변환
function toViewerModel(apiData) {
  const samples = [];
  (apiData.examples ?? []).forEach((ex, idx) => {
    const no = idx + 1;
    if (ex.input != null) samples.push({ label: `예제 입력 ${no}`, value: ex.input });
    if (ex.output != null) samples.push({ label: `예제 출력 ${no}`, value: ex.output });
  });

  const statement =
    typeof apiData.description === 'string'
      ? apiData.description.split(/\r?\n/).filter(Boolean)
      : [];

  return {
    level: { tierText: 'LV', rank: apiData.level ?? 1 },
    title: apiData.title ?? '',
    tags: apiData.tags ?? [],
    statement,
    inputDesc: apiData.inputDescription ?? '',
    outputDesc: apiData.outputDescription ?? '',
    samples,
    imageUrl: null,
  };
}

function ProblemViewer({ problem, problemId }) {
  const [copiedId, setCopiedId] = useState(null);
  const [data, setData] = useState(problem ? toViewerModel(problem) : null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);

  const isIncomplete = useMemo(() => {
    if (!problem) return false;
    const tags = problem.tags;
    return !Array.isArray(tags) || tags.length === 0;
  }, [problem]);

  useEffect(() => {
    if (problem) {
      setData(toViewerModel(problem));
      setLoading(false);
      setNotFound(false);
      setError(null);
    }
  }, [problem]);

  useEffect(() => {
    if (problem && !isIncomplete) return;
    const pid = Number(problem?.id ?? problemId);
    if (!Number.isFinite(pid)) {
      setData(null); setLoading(false); setNotFound(false); setError(null);
      return;
    }

    let mounted = true;
    setLoading(true); setError(null); setNotFound(false);

    (async () => {
      try {
        const res = await apiClient.get(`/api/problems/${pid}`);
        if (!mounted) return;
        setData(toViewerModel(res.data));
      } catch (err) {
        const res = err?.response;
        if (!mounted) return;
        if (res?.status === 404) setNotFound(true);
        else setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [problem, problemId, isIncomplete]);

  const levelText = useMemo(() => {
    const level = data?.level;
    return typeof level === 'string'
      ? level
      : `${level?.tierText ?? 'LV'}. ${level?.rank ?? 1}`;
  }, [data]);

  const handleCopy = async (text, key) => {
    try {
      if (navigator?.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedId(key);
      setTimeout(() => setCopiedId(null), 1000);
    } catch {
      alert('복사에 실패했습니다.');
    }
  };

  // 상태 UI
  if (!problem && !Number.isFinite(Number(problemId))) {
    return <p className={styles.paragraph}>문제 ID가 필요합니다.</p>;
  }
  if (loading) return <p className={styles.paragraph}>문제 불러오는 중…</p>;
  if (notFound) return <p className={styles.paragraph}>문제를 찾을 수 없습니다. (ID: {problemId})</p>;
  if (error) return <p className={styles.paragraph}>문제 조회 중 오류가 발생했습니다.</p>;
  if (!data) return null;

  return (
    <div className={styles.problemContainer}>
      <div className={styles.problemHeader}>
        <div className={styles.problemLevel}>{levelText}</div>
        <p className={styles.problemTitle}>{data.title}</p>
      </div>

      {!!data.tags?.length && (
        <div className={styles.tags} aria-label="알고리즘 분류 태그">
          {data.tags.map((t, i) => (
            <Chip key={`${t}-${i}`}>{t}</Chip>
          ))}
        </div>
      )}

      <div className={styles.section}>
        <p className={`${styles.sectionTitle} ${styles.sectionProblem}`}>문제</p>
        {data.statement.map((line, i) => (
          <p key={i} className={styles.paragraph}>{line}</p>
        ))}
      </div>

      <div className={styles.section}>
        <p className={styles.sectionTitle}>입력</p>
        <p className={styles.paragraph}>{data.inputDesc}</p>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionTitle}>출력</p>
        <p className={styles.paragraph}>{data.outputDesc}</p>
      </div>

      <div className={`${styles.section} ${styles.sampleTop}`}>
        {data.samples.map((s, i) => {
          const key = `sample-${i}`;
          return (
            <div key={i} className={styles.sampleItem}>
              <div className={styles.sampleHeader}>
                <span className={styles.sampleLabel}>{s.label}</span>
                <button
                  type="button"
                  className={styles.copyBtn}
                  onClick={() => handleCopy(s.value, key)}
                  aria-label={copiedId === key ? '복사됨' : '코드 복사'}
                  title="복사"
                >
                  {copiedId === key ? (
                    <img src={CheckIcon} alt="" aria-hidden />
                  ) : (
                    <img src={CopyIcon} alt="" aria-hidden />
                  )}
                </button>
              </div>
              <pre className={styles.sampleBox}>
                <code>{s.value}</code>
              </pre>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProblemViewer;
