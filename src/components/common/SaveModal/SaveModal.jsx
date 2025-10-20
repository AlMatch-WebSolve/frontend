import React, { useEffect } from 'react';
import CloseIcon from '../../../assets/icons/CloseIcon.svg';
import styles from './SaveModal.module.css';

function SaveModal({ open, message = '코드가 저장되었습니다.', duration = 1000, onClose, onAfterAutoClose }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      onClose?.();
      onAfterAutoClose?.();
    }, duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose, onAfterAutoClose]);

  if (!open) return null;
  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <button
          aria-label="닫기"
          className={styles.closeBtn}
          onClick={() => { onClose?.(); onAfterAutoClose?.(); }}>
          <img src={CloseIcon} alt="닫기" />
        </button>
        <div className={styles.message}>{message}</div>
      </div>
    </div>
  );
}

export default SaveModal;
