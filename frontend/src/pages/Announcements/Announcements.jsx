import React, { useState, useEffect } from 'react'
import styles from './Announcements.module.css'
import { Megaphone, Search, Filter, Calendar, MapPin, Eye } from 'lucide-react';
import megaphone from '../../assets/announcement/megaphone.png'
const API_BASE = import.meta.env.VITE_API_URL; // e.g. http://localhost:4000/api

const PublicAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

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

  const openViewModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowViewModal(true);
    incrementViews(announcement._id);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedAnnouncement(null);
  };

  // Increment views
  const incrementViews = async (id) => {
    try {
      await fetch(`${API_BASE}/announcements/${id}/views`, {
        method: 'PATCH',
      });
    } catch (err) {
      console.error('Failed to increment views:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
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
            <p>Narito ang mga pinakabagong balita, paalala, at impormasyon para sa ating komunidad, mula sa aming opisina.</p>
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

          {/* Filter Buttons */}
          <div className={styles.filterButtons}>
            <Filter size={20} className={styles.filterIcon} />
            <button
              onClick={() => handleFilterChange('All')}
              className={`${styles.filterButton} ${selectedFilter === 'All' ? styles.active : ''}`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange('Update')}
              className={`${styles.filterButton} ${selectedFilter === 'Update' ? styles.active : ''}`}
            >
              Updates
            </button>
            <button
              onClick={() => handleFilterChange('Event')}
              className={`${styles.filterButton} ${selectedFilter === 'Event' ? styles.active : ''}`}
            >
              Events
            </button>
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
                  <div className={styles.viewCount}>
                    <Eye size={14} />
                    <span>{announcement.views || 0}</span>
                  </div>
                </div>

                {/* Card Image */}
                {announcement.photos && announcement.photos.length > 0 && (
                  <div className={styles.cardImage}>
                    <img 
                      src={`${API_BASE.replace('/api', '')}/${announcement.photos[0].filePath}`} 
                      alt={announcement.title}
                      loading="lazy"
                    />
                    {announcement.photos.length > 1 && (
                      <div className={styles.imageCount}>
                        +{announcement.photos.length - 1} more
                      </div>
                    )}
                  </div>
                )}

                {/* Card Content */}
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{announcement.title}</h3>
                  
                  <p className={styles.cardDescription}>
                    {announcement.details.length > 150 
                      ? `${announcement.details.substring(0, 150)}...` 
                      : announcement.details
                    }
                  </p>

                  {/* Event Details */}
                  {announcement.category === 'Event' && announcement.eventDate && (
                    <div className={styles.eventInfo}>
                      <div className={styles.eventDetail}>
                        <Calendar size={16} />
                        <span>{formatDate(announcement.eventDate)}</span>
                      </div>
                      {announcement.eventLocation && (
                        <div className={styles.eventDetail}>
                          <MapPin size={16} />
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

      {/* View Modal */}
      {showViewModal && selectedAnnouncement && (
        <div className={styles.modalOverlay} onClick={closeViewModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <span className={`${styles.category} ${styles[selectedAnnouncement.category.toLowerCase()]}`}>
                  {selectedAnnouncement.category}
                </span>
                <h2>{selectedAnnouncement.title}</h2>
              </div>
              <button onClick={closeViewModal} className={styles.closeButton}>
                ×
              </button>
            </div>

            <div className={styles.modalContent}>
              {/* Photos Section */}
              {selectedAnnouncement.photos && selectedAnnouncement.photos.length > 0 && (
                <div className={styles.modalPhotos}>
                  <div className={styles.photoGrid}>
                    {selectedAnnouncement.photos.map((photo, index) => (
                      <div key={index} className={styles.photoContainer}>
                        <img 
                          src={`${API_BASE.replace('/api', '')}/${photo.filePath}`} 
                          alt={`${selectedAnnouncement.title} - Image ${index + 1}`}
                          className={styles.modalPhoto}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Details */}
              <div className={styles.modalDetails}>
                <p className={styles.fullDetails}>{selectedAnnouncement.details}</p>

                {/* Event Information */}
                {selectedAnnouncement.category === 'Event' && selectedAnnouncement.eventDate && (
                  <div className={styles.eventInfoFull}>
                    <h4>Event Details</h4>
                    <div className={styles.eventDetail}>
                      <Calendar size={18} />
                      <div>
                        <strong>Date:</strong>
                        <span>{formatDate(selectedAnnouncement.eventDate)}</span>
                      </div>
                    </div>
                    {selectedAnnouncement.eventLocation && (
                      <div className={styles.eventDetail}>
                        <MapPin size={18} />
                        <div>
                          <strong>Location:</strong>
                          <span>{selectedAnnouncement.eventLocation}</span>
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
                  <div className={styles.metaItem}>
                    <strong>Views:</strong> {selectedAnnouncement.views || 0}
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
