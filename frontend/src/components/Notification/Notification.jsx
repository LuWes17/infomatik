// frontend/src/components/Notification/Notification.jsx - Updated for context usage
import React, { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import styles from './Notification.module.css';

const Notification = ({ 
  type = 'error', 
  message, 
  isVisible, 
  onClose, 
  duration = 5000,
  position = 'top-right'
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className={styles.icon} />;
      case 'warning':
        return <AlertTriangle className={styles.icon} />;
      case 'info':
        return <Info className={styles.icon} />;
      case 'error':
      default:
        return <AlertCircle className={styles.icon} />;
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`${styles.notification} ${styles[type]} ${position !== 'static' ? styles[position] : ''}`}>
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          {getIcon()}
        </div>
        <div className={styles.message}>
          {message}
        </div>
        <button 
          className={styles.closeButton} 
          onClick={onClose}
          aria-label="Close notification"
        >
          <X className={styles.closeIcon} />
        </button>
      </div>
      {duration > 0 && (
        <div 
          className={styles.progressBar}
          style={{
            animationDuration: `${duration}ms`
          }}
        ></div>
      )}
    </div>
  );
};

export default Notification;