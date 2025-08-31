import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, FileText, Eye, X } from 'lucide-react';
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

  // Ordinance categories for filtering
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
        throw new Error('Failed to fetch ordinances');
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
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedOrdinance(null);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Local Resolutions</h1>
          <p className={styles.subtitle}>
            Browse and view our local government resolutions and policies
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className={styles.filtersContainer}>
        <div className={styles.searchContainer}>
          <div className={styles.searchBox}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search resolutions by title, number, or summary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.filterContainer}>
          <Filter size={20} className={styles.filterIcon} />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={styles.filterSelect}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className={styles.resultsCount}>
        {filteredOrdinances.length > 0 ? (
          <p>
            Showing {filteredOrdinances.length} of {ordinances.length} resolutions
            {categoryFilter !== 'All' && ` in "${categoryFilter}"`}
          </p>
        ) : (
          <p>No resolutions found matching your criteria</p>
        )}
      </div>

      {/* Ordinances Grid */}
      <div className={styles.ordinancesGrid}>
        {filteredOrdinances.map((ordinance) => (
          <div
            key={ordinance._id}
            className={styles.ordinanceCard}
            onClick={() => handleCardClick(ordinance)}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <FileText size={20} className={styles.titleIcon} />
                <h3>{ordinance.title}</h3>
              </div>
              <span className={styles.categoryBadge}>
                {ordinance.category}
              </span>
            </div>

            <div className={styles.cardContent}>
              <div className={styles.ordinanceNumber}>
                <strong>Resolution No. {ordinance.policyNumber}</strong>
              </div>
              
              <p className={styles.summary}>{ordinance.summary}</p>
              
              <div className={styles.cardMeta}>
                <div className={styles.metaItem}>
                  <Calendar size={16} />
                  <span>Implemented: {formatDate(ordinance.implementationDate)}</span>
                </div>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <span className={styles.clickHint}>
                <Eye size={16} />
                Click to view details
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrdinances.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <FileText size={48} className={styles.emptyIcon} />
          <h3>No resolutions found</h3>
          <p>Try adjusting your search criteria or filter selection</p>
        </div>
      )}

      {/* Modal for Ordinance Details */}
      {showModal && selectedOrdinance && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{selectedOrdinance.title}</h2>
              <button onClick={closeModal} className={styles.closeButton}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.ordinanceInfo}>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Resolution Number:</span>
                    <span className={styles.infoValue}>{selectedOrdinance.policyNumber}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Category:</span>
                    <span className={`${styles.infoValue} ${styles.categoryTag}`}>
                      {selectedOrdinance.category}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Implementation Date:</span>
                    <span className={styles.infoValue}>
                      {formatDate(selectedOrdinance.implementationDate)}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Status:</span>
                    <span className={`${styles.infoValue} ${styles.statusActive}`}>
                      Active
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
                  <h4>Full Document</h4>
                  <div className={styles.documentLink}>
                    <FileText size={20} />
                    <a 
                      href={selectedOrdinance.fullDocument.filePath} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.downloadLink}
                    >
                      View Full Resolution Document
                    </a>
                  </div>
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