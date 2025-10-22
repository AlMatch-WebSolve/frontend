import React, { useEffect, useState } from 'react';
import styles from './AiReviewView.module.css';
import apiClient from '../../../api/apiClient.js';

function AiReviewView({ solutionId, active = false }) {
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await apiClient.post(`/api/solutions/${solutionId}/ai/review`, { solutionId });
        const pickFirstEdit = (src) => {
          if (!src) return null;
          if (Array.isArray(src)) return src[0] ?? null;
          return src;
        };

        const edits =
          data?.verdict?.patch?.edits ??
          data?.patch?.edits ??
          null;

        const firstEdit = pickFirstEdit(edits);

        const normalized = {
          reasons: data?.verdict?.reasons ?? data?.reasons ?? [],
          strengths: data?.verdict?.strengths ?? data?.strengths ?? [],
          improvements: data?.verdict?.improvements ?? data?.improvements ?? [],
          patch: firstEdit
            ? { find: firstEdit.find ?? '', replace: firstEdit.replace ?? '' }
            : null,
        };

        if (mounted) setReview(normalized);
      } catch (e) {
        if (mounted) {
          setError('AI 리뷰를 불러오는 데 실패했습니다.');
          setReview({
            reasons: [],
            strengths: [],
            improvements: [],
            patch: null,
          });
        }
      } finally {
        mounted && setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [solutionId]);


  return (
    <div className={styles.container}>
      {loading && <div>분석 중…</div>}

      {/* strengths */}
      <div className={styles.block} aria-labelledby="good-title">
        <p id="good-title" className={styles.blockTitle}>장점</p>
        {review?.strengths?.length ? (
          <ul className={styles.list}>
            {review.strengths.map((s, i) => (
              <li key={i} className={styles.listItem}>{s}</li>
            ))}
          </ul>
        ) : (
          <p className={styles.muted}>강점이 아직 없어요.</p>
        )}
      </div>

      {/* improvements */}
      <div className={styles.block} aria-labelledby="imp-title">
        <p id="imp-title" className={styles.blockTitle}>보완점</p>
        {review?.improvements?.length ? (
          <ul className={styles.list}>
            {review.improvements.map((im, i) => (
              <li key={i} className={styles.listItem}>{im}</li>
            ))}
          </ul>
        ) : (
          <p className={styles.muted}>제안할 개선 아이디어가 없어요.</p>
        )}
      </div>

      {/* reasons */}
      <div className={styles.block} aria-labelledby="rsn-title">
        <p id="rsn-title" className={styles.blockTitle}>분석 이유</p>
        {review?.reasons?.length ? (
          <ul className={styles.list}>
            {review.reasons.map((r, i) => (
              <li key={i} className={styles.listItem}>{r}</li>
            ))}
          </ul>
        ) : (
          <p className={styles.muted}>근거 데이터가 없어요.</p>
        )}
      </div>


      {/* patch.edits */}
      <div className={styles.block} aria-labelledby="patch-title">
        <p id="patch-title" className={styles.blockTitle}>수정안</p>

        {review?.patch ? (
          <div className={styles.patchItem} role="group" aria-labelledby="patch-title">
            <p className={styles.label}>현재 코드</p>
            <pre className={styles.codeBox}>
              <code className={styles.code}>{review.patch.find}</code>
            </pre>

            <p className={styles.label}>수정 코드</p>
            <pre className={styles.codeBox}>
              <code className={styles.code}>{review.patch.replace}</code>
            </pre>
          </div>
        ) : (
          <p className={styles.muted}>제안된 패치가 없어요.</p>
        )}
      </div>

    </div>
  );
}
export default AiReviewView;