// frontend/src/components/FeedbackDetailsModal/FeedbackDetailsModal.jsx
import React, { useState } from 'react';
import { X, Calendar, User, Tag, Globe, Lock, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './FeedbackDetailsModal.module.css';

const FeedbackDetailsModal = ({ feedback, isOpen, onClose }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);

  if (!isOpen || !feedback) return null;

  const handlePhotoClick = (index) => {
    setCurrentPhotoIndex(index);
    setShowPhotoGallery(true);
  };

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev === 0 ? feedback.photos.length - 1 : prev - 1
    );
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev === feedback.photos.length - 1 ? 0 : prev + 1
    );
  };

  const handleGalleryClose = () => {
    setShowPhotoGallery(false);
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

  return (
    <>
      {/* Main Feedback Details Modal */}
      <div className={styles.modal} onClick={onClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className={styles.modalHeader}>
            <div className={styles.headerInfo}>
              <h2 className={styles.feedbackTitle}>{feedback.subject}</h2>
              <div className={styles.metaInfo}>
                <div className={styles.metaItem}>
                  <User size={16} />
                  <span>
                    {feedback.submittedBy 
                      ? `${feedback.submittedBy.firstName} ${feedback.submittedBy.lastName}`
                      : 'Anonymous'
                    }
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <Calendar size={16} />
                  <span>{formatDate(feedback.createdAt)}</span>
                </div>
                <div className={styles.metaItem}>
                  <Tag size={16} />
                  <span className={styles.category}>{feedback.category}</span>
                </div>
                <div className={styles.metaItem}>
                  {feedback.isPublic ? <Globe size={16} /> : <Lock size={16} />}
                  <span>{feedback.isPublic ? 'Public' : 'Private'}</span>
                </div>
                {feedback.photos && feedback.photos.length > 0 && (
                  <div className={styles.metaItem}>
                    <ImageIcon size={16} />
                    <span>{feedback.photos.length} photo{feedback.photos.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
            <button 
              className={styles.closeButton} 
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className={styles.modalBody}>
            {/* Message */}
            <div className={styles.messageSection}>
              <h3>Message</h3>
              <p className={styles.messageText}>{feedback.message}</p>
            </div>

            {/* Photos Section */}
            {feedback.photos && feedback.photos.length > 0 && (
              <div className={styles.photosSection}>
                <h3>Attached Photos</h3>
                <div className={styles.photoGrid}>
                  {feedback.photos.map((photo, index) => (
                    <div 
                      key={index} 
                      className={styles.photoItem}
                      onClick={() => handlePhotoClick(index)}
                    >
                      <img 
                        src={photo.filePath} 
                        alt={photo.fileName}
                        className={styles.photo}
                      />
                      <div className={styles.photoOverlay}>
                        <ImageIcon size={20} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Response */}
            {feedback.adminResponse && feedback.adminResponse.message && (
              <div className={styles.responseSection}>
                <h3>Official Response</h3>
                <div className={styles.responseContent}>
                  <p className={styles.responseText}>{feedback.adminResponse.message}</p>
                  <div className={styles.responseInfo}>
                    <span>
                      Responded by: {feedback.adminResponse.respondedBy?.firstName} {feedback.adminResponse.respondedBy?.lastName}
                    </span>
                    <span>
                      {formatDate(feedback.adminResponse.respondedAt)}
                    </span>
                    {feedback.adminResponse.isEdited && (
                      <span className={styles.editedIndicator}>
                        (Edited on {formatDate(feedback.adminResponse.editedAt)})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Status */}
            <div className={styles.statusSection}>
              <h3>Status</h3>
              <span className={`${styles.statusBadge} ${styles[feedback.status]}`}>
                {feedback.status.replace('-', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery Modal */}
      {showPhotoGallery && feedback.photos && feedback.photos.length > 0 && (
        <div className={styles.galleryModal} onClick={handleGalleryClose}>
          <div className={styles.galleryContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.galleryHeader}>
              <span className={styles.photoCounter}>
                {currentPhotoIndex + 1} of {feedback.photos.length}
              </span>
              <button 
                className={styles.galleryCloseButton} 
                onClick={handleGalleryClose}
                aria-label="Close gallery"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className={styles.galleryImageContainer}>
              <img 
                src={feedback.photos[currentPhotoIndex].filePath} 
                alt={feedback.photos[currentPhotoIndex].fileName}
                className={styles.galleryImage}
              />
              
              {feedback.photos.length > 1 && (
                <>
                  <button 
                    className={`${styles.galleryNavButton} ${styles.prevButton}`}
                    onClick={handlePrevPhoto}
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    className={`${styles.galleryNavButton} ${styles.nextButton}`}
                    onClick={handleNextPhoto}
                    aria-label="Next photo"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
            
            <div className={styles.galleryFooter}>
              <span className={styles.photoName}>
                {feedback.photos[currentPhotoIndex].fileName}
              </span>
            </div>
            
            {feedback.photos.length > 1 && (
              <div className={styles.galleryThumbnails}>
                {feedback.photos.map((photo, index) => (
                  <button
                    key={index}
                    className={`${styles.thumbnail} ${
                      index === currentPhotoIndex ? styles.activeThumbnail : ''
                    }`}
                    onClick={() => setCurrentPhotoIndex(index)}
                  >
                    <img 
                      src={photo.filePath} 
                      alt={photo.fileName}
                      className={styles.thumbnailImage}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackDetailsModal;