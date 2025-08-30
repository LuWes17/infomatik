// frontend/src/pages/Services/RiceDistribution.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './RiceDistribution.module.css';

const RiceDistribution = () => {
  const { user } = useAuth();
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    fetchDistributions(currentPage);
  }, [currentPage]);

  const fetchDistributions = async (page = 1) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/rice-distribution?page=${page}&limit=6`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch rice distributions');
      }

      const data = await response.json();
      setDistributions(data.data || []);
      setPagination(data.pagination || { current: 1, pages: 1, total: 0 });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching distributions:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatMonth = (monthString) => {
    return new Date(monthString + '-01').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const isUserBarangayIncluded = (distribution) => {
    if (!user?.barangay) return false;
    return distribution.selectedBarangays
      .map(b => b.toLowerCase())
      .includes(user.barangay.toLowerCase());
  };

  const getUpcomingSchedule = (distribution) => {
    const now = new Date();
    return distribution.distributionSchedule
      .filter(schedule => new Date(schedule.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getUserRelevantSchedules = (distribution) => {
    if (!user?.barangay) return [];
    return distribution.distributionSchedule
      .filter(schedule => schedule.barangay.toLowerCase() === user.barangay.toLowerCase());
  };

  const handleViewDetails = (distribution) => {
    setSelectedDistribution(distribution);
    setShowModal(true);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading rice distributions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Monthly Rice Distribution</h1>
          <p className={styles.pageDescription}>
            Stay informed about rice distribution schedules and locations in your barangay. 
            Qualified residents will receive SMS notifications for distribution dates.
          </p>
        </div>
        <div className={styles.headerIcon}>
          🌾
        </div>
      </div>

      {/* User Info Banner */}
      {user && (
        <div className={styles.userInfoBanner}>
          <div className={styles.userInfo}>
            <span className={styles.userLabel}>Your Barangay:</span>
            <span className={styles.userBarangay}>{user.barangay || 'Not specified'}</span>
          </div>
          <div className={styles.userNote}>
            You will receive SMS notifications for distributions in your barangay
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className={styles.errorMessage}>
          <span className={styles.errorIcon}>⚠️</span>
          {error}
        </div>
      )}

      {/* Distributions Grid */}
      <div className={styles.distributionsContainer}>
        {distributions.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <h3>No Rice Distributions Available</h3>
            <p>There are currently no rice distributions scheduled. Check back later for updates.</p>
          </div>
        ) : (
          <>
            <div className={styles.distributionsGrid}>
              {distributions.map((distribution) => {
                const isRelevantToUser = isUserBarangayIncluded(distribution);
                const upcomingSchedules = getUpcomingSchedule(distribution);
                const userSchedules = getUserRelevantSchedules(distribution);
                
                return (
                  <div 
                    key={distribution._id} 
                    className={`${styles.distributionCard} ${isRelevantToUser ? styles.relevantCard : ''}`}
                  >
                    {/* Card Header */}
                    <div className={styles.cardHeader}>
                      <h3 className={styles.distributionTitle}>
                        {distribution.distributionTitle}
                      </h3>
                      <span className={`${styles.statusBadge} ${styles[distribution.status]}`}>
                        {distribution.status}
                      </span>
                    </div>

                    {/* Distribution Info */}
                    <div className={styles.cardBody}>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Month:</span>
                        <span className={styles.infoValue}>
                          {formatMonth(distribution.distributionMonth)}
                        </span>
                      </div>

                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Barangays:</span>
                        <span className={styles.infoValue}>
                          {distribution.selectedBarangays.length} selected
                        </span>
                      </div>

                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Rice per Family:</span>
                        <span className={styles.infoValue}>
                          {distribution.riceDetails.kilosPerFamily} kg
                        </span>
                      </div>

                      {/* User-specific info */}
                      {isRelevantToUser && (
                        <div className={styles.userRelevantInfo}>
                          <div className={styles.relevantBadge}>
                            ✓ Your barangay is included
                          </div>
                          {userSchedules.length > 0 && (
                            <div className={styles.userSchedule}>
                              <strong>Your distribution date:</strong>
                              <div className={styles.scheduleDate}>
                                {formatDate(userSchedules[0].date)}
                              </div>
                              <div className={styles.scheduleLocation}>
                                📍 {userSchedules[0].location}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Next distribution info */}
                      {upcomingSchedules.length > 0 && (
                        <div className={styles.nextDistribution}>
                          <span className={styles.nextLabel}>Next distribution:</span>
                          <span className={styles.nextDate}>
                            {formatDate(upcomingSchedules[0].date)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className={styles.cardFooter}>
                      <button 
                        className={styles.viewDetailsBtn}
                        onClick={() => handleViewDetails(distribution)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={`${styles.pageBtn} ${currentPage === 1 ? styles.disabled : ''}`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                <div className={styles.pageNumbers}>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  className={`${styles.pageBtn} ${currentPage === pagination.pages ? styles.disabled : ''}`}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Details Modal */}
      {showModal && selectedDistribution && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{selectedDistribution.distributionTitle}</h2>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Basic Information */}
              <div className={styles.modalSection}>
                <h3>Distribution Information</h3>
                <div className={styles.modalInfoGrid}>
                  <div className={styles.modalInfoItem}>
                    <span className={styles.modalLabel}>Month:</span>
                    <span>{formatMonth(selectedDistribution.distributionMonth)}</span>
                  </div>
                  <div className={styles.modalInfoItem}>
                    <span className={styles.modalLabel}>Status:</span>
                    <span className={`${styles.statusBadge} ${styles[selectedDistribution.status]}`}>
                      {selectedDistribution.status}
                    </span>
                  </div>
                  <div className={styles.modalInfoItem}>
                    <span className={styles.modalLabel}>Total Rice:</span>
                    <span>{selectedDistribution.riceDetails.totalKilos} kg</span>
                  </div>
                  <div className={styles.modalInfoItem}>
                    <span className={styles.modalLabel}>Per Family:</span>
                    <span>{selectedDistribution.riceDetails.kilosPerFamily} kg</span>
                  </div>
                </div>
              </div>

              {/* Selected Barangays */}
              <div className={styles.modalSection}>
                <h3>Selected Barangays ({selectedDistribution.selectedBarangays.length})</h3>
                <div className={styles.barangaysList}>
                  {selectedDistribution.selectedBarangays.map((barangay, index) => (
                    <span 
                      key={index} 
                      className={`${styles.barangayTag} ${
                        user?.barangay?.toLowerCase() === barangay.toLowerCase() ? styles.userBarangayTag : ''
                      }`}
                    >
                      {barangay}
                      {user?.barangay?.toLowerCase() === barangay.toLowerCase() && ' (You)'}
                    </span>
                  ))}
                </div>
              </div>

              {/* Distribution Schedule */}
              <div className={styles.modalSection}>
                <h3>Distribution Schedule</h3>
                <div className={styles.scheduleList}>
                  {selectedDistribution.distributionSchedule
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((schedule, index) => (
                    <div 
                      key={index} 
                      className={`${styles.scheduleItem} ${
                        user?.barangay?.toLowerCase() === schedule.barangay.toLowerCase() ? styles.userSchedule : ''
                      }`}
                    >
                      <div className={styles.scheduleHeader}>
                        <span className={styles.scheduleBarangay}>
                          {schedule.barangay}
                          {user?.barangay?.toLowerCase() === schedule.barangay.toLowerCase() && ' (Your barangay)'}
                        </span>
                        <span className={styles.scheduleDate}>
                          {formatDate(schedule.date)}
                        </span>
                      </div>
                      <div className={styles.scheduleLocation}>
                        📍 {schedule.location}
                      </div>
                      {schedule.contactPerson && (
                        <div className={styles.scheduleContact}>
                          👤 {schedule.contactPerson.name}
                          {schedule.contactPerson.phone && (
                            <span> • 📞 {schedule.contactPerson.phone}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* SMS Notification Info */}
              <div className={styles.modalSection}>
                <div className={styles.notificationInfo}>
                  <h4>📱 SMS Notifications</h4>
                  <p>
                    Residents of selected barangays will receive automatic SMS notifications 
                    with distribution details and reminders.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiceDistribution;