import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import styles from './styles/AdminFeedback.module.css';

const AdminFeedback = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statistics, setStatistics] = useState({});
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states for admin response
  const [responseMessage, setResponseMessage] = useState('');
  const [responsePublic, setResponsePublic] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
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

  const statusOptions = [
    'pending',
    'acknowledged', 
    'in-progress',
    'resolved',
    'closed'
  ];

  useEffect(() => {
    fetchFeedbacks();
    fetchStatistics();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterCategory !== 'all') params.append('category', filterCategory);
      
      const response = await fetch(`/api/feedback/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch feedback');
      
      const data = await response.json();
      setFeedbacks(data.data);
    } catch (error) {
      toast.error('Failed to fetch feedback');
      console.error('Fetch feedback error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/feedback/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch statistics');
      
      const data = await response.json();
      setStatistics(data.data);
    } catch (error) {
      console.error('Fetch statistics error:', error);
    }
  };

  const handleCardClick = (feedback) => {
    setSelectedFeedback(feedback);
    setResponseMessage('');
    setNewStatus(feedback.status);
    setResolutionNotes('');
    setShowModal(true);
  };

  const handleAddResponse = async () => {
    if (!responseMessage.trim()) {
      toast.error('Please enter a response message');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/feedback/${selectedFeedback._id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: responseMessage,
          isPublic: responsePublic
        })
      });

      if (!response.ok) throw new Error('Failed to add response');

      const data = await response.json();
      
      // Update the selected feedback and feedbacks list
      setSelectedFeedback(data.data);
      setFeedbacks(feedbacks.map(f => 
        f._id === selectedFeedback._id ? data.data : f
      ));
      
      setResponseMessage('');
      toast.success('Response added successfully');
      fetchStatistics();
    } catch (error) {
      toast.error('Failed to add response');
      console.error('Add response error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (newStatus === selectedFeedback.status) {
      toast.error('Please select a different status');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/feedback/${selectedFeedback._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          resolutionNotes: newStatus === 'resolved' ? resolutionNotes : undefined
        })
      });

      if (!response.ok) throw new Error('Failed to update status');

      const data = await response.json();
      
      // Update the selected feedback and feedbacks list
      setSelectedFeedback(data.data);
      setFeedbacks(feedbacks.map(f => 
        f._id === selectedFeedback._id ? data.data : f
      ));
      
      toast.success('Status updated successfully');
      fetchStatistics();
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Update status error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return styles.statusPending;
      case 'acknowledged': return styles.statusAcknowledged;
      case 'in-progress': return styles.statusInProgress;
      case 'resolved': return styles.statusResolved;
      case 'closed': return styles.statusClosed;
      default: return styles.statusPending;
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

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesStatus = filterStatus === 'all' || feedback.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || feedback.category === filterCategory;
    const matchesSearch = !searchTerm || 
      feedback.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${feedback.submittedBy?.firstName} ${feedback.submittedBy?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const closeModal = () => {
    setShowModal(false);
    setSelectedFeedback(null);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading feedback...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Feedback Management</h1>
          <p className={styles.subtitle}>Manage community feedback and responses</p>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className={styles.statsBar}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{statistics.total || 0}</div>
            <div className={styles.statLabel}>Total Feedback</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{statistics.pending || 0}</div>
            <div className={styles.statLabel}>Pending</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{statistics.acknowledged || 0}</div>
            <div className={styles.statLabel}>Acknowledged</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{statistics.resolved || 0}</div>
            <div className={styles.statLabel}>Resolved</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Status</option>
          {statusOptions.map(status => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <button 
          onClick={fetchFeedbacks}
          className={styles.refreshButton}
        >
          Refresh
        </button>
      </div>

      {/* Feedback Grid */}
      <div className={styles.feedbackGrid}>
        {filteredFeedbacks.length === 0 ? (
          <div className={styles.emptyState}>
            No feedback found matching your filters.
          </div>
        ) : (
          filteredFeedbacks.map(feedback => (
            <div
              key={feedback._id}
              className={styles.feedbackCard}
              onClick={() => handleCardClick(feedback)}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderLeft}>
                  <span className={`${styles.statusBadge} ${getStatusBadgeClass(feedback.status)}`}>
                    {feedback.status}
                  </span>
                  <span className={styles.category}>{feedback.category}</span>
                </div>
                <div className={styles.cardDate}>
                  {formatDate(feedback.createdAt)}
                </div>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.feedbackSubject}>{feedback.subject}</h3>
                <p className={styles.feedbackMessage}>
                  {feedback.message.length > 150 
                    ? `${feedback.message.substring(0, 150)}...`
                    : feedback.message
                  }
                </p>
                
                <div className={styles.submitterInfo}>
                  <strong>From: </strong>
                  {feedback.submittedBy?.firstName} {feedback.submittedBy?.lastName}
                  <span className={styles.barangay}>({feedback.submittedBy?.barangay})</span>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.responseCount}>
                  {feedback.adminResponse?.message ? '1 Response' : 'No Response'}
                  {feedback.followUpResponses?.length > 0 && 
                    ` + ${feedback.followUpResponses.length} Follow-ups`
                  }
                </div>
                <div className={styles.views}>
                  👁 {feedback.views || 0} views
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && selectedFeedback && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderLeft}>
                <h2>{selectedFeedback.subject}</h2>
                <span className={`${styles.statusBadge} ${getStatusBadgeClass(selectedFeedback.status)}`}>
                  {selectedFeedback.status}
                </span>
                <span className={styles.modalCategory}>{selectedFeedback.category}</span>
              </div>
              <button onClick={closeModal} className={styles.closeButton}>
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Feedback Details */}
              <div className={styles.feedbackSection}>
                <h3>Feedback Details</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <strong>Submitted By:</strong>
                    <span>
                      {selectedFeedback.submittedBy?.firstName} {selectedFeedback.submittedBy?.lastName}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Contact:</strong>
                    <span>{selectedFeedback.submittedBy?.contactNumber}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Barangay:</strong>
                    <span>{selectedFeedback.submittedBy?.barangay}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Submitted:</strong>
                    <span>{formatDate(selectedFeedback.createdAt)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Public:</strong>
                    <span>{selectedFeedback.isPublic ? 'Yes' : 'No'}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Views:</strong>
                    <span>{selectedFeedback.views || 0}</span>
                  </div>
                </div>
                
                <div className={styles.fullMessage}>
                  <strong>Message:</strong>
                  <p>{selectedFeedback.message}</p>
                </div>
              </div>

              {/* Existing Admin Response */}
              {selectedFeedback.adminResponse?.message && (
                <div className={styles.responseSection}>
                  <h3>Admin Response</h3>
                  <div className={styles.existingResponse}>
                    <p>{selectedFeedback.adminResponse.message}</p>
                    <div className={styles.responseInfo}>
                      <span>By: {selectedFeedback.adminResponse.respondedBy?.firstName} {selectedFeedback.adminResponse.respondedBy?.lastName}</span>
                      <span>{formatDate(selectedFeedback.adminResponse.respondedAt)}</span>
                      <span>{selectedFeedback.adminResponse.isPublic ? 'Public' : 'Private'}</span>
                    </div>
                  </div>
                </div>
              )}


              {/* Edit Response */}
              <div className={styles.responseSection}>
                <h3>Edit Response</h3>
                <div className={styles.responseForm}>
                  <textarea
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Enter your response..."
                    className={styles.responseTextarea}
                    maxLength={1500}
                  />
                  <div className={styles.responseOptions}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={responsePublic}
                        onChange={(e) => setResponsePublic(e.target.checked)}
                      />
                      Make response public
                    </label>
                    <div className={styles.characterCount}>
                      {responseMessage.length}/1500
                    </div>
                  </div>
                  <button
                    onClick={handleAddResponse}
                    disabled={isSubmitting || !responseMessage.trim()}
                    className={styles.submitButton}
                  >
                    {isSubmitting ? 'Adding...' : 'Add Response'}
                  </button>
                </div>
              </div>

              {/* Update Status */}
              <div className={styles.statusSection}>
                <h3>Update Status</h3>
                <div className={styles.statusForm}>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className={styles.statusSelect}
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>

                  {newStatus === 'resolved' && (
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Resolution notes (optional)..."
                      className={styles.resolutionTextarea}
                    />
                  )}

                  <button
                    onClick={handleUpdateStatus}
                    disabled={isSubmitting || newStatus === selectedFeedback.status}
                    className={styles.updateButton}
                  >
                    {isSubmitting ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;