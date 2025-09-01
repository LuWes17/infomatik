// frontend/src/pages/AboutUs/Feedback.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Feedback.module.css';

const Feedback = () => {
  const { isAuthenticated, user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Modal states
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'General Feedback',
    isPublic: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'General Feedback', 
    'Service Complaint', 
    'Service Commendation', 
    'Suggestion', 
    'Inquiry', 
    'Report Issue', 
    'Other'
  ];

  // Fetch feedback data
  useEffect(() => {
    fetchFeedback();
  }, []);

  // Filter feedbacks when category changes
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredFeedbacks(feedbacks);
    } else {
      setFilteredFeedbacks(feedbacks.filter(feedback => feedback.category === selectedCategory));
    }
  }, [feedbacks, selectedCategory]);

  const fetchFeedback = async () => {
    try {
      const response = await fetch('/api/feedback/public');
      if (!response.ok) throw new Error('Failed to fetch feedback');
      
      const data = await response.json();
      setFeedbacks(data.data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitClick = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    setShowSubmitModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to submit feedback');

      toast.success('Feedback submitted successfully!');
      setShowSubmitModal(false);
      setFormData({
        subject: '',
        message: '',
        category: 'General Feedback',
        isPublic: true
      });
      
      // Refresh feedback list
      fetchFeedback();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCardClick = async (feedback) => {
    setSelectedFeedback(feedback);
    setShowDetailModal(true);

    // Increment views (optional - could be done on backend)
    try {
      const response = await fetch(`/api/feedback/${feedback._id}/view`, {
        method: 'POST'
      });
      if (response.ok) {
        // Update local feedback data
        setFeedbacks(prev => prev.map(f => 
          f._id === feedback._id ? { ...f, views: f.views + 1 } : f
        ));
      }
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'General Feedback': '💬',
      'Service Complaint': '⚠️',
      'Service Commendation': '👍',
      'Suggestion': '💡',
      'Inquiry': '❓',
      'Report Issue': '🔧',
      'Other': '📝'
    };
    return icons[category] || '📝';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      acknowledged: 'blue',
      'in-progress': 'purple',
      resolved: 'green',
      closed: 'gray'
    };
    return colors[status] || 'gray';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Community Feedback</h1>
        <p className={styles.subtitle}>
          Your voice matters. Share your thoughts and read feedback from fellow community members.
        </p>
      </div>

      {/* Actions Bar */}
      <div className={styles.actionsBar}>
        <button 
          className={styles.submitButton}
          onClick={handleSubmitClick}
        >
          📝 Submit Feedback
        </button>

        {/* Category Filter */}
        <div className={styles.filterSection}>
          <label htmlFor="categoryFilter" className={styles.filterLabel}>
            Filter by Category:
          </label>
          <select
            id="categoryFilter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {getCategoryIcon(category)} {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feedback Count */}
      <div className={styles.feedbackCount}>
        <p>
          {filteredFeedbacks.length} feedback{filteredFeedbacks.length !== 1 ? 's' : ''} found
          {selectedCategory !== 'all' && ` in "${selectedCategory}"`}
        </p>
      </div>

      {/* Feedback Grid */}
      <div className={styles.feedbackGrid}>
        {filteredFeedbacks.length === 0 ? (
          <div className={styles.noFeedback}>
            <div className={styles.noFeedbackIcon}>💭</div>
            <h3>No feedback found</h3>
            <p>
              {selectedCategory === 'all' 
                ? 'Be the first to share your thoughts with the community!'
                : `No feedback found in the "${selectedCategory}" category.`
              }
            </p>
            <button 
              className={styles.submitButton}
              onClick={handleSubmitClick}
            >
              📝 Submit First Feedback
            </button>
          </div>
        ) : (
          filteredFeedbacks.map(feedback => (
            <div 
              key={feedback._id} 
              className={styles.feedbackCard}
              onClick={() => handleCardClick(feedback)}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardCategory}>
                  <span className={styles.categoryIcon}>
                    {getCategoryIcon(feedback.category)}
                  </span>
                  <span className={styles.categoryText}>{feedback.category}</span>
                </div>
                <span 
                  className={styles.statusBadge}
                  style={{ backgroundColor: getStatusColor(feedback.status) }}
                >
                  {feedback.status}
                </span>
              </div>

              <h3 className={styles.cardTitle}>{feedback.subject}</h3>
              <p className={styles.cardMessage}>
                {truncateText(feedback.message, 120)}
              </p>

              <div className={styles.cardFooter}>
                <div className={styles.authorInfo}>
                  <span className={styles.authorName}>
                    {feedback.submittedBy?.firstName} {feedback.submittedBy?.lastName}
                  </span>
                  <span className={styles.submitDate}>
                    {formatDate(feedback.createdAt)}
                  </span>
                </div>

                <div className={styles.cardStats}>
                  <span className={styles.stat}>
                    👁️ {feedback.views || 0}
                  </span>
                  {feedback.adminResponse?.message && (
                    <span className={styles.stat}>
                      💬 Admin Replied
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Submit Feedback Modal */}
      {showSubmitModal && (
        <div className={styles.modalOverlay} onClick={() => setShowSubmitModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Submit Feedback</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowSubmitModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className={styles.feedbackForm}>
              <div className={styles.formGroup}>
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  maxLength={150}
                  required
                  placeholder="Brief description of your feedback"
                />
                <small className={styles.charCount}>
                  {formData.subject.length}/150 characters
                </small>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  required
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {getCategoryIcon(category)} {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  maxLength={2000}
                  rows={6}
                  required
                  placeholder="Please provide detailed feedback..."
                />
                <small className={styles.charCount}>
                  {formData.message.length}/2000 characters
                </small>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  />
                  Make this feedback public (visible to all users)
                </label>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowSubmitModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitFormButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Detail Modal */}
      {showDetailModal && selectedFeedback && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
          <div className={styles.detailModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Feedback Details</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowDetailModal(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.detailContent}>
              {/* Feedback Section */}
              <div className={styles.feedbackSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.categoryBadge}>
                    <span className={styles.categoryIcon}>
                      {getCategoryIcon(selectedFeedback.category)}
                    </span>
                    <span>{selectedFeedback.category}</span>
                  </div>
                  <span 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(selectedFeedback.status) }}
                  >
                    {selectedFeedback.status}
                  </span>
                </div>

                <h3 className={styles.feedbackSubject}>{selectedFeedback.subject}</h3>
                <div className={styles.feedbackMeta}>
                  <span className={styles.author}>
                    By: {selectedFeedback.submittedBy?.firstName} {selectedFeedback.submittedBy?.lastName}
                  </span>
                  <span className={styles.date}>
                    {formatDate(selectedFeedback.createdAt)}
                  </span>
                  <span className={styles.views}>
                    👁️ {selectedFeedback.views} views
                  </span>
                </div>

                <div className={styles.feedbackMessage}>
                  <p>{selectedFeedback.message}</p>
                </div>
              </div>

              {/* Admin Response Section */}
              {selectedFeedback.adminResponse?.message && (
                <div className={styles.responseSection}>
                  <div className={styles.responseSectionHeader}>
                    <h4>📢 Official Response</h4>
                    {selectedFeedback.adminResponse.isEdited && (
                      <span className={styles.editedIndicator}>(Edited)</span>
                    )}
                  </div>

                  <div className={styles.responseContent}>
                    <p>{selectedFeedback.adminResponse.message}</p>
                  </div>

                  <div className={styles.responseMeta}>
                    <span>
                      By: {selectedFeedback.adminResponse.respondedBy?.firstName} {selectedFeedback.adminResponse.respondedBy?.lastName}
                    </span>
                    <span>
                      {formatDate(selectedFeedback.adminResponse.respondedAt)}
                    </span>
                    {selectedFeedback.adminResponse.isEdited && (
                      <span>
                        Edited: {formatDate(selectedFeedback.adminResponse.editedAt)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* No Response Message */}
              {!selectedFeedback.adminResponse?.message && (
                <div className={styles.noResponseSection}>
                  <div className={styles.noResponseIcon}>⏳</div>
                  <h4>Awaiting Response</h4>
                  <p>This feedback has not yet received an official response.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className={styles.modalOverlay} onClick={() => setShowLoginPrompt(false)}>
          <div className={styles.loginPromptModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Login Required</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowLoginPrompt(false)}
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
                  onClick={() => window.location.href = '/login'}
                >
                  Login
                </button>
                <button 
                  className={styles.registerButton}
                  onClick={() => window.location.href = '/register'}
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;