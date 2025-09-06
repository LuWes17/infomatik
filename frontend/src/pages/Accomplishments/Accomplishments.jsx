import React, { useState, useEffect, useRef } from 'react';
import styles from './Accomplishments.module.css';
import { ClipboardCheck, Search, Filter, Calendar, MapPin, Eye, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL; // e.g. http://localhost:4000/api

const Accomplishments = () => {
  const [accomplishments, setAccomplishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAccomplishment, setSelectedAccomplishment] = useState(null);
  const [filteredAccomplishments, setFilteredAccomplishments] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);


  // Project types for filtering
  const projectTypes = ['All', 'Infrastructure', 'Social Program', 'Health Initiative', 'Education', 'Environment', 'Economic Development', 'Other'];

  // Fetch accomplishments from backend
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

  // Apply filters + search
  useEffect(() => {
  let filtered = accomplishments;

  if (selectedFilter !== 'All') {
    // Directly filter using the full projectType
    filtered = filtered.filter(a => a.projectType === selectedFilter);
  }

  if (searchTerm.trim()) {
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  setFilteredAccomplishments(filtered);
}, [accomplishments, selectedFilter, searchTerm]);


  // Helper function to get CSS class name for project type
  const getProjectTypeClass = (projectType) => {
    if (!projectType) return 'general';
    const lowerType = projectType.toLowerCase().replace(/\s+/g, ''); // remove spaces
    return lowerType;
  };


  const openModal = (accomplishment) => {
    setSelectedAccomplishment(accomplishment);
    setCurrentImageIndex(0);
    setShowModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAccomplishment(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = "auto";
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading accomplishments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>Error: {error}</p>
        <button onClick={fetchAccomplishments} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.accomplishmentsPage}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <ClipboardCheck size={92} className={styles.icon} />
          <div className={styles.headerContent}>
            <h1>Our Accomplishments</h1>
            <p>Mga natapos namin na proyekto at programa para sa aming komunidad. Tingnan ang aming mga tagumpay at patuloy na pag-unlad.</p>
          </div>
        </div>
        
        <div className={styles.filterContainer}>
          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search accomplishments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Filter Dropdown */}
          <div className={styles.filterDropdown} ref={dropdownRef}>
            <Filter size={20} className={styles.filterIcon} />
            <button
              onClick={toggleDropdown}
              className={`${styles.dropdownButton} ${dropdownOpen ? styles.active : ''}`}
            >
              <span>{selectedFilter}</span>
              <ChevronDown size={16} className={`${styles.dropdownArrow} ${dropdownOpen ? styles.open : ''}`} />
            </button>
            <div className={`${styles.dropdownContent} ${dropdownOpen ? styles.show : ''}`}>
              {projectTypes.map(type => (
                <button
                  key={type}
                  onClick={() => handleFilterChange(type)}
                  className={`${styles.dropdownItem} ${selectedFilter === type ? styles.active : ''}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className={styles.content}>
        {filteredAccomplishments.length === 0 ? (
          <div className={styles.noResults}>
            <ClipboardCheck size={80} className={styles.noResultsIcon} />
            <h3>No accomplishments found</h3>
            <p>
              {searchTerm || selectedFilter !== 'All' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Check back later for updates'}
            </p>
          </div>
        ) : (
          <div className={styles.accomplishmentsGrid}>
            {filteredAccomplishments.map((accomplishment) => (
              <div key={accomplishment._id} className={styles.accomplishmentCard}>
                {/* Card Image */}
                <div className={styles.cardImageContainer}>
                  {accomplishment.photos && accomplishment.photos.length > 0 ? (
                    <>
                      <img 
                        src={accomplishment.photos[0].filePath.startsWith('http') ? 
                             accomplishment.photos[0].filePath : 
                             `${API_BASE.replace('/api', '')}/${accomplishment.photos[0].filePath}`} 
                        alt={accomplishment.title}
                        className={styles.cardImage}
                        loading="lazy"
                      />
                      {accomplishment.photos.length > 1 && (
                        <div className={styles.imageCount}>
                          +{accomplishment.photos.length - 1} more
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={styles.placeholderImage}>
                      <ClipboardCheck size={40} />
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{accomplishment.title}</h3>
                    <div className={styles.cardCategory}>
                      <span className={`${styles.projectType} ${styles[getProjectTypeClass(accomplishment.projectType)]}`}>
                        {accomplishment.projectType || 'General'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className={styles.cardDescription}>
                    {accomplishment.description}
                  </p>

                  {/* Footer with date and button */}
                  <div className={styles.cardFooter}>
                    <div className={styles.cardMeta}>
                      <span className={styles.publishDate}>
                        {formatDate(accomplishment.createdAt)}
                      </span>
                    </div>
                    <button 
                      onClick={() => openModal(accomplishment)}
                      className={styles.readMoreButton}
                    >
                      Read More
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedAccomplishment && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <h2>{selectedAccomplishment.title}</h2>
                <span className={`${styles.projectType} ${styles[getProjectTypeClass(selectedAccomplishment.projectType)]}`}>
                  {selectedAccomplishment.projectType || 'General'}
                </span>
              </div>
              <button onClick={closeModal} className={styles.closeButton}>
                ×
              </button>
            </div>

            <div className={styles.modalContent}>
              {/* Image Gallery */}
              {selectedAccomplishment.photos && selectedAccomplishment.photos.length > 0 && (
                <div className={styles.imageGallery}>
                  <div className={styles.mainImageContainer}>
                    <img
                      src={selectedAccomplishment.photos[currentImageIndex].filePath.startsWith('http') ? 
                           selectedAccomplishment.photos[currentImageIndex].filePath : 
                           `${API_BASE.replace('/api', '')}/${selectedAccomplishment.photos[currentImageIndex].filePath}`}
                      alt={`${selectedAccomplishment.title} - Image ${currentImageIndex + 1}`}
                      className={styles.mainImage}
                      onClick={() => setFullscreenImage(
                        selectedAccomplishment.photos[currentImageIndex].filePath.startsWith('http') 
                          ? selectedAccomplishment.photos[currentImageIndex].filePath 
                          : `${API_BASE.replace('/api', '')}/${selectedAccomplishment.photos[currentImageIndex].filePath}`
                      )}
                    />
                    {fullscreenImage && (
                      <div className={styles.fullscreenOverlay} onClick={() => setFullscreenImage(null)}>
                        <img src={fullscreenImage} alt="Fullscreen View" className={styles.fullscreenImage} />
                        <button className={styles.fullscreenClose} onClick={() => setFullscreenImage(null)}>×</button>
                      </div>
                    )}
                    
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
                          src={photo.filePath.startsWith('http') ? 
                               photo.filePath : 
                               `${API_BASE.replace('/api', '')}/${photo.filePath}`}
                          alt={`Thumbnail ${index + 1}`}
                          className={`${styles.thumbnail} ${currentImageIndex === index ? styles.activeThumbnail : ''}`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Content Details */}
              <div className={styles.modalDetails}>
                <p className={styles.fullDetails}>{selectedAccomplishment.description}</p>

                {/* Metadata */}
                <div className={styles.modalMetadata}>
                  <div className={styles.metaItem}>
                    <strong>Published:</strong> {formatDate(selectedAccomplishment.createdAt)}
                  </div>
                  {selectedAccomplishment.updatedAt !== selectedAccomplishment.createdAt && (
                    <div className={styles.metaItem}>
                      <strong>Last Updated:</strong> {formatDate(selectedAccomplishment.updatedAt)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accomplishments;