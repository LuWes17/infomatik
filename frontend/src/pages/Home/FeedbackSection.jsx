// FeedbackSection.jsx - Component for Home page
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './FeedbackSection.module.css';
import { User } from 'lucide-react';

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
        <div className={styles.modal} onClick={closeLoginPrompt}>
          <div className={styles.authPrompt} onClick={(e) => e.stopPropagation()}>
            <div className={styles.authPromptHeader}>
              <User size={32} />
              <h3>Account Required</h3>
            </div>
            <p>You need to have an account to submit a feedback.</p>
            <div className={styles.authActions}>
              <button 
                className={styles.loginBtn}
                onClick={() => window.location.href = '/login'}
              >
                Login
              </button>
              <button 
                className={styles.registerBtn}
                onClick={() => window.location.href = '/register'}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackSection;