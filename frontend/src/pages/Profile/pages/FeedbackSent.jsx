import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
  Eye, 
  X, 
  Calendar, 
  User, 
  MessageCircle,
  Tag, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ThumbsUp,
  MessageSquare,
  Globe,
  Lock
} from 'lucide-react';
import styles from './FeedbackSent.module.css';

const API_BASE = import.meta.env.VITE_API_URL; // e.g. http://localhost:4000/api

const FeedbackSent = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();

  const handleSendFeedbackClick = () => {
    // Redirect to feedback page and trigger form modal
    navigate('/about/feedback', { state: { openForm: true } });
  };

  useEffect(() => {
    fetchMyFeedbacks();
  }, []);

  const fetchMyFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/feedback/my`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch feedbacks');
      }

      const data = await response.json();
      setFeedbacks(data.data || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusDisplay = (status) => {
    const statusConfig = {
      pending: {
        text: 'Pending Review',
        className: styles.statusPending,
        icon: <Clock size={16} />
      },
      'in-progress': {
        text: 'In Progress',
        className: styles.statusInProgress,
        icon: <Clock size={16} />
      },
      resolved: {
        text: 'Resolved',
        className: styles.statusResolved,
        icon: <CheckCircle size={16} />
      }
    };

    return statusConfig[status] || {
      text: status,
      className: styles.statusDefault,
      icon: <AlertCircle size={16} />
    };
  };

  // Function to check if status should be displayed for a category
  const shouldDisplayStatus = (category) => {
    const noStatusCategories = [
      'General Feedback',
      'Service Commendation', 
      'Suggestion',
      'Other'
    ];
    return !noStatusCategories.includes(category);
  };

  useEffect(() => {
    if (showDetails) {
      // Prevent body scroll when modal is open
      document.body.classList.add(styles.bodyScrollLocked);
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable body scroll when modal is closed
      document.body.classList.remove(styles.bodyScrollLocked);
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove(styles.bodyScrollLocked);
      document.body.style.overflow = 'unset';
    };
  }, [showDetails]);

  const viewFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedFeedback(null);
    document.body.style.overflow = 'unset';
    document.body.style.paddingRight = '0px';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading your feedbacks...</p>
        </div>
      </div>
    );
  }

  const Modal = () => {
    if (!showDetails || !selectedFeedback) return null;

    return createPortal(
      <div className={styles.modalOverlay} onClick={closeDetails}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{selectedFeedback.subject}</h2>
              <button className={styles.closeButton} onClick={closeDetails}>
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Status Section - Only show for certain categories */}
              {shouldDisplayStatus(selectedFeedback.category) && (
                <div className={styles.statusSection}>
                  <p className={styles.feedbackDate}>
                    Submitted on {formatDate(selectedFeedback.createdAt)}
                  </p>
                  <div className={`${styles.statusBadge} ${styles.large} ${getStatusDisplay(selectedFeedback.status).className}`}>
                    {getStatusDisplay(selectedFeedback.status).icon}
                    <span>{getStatusDisplay(selectedFeedback.status).text}</span>
                  </div>
                </div>
              )}

              {/* Show just the date for categories without status */}
              {!shouldDisplayStatus(selectedFeedback.category) && (
                <div className={styles.statusSection}>
                  <p className={styles.feedbackDate}>
                    Submitted on {formatDate(selectedFeedback.createdAt)}
                  </p>
                </div>
              )}

              {/* Feedback Details Section */}
              <div className={styles.detailsSection}>
                <h3>Feedback Information</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <div className={styles.infoItemHeader}>
                      <Tag size={16} />
                      <span className={styles.infoLabel}>Category:</span>
                      <span>{selectedFeedback.category}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Content Section */}
              <div className={styles.threadContainer}>
                <div className={styles.threadHeader}>
                  Feedback Thread:
                </div>
                
                <div className={styles.threadMessage}>
                  <div className={styles.senderInfo}>
                    <div className={styles.threadAvatar}>
                      <User size={14} />
                    </div>
                    <span className={styles.senderName}>
                      {selectedFeedback.user?.firstName && selectedFeedback.user?.lastName 
                        ? `${selectedFeedback.user.firstName} ${selectedFeedback.user.lastName}`
                        : 'You'
                      }
                    </span>
                    <span className={styles.messageDate}>
                      {formatDateTime(selectedFeedback.createdAt)}
                    </span>
                  </div>
                  <div className={styles.messageText}>
                    {selectedFeedback.message}
                  </div>
                </div>
              
                {/* Admin Response in Thread */}
                {selectedFeedback.adminResponse && selectedFeedback.adminResponse.message && (
                  <div className={`${styles.threadMessage} ${styles.adminThreadMessage}`}>
                    <div className={styles.senderInfo}>
                      <div className={`${styles.threadAvatar} ${styles.adminAvatar}`}>
                        <User size={14} />
                      </div>
                      <span className={`${styles.senderName} ${styles.adminSenderName}`}>
                        System Admin
                      </span>
                      <span className={styles.messageDate}>
                        {selectedFeedback.adminResponse.respondedAt && formatDateTime(selectedFeedback.adminResponse.respondedAt)}
                      </span>
                      {selectedFeedback.adminResponse.isEdited && (
                        <span className={styles.editedBadge}>Edited</span>
                      )}
                    </div>
                    <div className={styles.messageText}>
                      {selectedFeedback.adminResponse.message}
                    </div>
                  </div>
                )}
              </div>

              {/* Resolution Section */}
              {selectedFeedback.status === 'resolved' && selectedFeedback.resolutionNotes && (
                <div className={styles.resolutionSection}>
                  <h3>Resolution Details</h3>
                  <div className={styles.resolutionContent}>
                    <p>{selectedFeedback.resolutionNotes}</p>
                    {selectedFeedback.resolvedAt && (
                      <p className={styles.resolutionDate}>
                        Resolved on {formatDate(selectedFeedback.resolvedAt)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
      document.body // Render modal as direct child of body
    );
  };

  return (
    <div className={styles.container}>

      {feedbacks.length === 0 ? (
        <div className={styles.emptyState}>
          <MessageCircle size={48} />
          <h3>No Feedbacks Submitted</h3>
          <p>You haven't submitted any feedbacks yet.</p>
          <button onClick={handleSendFeedbackClick} className={styles.submitButton}>
            Submit Feedback
          </button>
        </div>
      ) : (
        <div className={styles.feedbacksGrid}>
          {feedbacks.map((feedback) => {
            const statusDisplay = getStatusDisplay(feedback.status);
            
            return (
              <div key={feedback._id} className={styles.feedbackCard} onClick={() => viewFeedback(feedback)}>
                <div className={styles.cardHeader}>
                  <h3 className={`${styles.feedbackSubject} ${!shouldDisplayStatus(feedback.category) ? styles.noStatus : ''}`}>
                    {feedback.subject}
                  </h3>
                  {shouldDisplayStatus(feedback.category) && (
                    <div className={`${styles.statusBadge} ${statusDisplay.className}`}>
                      {statusDisplay.icon}
                      <span>{statusDisplay.text}</span>
                    </div>
                  )}
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.feedbackInfo}>
                    <div className={styles.infoRow}>
                      <Tag size={16} />
                      <span>{feedback.category}</span>
                    </div>
                  </div>

                  {feedback.message && (
                    <div className={styles.messageSection}>
                      <strong>Message:</strong>
                      <p className={styles.messageText}>
                        {feedback.message.length > 120
                          ? `${feedback.message.substring(0, 120)}...`
                          : feedback.message
                        }
                      </p>
                    </div>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <button className={styles.viewButton}>
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Feedback Details Modal */}
      < Modal />
    </div>
  );
};

export default FeedbackSent;