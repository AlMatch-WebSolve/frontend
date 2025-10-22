import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '../../assets/icons/CloseIcon.svg';
import styles from './SettingsModal.module.css';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
import apiClient from '../../api/apiClient.js';

const DEFAULT_SHORTCUTS = [
  { key: 'Ctrl+S', ko: '저장', en: 'Save', desc: '저장' },
  {
    key: 'Ctrl+Z',
    ko: '문자삽입취소',
    en: 'Undo Insert Characters',
    desc: '문자 삽입 취소',
  },
  { key: 'Ctrl+C', ko: '복사', en: 'Copy', desc: '복사' },
  { key: 'Ctrl+V', ko: '붙여넣기', en: 'Paste', desc: '붙여넣기' },
  { key: 'Ctrl+A', ko: '모두선택', en: 'Select All', desc: '모두 선택' },
  {
    key: 'Ctrl+/',
    ko: '주석 전환',
    en: 'Toggle Comment',
    desc: '주석 생성 및 삭제',
  },
  {
    key: "Ctrl+'+'/ Ctrl+'-'",
    ko: '확대/축소',
    en: 'ZoomIn / ZoomOut',
    desc: '글자 크기 확대 / 축소',
  },
];

const LANGUAGES = ['Java', 'JavaScript', 'Python'];

const SERVER_LANG_TO_UI = {
  JAVA: 'Java',
  JAVASCRIPT: 'JavaScript',
  PYTHON: 'Python',
};
const UI_LANG_TO_SERVER = {
  Java: 'JAVA',
  JavaScript: 'JAVASCRIPT',
  Python: 'PYTHON',
};
const SERVER_THEME_TO_UI = {
  LIGHT: 'light',
  DARK: 'dark',
};
const UI_THEME_TO_SERVER = {
  light: 'LIGHT',
  dark: 'DARK',
};

const ensureValidUiLanguage = (val) => (LANGUAGES.includes(val) ? val : 'Java');

export default function SettingsModalLocal({
  open,
  onClose,
  onSave,
  onLogout,
  initialTheme = 'light',
  initialLanguage = 'Java',
  shortcuts = DEFAULT_SHORTCUTS,
}) {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(initialTheme);
  const [language, setLanguage] = useState(initialLanguage);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ConfirmModal 제어
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmKind, setConfirmKind] = useState(null); // 'save' | 'logout' | null

  // 모달 열릴 때마다 ConfirmModal/상태 초기화 + 서버에서 설정 조회
  useEffect(() => {
    if (!open) return;

    // 절대 뜨지 않도록 초기화
    setConfirmOpen(false);
    setConfirmKind(null);
    setSaving(false);

    let alive = true;
    (async () => {
      try {
        setLoading(true);

        if (alive) {
          setTheme(initialTheme);
          setLanguage(initialLanguage);
        }

        const { data } = await apiClient.get('/api/users/me/settings');

        // 테마 매핑 (서버 → UI)
        const rawTheme = String(data?.theme ?? initialTheme)
          .trim()
          .toUpperCase();
        const nextTheme = SERVER_THEME_TO_UI[rawTheme] ?? initialTheme; // 'light' | 'dark'

        // 언어 매핑 (서버 → UI)
        const rawLang = String(data?.language ?? initialLanguage)
          .trim()
          .toUpperCase();
        const mappedUiLang = SERVER_LANG_TO_UI[rawLang] ?? initialLanguage;
        const nextLang = ensureValidUiLanguage(mappedUiLang);

        if (alive) {
          setTheme(nextTheme);
          setLanguage(nextLang);
        }
      } catch (e) {
        // 조회 실패해도 기본값 유지
        console.error(
          '설정 불러오기 실패:',
          e?.response?.status,
          e?.response?.data,
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open, initialTheme, initialLanguage]);

  if (!open) return null;

  // 저장 흐름 - 버튼 클릭 시 ConfirmModal만 연다
  const askSave = () => {
    setConfirmKind('save');
    setConfirmOpen(true);
  };

  // ConfirmModal 확인에서만 백엔드 호출
  const handleConfirmSave = async () => {
    setSaving(true);
    try {
      const payload = {
        theme: UI_THEME_TO_SERVER[theme] ?? String(theme).trim().toUpperCase(), // LIGHT / DARK
        language:
          UI_LANG_TO_SERVER[language] ?? String(language).trim().toUpperCase(), // JAVA / JAVASCRIPT / PYTHON
      };

      const res = await apiClient.put('/api/users/me/settings', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.status === 200) {
        onSave?.(payload);
        setConfirmOpen(false);
        onClose?.();
      } else {
        alert('설정 저장에 실패했습니다.');
      }
    } catch (e) {
      console.error('설정 저장 실패:', e?.response?.status, e?.response?.data);
      if (e?.response?.status === 400) {
        alert('잘못된 요청입니다. 값을 다시 확인해주세요.');
      } else {
        alert('설정 저장에 실패했습니다.');
      }
    } finally {
      setSaving(false);
    }
  };

  // 로그아웃 흐름 - 버튼 클릭 시 ConfirmModal만 연다
  const askLogout = () => {
    setConfirmKind('logout');
    setConfirmOpen(true);
  };

  // ConfirmModal 확인에서만 로그아웃 API 호출
  const handleConfirmLogout = async () => {
    setSaving(true);
    try {
      const res = await apiClient.post('/api/auth/logout');
      if (res.status === 204) {
        await onLogout?.();
        navigate('/', { replace: true });
        setConfirmOpen(false);
        onClose?.();
      } else {
        alert('로그아웃에 실패했습니다.');
      }
    } catch (e) {
      console.error('로그아웃 실패:', e?.response?.status, e?.response?.data);
      alert('로그아웃에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // ConfirmModal 취소시 설정 모달 유지
  const handleCancelConfirm = () => {
    setConfirmOpen(false);
    setConfirmKind(null);
  };

  // ConfirmModal 문구
  const confirmLines =
    confirmKind === 'save'
      ? ['변경사항을 저장합니다.', '계속하시겠습니까?']
      : confirmKind === 'logout'
        ? ['로그아웃합니다.', '계속하시겠습니까?']
        : [];

  // ConfirmModal 확인 핸들러 매핑
  const onConfirm =
    confirmKind === 'save'
      ? handleConfirmSave
      : confirmKind === 'logout'
        ? handleConfirmLogout
        : undefined;

  return (
    <div className={styles.backdrop} onClick={saving ? undefined : onClose}>
      <div
        className={styles.settingsContainer}
        aria-modal='true'
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.settingsHeader}>
          <p id='settings-title' className={styles.settingsTitle}>
            설정
          </p>
          <button
            aria-label='닫기'
            className={styles.closeBtn}
            onClick={onClose}
            disabled={saving}
          >
            <img src={CloseIcon} alt='닫기' />
          </button>
        </div>

        <div className={styles.settingsInner} aria-busy={loading || saving}>
          <p className={styles.keyTitle}>단축키</p>
          <div className={styles.tableWrap}>
            <table className={styles.table} aria-label='단축키 목록'>
              <thead>
                <tr>
                  <th>단축키</th>
                  <th>한글</th>
                  <th>영어</th>
                  <th>설명</th>
                </tr>
              </thead>
              <tbody>
                {shortcuts.map((s) => (
                  <tr key={s.key}>
                    <td className={styles.kbd}>{s.key}</td>
                    <td>{s.ko}</td>
                    <td>{s.en}</td>
                    <td>{s.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.optionsRow}>
            <div className={styles.optionGroup}>
              <span className={styles.optionLabel}>테마</span>
              <div className={styles.segment}>
                <button
                  className={`${styles.segmentBtn} ${theme === 'dark' ? styles.active : ''}`}
                  onClick={() => setTheme('dark')}
                  type='button'
                  disabled={loading || saving}
                >
                  dark
                </button>
                <button
                  className={`${styles.segmentBtn} ${theme === 'light' ? styles.active : ''}`}
                  onClick={() => setTheme('light')}
                  type='button'
                  disabled={loading || saving}
                >
                  light
                </button>
              </div>
            </div>

            <div className={styles.optionGroup}>
              <label className={styles.optionLabel} htmlFor='langSelect'>
                언어 선택
              </label>
              <select
                id='langSelect'
                className={styles.select}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={loading || saving}
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            className={styles.logout}
            type='button'
            // onClick={askLogout}
            disabled={loading || saving}
          >
            로그아웃하기
          </button>

          <div className={styles.settingsSave}>
            <button
              className={styles.settingsSaveBtn}
              onClick={askSave}
              disabled={loading || saving}
            >
              저장
            </button>
          </div>
        </div>
      </div>

      {/* 확인 모달 (저장/로그아웃 공용) */}
      <ConfirmModal
        open={!!confirmOpen}
        lines={confirmLines}
        onCancel={saving ? undefined : handleCancelConfirm}
        onConfirm={saving ? undefined : onConfirm}
        onClose={saving ? undefined : handleCancelConfirm}
      />
    </div>
  );
}
