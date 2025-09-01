// LatestAccomplishments.jsx - Latest Accomplishments Section for Homepage
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Award, ArrowRight, ClipboardCheck } from 'lucide-react';
import styles from './LatestAccomplishments.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const LatestAccomplishments = () => {
  const [accomplishments, setAccomplishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch latest 3 accomplishments
  const fetchLatestAccomplishments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/accomplishments?limit=3`);

      if (!response.ok) {
        throw new Error('Failed to fetch latest accomplishments');
      }

      const data = await response.json();
      setAccomplishments(data.data || data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching latest accomplishments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestAccomplishments();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 120) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getProjectTypeClass = (projectType) => {
    if (!projectType) return 'general';
    return projectType.toLowerCase().replace(/\s+/g, '');
  };

  const handleCardClick = (accomplishmentId) => {
    navigate(`/accomplishments?highlight=${accomplishmentId}`);
  };

  const handleGoToAccomplishments = () => {
    navigate('/accomplishments');
  };

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>Unable to load latest accomplishments.</p>
      </div>
    );
  }

  return (
    <div className={styles.latestAccomplishmentsSection}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerText}>
              <h2 className={styles.title}>Latest Accomplishments</h2>
            </div>
          </div>
        </div>

        {/* Accomplishments Grid */}
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading accomplishments...</p>
          </div>
        ) : accomplishments.length > 0 ? (
          <div className={styles.accomplishmentsGrid}>
            {accomplishments.map((accomplishment) => (
              <div 
                key={accomplishment._id}
                className={styles.accomplishmentCard}
                onClick={() => handleCardClick(accomplishment._id)}
              >
                {/* Card Image */}
                <div className={styles.cardImage}>
                  {accomplishment.photos && accomplishment.photos.length > 0 ? (
                    <>
                      <img
                        src={accomplishment.photos[0].filePath.startsWith('http') ? 
                             accomplishment.photos[0].filePath : 
                             `${API_BASE.replace('/api', '')}/${accomplishment.photos[0].filePath}`}
                        alt={accomplishment.title}
                        className={styles.image}
                        loading="lazy"
                      />
                      {accomplishment.photos.length > 1 && (
                        <div className={styles.imageCount}>
                          <ClipboardCheck size={12} />
                          {accomplishment.photos.length}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={styles.placeholderImage}>
                      <ClipboardCheck size={32} />
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className={styles.cardContent}>
                  {/* Category Badge */}
                  <div className={styles.categoryBadge}>
                    <span className={`${styles.category} ${styles[getProjectTypeClass(accomplishment.projectType)]}`}>
                      {accomplishment.projectType || 'General'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className={styles.cardTitle}>{accomplishment.title}</h3>

                  {/* Description */}
                  <p className={styles.cardDescription}>
                    {truncateText(accomplishment.description)}
                  </p>

                  {/* Footer */}
                  <div className={styles.cardFooter}>
                    <div className={styles.date}>
                      <Calendar size={14} />
                      {formatDate(accomplishment.createdAt)}
                    </div>
                    <div className={styles.readMore}>
                      Read More
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noAccomplishments}>
            <div className={styles.noAccomplishmentsIcon}>
              <ClipboardCheck size={48} />
            </div>
            <h3>No Accomplishments Available</h3>
            <p>Check back later for the latest community accomplishments and completed projects.</p>
            <button 
              className={styles.viewAllBtn}
              onClick={handleGoToAccomplishments}
            >
              View All Accomplishments
            </button>
          </div>
        )}

        {/* Go to Accomplishments Button */}
        <div className={styles.buttonContainer}>
          <button 
            className={styles.goToAccomplishmentsBtn}
            onClick={handleGoToAccomplishments}
          >
            Go to Accomplishments Page
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LatestAccomplishments;