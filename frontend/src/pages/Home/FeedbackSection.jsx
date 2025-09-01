// FeedbackSection.jsx - Component for Home page
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './FeedbackSection.module.css';

const FeedbackSection = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleViewFeedbackClick = () => {
    navigate('/about/feedback');
  };

  const handleSendFeedbackClick = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    
    // Redirect to feedback page and trigger form modal
    navigate('/about/feedback', { state: { openForm: true } });
  };

  const closeLoginPrompt = () => {
    setShowLoginPrompt(false);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <>
      {/* Feedback Section */}
      <div className={styles.feedbackSection}>
        <div className={styles.feedbackContainer}>
          <div className={styles.feedbackContent}>
            <h2 className={styles.feedbackTitle}>Help us improve our service</h2>
            <p className={styles.feedbackSubtitle}>
              Spotted a service that needs improvement?<br />
              Contact us so we can address it.
            </p>
          </div>
          
          <div className={styles.feedbackActions}>
            <button 
              className={styles.viewFeedbackBtn}
              onClick={handleViewFeedbackClick}
            >
              View Feedback
            </button>
            
            <button 
              className={styles.sendFeedbackBtn}
              onClick={handleSendFeedbackClick}
            >
              Send a feedback
            </button>
          </div>
        </div>
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className={styles.modalOverlay} onClick={closeLoginPrompt}>
          <div className={styles.loginPromptModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Login Required</h2>
              <button 
                className={styles.closeButton}
                onClick={closeLoginPrompt}
              >
                ✕
              </button>
            </div>

            <div className={styles.loginPromptContent}>
              <div className={styles.loginPromptIcon}>🔒</div>
              <h3>Account Required</h3>
              <p>
                You need to be registered and logged in to submit feedback. 
                Creating an account is quick and free!
              </p>

              <div className={styles.loginPromptActions}>
                <button 
                  className={styles.loginButton}
                  onClick={handleLoginClick}
                >
                  Login
                </button>
                <button 
                  className={styles.registerButton}
                  onClick={handleRegisterClick}
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackSection;