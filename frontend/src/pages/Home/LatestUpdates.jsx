// LatestUpdates.jsx - Latest Updates Section for Homepage
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Image, ArrowRight, Megaphone } from 'lucide-react';
import styles from './LatestUpdates.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const LatestUpdates = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch latest 3 announcements filtered by "Update" category
  const fetchLatestUpdates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/announcements?category=Update&limit=3`);

      if (!response.ok) {
        throw new Error('Failed to fetch latest updates');
      }

      const data = await response.json();
      setUpdates(data.data || data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching latest updates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestUpdates();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 120) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const handleCardClick = (updateId) => {
    navigate(`/announcements?highlight=${updateId}`);
  };

  const handleGoToAnnouncements = () => {
    navigate('/announcements?filter=Update');
  };

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>Unable to load latest updates.</p>
      </div>
    );
  }

  return (
    <div className={styles.latestUpdatesSection}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerText}>
              <h2 className={styles.title}>Latest Updates</h2>
            </div>
          </div>
        </div>

        {/* Updates Grid */}
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingGrid}>
              {[...Array(3)].map((_, index) => (
                <div key={index} className={styles.skeletonCard}>
                  <div className={styles.skeletonImage}></div>
                  <div className={styles.skeletonContent}>
                    <div className={styles.skeletonBadge}></div>
                    <div className={styles.skeletonTitle}></div>
                    <div className={styles.skeletonText}></div>
                    <div className={styles.skeletonText}></div>
                    <div className={styles.skeletonDate}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : updates.length > 0 ? (
          <div className={styles.updatesGrid}>
            {updates.map((update) => (
              <div 
                key={update._id}
                className={styles.updateCard}
                onClick={() => handleCardClick(update._id)}
              >
                {/* Card Image */}
                <div className={styles.cardImage}>
                  {update.photos && update.photos.length > 0 ? (
                    <>
                      <img
                        src={update.photos[0].filePath.startsWith('http') ? 
                             update.photos[0].filePath : 
                             `${API_BASE.replace('/api', '')}/${update.photos[0].filePath}`}
                        alt={update.title}
                        className={styles.image}
                      />
                      {update.photos.length > 1 && (
                        <div className={styles.imageCount}>
                         +{update.photos.length - 1} more
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={styles.placeholderImage}>
                      <Megaphone size={32} />
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className={styles.cardContent}>

                  {/* Title */}
                  <h3 className={styles.cardTitle}>{update.title}</h3>

                  {/* Description */}
                  <p className={styles.cardDescription}>
                    {truncateText(update.details)}
                  </p>

                  {/* Footer */}
                  <div className={styles.cardFooter}>
                    <div className={styles.date}>
                      {formatDate(update.createdAt)}
                    </div>
                    <div className={styles.readMore}>
                      Read More
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noUpdates}>
            <div className={styles.noUpdatesIcon}>
              <Megaphone size={48} />
            </div>
            <h3>No Updates Available</h3>
            <p>Check back later for the latest community updates and announcements.</p>
            <button 
              className={styles.viewAllBtn}
              onClick={handleGoToAnnouncements}
            >
              View All Announcements
            </button>
          </div>
        )}

        <button 
            className={styles.goToAnnouncementsBtn}
            onClick={handleGoToAnnouncements}
          >
            Go to Announcements
            <ArrowRight size={18} />
          </button>
      </div>
    </div>
  );
};

export default LatestUpdates;