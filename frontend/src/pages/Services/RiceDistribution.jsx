import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Users, Clock, Package, AlertCircle, Search, Filter, ChevronDown, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import styles from './RiceDistribution.module.css';

const RiceDistribution = () => {
  const { user } = useAuth();
  const [distributions, setDistributions] = useState([]);
  const [filteredDistributions, setFilteredDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  const statusOptions = ['all', 'planned', 'completed'];

  useEffect(() => {
    fetchDistributions(currentPage);
  }, [currentPage]);

  // Filter functionality
  useEffect(() => {
    let filtered = [...distributions];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(dist => dist.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(dist => {
        const searchLower = searchTerm.toLowerCase();
        
        // Search in distribution month/title
        const monthMatch = formatMonth(dist.distributionMonth).toLowerCase().includes(searchLower);
        
        // Search in selected barangays
        const barangayMatch = dist.selectedBarangays.some(barangay => 
          barangay.toLowerCase().includes(searchLower)
        );
        
        // Search in distribution schedule locations
        const locationMatch = dist.distributionSchedule.some(schedule =>
          schedule.location.toLowerCase().includes(searchLower) ||
          schedule.barangay.toLowerCase().includes(searchLower)
        );
        
        return monthMatch || barangayMatch || locationMatch;
      });
    }

    setFilteredDistributions(filtered);
  }, [distributions, statusFilter, searchTerm]);

  const fetchDistributions = async (page = 1) => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get(`/rice-distribution?page=${page}&limit=6`);
      
      if (response.data.success) {
        setDistributions(response.data.data || []);
        setFilteredDistributions(response.data.data || []);
        setPagination(response.data.pagination || { current: 1, pages: 1, total: 0 });
      } else {
        throw new Error(response.data.message || 'Failed to fetch rice distributions');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch rice distributions';
      setError(errorMessage);
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
    // Handle both YYYY-MM format and full date strings
    let dateToFormat;
    if (monthString.includes('-') && monthString.length === 7) {
      dateToFormat = monthString + '-01'; // Add day for parsing
    } else {
      dateToFormat = monthString;
    }
    
    return new Date(dateToFormat).toLocaleDateString('en-US', {
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

  const getUserRelevantSchedule = (distribution) => {
    if (!user?.barangay) return null;
    
    return distribution.distributionSchedule.find(schedule =>
      schedule.barangay.toLowerCase() === user.barangay.toLowerCase()
    );
  };

  const openModal = (distribution) => {
    setSelectedDistribution(distribution);
    setShowModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDistribution(null);
    document.body.style.overflow = "auto";
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const getStatusBadgeClass = (status) => {
    return `${styles.statusBadge} ${styles[status]}`;
  };

  if (loading) {
    return (
      <div className={styles.riceDistribution}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading rice distributions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.riceDistribution}>
        <div className={styles.errorMessage}>
          <AlertCircle size={20} />
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.riceDistribution}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <Package size={92} className={styles.icon} />
          <div className={styles.headerContent}>
            <h1>Monthly Rice Distribution</h1>
            <p>View upcoming and past rice distribution schedules for your barangay.</p>
          </div>
        </div>

        <div className={styles.filterSection}>
          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by month, barangay, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Filter Dropdown */}
          <div className={styles.filterDropdown}>
            <Filter size={20} className={styles.filterIcon} />
            <button
              onClick={toggleDropdown}
              className={`${styles.dropdownButton} ${dropdownOpen ? styles.active : ''}`}
            >
              <span>{statusFilter === 'all' ? 'All Status' : statusFilter}</span>
              <ChevronDown size={16} className={`${styles.dropdownArrow} ${dropdownOpen ? styles.open : ''}`} />
            </button>
            <div className={`${styles.dropdownContent} ${dropdownOpen ? styles.show : ''}`}>
              <button
                onClick={() => handleFilterChange('all')}
                className={`${styles.dropdownItem} ${statusFilter === 'all' ? styles.active : ''}`}
              >
                All Status ({distributions.length})
              </button>
              {statusOptions.slice(1).map(status => (
                <button
                  key={status}
                  onClick={() => handleFilterChange(status)}
                  className={`${styles.dropdownItem} ${statusFilter === status ? styles.active : ''}`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({distributions.filter(dist => dist.status === status).length})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Info Banner */}
      {user?.barangay && (
        <div className={styles.userBanner}>
          <div className={styles.userInfo}>
            <span className={styles.userLabel}>Your Barangay:</span>
            <span className={styles.userBarangay}>{user.barangay}</span>
          </div>
          <span className={styles.userNote}>You'll be notified when your barangay is scheduled</span>
        </div>
      )}

      {/* Content */}
      <div className={styles.content}>
        {filteredDistributions.length === 0 ? (
          <div className={styles.noDistributions}>
            <Package size={64} className={styles.noDistributionsIcon} />
            <h3>No distributions found</h3>
            <p>{searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'No rice distributions are currently scheduled.'}
            </p>
          </div>
        ) : (
          <div className={styles.distributionsGrid}>
            {filteredDistributions.map((distribution) => {
              const isRelevant = isUserBarangayIncluded(distribution);
              const userSchedule = getUserRelevantSchedule(distribution);
              const upcomingSchedules = getUpcomingSchedule(distribution);

              return (
                <div
                  key={distribution._id}
                  className={`${styles.distributionCard} ${isRelevant ? styles.relevantCard : ''}`}
                  onClick={() => openModal(distribution)}
                >
                  <div className={styles.cardHeader}>
                    <h3 className={styles.distributionTitle}>
                      {formatMonth(distribution.distributionMonth)} Distribution
                    </h3>
                    <span className={getStatusBadgeClass(distribution.status)}>
                      {distribution.status}
                    </span>
                  </div>

                  <div className={styles.cardDetails}>
                    <div className={styles.detailItem}>
                      <MapPin size={16} />
                      <span>{distribution.selectedBarangays.length} Barangays</span>
                    </div>
                    <div className={styles.detailItem}>
                      <Calendar size={16} />
                      <span>{distribution.distributionSchedule.length} Schedule{distribution.distributionSchedule.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <Users size={16} />
                      <span>{distribution.riceDetails?.kilosPerFamily || 'N/A'} kg per family</span>
                    </div>
                  </div>

                  {isRelevant && userSchedule && (
                    <div className={styles.userRelevantInfo}>
                      <div className={styles.relevantBadge}>Your Schedule</div>
                      <div className={styles.userSchedule}>
                        <strong>Date: {formatDate(userSchedule.date)}</strong>
                        <div className={styles.scheduleLocation}>
                          Location: {userSchedule.location}
                        </div>
                        {userSchedule.contactPerson?.name && (
                          <div className={styles.scheduleContact}>
                            Contact: {userSchedule.contactPerson.name}
                            {userSchedule.contactPerson.phone && ` (${userSchedule.contactPerson.phone})`}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {upcomingSchedules.length > 0 && (
                    <div className={styles.nextDistribution}>
                      <span className={styles.nextLabel}>Next Distribution:</span>
                      <span className={styles.nextDate}>
                        {formatDate(upcomingSchedules[0].date)}
                      </span>
                    </div>
                  )}

                  <div className={styles.cardFooter}>
                    <button className={styles.viewDetailsBtn}>
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`${styles.pageBtn} ${currentPage === 1 ? styles.disabled : ''}`}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            
            <div className={styles.pageNumbers}>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
              disabled={currentPage === pagination.pages}
              className={`${styles.pageBtn} ${currentPage === pagination.pages ? styles.disabled : ''}`}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedDistribution && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {formatMonth(selectedDistribution.distributionMonth)} Rice Distribution
              </h2>
              <span className={getStatusBadgeClass(selectedDistribution.status)}>
                {selectedDistribution.status}
              </span>
              <button
                onClick={closeModal}
                className={styles.closeBtn}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {/* Overview */}
              <div className={styles.section}>
                <h4>Distribution Overview</h4>
                <div className={styles.overview}>
                  <div className={styles.overviewItem}>
                    <span className={styles.overviewLabel}>Total Barangays:</span>
                    <span className={styles.overviewValue}>{selectedDistribution.selectedBarangays.length}</span>
                  </div>
                  <div className={styles.overviewItem}>
                    <span className={styles.overviewLabel}>Total Schedules:</span>
                    <span className={styles.overviewValue}>{selectedDistribution.distributionSchedule.length}</span>
                  </div>
                  <div className={styles.overviewItem}>
                    <span className={styles.overviewLabel}>Status:</span>
                    <span className={styles.overviewValue}>{selectedDistribution.status}</span>
                  </div>
                  {selectedDistribution.riceDetails && (
                    <>
                      <div className={styles.overviewItem}>
                        <span className={styles.overviewLabel}>Total Rice:</span>
                        <span className={styles.overviewValue}>{selectedDistribution.riceDetails.totalKilos} kg</span>
                      </div>
                      <div className={styles.overviewItem}>
                        <span className={styles.overviewLabel}>Per Family:</span>
                        <span className={styles.overviewValue}>{selectedDistribution.riceDetails.kilosPerFamily} kg</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Selected Barangays */}
              <div className={styles.section}>
                <h4>Selected Barangays</h4>
                <div className={styles.barangayGrid}>
                  {selectedDistribution.selectedBarangays.map((barangay, index) => (
                    <span key={index} className={styles.barangayTag}>
                      {barangay}
                    </span>
                  ))}
                </div>
              </div>

              {/* Distribution Schedule */}
              <div className={styles.section}>
                <h4>Distribution Schedule</h4>
                <div className={styles.scheduleList}>
                  {selectedDistribution.distributionSchedule
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((schedule, index) => {
                      const isUserSchedule = user?.barangay && 
                        schedule.barangay.toLowerCase() === user.barangay.toLowerCase();
                      
                      return (
                        <div
                          key={index}
                          className={`${styles.scheduleItem} ${isUserSchedule ? styles.userSchedule : ''}`}
                        >
                          <div className={styles.scheduleHeader}>
                            <span className={styles.scheduleBarangay}>
                              {schedule.barangay}
                            </span>
                            <span className={styles.scheduleDate}>
                              {formatDate(schedule.date)}
                            </span>
                          </div>
                          <div className={styles.scheduleDetails}>
                            <div className={styles.scheduleLocation}>
                              <MapPin size={14} />
                              Location: {schedule.location}
                            </div>
                            {schedule.contactPerson?.name && (
                              <div className={styles.scheduleContact}>
                                <Users size={14} />
                                Contact: {schedule.contactPerson.name}
                                {schedule.contactPerson.phone && ` - ${schedule.contactPerson.phone}`}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Notification Info */}
              {user?.barangay && isUserBarangayIncluded(selectedDistribution) && (
                <div className={styles.notificationInfo}>
                  <h4>SMS Notification</h4>
                  <p>You will receive an SMS notification closer to your scheduled distribution date with specific details and any updates.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiceDistribution;