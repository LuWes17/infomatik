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
          <p>Loading announcements...</p>
        </div>
      );
    }

  return (
    <div className='adminAccomplishments'>
    </div>
  )
}

export default AdminAccomplishments