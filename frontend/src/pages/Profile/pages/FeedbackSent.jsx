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

  const getCategoryIcon = (category) => {
    const categoryIcons = {
      'General Feedback': <MessageCircle size={16} />,
      'Service Complaint': <AlertCircle size={16} />,
      'Service Commendation': <ThumbsUp size={16} />,
      'Suggestion': <MessageSquare size={16} />,
      'Inquiry': <FileText size={16} />,
      'Report Issue': <AlertCircle size={16} />,
      'Other': <Tag size={16} />
    };

    return categoryIcons[category] || <Tag size={16} />;
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
              {/* Status Section */}
              <div className={styles.statusSection}>
                <p className={styles.feedbackDate}>
                  Submitted on {formatDate(selectedFeedback.createdAt)}
                </p>
                <div className={`${styles.statusBadge} ${styles.large} ${getStatusDisplay(selectedFeedback.status).className}`}>
                  {getStatusDisplay(selectedFeedback.status).icon}
                  <span>{getStatusDisplay(selectedFeedback.status).text}</span>
                </div>
              </div>

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
              <div className={styles.detailsSection}>
                <h3>Feedback Message</h3>
                <div className={styles.feedbackContent}>
                  <div className={styles.messageContentSection}>
                    <p>{selectedFeedback.message}</p>
                  </div>
                </div>
              </div>

              {/* Admin Response Section */}
              {selectedFeedback.adminResponse && selectedFeedback.adminResponse.message && (
                <div className={styles.adminSection}>
                  <h3>Administrative Response</h3>
                  <div className={styles.adminResponse}>
                    <div className={styles.responseHeader}>
                      <div className={styles.responseInfo}>
                        <span className={styles.responseLabel}>Response from Admin</span>
                        {selectedFeedback.adminResponse.respondedAt && (
                          <span className={styles.responseDate}>
                            {formatDate(selectedFeedback.adminResponse.respondedAt)}
                          </span>
                        )}
                      </div>
                      {selectedFeedback.adminResponse.isEdited && (
                        <span className={styles.editedBadge}>Edited</span>
                      )}
                    </div>
                    <div className={styles.responseMessage}>
                      <p>{selectedFeedback.adminResponse.message}</p>
                    </div>
                  </div>
                </div>
              )}

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
                  <h3 className={styles.feedbackSubject}>
                    {feedback.subject}
                  </h3>
                  <div className={`${styles.statusBadge} ${statusDisplay.className}`}>
                    {statusDisplay.icon}
                    <span>{statusDisplay.text}</span>
                  </div>
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