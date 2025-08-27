import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Eye, Calendar, MapPin, Pin, PinOff, Image, X } from 'lucide-react';
import styles from './styles/AdminAnnouncements.module.css';

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
      const response = await fetch('/api/announcements?page=1&limit=50', {
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
    
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }));
  };

  // Remove photo from form
  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  // Reset form
  const resetForm = () => {
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
        submitData.append('images', photo);
      });

      const response = await fetch('/api/announcements', {
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
      
      // Only append new photos (File objects)
      formData.photos.forEach((photo) => {
        if (photo instanceof File) {
          submitData.append('images', photo);
        }
      });

      const response = await fetch(`/api/announcements/${selectedAnnouncement._id}`, {
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
      const response = await fetch(`/api/announcements/${id}`, {
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

  // Handle pin/unpin announcement
  const handleTogglePin = async (id, currentPinStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/announcements/${id}/toggle-pin`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle pin status');
      }

      await fetchAnnouncements();
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
    setFormData({
      title: selectedAnnouncement.title,
      details: selectedAnnouncement.details,
      category: selectedAnnouncement.category,
      eventDate: selectedAnnouncement.eventDate ? selectedAnnouncement.eventDate.split('T')[0] : '',
      eventLocation: selectedAnnouncement.eventLocation || '',
      photos: selectedAnnouncement.photos || []
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
        <div className={styles.spinner}></div>
        <p>Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className={styles.adminAnnouncements}>
      <div className={styles.header}>
        <h1>Manage Announcements</h1>
        <button 
          className={styles.createButton}
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={20} />
          Create Announcement
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <div className={styles.announcementGrid}>
        {announcements.map((announcement) => (
          <div 
            key={announcement._id} 
            className={styles.announcementCard}
            onClick={() => openViewModal(announcement)}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <h3>{announcement.title}</h3>
                {announcement.isPinned && (
                  <Pin className={styles.pinnedIcon} size={16} />
                )}
              </div>
              <span className={`${styles.category} ${styles[announcement.category.toLowerCase()]}`}>
                {announcement.category}
              </span>
            </div>
            
            <div className={styles.cardBody}>
              <p className={styles.details}>
                {announcement.details.length > 150 
                  ? `${announcement.details.substring(0, 150)}...` 
                  : announcement.details}
              </p>
              
              {announcement.eventDate && (
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
            </div>
            
            <div className={styles.cardFooter}>
              <span className={styles.date}>
                Created: {formatDate(announcement.createdAt)}
              </span>
              <div className={styles.stats}>
                <span><Eye size={14} /> {announcement.views}</span>
                {announcement.photos?.length > 0 && (
                  <span><Image size={14} /> {announcement.photos.length}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {announcements.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <p>No announcements found. Create your first announcement!</p>
        </div>
      )}

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className={styles.modal} onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}>
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
            
            <form onSubmit={handleCreateAnnouncement} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  maxLength={150}
                  className={styles.input}
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
                  className={styles.select}
                >
                  <option value="">Select Category</option>
                  <option value="Update">Update</option>
                  <option value="Event">Event</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="details">Details *</label>
                <textarea
                  id="details"
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  required
                  maxLength={3000}
                  rows={6}
                  className={styles.textarea}
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
                      className={styles.input}
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
                      className={styles.input}
                    />
                  </div>
                </>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="photos">Photos (Max 4)</label>
                <input
                  type="file"
                  id="photos"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className={styles.fileInput}
                />
                
                {formData.photos.length > 0 && (
                  <div className={styles.photoPreview}>
                    {formData.photos.map((photo, index) => (
                      <div key={index} className={styles.photoItem}>
                        <span>{photo.name || `Photo ${index + 1}`}</span>
                        <button 
                          type="button"
                          onClick={() => removePhoto(index)}
                          className={styles.removePhoto}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.formActions}>
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  Create Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View/Edit Announcement Modal */}
      {showViewModal && selectedAnnouncement && (
        <div className={styles.modal} onClick={(e) => e.target === e.currentTarget && setShowViewModal(false)}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{isEditMode ? 'Edit Announcement' : selectedAnnouncement.title}</h2>
              <div className={styles.modalActions}>
                {!isEditMode && (
                  <>
                    <button
                      onClick={() => handleTogglePin(selectedAnnouncement._id, selectedAnnouncement.isPinned)}
                      className={styles.iconButton}
                      title={selectedAnnouncement.isPinned ? 'Unpin' : 'Pin'}
                    >
                      {selectedAnnouncement.isPinned ? <PinOff size={18} /> : <Pin size={18} />}
                    </button>
                    <button 
                      onClick={openEditMode}
                      className={styles.iconButton}
                      title="Edit"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteAnnouncement(selectedAnnouncement._id)}
                      className={styles.deleteButton}
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
            
            {isEditMode ? (
              <form onSubmit={handleUpdateAnnouncement} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="editTitle">Title *</label>
                  <input
                    type="text"
                    id="editTitle"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    maxLength={150}
                    className={styles.input}
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
                    className={styles.select}
                  >
                    <option value="Update">Update</option>
                    <option value="Event">Event</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="editDetails">Details *</label>
                  <textarea
                    id="editDetails"
                    name="details"
                    value={formData.details}
                    onChange={handleInputChange}
                    required
                    maxLength={3000}
                    rows={6}
                    className={styles.textarea}
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
                        className={styles.input}
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
                        className={styles.input}
                      />
                    </div>
                  </>
                )}

                <div className={styles.formGroup}>
                  <label>Current Photos</label>
                  {selectedAnnouncement.photos?.length > 0 ? (
                    <div className={styles.currentPhotos}>
                      {selectedAnnouncement.photos.map((photo, index) => (
                        <div key={index} className={styles.photoItem}>
                          <span>{photo.fileName}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.noPhotos}>No photos uploaded</p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="newPhotos">Add New Photos (Max 4 total)</label>
                  <input
                    type="file"
                    id="newPhotos"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className={styles.fileInput}
                  />
                </div>

                <div className={styles.formActions}>
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsEditMode(false);
                      resetForm();
                    }}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitButton}>
                    Update Announcement
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.viewContent}>
                <div className={styles.announcementDetails}>
                  <div className={styles.categoryBadge}>
                    <span className={`${styles.category} ${styles[selectedAnnouncement.category.toLowerCase()]}`}>
                      {selectedAnnouncement.category}
                    </span>
                    {selectedAnnouncement.isPinned && (
                      <span className={styles.pinnedBadge}>
                        <Pin size={14} /> Pinned
                      </span>
                    )}
                  </div>
                  
                  <p className={styles.fullDetails}>{selectedAnnouncement.details}</p>
                  
                  {selectedAnnouncement.eventDate && (
                    <div className={styles.eventInfoFull}>
                      <div className={styles.eventDetail}>
                        <Calendar size={16} />
                        <strong>Date:</strong> {formatDate(selectedAnnouncement.eventDate)}
                      </div>
                      {selectedAnnouncement.eventLocation && (
                        <div className={styles.eventDetail}>
                          <MapPin size={16} />
                          <strong>Location:</strong> {selectedAnnouncement.eventLocation}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {selectedAnnouncement.photos?.length > 0 && (
                    <div className={styles.photosSection}>
                      <h4>Photos ({selectedAnnouncement.photos.length})</h4>
                      <div className={styles.photoGrid}>
                        {selectedAnnouncement.photos.map((photo, index) => (
                          <div key={index} className={styles.photoContainer}>
                            <img 
                              src={photo.filePath} 
                              alt={`Announcement photo ${index + 1}`}
                              className={styles.photo}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className={styles.metadata}>
                    <div className={styles.metaItem}>
                      <strong>Created:</strong> {formatDate(selectedAnnouncement.createdAt)}
                    </div>
                    <div className={styles.metaItem}>
                      <strong>Views:</strong> {selectedAnnouncement.views}
                    </div>
                    {selectedAnnouncement.updatedAt !== selectedAnnouncement.createdAt && (
                      <div className={styles.metaItem}>
                        <strong>Updated:</strong> {formatDate(selectedAnnouncement.updatedAt)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;