import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Calendar, FileText, Eye, X, ScrollText, ChevronDown } from 'lucide-react';
import styles from './Ordinance.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const Ordinance = () => {
  const [ordinances, setOrdinances] = useState([]);
  const [filteredOrdinances, setFilteredOrdinances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrdinance, setSelectedOrdinance] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Resolution categories for filtering
  const categories = [
    'All',
    'Public Safety',
    'Health and Sanitation',
    'Environment',
    'Transportation',
    'Business and Commerce',
    'Education',
    'Social Services',
    'Infrastructure',
    'Finance and Budget',
    'Governance',
    'Other'
  ];

  // Fetch ordinances from API
  const fetchOrdinances = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/policies?type=resolution`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch resolutions');
      }

      const data = await response.json();
      setOrdinances(data.data || data);
      setFilteredOrdinances(data.data || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdinances();
  }, []);

  // Close dropdown when clicking outside
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

  // Apply filters and search
  useEffect(() => {
    let filtered = ordinances;

    // Apply category filter
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(ordinance => ordinance.category === categoryFilter);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(ordinance => 
        ordinance.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ordinance.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ordinance.summary.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrdinances(filtered);
  }, [ordinances, categoryFilter, searchTerm]);

  // Open ordinance details modal
  const handleCardClick = (ordinance) => {
    setSelectedOrdinance(ordinance);
    setShowModal(true);
    document.body.style.overflow = "hidden";
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedOrdinance(null);
    document.body.style.overflow = "auto";
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleFilterChange = (category) => {
    setCategoryFilter(category);
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Helper function to get CSS class name for category
  const getCategoryClass = (category) => {
    if (!category) return 'general';
    const lowerCategory = category.toLowerCase().replace(/\s+/g, '').replace(/&/g, 'and');
    return lowerCategory;
  };

  // Loading component
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading resolutions...</p>
        </div>
      </div>
    );
  }

  // Error component
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <p>Error: {error}</p>
          <button onClick={fetchOrdinances} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header Section - Updated to horizontal layout */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <ScrollText size={92} className={styles.icon} />
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Local Resolutions</h1>
            <p className={styles.subtitle}>
              Mga lokal na resolusyon at patakaran ng aming pamunuan. Alamin ang mga batas na umiiral sa aming komunidad.
            </p>
          </div>
        </div>
        
        <div className={styles.filtersContainer}>
          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <div className={styles.searchBox}>
              <Search size={20} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search resolutions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          {/* Filter Dropdown */}
          <div className={styles.filterDropdown} ref={dropdownRef}>
            <Filter size={20} className={styles.filterIcon} />
            <button
              onClick={toggleDropdown}
              className={`${styles.dropdownButton} ${dropdownOpen ? styles.active : ''}`}
            >
              <span>{categoryFilter}</span>
              <ChevronDown size={16} className={`${styles.dropdownArrow} ${dropdownOpen ? styles.open : ''}`} />
            </button>
            <div className={`${styles.dropdownContent} ${dropdownOpen ? styles.show : ''}`}>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleFilterChange(category)}
                  className={`${styles.dropdownItem} ${categoryFilter === category ? styles.active : ''}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className={styles.content}>
        {filteredOrdinances.length === 0 ? (
          <div className={styles.emptyState}>
            <FileText size={80} className={styles.emptyIcon} />
            <h3>No resolution found</h3>
            <p>
              {searchTerm || categoryFilter !== 'All' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Check back later for updates'}
            </p>
          </div>
        ) : (
          <div className={styles.ordinancesGrid}>
            {filteredOrdinances.map((ordinance) => (
              <div
                key={ordinance._id}
                className={styles.ordinanceCard}
                onClick={() => handleCardClick(ordinance)}
              >
                {/* Card Icon - Document placeholder */}
                <div className={styles.cardIconContainer}>
                  <FileText size={80} className={styles.cardIcon} />
                </div>

                {/* Card Content */}
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                      <h3>{ordinance.title}</h3>
                    </div>
                    <div className={`${styles.categoryBadge} ${styles[getCategoryClass(ordinance.category)]}`}>
                      {ordinance.category || 'General'}
                    </div>
                  </div>

                  <div className={styles.ordinanceNumber}>
                    <strong>Resolution No. {ordinance.policyNumber}</strong>
                  </div>
                  
                  <p className={styles.summary}>
                    {ordinance.summary.length > 150 
                      ? `${ordinance.summary.substring(0, 150)}...` 
                      : ordinance.summary
                    }
                  </p>
                  
                  {/* Footer with date and button */}
                  <div className={styles.cardFooter}>
                    <div className={styles.cardMeta}>
                      <div className={styles.metaItem}>
                        <Calendar size={16} />
                        <span>Implemented: {formatDate(ordinance.implementationDate)}</span>
                      </div>
                    </div>
                    <div className={styles.readMoreButton}>
                      Read More
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Ordinance Details */}
      {showModal && selectedOrdinance && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{selectedOrdinance.title}</h2>
              <button onClick={closeModal} className={styles.closeButton}>
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.ordinanceInfo}>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Ordinance Number:</span>
                    <span className={styles.infoValue}>{selectedOrdinance.policyNumber}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Category:</span>
                    <span className={`${styles.categoryTag} ${styles[getCategoryClass(selectedOrdinance.category)]}`}>
                      {selectedOrdinance.category}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Implementation Date:</span>
                    <span className={styles.infoValue}>
                      {formatDate(selectedOrdinance.implementationDate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.summarySection}>
                <h4>Summary</h4>
                <p>{selectedOrdinance.summary}</p>
              </div>

              {selectedOrdinance.fullDocument && (
                <div className={styles.documentSection}>
                  <a 
                    href={selectedOrdinance.fullDocument.filePath} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.documentLink}
                  >
                    <FileText size={20} />
                    <span className={styles.downloadLink}>
                      View Full Resolution Document
                    </span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ordinance;