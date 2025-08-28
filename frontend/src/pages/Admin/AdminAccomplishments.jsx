import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Eye, Calendar, MapPin, Pin, PinOff, Image, X } from 'lucide-react';
import './styles/AdminAccomplishments.css';

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
    completionDate: '',
    projectType: '',
    photos: []
  });

  const fetchAccomplishments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/accomplishments?page=1&limit=50', {
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

  // Remove photo from form
  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      completionDate: '',
      projectType: '',
      photos: []
    });
  };

  const handleCreateAccomplishment = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.completionDate || !formData.projectType){
      alert('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();

      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('completionDate', formData.completionDate)
      submitData.append('projectType', formData.projectType);

      formData.photos.forEach((photo) => {
        submitData.append('images', photo);
      });

      const response = await fetch('/api/accomplishments', {
        method: 'POST',
        headers: {
          'Authorization' : `Bearer ${token}`
        },
        body: submitData
      });

      if (!response.ok) {
        throw new Error('Failed to create accomplishment');
      }

      await fetchAccomplishments();
      setShowCreateModal(false);
      resetForm();
      alert('Accomplishment created successfully!');
    } catch (err) {
      setError(err.message);
    } 
  };

  const handleUpdateAccomplishment = async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem('token');
    const submitData = new FormData();

    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('completionDate', formData.completionDate);
    submitData.append('projectType', formData.projectType);

    formData.photos.forEach((photo) => {
      submitData.append('images', photo);
    });

    const response = await fetch(`/api/accomplishments/${selectedAccomplishment._id}`, {
      method: 'PUT', 
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: submitData
    });

    if (!response.ok) {
      throw new Error('Failed to update accomplishment');
    }

    await fetchAccomplishments();
    setIsEditMode(false);
    setShowViewModal(false);
    resetForm();
    alert('Accomplishment updated successfully!');
  } catch (err) {
    setError(err.message);
  }
};

const handleDeleteAccomplishment = async (id) => {
  if (!window.confirm('Are you sure you want to delete this accomplishment?')) {
    return;
  }

  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`/api/accomplishments/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete accomplishment');
    }

    await fetchAccomplishments();
    setShowViewModal(false);
    alert('Accomplishment deleted successfully!');
  } catch (err) {
    setError(err.message);
  }
};

  const handleToggleFeature = async (id, currentFeatureStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/accomplishments/${id}/toggle-feature`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle feature status');
      }

      await fetchAccomplishments();
    } catch (error) {
      setError(err.message);
    }
  }

  // Open view modal
  const openViewModal = (accomplishment) => {
    setSelectedAccomplishment(accomplishment);
    setShowViewModal(true);
    setIsEditMode(false);
  };

  const openEditMode = () => {
    setFormData({
      title: selectedAccomplishment.title,
      description: selectedAccomplishment.description,
      completionDate: selectedAccomplishment.completionDate ? selectedAccomplishment.completionDate.split('T')[0] : '',
      projectType: selectedAccomplishment.projectType,
      photos: selectedAccomplishment.photos || []
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
        <div className='loadingContainer'>
          <div className='spinner'></div>
          <p>Loading accomplishments...</p>
        </div>
      );
    }

  return (
    <div className='adminAccomplishments'>
      <div className='header'>
        <h1>Manage Accomplishments</h1>
        <button className='createButton' onClick={() => setShowCreateModal(true)}>
          <Plus size={20} />
          Create Accomplishment
        </button>
      </div>

      {error && (
        <div className='errorMessage'>
          {error}
        </div>
      )}

      <div className="accomplishmentGrid">
        {accomplishments.map((acc) => (
          <div key={acc._id} className="accomplishmentCard" onClick={() => openViewModal(acc)}>
            <div className="cardHeader">
              <div className="cardTitle">
                <h3>{acc.title}</h3>
                {acc.isPinned && <Pin className="pinnedIcon" size={16} />}
              </div>
              <span className="typeBadge">{acc.projectType}</span>
            </div>

            <div className="cardBody">
              <p className="description">
                {acc.description.length > 150 ? `${acc.description.substring(0, 150)}...` : acc.description}
              </p>
              {acc.completionDate && (
                <div className="eventDetail">
                  <Calendar size={14} /> {formatDate(acc.completionDate)}
                </div>
              )}
            </div>

            <div className="cardFooter">
              <span className="date">Created: {formatDate(acc.createdAt)}</span>
              <div className="stats">
                <span><Eye size={14} /> {acc.views || 0}</span>
                {acc.photos?.length > 0 && <span><Image size={14} /> {acc.photos.length}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {accomplishments.length === 0 && !loading && (
        <div className="emptyState">
          <p>No accomplishments yet. Create your first one!</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal" onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}>
          <div className="modalContent">
            <div className="modalHeader">
              <h2>Create New Accomplishment</h2>
              <button className="closeButton" onClick={() => setShowCreateModal(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateAccomplishment} className="form">
              <div className="formGroup">
                <label>Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div className="formGroup">
                <label>Description *</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={6} />
              </div>
              <div className="formGroup">
                <label>Completion Date *</label>
                <input type="date" name="completionDate" value={formData.completionDate} onChange={handleInputChange} required />
              </div>
              <div className="formGroup">
                <label>Project Type *</label>
                <input type="text" name="projectType" value={formData.projectType} onChange={handleInputChange} required />
              </div>
              <div className="formGroup">
                <label>Photos (Max 4)</label>
                <input type="file" multiple accept="image/*" onChange={handleFileUpload} />
                {formData.photos.length > 0 && (
                  <div className="photoPreview">
                    {formData.photos.map((photo, i) => (
                      <div key={i} className="photoItem">
                        <span>{photo.name || `Photo ${i + 1}`}</span>
                        <button type="button" onClick={() => removePhoto(i)}><X size={16} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="formActions">
                <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View/Edit Modal */}
      {showViewModal && selectedAccomplishment && (
        <div className="modal" onClick={(e) => e.target === e.currentTarget && setShowViewModal(false)}>
          <div className="modalContent">
            <div className="modalHeader">
              <h2>{isEditMode ? 'Edit Accomplishment' : selectedAccomplishment.title}</h2>
              <div className="modalActions">
                {!isEditMode && (
                  <>
                    <button onClick={() => handleToggleFeature(selectedAccomplishment._id)}>
                      {selectedAccomplishment.isPinned ? <PinOff size={18} /> : <Pin size={18} />}
                    </button>
                    <button onClick={openEditMode}><Edit3 size={18} /></button>
                    <button onClick={() => handleDeleteAccomplishment(selectedAccomplishment._id)}><Trash2 size={18} /></button>
                  </>
                )}
                <button onClick={() => { setShowViewModal(false); setIsEditMode(false); resetForm(); }}>
                  <X size={24} />
                </button>
              </div>
            </div>

            {isEditMode ? (
              <form onSubmit={handleUpdateAccomplishment} className="form">
                <div className="formGroup">
                  <label>Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>
                <div className="formGroup">
                  <label>Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={6} />
                </div>
                <div className="formGroup">
                  <label>Completion Date *</label>
                  <input type="date" name="completionDate" value={formData.completionDate} onChange={handleInputChange} required />
                </div>
                <div className="formGroup">
                  <label>Project Type *</label>
                  <input type="text" name="projectType" value={formData.projectType} onChange={handleInputChange} required />
                </div>
                <div className="formGroup">
                  <label>Add Photos</label>
                  <input type="file" multiple accept="image/*" onChange={handleFileUpload} />
                </div>
                <div className="formActions">
                  <button type="button" onClick={() => { setIsEditMode(false); resetForm(); }}>Cancel</button>
                  <button type="submit">Update</button>
                </div>
              </form>
            ) : (
              <div className="viewContent">
                <p>{selectedAccomplishment.description}</p>
                {selectedAccomplishment.completionDate && (
                  <div><Calendar size={16} /> {formatDate(selectedAccomplishment.completionDate)}</div>
                )}
                {selectedAccomplishment.photos?.length > 0 && (
                  <div className="photosSection">
                    <h4>Photos</h4>
                    <div className="photoGrid">
                      {selectedAccomplishment.photos.map((photo, i) => (
                        <img key={i} src={photo.filePath} alt={`Photo ${i + 1}`} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminAccomplishments