// frontend/src/contexts/NotificationContext.jsx
import React, { createContext, useContext, useState } from 'react';
import Notification from '../components/Notification/Notification';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (type, message, options = {}) => {
    const {
      duration = 5000,
      position = 'top-right',
      persistent = false
    } = options;

    const id = Date.now() + Math.random();
    const notification = {
      id,
      type,
      message,
      duration: persistent ? 0 : duration,
      position,
      isVisible: true
    };

    setNotifications(prev => [...prev, notification]);

    // Auto remove after duration (unless persistent)
    if (!persistent && duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Convenience methods
  const showSuccess = (message, options) => 
    showNotification('success', message, { duration: 4000, ...options });
  
  const showError = (message, options) => 
    showNotification('error', message, { duration: 6000, ...options });
  
  const showWarning = (message, options) => 
    showNotification('warning', message, { duration: 5000, ...options });
  
  const showInfo = (message, options) => 
    showNotification('info', message, { duration: 4000, ...options });

  const clearAll = () => setNotifications([]);

  const value = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearAll,
    notifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Render all notifications - positioned based on their individual position */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 9999 }}>
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            style={{
              position: 'absolute',
              pointerEvents: 'auto',
              // Stack notifications with slight offset
              ...(notification.position === 'top-right' && {
                top: `${1 + index * 0.5}rem`,
                right: '1rem'
              }),
              ...(notification.position === 'top-left' && {
                top: `${1 + index * 0.5}rem`,
                left: '1rem'
              }),
              ...(notification.position === 'bottom-right' && {
                bottom: `${1 + index * 0.5}rem`,
                right: '1rem'
              }),
              ...(notification.position === 'bottom-left' && {
                bottom: `${1 + index * 0.5}rem`,
                left: '1rem'
              }),
              ...(notification.position === 'top-center' && {
                top: `${1 + index * 0.5}rem`,
                left: '50%',
                transform: 'translateX(-50%)'
              }),
              ...(notification.position === 'bottom-center' && {
                bottom: `${1 + index * 0.5}rem`,
                left: '50%',
                transform: 'translateX(-50%)'
              })
            }}
          >
            <Notification
              type={notification.type}
              message={notification.message}
              isVisible={notification.isVisible}
              onClose={() => removeNotification(notification.id)}
              position="static" // Override position since we handle it here
              duration={0} // Duration handled by context
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};