import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Eye, Calendar, MapPin, Pin, PinOff, Image, X, ClipboardCheck } from 'lucide-react';
import styles from './styles/AdminAccomplishments.module.css';

const API_BASE = import.meta.env.VITE_API_URL; 

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

  useEffect(() => {
    return () => {
      // Cleanup any remaining preview URLs
      formData.photos.forEach(photo => {
        if (photo.preview && !photo.existing) {
          URL.revokeObjectURL(photo.preview);
        }
      });
    };
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
    
    // Create preview URLs for the files
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

  const getProjectTypeClass = (projectType) => {
    if (!projectType) return 'general';
    const lowerType = projectType.toLowerCase().replace(/\s+/g, ''); // remove spaces
    return lowerType;
  };


  // And update the removePhoto function to handle cleanup properly:
  const removePhoto = (index) => {
    const photoToRemove = formData.photos[index];
    
    // Cleanup the preview URL to prevent memory leaks
    if (!photoToRemove.existing && photoToRemove.preview) {
      URL.revokeObjectURL(photoToRemove.preview);
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

    if (!formData.title || !formData.description || !formData.projectType) {
    alert('Please fill in all required fields');
    return;
  }

    const confirmMessage = isEditMode 
      ? 'Are you sure you want to update this accomplishment?' 
      : 'Are you sure you want to create this accomplishment?';
      
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();
      
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('projectType', formData.projectType);
      
      if (isEditMode) {
        // Prepare data for backend to handle existing photos
        const remainingExistingPhotos = formData.photos
          .filter(photo => photo.existing)
          .map(photo => ({
            fileId: photo.fileId,
            fileName: photo.fileName,
            filePath: photo.filePath
          }));
        
        // Send remaining existing photos as JSON string
        submitData.append('remainingExistingPhotos', JSON.stringify(remainingExistingPhotos));
        
        // Only append new photos (File objects)
        formData.photos.forEach((photo) => {
          if (!photo.existing && photo.file) {
            submitData.append('photos', photo.file);
          }
        });
      } else {
        // For creating new accomplishments, append all photos
        formData.photos.forEach((photo) => {
          if (photo.file) {
            submitData.append('photos', photo.file);
          }
        });
      }

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
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditMode ? 'update' : 'create'} accomplishment`);
      }

      // Cleanup preview URLs
      formData.photos.forEach(photo => {
        if (!photo.existing && photo.preview) {
          URL.revokeObjectURL(photo.preview);
        }
      });

      await fetchAccomplishments();
      closeModal();
      alert(`Accomplishment ${isEditMode ? 'updated' : 'created'} successfully!`);
    } catch (err) {
      console.error('Submit error:', err);
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
    // Convert existing photos to preview format for consistent handling
    const existingPhotos = selectedAccomplishment.photos?.map(photo => ({
      existing: true,
      fileId: photo.fileId,
      fileName: photo.fileName,
      filePath: photo.filePath,
      preview: photo.filePath, // Use file path as preview for existing photos
      name: photo.fileName || `Photo ${selectedAccomplishment.photos.indexOf(photo) + 1}`
    })) || [];
    
    setFormData({
      title: selectedAccomplishment.title,
      description: selectedAccomplishment.description,
      projectType: selectedAccomplishment.projectType || '',
      photos: existingPhotos
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
                    {accomplishment.description.length > 100 
                      ? `${accomplishment.description.substring(0, 100)}...` 
                      : accomplishment.description
                    }
                  </p>

                  {/* Footer with date and button */}
                  <div className={styles.cardFooter}>
                    <div className={styles.cardMeta}>
                      <span className={styles.publishDate}>
                        {formatDate(accomplishment.createdAt)}
                      </span>
                    </div>
                    <button 
                      onClick={() => openViewModal(accomplishment)}
                      className={styles.readMoreButton}
                    >
                      Read More
                    </button>
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
                  <label className={styles.label}>Accomplishment Type *</label>
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

              <div className={styles.formGroup}>
                <label htmlFor="photos">
                  <Image size={18} />
                  Photos (Max 4)
                </label>
                <input
                  id="photos"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className={styles.fileInput}
                  disabled={formData.photos.length >= 4}
                />
                
                {formData.photos.length > 0 && (
                  <div className={styles.photoPreview}>
                    <div className={styles.photoPreviewGrid}>
                      {formData.photos.map((photo, index) => (
                        <div key={index} className={styles.photoPreviewItem}>
                          <div className={styles.photoPreviewImage}>
                            <img 
                              src={photo.preview} 
                              alt={`Preview ${index + 1}`}
                              className={styles.previewImg}
                            />
                            <button 
                              type="button"
                              onClick={() => removePhoto(index)}
                              className={styles.removePhotoBtn}
                            >
                              <X size={16} />
                            </button>
                            {photo.existing && (
                              <div className={styles.existingPhotoIndicator}>
                                Existing
                              </div>
                            )}
                          </div>
                          <span className={styles.photoName}>{photo.name}</span>
                        </div>
                      ))}
                    </div>
                    {formData.photos.length < 4 && (
                      <p className={styles.photoHint}>
                        You can add {4 - formData.photos.length} more photo{4 - formData.photos.length !== 1 ? 's' : ''}.
                      </p>
                    )}
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