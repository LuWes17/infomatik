import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Package, 
  AlertCircle, 
  Search, 
  Filter, 
  ChevronDown, 
  X,
  Home,
  Wheat
} from 'lucide-react';
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
  const dropdownRef = useRef(null);
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

  // Close dropdown when clicking outside - Like Job Openings
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter functionality - Exactly like Job Openings
  useEffect(() => {
    let filtered = [...distributions];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(dist => dist.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm.trim()) {
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

  // Modal handlers - Like Job Openings
  const handleDistributionClick = (distribution) => {
    setSelectedDistribution(distribution);
    setShowModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDistribution(null);
    document.body.style.overflow = "auto";
  };

  // Filter handlers - Exactly like Job Openings
  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Loading state - Like Job Openings
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

  // Error state - Like Job Openings
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
      {/* Header - Exactly like Job Openings */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <Package size={92} className={styles.icon} />
          <div className={styles.headerContent}>
            <h1>Monthly Rice Distribution</h1>
            <p>View upcoming and past rice distribution schedules for your barangay.</p>
          </div>
        </div>

        <div className={styles.filterSection}>
          {/* Search Container - Like Job Openings */}
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

          {/* Filter Dropdown - Exactly like Job Openings */}
          <div className={styles.filterDropdown} ref={dropdownRef}>
            <Filter size={20} className={styles.filterIcon} />
            <button
              onClick={toggleDropdown}
              className={`${styles.dropdownButton} ${dropdownOpen ? styles.active : ''}`}
            >
              <span>{statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}</span>
              <ChevronDown size={16} className={`${styles.dropdownArrow} ${dropdownOpen ? styles.open : ''}`} />
            </button>
            <div className={`${styles.dropdownContent} ${dropdownOpen ? styles.show : ''}`}>
              <button
                onClick={() => handleFilterChange('all')}
                className={`${styles.dropdownItem} ${statusFilter === 'all' ? styles.active : ''}`}
              >
                All Status
              </button>
              {statusOptions.slice(1).map(status => (
                <button
                  key={status}
                  onClick={() => handleFilterChange(status)}
                  className={`${styles.dropdownItem} ${statusFilter === status ? styles.active : ''}`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {filteredDistributions.length === 0 ? (
          <div className={styles.noDistributions}>
            <Package size={64} />
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
                  onClick={() => handleDistributionClick(distribution)}
                >
                  {/* Status Badge */}
                  <div className={`${styles.statusBadge} ${styles[distribution.status]}`}>
                    {distribution.status === 'planned' ? 'Planned' : 'Completed'}
                  </div>

                  {/* Distribution Title */}
                  <h3 className={styles.distributionTitle}>
                    {formatMonth(distribution.distributionMonth)} Distribution
                  </h3>

                  {/* Distribution Info */}
                  <div className={styles.cardDetails}>
                    <div className={styles.detailItem}>
                      <Home size={16} />
                      <span>{distribution.selectedBarangays.length} Barangays</span>
                    </div>
                    <div className={styles.detailItem}>
                      <Wheat size={16} />
                      <span>{distribution.riceDetails?.kilosPerFamily || 'N/A'} kg per Family</span>
                    </div>
                  </div>

                  {/* User Distribution Details - Only show if user's barangay is included */}
                  {user?.barangay && isRelevant && userSchedule && (
                    <div className={styles.userBarangaySection}>
                      <div className={styles.userBarangayLabel}>
                        <strong>Your Barangay:</strong> {user.barangay}
                      </div>
                      
                      <div className={styles.distributionDetails}>
                        <div className={styles.detailItem}>
                          <Calendar size={14} />
                          <span><strong>Pick up Date:</strong> {formatDate(userSchedule.date)}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <MapPin size={14} />
                          <span><strong>Pick up Address:</strong> {userSchedule.location}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Next Distribution - Like Job Openings requirements section */}
                  {upcomingSchedules.length > 0 && (
                    <div className={styles.nextDistribution}>
                      <span className={styles.nextLabel}>Next Distribution:</span>
                      <span className={styles.nextDate}>
                        {formatDate(upcomingSchedules[0].date)}
                      </span>
                    </div>
                  )}

                  {/* Card Actions - Exactly like Job Openings cardActions */}
                  <div className={styles.cardFooter}>
                    <button 
                      className={styles.viewDetailsBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDistributionClick(distribution);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination - Like Job Openings if it had pagination */}
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

      {/* Modal - Exactly like Job Openings modal structure */}
      {showModal && selectedDistribution && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <h2>{formatMonth(selectedDistribution.distributionMonth)} Rice Distribution</h2>
                <span className={`${styles.statusBadge} ${styles[selectedDistribution.status]}`}>
                  {selectedDistribution.status === 'planned' ? 'Planned' : 'Completed'}
                </span>
              </div>
              <button
                onClick={closeModal} className={styles.closeBtn}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {/* Overview - Like Job Openings jobDetailsGrid */}
              <div className={styles.overview}>
                <div className={styles.overviewItem}>
                  <Home size={20} />
                  <div>
                    <strong> Total Barangays:</strong> {selectedDistribution.selectedBarangays.length}
                  </div>
                </div>
                
                {selectedDistribution.riceDetails && (
                  <div className={styles.overviewItem}>
                    <Wheat size={20} />
                    <div>
                      <strong>Rice Per Family:</strong> {selectedDistribution.riceDetails.kilosPerFamily} kgs
                    </div>
                  </div>
                )}
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

              {/* Notification Info - Like Job Openings special info sections */}
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