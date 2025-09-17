import React, { useState, useEffect, useRef } from 'react'
import styles from './Announcements.module.css'
import { Megaphone, Search, Filter, Calendar, MapPin, Eye, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import megaphone from '../../assets/announcement/megaphone.png'
const API_BASE = import.meta.env.VITE_API_URL; // e.g. http://localhost:4000/api
import { useSearchParams, useLocation } from 'react-router-dom';

const PublicAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const dropdownRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Categories for filtering
  const categories = ['All', 'Update', 'Event'];

  // Fetch announcements from backend
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/announcements`);

      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }

      const data = await response.json();
      setAnnouncements(data.data || data); // supports {data:[]} or []
      setFilteredAnnouncements(data.data || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
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
    let filtered = announcements;

    if (selectedFilter !== 'All') {
      filtered = filtered.filter(a => a.category === selectedFilter);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAnnouncements(filtered);
  }, [announcements, selectedFilter, searchTerm]);

  useEffect(() => {
  const filterParam = searchParams.get('filter');
  const highlightParam = searchParams.get('highlight');
  
  // Set filter based on URL parameter
  if (filterParam && categories.includes(filterParam)) {
    setSelectedFilter(filterParam);
  } else if (filterParam === null) {
    // No filter parameter in URL, keep current filter
  } else {
    // Invalid filter parameter, reset to 'All'
    setSelectedFilter('All');
  }

  // Handle highlight parameter (for specific announcement highlighting)
  if (highlightParam && announcements.length > 0) {
    const highlightedAnnouncement = announcements.find(
      announcement => announcement._id === highlightParam
    );
    if (highlightedAnnouncement) {
      // Auto-open the modal for the highlighted announcement
      setTimeout(() => {
        openViewModal(highlightedAnnouncement);
      }, 500);
    }
  }
}, [searchParams, announcements, location]);

  const openViewModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setCurrentImageIndex(0);
    setShowViewModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedAnnouncement(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = "auto";

    const newSearchParams = new URLSearchParams(searchParams);
    if (newSearchParams.has('highlight')) {
      newSearchParams.delete('highlight');
      setSearchParams(newSearchParams);
    }
  };

  // Navigate through images in modal
  const nextImage = () => {
    if (selectedAnnouncement && selectedAnnouncement.photos) {
      setCurrentImageIndex((prev) => 
        prev === selectedAnnouncement.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedAnnouncement && selectedAnnouncement.photos) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedAnnouncement.photos.length - 1 : prev - 1
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

    const newSearchParams = new URLSearchParams(searchParams);
    if (filter === 'All') {
      newSearchParams.delete('filter');
    } else {
      newSearchParams.set('filter', filter);
    }
    setSearchParams(newSearchParams);
};

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading announcements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>Error: {error}</p>
        <button onClick={fetchAnnouncements} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.publicAnnouncements}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <img src={megaphone} alt="Megaphone" className={styles.icon} />
          <div className={styles.headerContent}>
            <h1>Community Announcements</h1>
            <p>Here are the latest updates and events for our community, from our office.</p>
          </div>
        </div>
        
        <div className={styles.filterContainer}>
          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search announcements..."
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
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleFilterChange(category)}
                  className={`${styles.dropdownItem} ${selectedFilter === category ? styles.active : ''}`}
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
        {filteredAnnouncements.length === 0 ? (
          <div className={styles.noResults}>
            <Megaphone size={80} className={styles.noResultsIcon} />
            <h3>No announcements found</h3>
            <p>
              {searchTerm || selectedFilter !== 'All' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Check back later for updates'}
            </p>
          </div>
        ) : (
          <div className={styles.announcementsGrid}>
            {filteredAnnouncements.map((announcement) => (
              <div key={announcement._id} className={styles.announcementCard}>
                {/* Card Header */}
                <div className={styles.cardHeader}>
                  <div className={styles.categoryBadge}>
                    <span className={`${styles.category} ${styles[announcement.category.toLowerCase()]}`}>
                      {announcement.category}
                    </span>
                  </div>
                </div>

                {/* Card Image - Updated with placeholder */}
                <div className={styles.cardImage}>
                  {announcement.photos && announcement.photos.length > 0 ? (
                    <>
                      <img 
                        src={announcement.photos[0].filePath.startsWith('http') ? 
                             announcement.photos[0].filePath : 
                             `${API_BASE.replace('/api', '')}/${announcement.photos[0].filePath}`} 
                        alt={announcement.title}
                        loading="lazy"
                      />
                      {announcement.photos.length > 1 && (
                        <div className={styles.imageCount}>
                          +{announcement.photos.length - 1} more
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={styles.placeholderImage}>
                      <Megaphone size={40} />
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{announcement.title}</h3>
                  <p className={styles.cardDescription}>
                    {announcement.details}
                  </p>

                  {/* Event Details */}
                  {announcement.category === 'Event' && announcement.eventDate && (
                    <div className={styles.eventInfo}>
                      <div className={styles.eventDetail}>
                        <Calendar size={14} />
                        <span>{formatDate(announcement.eventDate)}</span>
                      </div>
                      {announcement.eventLocation && (
                        <div className={styles.eventDetail}>
                          <MapPin size={14} />
                          <span>{announcement.eventLocation}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Footer */}
                  <div className={styles.cardFooter}>
                    <span className={styles.publishDate}>
                      {formatDate(announcement.createdAt)}
                    </span>
                    <button 
                      onClick={() => openViewModal(announcement)}
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
      {showViewModal && selectedAnnouncement && (
        <div className={styles.modalOverlay} onClick={closeViewModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <h2>{selectedAnnouncement.title}</h2>
                <span className={`${styles.category} ${styles[selectedAnnouncement.category.toLowerCase()]}`}>
                  {selectedAnnouncement.category}
                </span>
              </div>
              <button onClick={closeViewModal} className={styles.closeButton}>
                ×
              </button>
            </div>

            <div className={styles.modalContent}>
              {/* Image Gallery */}
              {selectedAnnouncement.photos && selectedAnnouncement.photos.length > 0 && (
                <div className={styles.imageGallery}>
                  <div className={styles.mainImageContainer}>
                    <img
                      src={selectedAnnouncement.photos[currentImageIndex].filePath.startsWith('http') ? 
                           selectedAnnouncement.photos[currentImageIndex].filePath : 
                           `${API_BASE.replace('/api', '')}/${selectedAnnouncement.photos[currentImageIndex].filePath}`}
                      alt={`${selectedAnnouncement.title} - Image ${currentImageIndex + 1}`}
                      className={styles.mainImage}
                      onClick={() => setFullscreenImage(
                        selectedAnnouncement.photos[currentImageIndex].filePath.startsWith('http') 
                          ? selectedAnnouncement.photos[currentImageIndex].filePath 
                          : `${API_BASE.replace('/api', '')}/${selectedAnnouncement.photos[currentImageIndex].filePath}`
                      )}
                    />
                    {fullscreenImage && (
                      <div className={styles.fullscreenOverlay} onClick={() => setFullscreenImage(null)}>
                        <img src={fullscreenImage} alt="Fullscreen View" className={styles.fullscreenImage} />
                        <button className={styles.fullscreenClose} onClick={() => setFullscreenImage(null)}>×</button>
                      </div>
                    )}
                    
                    {selectedAnnouncement.photos.length > 1 && (
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
                      {currentImageIndex + 1} / {selectedAnnouncement.photos.length}
                    </div>
                  </div>

                  {/* Thumbnail Navigation */}
                  {selectedAnnouncement.photos.length > 1 && (
                    <div className={styles.thumbnails}>
                      {selectedAnnouncement.photos.map((photo, index) => (
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
                <p className={styles.fullDetails}>{selectedAnnouncement.details}</p>

                {/* Event Information */}
                {selectedAnnouncement.category === 'Event' && selectedAnnouncement.eventDate && (
                  <div className={styles.eventInfoFull}>
                    <div className={styles.eventDetail}>
                      <Calendar size={16} />
                      <div>
                        <span><strong>Date:</strong> {formatDate(selectedAnnouncement.eventDate)}</span>
                      </div>
                    </div>
                    {selectedAnnouncement.eventLocation && (
                      <div className={styles.eventDetail}>
                        <MapPin size={16} />
                        <div>
                          <span><strong>Location:</strong> {selectedAnnouncement.eventLocation}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Metadata */}
                <div className={styles.modalMetadata}>
                  <div className={styles.metaItem}>
                    <strong>Published:</strong> {formatDate(selectedAnnouncement.createdAt)}
                  </div>
                  {selectedAnnouncement.updatedAt !== selectedAnnouncement.createdAt && (
                    <div className={styles.metaItem}>
                      <strong>Last Updated:</strong> {formatDate(selectedAnnouncement.updatedAt)}
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

export default PublicAnnouncements;