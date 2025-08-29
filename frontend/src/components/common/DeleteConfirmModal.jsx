import React from 'react';
import { AlertTriangle } from 'lucide-react';
import styles from './DeleteConfirmModal.module.css';

const DeleteConfirmModal = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          <div className={styles.iconWrapper}>
            <AlertTriangle size={48} className={styles.warningIcon} />
          </div>
          
          <h2 className={styles.title}>{title || 'Confirm Delete'}</h2>
          
          <p className={styles.message}>
            {message || 'Are you sure you want to delete this item? This action cannot be undone.'}
          </p>
          
          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={onCancel}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={onConfirm}
              className={styles.deleteButton}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;