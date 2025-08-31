import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, MapPin, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Accomplishments.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const Accomplishments = () => {
  const [accomplishments, setAccomplishments] = useState([]);
  const [filteredAccomplishments, setFilteredAccomplishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAccomplishment, setSelectedAccomplishment] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Project types for filtering
  const projectTypes = ['All', 'Infrastructure', 'Social Program', 'Health Initiative', 'Education', 'Environment', 'Economic Development', 'Other'];

  // Fetch accomplishments from API
  const fetchAccomplishments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/accomplishments`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch accomplishments');
      }

      const data = await response.json();
      setAccomplishments(data.data || data);
      setFilteredAccomplishments(data.data || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccomplishments();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = accomplishments;

    // Apply project type filter
    if (selectedFilter !== 'All') {
      filtered = filtered.filter(acc => acc.projectType === selectedFilter);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(acc => 
        acc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAccomplishments(filtered);
  }, [accomplishments, selectedFilter, searchTerm]);

  // Open accomplishment modal
  const handleCardClick = (accomplishment) => {
    setSelectedAccomplishment(accomplishment);
    setCurrentImageIndex(0);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedAccomplishment(null);
    setCurrentImageIndex(0);
  };

  // Navigate through images in modal
  const nextImage = () => {
    if (selectedAccomplishment && selectedAccomplishment.photos) {
      setCurrentImageIndex((prev) => 
        prev === selectedAccomplishment.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedAccomplishment && selectedAccomplishment.photos) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedAccomplishment.photos.length - 1 : prev - 1
      );
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading accomplishments...</p>
      </div>
    );
  }

  return (
    <div className={styles.accomplishmentsPage}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Our Accomplishments</h1>
          <p className={styles.subtitle}>
            Discover the progress and achievements we've made for our community
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.filtersSection}>
        <div className="container">
          <div className={styles.filtersContainer}>
            {/* Search Bar */}
            <div className={styles.searchContainer}>
              <Search className={styles.searchIcon} size={20} />
              <input
                type="text"
                placeholder="Search accomplishments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Project Type Filter */}
            <div className={styles.filterContainer}>
              <Filter className={styles.filterIcon} size={20} />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className={styles.filterSelect}
              >
                {projectTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className={styles.resultsCount}>
            Showing {filteredAccomplishments.length} accomplishment{filteredAccomplishments.length !== 1 ? 's' : ''}
            {selectedFilter !== 'All' && ` in ${selectedFilter}`}
            {searchTerm && ` for "${searchTerm}"`}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="container">
          <div className={styles.errorMessage}>
            {error}
          </div>
        </div>
      )}

      {/* Accomplishments Grid */}
      <div className={styles.contentSection}>
        <div className="container">
          {filteredAccomplishments.length === 0 ? (
            <div className={styles.noResults}>
              <p>No accomplishments found matching your criteria.</p>
            </div>
          ) : (
            <div className={styles.accomplishmentsGrid}>
              {filteredAccomplishments.map((accomplishment) => (
                <div
                  key={accomplishment._id}
                  className={styles.accomplishmentCard}
                  onClick={() => handleCardClick(accomplishment)}
                >
                  {/* Card Image */}
                  <div className={styles.cardImageContainer}>
                    {accomplishment.photos && accomplishment.photos.length > 0 ? (
                      <img
                        src={accomplishment.photos[0].filePath}
                        alt={accomplishment.title}
                        className={styles.cardImage}
                      />
                    ) : (
                      <div className={styles.placeholderImage}>
                        <MapPin size={40} />
                      </div>
                    )}
                    {accomplishment.photos && accomplishment.photos.length > 1 && (
                      <div className={styles.imageCount}>
                        +{accomplishment.photos.length - 1} more
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <span className={`${styles.projectType} ${styles[accomplishment.projectType?.toLowerCase()]}`}>
                        {accomplishment.projectType || 'General'}
                      </span>
                      <div className={styles.cardDate}>
                        <Calendar size={14} />
                        {formatDate(accomplishment.createdAt)}
                      </div>
                    </div>

                    <h3 className={styles.cardTitle}>{accomplishment.title}</h3>
                    
                    <p className={styles.cardDescription}>
                      {accomplishment.description.length > 120
                        ? `${accomplishment.description.substring(0, 120)}...`
                        : accomplishment.description
                      }
                    </p>

                    <div className={styles.cardFooter}>
                      <div className={styles.viewsCount}>
                        <Eye size={16} />
                        {accomplishment.views || 0} views
                      </div>
                      <span className={styles.clickHint}>Click to view details</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Accomplishment Details */}
      {showModal && selectedAccomplishment && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{selectedAccomplishment.title}</h2>
              <button className={styles.closeButton} onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalContent}>
              {/* Image Gallery */}
              {selectedAccomplishment.photos && selectedAccomplishment.photos.length > 0 && (
                <div className={styles.imageGallery}>
                  <div className={styles.mainImageContainer}>
                    <img
                      src={selectedAccomplishment.photos[currentImageIndex].filePath}
                      alt={`${selectedAccomplishment.title} - Image ${currentImageIndex + 1}`}
                      className={styles.mainImage}
                    />
                    
                    {selectedAccomplishment.photos.length > 1 && (
                      <>
                        <button
                          className={`${styles.navButton} ${styles.prevButton}`}
                          onClick={prevImage}
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <button
                          className={`${styles.navButton} ${styles.nextButton}`}
                          onClick={nextImage}
                        >
                          <ChevronRight size={24} />
                        </button>
                      </>
                    )}

                    <div className={styles.imageIndicator}>
                      {currentImageIndex + 1} / {selectedAccomplishment.photos.length}
                    </div>
                  </div>

                  {/* Thumbnail Navigation */}
                  {selectedAccomplishment.photos.length > 1 && (
                    <div className={styles.thumbnails}>
                      {selectedAccomplishment.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo.filePath}
                          alt={`Thumbnail ${index + 1}`}
                          className={`${styles.thumbnail} ${currentImageIndex === index ? styles.activeThumbnail : ''}`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Details Section */}
              <div className={styles.detailsSection}>
                <div className={styles.modalMeta}>
                  <span className={`${styles.projectType} ${styles[selectedAccomplishment.projectType?.toLowerCase()]}`}>
                    {selectedAccomplishment.projectType || 'General'}
                  </span>
                  <div className={styles.modalDate}>
                    <Calendar size={16} />
                    {formatDate(selectedAccomplishment.createdAt)}
                  </div>
                  <div className={styles.modalViews}>
                    <Eye size={16} />
                    {selectedAccomplishment.views || 0} views
                  </div>
                </div>

                <div className={styles.description}>
                  <h4>Description</h4>
                  <p>{selectedAccomplishment.description}</p>
                </div>

                {selectedAccomplishment.createdBy && (
                  <div className={styles.createdBy}>
                    <h4>Published by</h4>
                    <p>{selectedAccomplishment.createdBy.firstName} {selectedAccomplishment.createdBy.lastName}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accomplishments;