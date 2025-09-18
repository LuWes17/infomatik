import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Eye, Calendar, MapPin, Image, X, Megaphone, Clock } from 'lucide-react';
import styles from './styles/AdminAnnouncements.module.css';

const API_BASE = import.meta.env.VITE_API_URL; 

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    details: '',
    category: '',
    eventDate: '',
    eventLocation: '',
    photos: []
  });

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/announcements?page=1&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }

      const data = await response.json();
      setAnnouncements(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file uploads
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.photos.length > 4) {
      alert('Maximum 4 photos allowed');
      return;
    }
    
    const newPhotos = files.map(file => ({
      existing: false,
      file: file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos]
    }));
  };

  // Remove photo from form
  const removePhoto = (index) => {
    const photoToRemove = formData.photos[index];
    
    if (!photoToRemove.existing && photoToRemove.preview) {
      URL.revokeObjectURL(photoToRemove.preview);
    }
    
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  // Reset form
  const resetForm = () => {
    formData.photos.forEach(photo => {
      if (photo.preview) {
        URL.revokeObjectURL(photo.preview);
      }
    });
    setFormData({
      title: '',
      details: '',
      category: '',
      eventDate: '',
      eventLocation: '',
      photos: []
    });
  };

  // Handle create announcement
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.details || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.category === 'Event' && !formData.eventDate) {
      alert('Event date is required for events');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();
      
      submitData.append('title', formData.title);
      submitData.append('details', formData.details);
      submitData.append('category', formData.category);
      
      if (formData.eventDate) {
        submitData.append('eventDate', formData.eventDate);
      }
      if (formData.eventLocation) {
        submitData.append('eventLocation', formData.eventLocation);
      }
      
      formData.photos.forEach((photo) => {
        submitData.append('images', photo.file);
      });

      const response = await fetch(`${API_BASE}/announcements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      if (!response.ok) {
        throw new Error('Failed to create announcement');
      }

      await fetchAnnouncements();
      setShowCreateModal(false);
      resetForm();
      alert('Announcement created successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle update announcement
  const handleUpdateAnnouncement = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();
      
      submitData.append('title', formData.title);
      submitData.append('details', formData.details);
      submitData.append('category', formData.category);
      
      if (formData.eventDate) {
        submitData.append('eventDate', formData.eventDate);
      }
      if (formData.eventLocation) {
        submitData.append('eventLocation', formData.eventLocation);
      }
      
      const remainingExistingPhotos = formData.photos
        .filter(photo => photo.existing)
        .map(photo => ({
          fileId: photo.fileId,
          fileName: photo.fileName,
          filePath: photo.filePath
        }));
      
      submitData.append('remainingExistingPhotos', JSON.stringify(remainingExistingPhotos));
      
      formData.photos.forEach((photo) => {
        if (!photo.existing && photo.file) {
          submitData.append('images', photo.file);
        }
      });

      const response = await fetch(`${API_BASE}/announcements/${selectedAnnouncement._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      if (!response.ok) {
        throw new Error('Failed to update announcement');
      }

      await fetchAnnouncements();
      setShowViewModal(false);
      setIsEditMode(false);
      resetForm();
      alert('Announcement updated successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle delete announcement
  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete announcement');
      }

      await fetchAnnouncements();
      setShowViewModal(false);
      alert('Announcement deleted successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  // Open view modal
  const openViewModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowViewModal(true);
    setIsEditMode(false);
  };

  // Open edit mode
  const openEditMode = () => {
    const existingPhotos = selectedAnnouncement.photos?.map(photo => ({
      existing: true,
      fileId: photo.fileId,
      fileName: photo.fileName,
      filePath: photo.filePath,
      preview: photo.filePath,
      name: photo.fileName
    })) || [];
    
    setFormData({
      title: selectedAnnouncement.title,
      details: selectedAnnouncement.details,
      category: selectedAnnouncement.category,
      eventDate: selectedAnnouncement.eventDate ? selectedAnnouncement.eventDate.split('T')[0] : '',
      eventLocation: selectedAnnouncement.eventLocation || '',
      photos: existingPhotos
    });
    setIsEditMode(true);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className={styles.announcementsPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitle}>
            <Megaphone className={styles.headerIcon} />
            <div>
              <h1>Community Announcements</h1>
              <p>Stay updated with the latest news and events from our community</p>
            </div>
          </div>
          <button 
            className={styles.createBtn}
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={20} />
            Create New
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* Announcements Grid */}
      <div className={styles.announcementsGrid}>
        {announcements.map((announcement) => (
          <div key={announcement._id} className={styles.announcementCard}>
            {/* Card Image */}
            <div className={styles.cardImageContainer}>
              {announcement.photos && announcement.photos.length > 0 ? (
                <>
                  <img 
                    src={announcement.photos[0].filePath.startsWith('http') ? 
                         announcement.photos[0].filePath : 
                         `${API_BASE.replace('/api', '')}/${announcement.photos[0].filePath}`} 
                    alt={announcement.title}
                    className={styles.cardImage}
                  />
                  {announcement.photos.length > 1 && (
                    <div className={styles.imageCount}>
                      <Image size={12} />
                      {announcement.photos.length}
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.cardImagePlaceholder}>
                  <Megaphone size={32} />
                </div>
              )}
              
              {/* Admin Actions Overlay */}
              <div className={styles.adminActions}>
                <button
                  className={styles.adminActionBtn}
                  onClick={() => openViewModal(announcement)}
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
                <button
                  className={styles.adminActionBtn}
                  onClick={() => {
                    setSelectedAnnouncement(announcement);
                    openEditMode();
                    setShowViewModal(true);
                  }}
                  title="Edit Announcement"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  className={`${styles.adminActionBtn} ${styles.deleteBtn}`}
                  onClick={() => handleDeleteAnnouncement(announcement._id)}
                  title="Delete Announcement"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Card Content */}
            <div className={styles.cardContent}>
              <div className={styles.cardHeader}>
                <span className={`${styles.categoryTag} ${styles[announcement.category.toLowerCase()]}`}>
                  {announcement.category}
                </span>
                <span className={styles.publishDate}>
                  <Clock size={12} />
                  {formatDate(announcement.createdAt)}
                </span>
              </div>

              <h3 className={styles.cardTitle}>{announcement.title}</h3>
              
              <p className={styles.cardDescription}>
                {announcement.details.length > 120 
                  ? `${announcement.details.substring(0, 120)}...` 
                  : announcement.details
                }
              </p>

              {/* Event Info */}
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

              <button 
                className={styles.readMoreBtn}
                onClick={() => openViewModal(announcement)}
              >
                Read More
              </button>
            </div>
          </div>
        ))}
      </div>

      {announcements.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <Megaphone size={64} />
          <h3>No announcements yet</h3>
          <p>Create your first announcement to get started!</p>
          <button 
            className={styles.createBtn}
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={20} />
            Create Announcement
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Create New Announcement</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowCreateModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.applicationForm}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="title">Announcement Title *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      maxLength={150}
                      className={styles.formInput}
                      placeholder="Enter announcement title"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className={styles.formSelect}
                    >
                      <option value="">Select Category</option>
                      <option value="Update">Update</option>
                      <option value="Event">Event</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="details">Announcement Details *</label>
                    <textarea
                      id="details"
                      name="details"
                      value={formData.details}
                      onChange={handleInputChange}
                      required
                      maxLength={3000}
                      rows={6}
                      className={styles.formTextarea}
                      placeholder="Enter the full details of your announcement"
                    />
                  </div>

                  {formData.category === 'Event' && (
                    <>
                      <div className={styles.formGroup}>
                        <label htmlFor="eventDate">Event Date *</label>
                        <input
                          type="date"
                          id="eventDate"
                          name="eventDate"
                          value={formData.eventDate}
                          onChange={handleInputChange}
                          required={formData.category === 'Event'}
                          className={styles.formInput}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor="eventLocation">Event Location</label>
                        <input
                          type="text"
                          id="eventLocation"
                          name="eventLocation"
                          value={formData.eventLocation}
                          onChange={handleInputChange}
                          maxLength={200}
                          className={styles.formInput}
                          placeholder="Enter event location"
                        />
                      </div>
                    </>
                  )}

                  <div className={styles.formGroup}>
                    <label htmlFor="photos">Photos (Max 4)</label>
                    <div className={styles.fileUpload}>
                      <input
                        type="file"
                        id="photos"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                        className={styles.fileInput}
                      />
                      <label htmlFor="photos" className={styles.fileLabel}>
                        <Image size={20} />
                        <span>Choose photos or drag and drop</span>
                        <small>PNG, JPG up to 10MB each</small>
                      </label>
                    </div>
                    
                    {formData.photos.length > 0 && (
                      <div className={styles.photoPreview}>
                        <div className={styles.photoGrid}>
                          {formData.photos.map((photo, index) => (
                            <div key={index} className={styles.photoItem}>
                              <img 
                                src={photo.preview} 
                                alt={`Preview ${index + 1}`}
                                className={styles.photoThumbnail}
                              />
                              <button 
                                type="button"
                                onClick={() => removePhoto(index)}
                                className={styles.removePhotoBtn}
                              >
                                <X size={14} />
                              </button>
                              <span className={styles.photoName}>{photo.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button 
                    type="button" 
                    onClick={() => setShowCreateModal(false)}
                    className={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCreateAnnouncement}
                    className={styles.submitBtn}
                  >
                    Create Announcement
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View/Edit Modal */}
      {showViewModal && selectedAnnouncement && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setShowViewModal(false)}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{isEditMode ? 'Edit Announcement' : selectedAnnouncement.title}</h2>
              <div className={styles.modalActions}>
                {!isEditMode && (
                  <>
                    <button 
                      onClick={openEditMode}
                      className={styles.iconBtn}
                      title="Edit"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteAnnouncement(selectedAnnouncement._id)}
                      className={styles.deleteIconBtn}
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    setIsEditMode(false);
                    resetForm();
                  }}
                  className={styles.closeButton}
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className={styles.modalBody}>
              {isEditMode ? (
                <div className={styles.applicationForm}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="editTitle">Announcement Title *</label>
                      <input
                        type="text"
                        id="editTitle"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        maxLength={150}
                        className={styles.formInput}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="editCategory">Category *</label>
                      <select
                        id="editCategory"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className={styles.formSelect}
                      >
                        <option value="Update">Update</option>
                        <option value="Event">Event</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="editDetails">Announcement Details *</label>
                      <textarea
                        id="editDetails"
                        name="details"
                        value={formData.details}
                        onChange={handleInputChange}
                        required
                        maxLength={3000}
                        rows={6}
                        className={styles.formTextarea}
                      />
                    </div>

                    {formData.category === 'Event' && (
                      <>
                        <div className={styles.formGroup}>
                          <label htmlFor="editEventDate">Event Date *</label>
                          <input
                            type="date"
                            id="editEventDate"
                            name="eventDate"
                            value={formData.eventDate}
                            onChange={handleInputChange}
                            required={formData.category === 'Event'}
                            className={styles.formInput}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label htmlFor="editEventLocation">Event Location</label>
                          <input
                            type="text"
                            id="editEventLocation"
                            name="eventLocation"
                            value={formData.eventLocation}
                            onChange={handleInputChange}
                            maxLength={200}
                            className={styles.formInput}
                          />
                        </div>
                      </>
                    )}

                    <div className={styles.formGroup}>
                      <label>Photos (Max 4 total)</label>
                      <div className={styles.fileUpload}>
                        <input
                          type="file"
                          id="editPhotos"
                          multiple
                          accept="image/*"
                          onChange={handleFileUpload}
                          className={styles.fileInput}
                        />
                        <label htmlFor="editPhotos" className={styles.fileLabel}>
                          <Image size={20} />
                          <span>Add more photos</span>
                        </label>
                      </div>
                    
                      {formData.photos.length > 0 && (
                        <div className={styles.photoPreview}>
                          <div className={styles.photoGrid}>
                            {formData.photos.map((photo, index) => (
                              <div key={index} className={styles.photoItem}>
                                <img 
                                  src={photo.preview} 
                                  alt={`Preview ${index + 1}`}
                                  className={styles.photoThumbnail}
                                />
                                <button 
                                  type="button"
                                  onClick={() => removePhoto(index)}
                                  className={styles.removePhotoBtn}
                                >
                                  <X size={14} />
                                </button>
                                {photo.existing && (
                                  <div className={styles.existingBadge}>
                                    Existing
                                  </div>
                                )}
                                <span className={styles.photoName}>{photo.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsEditMode(false);
                        resetForm();
                      }}
                      className={styles.cancelBtn}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      onClick={handleUpdateAnnouncement}
                      className={styles.submitBtn}
                    >
                      Update Announcement
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.announcementDetails}>
                  <div className={styles.announcementMeta}>
                    <span className={`${styles.categoryTag} ${styles[selectedAnnouncement.category.toLowerCase()]}`}>
                      {selectedAnnouncement.category}
                    </span>
                    <span className={styles.publishDate}>
                      <Clock size={14} />
                      {formatDate(selectedAnnouncement.createdAt)}
                    </span>
                  </div>
                  
                  <div className={styles.section}>
                    <h4>Details</h4>
                    <p className={styles.description}>{selectedAnnouncement.details}</p>
                  </div>
                  
                  {selectedAnnouncement.eventDate && (
                    <div className={styles.section}>
                      <h4>Event Information</h4>
                      <div className={styles.eventInfoFull}>
                        <div className={styles.eventDetail}>
                          <Calendar size={16} />
                          <div>
                            <strong>Date:</strong> {formatDate(selectedAnnouncement.eventDate)}
                          </div>
                        </div>
                        {selectedAnnouncement.eventLocation && (
                          <div className={styles.eventDetail}>
                            <MapPin size={16} />
                            <div>
                              <strong>Location:</strong> {selectedAnnouncement.eventLocation}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {selectedAnnouncement.photos?.length > 0 && (
                    <div className={styles.section}>
                      <h4>Photos ({selectedAnnouncement.photos.length})</h4>
                      <div className={styles.photoGallery}>
                        {selectedAnnouncement.photos.map((photo, index) => (
                          <div key={index} className={styles.galleryPhoto}>
                            <img 
                              src={photo.filePath} 
                              alt={`Photo ${index + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.modalMetadata}>
                    <div className={styles.metaItem}>
                      <strong>Published</strong>
                      <span>{formatDate(selectedAnnouncement.createdAt)}</span>
                    </div>
                    {selectedAnnouncement.updatedAt !== selectedAnnouncement.createdAt && (
                      <div className={styles.metaItem}>
                        <strong>Last Updated</strong>
                        <span>{formatDate(selectedAnnouncement.updatedAt)}</span>
                      </div>
                    )}
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

export default AdminAnnouncements;