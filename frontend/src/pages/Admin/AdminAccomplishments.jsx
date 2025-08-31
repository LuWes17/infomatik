import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Eye, Calendar, MapPin, Pin, PinOff, Image, X } from 'lucide-react';
import styles from './styles/AdminAccomplishments.module.css';

const AdminAccomplishments = () => { 
  const [accomplishments, setAccomplishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAccomplishment, setSelectedAccomplishment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectType: '',
    photos: []
  });

  const fetchAccomplishments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/accomplishments?page=1&limit=50', {
        headers: {
          'Authorization' : `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch accomplishments');
      }

      const data = await response.json();
      setAccomplishments(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccomplishments();
  }, []);

  const handleInputChange = (e) => {
    const {name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name] : value
    }));
  };

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

  // And update the removePhoto function to handle cleanup properly:
  const removePhoto = (index) => {
    const photoToRemove = formData.photos[index];
    
    // If it's a File object (not a string URL), revoke the object URL to prevent memory leaks
    if (typeof photoToRemove !== 'string') {
      URL.revokeObjectURL(URL.createObjectURL(photoToRemove));
    }
    
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      projectType: '',
      photos: []
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key !== 'photos') {
          submitData.append(key, formData[key]);
        }
      });

      formData.photos.forEach(photo => {
        submitData.append('photos', photo);
      });

      const url = isEditMode 
        ? `http://localhost:4000/api/accomplishments/${selectedAccomplishment._id}` 
        : 'http://localhost:4000/api/accomplishments';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      if (!response.ok) {
        throw new Error(isEditMode ? 'Failed to update accomplishment' : 'Failed to create accomplishment');
      }

      await fetchAccomplishments();
      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
  if (!window.confirm('Are you sure you want to delete this accomplishment?')) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:4000/api/accomplishments/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Get response data even if request failed
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Show specific server error if available
      const errorMessage = data.message || `Server error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    // Success - refresh the list and close modal
    await fetchAccomplishments();
    closeModal();
    
    // Show success message
    console.log('Accomplishment deleted successfully');
    
  } catch (err) {
    console.error('Delete error:', err);
    setError(`Failed to delete accomplishment: ${err.message}`);
    
    // Don't close modal on error so user can see the error message
  }
};

  const closeModal = () => {
    setShowCreateModal(false);
    setShowViewModal(false);
    setSelectedAccomplishment(null);
    setIsEditMode(false);
    resetForm();
  };

  const openViewModal = (accomplishment) => {
    setSelectedAccomplishment(accomplishment);
    setShowViewModal(true);
  };

  const openEditModal = () => {
    // Fix: Make sure photos are properly handled - convert photo objects to URLs if needed
    const existingPhotos = selectedAccomplishment.photos || [];
    
    // Convert photo objects to URLs if they're in object format
    const photoUrls = existingPhotos.map(photo => {
      // If photo is an object with filePath property, use filePath
      if (typeof photo === 'object' && photo.filePath) {
        return photo.filePath;
      }
      // If photo is already a string URL, use it directly
      return photo;
    });

    setFormData({
      title: selectedAccomplishment.title,
      description: selectedAccomplishment.description,
      projectType: selectedAccomplishment.projectType || '',
      photos: photoUrls // Use the processed URLs
    });
    setIsEditMode(true);
    setShowViewModal(false);
    setShowCreateModal(true);
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
        <p>Loading accomplishments...</p>
      </div>
    );
  }

  return (
    <div className={styles.adminAccomplishments}>
      <div className={styles.header}>
        <h1>Manage Accomplishments</h1>
        <button 
          className={styles.createButton}
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={20} />
          Create Accomplishment
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <div className={styles.accomplishmentGrid}>
        {accomplishments.map((accomplishment) => (
          <div 
            key={accomplishment._id} 
            className={styles.accomplishmentCard}
            onClick={() => openViewModal(accomplishment)}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <h3>{accomplishment.title}</h3>
              </div>
              <span className={`${styles.category} ${styles[accomplishment.projectType?.toLowerCase()]}`}>
                {accomplishment.projectType || 'General'}
              </span>
            </div>
            
            <div className={styles.cardBody}>
              <p className={styles.details}>
                {accomplishment.description.length > 150 
                  ? `${accomplishment.description.substring(0, 150)}...` 
                  : accomplishment.description}
              </p>
            </div>

            <div className={styles.cardFooter}>
              <span className={styles.date}>Created: {formatDate(accomplishment.createdAt)}</span>
              <div className={styles.stats}>
                <span><Eye size={14} /> {accomplishment.views || 0}</span>
                {accomplishment.photos?.length > 0 && (
                  <span><Image size={14} /> {accomplishment.photos.length}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {accomplishments.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <p>No accomplishments yet. Create your first one!</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{isEditMode ? 'Edit Accomplishment' : 'Create New Accomplishment'}</h2>
              <div className={styles.modalActions}>
                <button 
                  className={styles.closeButton}
                  onClick={closeModal}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Project Type</label>
                  <select
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    <option value="">Select Type</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Social Program">Social Program</option>
                    <option value="Health Initiative">Health Initiative</option>
                    <option value="Education">Education</option>
                    <option value="Environment">Environment</option>
                    <option value="Economic Development">Economic Development</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup + ' ' + styles.fullWidth}>
                <label className={styles.label}>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  rows="6"
                  required
                />
              </div>

              <div className={styles.formGroup + ' ' + styles.fullWidth}>
                <label className={styles.label}>Photos (Max 4)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className={styles.fileInput}
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className={styles.fileInputLabel}>
                  <Image size={20} />
                  Choose Photos
                </label>
                
                {formData.photos.length > 0 && (
                  <div className={styles.photosGrid}>
                    {formData.photos.map((photo, index) => (
                      <div key={index} className={styles.photoPreview}>
                        {/* Fix: Check if photo is a string (URL) or File object */}
                        {typeof photo === 'string' ? (
                          <img 
                            src={photo} 
                            alt={`Preview ${index + 1}`} 
                            className={styles.photoImage}
                          />
                        ) : (
                          <img 
                            src={URL.createObjectURL(photo)} 
                            alt={`Preview ${index + 1}`} 
                            className={styles.photoImage}
                          />
                        )}
                        <div className={styles.photoOverlay}>
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className={styles.removePhotoButton}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.formActions}>
                <button 
                  type="button" 
                  onClick={closeModal}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className={styles.submitButton}
                >
                  {isEditMode ? 'Update' : 'Create'} Accomplishment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedAccomplishment && (
        <div className={styles.modal} onClick={(e) => e.target === e.currentTarget && setShowViewModal(false)}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{selectedAccomplishment.title}</h2>
              <div className={styles.modalActions}>
                <button 
                  className={styles.iconButton}
                  onClick={openEditModal}
                >
                  <Edit3 size={18} />
                </button>
                <button 
                  className={styles.deleteButton}
                  onClick={() => handleDelete(selectedAccomplishment._id)}
                >
                  <Trash2 size={18} />
                </button>
                <button 
                  className={styles.closeButton}
                  onClick={closeModal}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <div className={styles.viewContent}>
              <div className={styles.accomplishmentDetails}>
                <div className={styles.categoryBadge}>
                  <span className={`${styles.category} ${styles[selectedAccomplishment.projectType?.toLowerCase()]}`}>
                    {selectedAccomplishment.projectType || 'General'}
                  </span>
                  {selectedAccomplishment.isPinned && (
                    <span className={styles.pinnedBadge}>
                      <Pin size={12} />
                      Pinned
                    </span>
                  )}
                </div>

                <div className={styles.fullDetails}>
                  {selectedAccomplishment.description}
                </div>


                {selectedAccomplishment.photos && selectedAccomplishment.photos.length > 0 && (
                  <div className={styles.photosSection}>
                    <h4>Photos</h4>
                    <div className={styles.photoGrid}>
                      {selectedAccomplishment.photos.map((photo, index) => (
                        <div key={index} className={styles.photoContainer}>
                          <img 
                            src={photo.filePath} 
                            alt={`Accomplishment ${index + 1}`}
                            className={styles.photo}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.metadata}>
                  <div className={styles.metaItem}>
                    <strong>Created:</strong> {formatDate(selectedAccomplishment.createdAt)}
                  </div>
                  <div className={styles.metaItem}>
                    <strong>Views:</strong> {selectedAccomplishment.views || 0}
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

export default AdminAccomplishments;