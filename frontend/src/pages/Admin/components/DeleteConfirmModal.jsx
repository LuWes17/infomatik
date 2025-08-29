// frontend/src/components/Admin/DeleteConfirmModal.jsx
import React, { useState } from 'react';
import styles from './DeleteConfirmModal.module.css';

const DeleteConfirmModal = ({ title, message, onConfirm, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title || 'Confirm Delete'}</h2>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.warningIcon}>⚠️</div>
          <p className={styles.message}>
            {message || 'Are you sure you want to delete this item? This action cannot be undone.'}
          </p>
        </div>

        <div className={styles.modalActions}>
          <button
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={styles.deleteButton}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;