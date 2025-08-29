import React, { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Users, Package, Edit2, Trash2, Send, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import CreateDistributionModal from './components/CreateDistributionModal';
import ViewDistributionModal from './components/ViewDistributionModal';
import EditDistributionModal from './components/EditDistributionModal';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import styles from './styles/AdminRiceDistribution.module.css';

const AdminRiceDistribution = () => {
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDistribution, setCurrentDistribution] = useState(null);
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  
  // Filter
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchDistributions();
    fetchCurrentDistribution();
  }, [statusFilter, pagination.current]);

  const fetchDistributions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current,
        limit: 9
      });
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await api.get(`/rice-distribution/all`);
      setDistributions(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching distributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentDistribution = async () => {
    try {
      const response = await api.get('/rice-distribution/current');
      setCurrentDistribution(response.data.data);
    } catch (error) {
      console.error('Error fetching current distribution:', error);
    }
  };

  const handleCreate = async (formData) => {
    try {
      const response = await api.post('/rice-distribution', formData);
      if (response.data.success) {
        setShowCreateModal(false);
        fetchDistributions();
        fetchCurrentDistribution();
        // Show success message
        alert('Rice distribution created successfully!');
      }
    } catch (error) {
      console.error('Error creating distribution:', error);
      alert(error.response?.data?.message || 'Failed to create distribution');
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      const response = await api.put(`/rice-distribution/${id}`, formData);
      if (response.data.success) {
        setShowEditModal(false);
        fetchDistributions();
        fetchCurrentDistribution();
        alert('Distribution updated successfully!');
      }
    } catch (error) {
      console.error('Error updating distribution:', error);
      alert(error.response?.data?.message || 'Failed to update distribution');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/rice-distribution/${selectedDistribution._id}`);
      if (response.data.success) {
        setShowDeleteModal(false);
        fetchDistributions();
        fetchCurrentDistribution();
        alert('Distribution deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting distribution:', error);
      alert(error.response?.data?.message || 'Failed to delete distribution');
    }
  };

  const handleSendNotifications = async (distributionId) => {
    if (!confirm('Are you sure you want to send SMS notifications to all residents in selected barangays?')) {
      return;
    }
    
    try {
      const response = await api.post(`/rice-distribution/${distributionId}/send-notifications`);
      if (response.data.success) {
        alert(response.data.message);
        fetchDistributions();
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
      alert(error.response?.data?.message || 'Failed to send notifications');
    }
  };

  const handleMarkComplete = async (distributionId) => {
    const completionNotes = prompt('Enter completion notes (optional):');
    
    try {
      const response = await api.post(`/rice-distribution/${distributionId}/complete`, {
        completionNotes
      });
      if (response.data.success) {
        alert('Distribution marked as complete!');
        fetchDistributions();
        fetchCurrentDistribution();
      }
    } catch (error) {
      console.error('Error marking distribution as complete:', error);
      alert(error.response?.data?.message || 'Failed to mark as complete');
    }
  };

  const handleCardClick = (distribution) => {
    setSelectedDistribution(distribution);
    setShowViewModal(true);
  };

  const handleEditClick = (e, distribution) => {
    e.stopPropagation();
    setSelectedDistribution(distribution);
    setShowEditModal(true);
  };

  const handleDeleteClick = (e, distribution) => {
    e.stopPropagation();
    setSelectedDistribution(distribution);
    setShowDeleteModal(true);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'planned': return styles.badgePlanned;
      case 'ongoing': return styles.badgeOngoing;
      case 'completed': return styles.badgeCompleted;
      case 'cancelled': return styles.badgeCancelled;
      default: return '';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Rice Distribution Management</h1>
        <button 
          className={styles.createButton}
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={20} />
          Create Distribution Record
        </button>
      </div>

      {/* Current Distribution Banner */}
      {currentDistribution && (
        <div className={styles.currentBanner}>
          <div className={styles.bannerContent}>
            <h3>Current Distribution</h3>
            <p>{currentDistribution.title}</p>
            <p className={styles.bannerDate}>
              {formatDate(currentDistribution.distributionSchedule[0]?.date)}
            </p>
          </div>
          <span className={`${styles.badge} ${getStatusBadgeClass(currentDistribution.status)}`}>
            {currentDistribution.status}
          </span>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Status</option>
          <option value="planned">Planned</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Distribution Cards Grid */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading distributions...</p>
        </div>
      ) : distributions.length === 0 ? (
        <div className={styles.emptyState}>
          <Package size={48} />
          <h3>No Distribution Records</h3>
          <p>Click "Create Distribution Record" to get started</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {distributions.map((distribution) => (
            <div 
              key={distribution._id}
              className={styles.card}
              onClick={() => handleCardClick(distribution)}
            >
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{distribution.title}</h3>
                <span className={`${styles.badge} ${getStatusBadgeClass(distribution.status)}`}>
                  {distribution.status}
                </span>
              </div>
              
              <div className={styles.cardBody}>
                <div className={styles.cardInfo}>
                  <Calendar size={16} />
                  <span>{formatDate(distribution.distributionSchedule[0]?.date)}</span>
                </div>
                
                <div className={styles.cardInfo}>
                  <MapPin size={16} />
                  <span>{distribution.distributionSchedule[0]?.location}</span>
                </div>
                
                <div className={styles.cardInfo}>
                  <Users size={16} />
                  <span>{distribution.selectedBarangays.length} Barangays</span>
                </div>
                
                <div className={styles.cardInfo}>
                  <Package size={16} />
                  <span>{distribution.riceDetails.totalKilos} kg Total</span>
                </div>
              </div>
              
              <div className={styles.cardFooter}>
                <div className={styles.cardActions}>
                  {distribution.status === 'planned' && !distribution.smsNotifications.sent && (
                    <button
                      className={styles.actionButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendNotifications(distribution._id);
                      }}
                      title="Send SMS Notifications"
                    >
                      <Send size={16} />
                    </button>
                  )}
                  
                  {distribution.status === 'ongoing' && (
                    <button
                      className={styles.actionButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkComplete(distribution._id);
                      }}
                      title="Mark as Complete"
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                  
                  <button
                    className={styles.actionButton}
                    onClick={(e) => handleEditClick(e, distribution)}
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  
                  <button
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={(e) => handleDeleteClick(e, distribution)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                {distribution.smsNotifications.sent && (
                  <div className={styles.smsStatus}>
                    <Send size={14} />
                    <span>SMS Sent: {distribution.smsNotifications.recipientCount}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className={styles.pagination}>
          <button
            disabled={pagination.current === 1}
            onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
            className={styles.paginationButton}
          >
            Previous
          </button>
          
          <span className={styles.paginationInfo}>
            Page {pagination.current} of {pagination.pages}
          </span>
          
          <button
            disabled={pagination.current === pagination.pages}
            onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
            className={styles.paginationButton}
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateDistributionModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
        />
      )}
      
      {showViewModal && selectedDistribution && (
        <ViewDistributionModal
          distribution={selectedDistribution}
          onClose={() => setShowViewModal(false)}
          onEdit={() => {
            setShowViewModal(false);
            setShowEditModal(true);
          }}
        />
      )}
      
      {showEditModal && selectedDistribution && (
        <EditDistributionModal
          distribution={selectedDistribution}
          onClose={() => setShowEditModal(false)}
          onSubmit={(formData) => handleUpdate(selectedDistribution._id, formData)}
        />
      )}
      
      {showDeleteModal && selectedDistribution && (
        <DeleteConfirmModal
          title="Delete Distribution Record"
          message={`Are you sure you want to delete "${selectedDistribution.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default AdminRiceDistribution;