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
  const [editingResponse, setEditingResponse] = useState(false);

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
    setResponseMessage(feedback.adminResponse?.message || '');
    setResponsePublic(feedback.adminResponse?.isPublic || true);
    setNewStatus(feedback.status);
    setResolutionNotes('');
    setEditingResponse(false);
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
      
      setEditingResponse(false);
      toast.success('Response added successfully');
      fetchStatistics();
    } catch (error) {
      toast.error('Failed to add response');
      console.error('Add response error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditResponse = async () => {
    if (!responseMessage.trim()) {
      toast.error('Please enter a response message');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/feedback/${selectedFeedback._id}/response`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: responseMessage,
          isPublic: responsePublic
        })
      });

      if (!response.ok) throw new Error('Failed to update response');

      const data = await response.json();
      
      // Update the selected feedback and feedbacks list
      setSelectedFeedback(data.data);
      setFeedbacks(feedbacks.map(f => 
        f._id === selectedFeedback._id ? data.data : f
      ));
      
      setEditingResponse(false);
      toast.success('Response updated successfully');
      fetchStatistics();
    } catch (error) {
      toast.error('Failed to update response');
      console.error('Edit response error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResponse = async () => {
    if (!window.confirm('Are you sure you want to delete this response?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/feedback/${selectedFeedback._id}/response`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete response');

      const data = await response.json();
      
      // Update the selected feedback and feedbacks list
      setSelectedFeedback(data.data);
      setFeedbacks(feedbacks.map(f => 
        f._id === selectedFeedback._id ? data.data : f
      ));
      
      setResponseMessage('');
      setResponsePublic(true);
      setEditingResponse(false);
      toast.success('Response deleted successfully');
      fetchStatistics();
    } catch (error) {
      toast.error('Failed to delete response');
      console.error('Delete response error:', error);
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

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading feedback...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Feedback Management</h1>
        <p className={styles.subtitle}>
          Manage community feedback and responses
        </p>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{statistics.total || 0}</div>
            <div className={styles.statLabel}>Total Feedback</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏳</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{statistics.pending || 0}</div>
            <div className={styles.statLabel}>Pending</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{statistics.acknowledged || 0}</div>
            <div className={styles.statLabel}>Acknowledged</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎯</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{statistics.resolved || 0}</div>
            <div className={styles.statLabel}>Resolved</div>
          </div>
        </div>
      </div>

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
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Feedback Grid */}
      <div className={styles.feedbackGrid}>
        {filteredFeedbacks.length === 0 ? (
          <div className={styles.noResults}>
            <p>No feedback found matching your filters.</p>
          </div>
        ) : (
          filteredFeedbacks.map(feedback => (
            <div 
              key={feedback._id} 
              className={styles.feedbackCard}
              onClick={() => handleCardClick(feedback)}
            >
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{feedback.subject}</h3>
                <span className={`${styles.statusBadge} ${getStatusBadgeClass(feedback.status)}`}>
                  {feedback.status}
                </span>
              </div>
              
              <div className={styles.cardContent}>
                <p className={styles.cardMessage}>
                  {feedback.message.length > 150 
                    ? `${feedback.message.substring(0, 150)}...`
                    : feedback.message
                  }
                </p>
                
                <div className={styles.cardMeta}>
                  <div className={styles.metaItem}>
                    <strong>From:</strong> 
                    {feedback.submittedBy?.firstName} {feedback.submittedBy?.lastName}
                  </div>
                  <div className={styles.metaItem}>
                    <strong>Category:</strong> {feedback.category}
                  </div>
                  <div className={styles.metaItem}>
                    <strong>Date:</strong> {formatDate(feedback.createdAt)}
                  </div>
                  {feedback.adminResponse?.message && (
                    <div className={styles.responseIndicator}>
                      ✅ Has Response
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && selectedFeedback && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{selectedFeedback.subject}</h2>
              <button 
                onClick={() => setShowModal(false)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {/* Feedback Details */}
              <div className={styles.feedbackSection}>
                <h3>Feedback Details</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <strong>Submitted By:</strong>
                    <span>{selectedFeedback.submittedBy?.firstName} {selectedFeedback.submittedBy?.lastName}</span>
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
                    <strong>Category:</strong>
                    <span>{selectedFeedback.category}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Status:</strong>
                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(selectedFeedback.status)}`}>
                      {selectedFeedback.status}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Date:</strong>
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

              {/* Admin Response Section */}
              <div className={styles.responseSection}>
                <div className={styles.responseSectionHeader}>
                  <h3>Admin Response</h3>
                  {selectedFeedback.adminResponse?.message && !editingResponse && (
                    <div className={styles.responseActions}>
                      <button 
                        onClick={() => setEditingResponse(true)}
                        className={styles.editButton}
                        disabled={isSubmitting}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={handleDeleteResponse}
                        className={styles.deleteButton}
                        disabled={isSubmitting}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Existing Response Display */}
                {selectedFeedback.adminResponse?.message && !editingResponse && (
                  <div className={styles.existingResponse}>
                    <p>{selectedFeedback.adminResponse.message}</p>
                    <div className={styles.responseInfo}>
                      <span>By: {selectedFeedback.adminResponse.respondedBy?.firstName} {selectedFeedback.adminResponse.respondedBy?.lastName}</span>
                      <span>{formatDate(selectedFeedback.adminResponse.respondedAt)}</span>
                      <span>{selectedFeedback.adminResponse.isPublic ? 'Public' : 'Private'}</span>
                      {selectedFeedback.adminResponse.isEdited && (
                        <span className={styles.editedIndicator}>Edited</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Response Form */}
                {(!selectedFeedback.adminResponse?.message || editingResponse) && (
                  <div className={styles.responseForm}>
                    <textarea
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      placeholder="Enter your response..."
                      className={styles.responseTextarea}
                      maxLength={1500}
                    />
                    <div className={styles.responseOptions}>
                      <div className={styles.characterCount}>
                        {responseMessage.length}/1500
                      </div>
                    </div>
                    <div className={styles.responseFormActions}>
                      <button
                        onClick={editingResponse ? handleEditResponse : handleAddResponse}
                        disabled={isSubmitting || !responseMessage.trim()}
                        className={styles.submitButton}
                      >
                        {isSubmitting 
                          ? (editingResponse ? 'Updating...' : 'Adding...') 
                          : (editingResponse ? 'Update Response' : 'Add Response')
                        }
                      </button>
                      {editingResponse && (
                        <button
                          onClick={() => {
                            setEditingResponse(false);
                            setResponseMessage(selectedFeedback.adminResponse?.message || '');
                            setResponsePublic(selectedFeedback.adminResponse?.isPublic || true);
                          }}
                          className={styles.cancelButton}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}
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