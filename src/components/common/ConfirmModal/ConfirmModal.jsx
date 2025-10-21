import React from 'react';
import styles from './ConfirmModal.module.css';
import CloseIcon from '../../../assets/icons/CloseIcon.svg';

function ConfirmModal({ open, lines = [], onCancel, onConfirm, onClose }) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={styles.backdrop}
    >
      <div className={styles.modal}>
        <button
          aria-label="닫기"
          className={styles.closeBtn}
          onClick={onClose}
        >
          <img src={CloseIcon} alt="닫기" />
        </button>
        <div className={styles.textContainer}>
          {lines.map((t, i) => (
            <span key={i}>{t}<br /></span>
          ))}
        </div>
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onCancel}>취소</button>
          <button className={styles.confirmBtn} onClick={onConfirm}>확인</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
