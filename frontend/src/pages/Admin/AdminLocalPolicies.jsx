import React, { useState, useEffect } from 'react';
import styles from './styles/AdminLocalPolicies.module.css';

const AdminLocalPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    type: 'ordinance',
    policyNumber: '',
    implementationDate: '',
    summary: '',
    category: 'Public Safety',
    fullDocument: null
  });

  const categories = [
    'Public Safety', 'Health and Sanitation', 'Environment', 'Transportation',
    'Business and Commerce', 'Education', 'Social Services', 'Infrastructure',
    'Finance and Budget', 'Governance', 'Other'
  ];

  // FIXED: Fetch policies from API - for admin, get all policies including unpublished
  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Use admin-specific endpoint or add admin parameter to get all policies
      const response = await fetch('/api/policies?admin=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch policies');
      }

      const result = await response.json();
      setPolicies(result.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching policies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  // Filter policies based on search and filters
  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || policy.type === typeFilter;
    const matchesCategory = !categoryFilter || policy.category === categoryFilter;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'fullDocument') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      type: 'ordinance',
      policyNumber: '',
      implementationDate: '',
      summary: '',
      category: 'Public Safety',
      fullDocument: null
    });
  };

  // FIXED: Handle create/edit policy - ensure isPublished is set to true
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Add all form data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // FIXED: Ensure the policy is published by default for admin creation
      formDataToSend.append('isPublished', 'true');

      const url = isEditing ? `/api/policies/${selectedPolicy._id}` : '/api/policies';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save policy');
      }

      const result = await response.json();
      
      if (isEditing) {
        setPolicies(prev => prev.map(p => p._id === selectedPolicy._id ? result.data : p));
        setShowViewModal(false);
      } else {
        setPolicies(prev => [result.data, ...prev]);
        setShowCreateModal(false);
      }

      resetForm();
      setIsEditing(false);
      setSelectedPolicy(null);
      
      alert(`Policy ${isEditing ? 'updated' : 'created'} successfully!`);
    } catch (err) {
      setError(err.message);
      console.error('Error saving policy:', err);
      alert(`Error: ${err.message}`);
    }
  };

  // Handle delete policy
  const handleDelete = async (policyId) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/policies/${policyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete policy');
      }

      setPolicies(prev => prev.filter(p => p._id !== policyId));
      setShowViewModal(false);
      alert('Policy deleted successfully!');
    } catch (err) {
      setError(err.message);
      console.error('Error deleting policy:', err);
      alert(`Error: ${err.message}`);
    }
  };

  // Handle card click
  const handleCardClick = (policy) => {
    setSelectedPolicy(policy);
    setShowViewModal(true);
  };

  // Handle edit click
  const handleEditClick = () => {
    setFormData({
      title: selectedPolicy.title,
      type: selectedPolicy.type,
      policyNumber: selectedPolicy.policyNumber,
      implementationDate: selectedPolicy.implementationDate.split('T')[0],
      summary: selectedPolicy.summary,
      category: selectedPolicy.category,
      fullDocument: null
    });
    setIsEditing(true);
    setShowViewModal(false);
    setShowCreateModal(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading policies...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Local Policies Management</h1>
        <p className={styles.subtitle}>Create and manage ordinances and resolutions</p>
      </div>

      {error && (
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      <div className={styles.controls}>
        <button 
          className={styles.createButton}
          onClick={() => {
            resetForm();
            setIsEditing(false);
            setShowCreateModal(true);
          }}
        >
          <span className={styles.icon}>+</span>
          Create New Policy
        </button>

        <div className={styles.filters}>
          <input
            type="text"
            placeholder="Search policies..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select
            className={styles.filterSelect}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="ordinance">Ordinance</option>
            <option value="resolution">Resolution</option>
          </select>

          <select
            className={styles.filterSelect}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredPolicies.length === 0 ? (
        <div className={styles.empty}>
          <p>No policies found</p>
          <p className={styles.emptyHint}>Create your first policy or adjust your filters</p>
        </div>
      ) : (
        <div className={styles.policiesGrid}>
          {filteredPolicies.map(policy => (
            <div 
              key={policy._id} 
              className={styles.policyCard}
              onClick={() => handleCardClick(policy)}
            >
              <div className={styles.cardHeader}>
                <span className={`${styles.policyType} ${styles[policy.type]}`}>
                  {policy.type}
                </span>
                <span className={styles.policyNumber}>
                  No. {policy.policyNumber}
                </span>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.policyTitle}>{policy.title}</h3>
                <p className={styles.policySummary}>
                  {policy.summary.length > 150 
                    ? `${policy.summary.substring(0, 150)}...` 
                    : policy.summary
                  }
                </p>

                <div className={styles.cardMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Category:</span>
                    <span className={styles.metaValue}>{policy.category}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Implementation:</span>
                    <span className={styles.metaValue}>
                      {formatDate(policy.implementationDate)}
                    </span>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.stats}>
                    <div className={styles.stat}>
                      <span className={styles.statIcon}>👁</span>
                      <span>{policy.views}</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statIcon}>⬇</span>
                      <span>{policy.downloads}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{isEditing ? 'Edit Policy' : 'Create New Policy'}</h2>
              <button 
                className={styles.closeButton}
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                  setIsEditing(false);
                  setSelectedPolicy(null);
                }}
              >
                ×
              </button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="title">Policy Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter policy title"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="type">Policy Type *</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="ordinance">Ordinance</option>
                    <option value="resolution">Resolution</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="policyNumber">Policy Number *</label>
                  <input
                    type="text"
                    id="policyNumber"
                    name="policyNumber"
                    value={formData.policyNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 2024-001"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="implementationDate">Implementation Date *</label>
                  <input
                    type="date"
                    id="implementationDate"
                    name="implementationDate"
                    value={formData.implementationDate}
                    onChange={handleInputChange}
                    required
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
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="fullDocument">Upload Document</label>
                  <input
                    type="file"
                    id="fullDocument"
                    name="fullDocument"
                    onChange={handleInputChange}
                    accept=".pdf,.doc,.docx"
                    className={styles.fileInput}
                  />
                  <small className={styles.fileHint}>
                    Upload PDF or Word document (optional)
                  </small>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="summary">Summary *</label>
                <textarea
                  id="summary"
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  required
                  placeholder="Provide a brief summary of the policy"
                  rows={4}
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                    setIsEditing(false);
                    setSelectedPolicy(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                >
                  {isEditing ? 'Update Policy' : 'Create Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedPolicy && (
        <div className={styles.modalOverlay}>
          <div className={styles.viewModal}>
            <div className={styles.modalHeader}>
              <h2>{selectedPolicy.title}</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowViewModal(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.viewContent}>
              <div className={styles.detailHeader}>
                <span className={`${styles.policyType} ${styles[selectedPolicy.type]}`}>
                  {selectedPolicy.type}
                </span>
                <span className={styles.policyNumber}>
                  No. {selectedPolicy.policyNumber}
                </span>
              </div>

              <div className={styles.detailMeta}>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Category:</span>
                  <span className={styles.metaValue}>{selectedPolicy.category}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Implementation Date:</span>
                  <span className={styles.metaValue}>
                    {formatDate(selectedPolicy.implementationDate)}
                  </span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Created:</span>
                  <span className={styles.metaValue}>
                    {formatDate(selectedPolicy.createdAt)}
                  </span>
                </div>
              </div>

              <div className={styles.detailSummary}>
                <h4>Summary</h4>
                <p>{selectedPolicy.summary}</p>
              </div>

              {selectedPolicy.fullDocument && (
                <div className={styles.detailDocument}>
                  <h4>Document</h4>
                  <a 
                    href={selectedPolicy.fullDocument.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.downloadLink}
                  >
                    📄 {selectedPolicy.fullDocument.fileName}
                  </a>
                </div>
              )}

              <div className={styles.detailStats}>
                <div className={styles.stat}>
                  <span className={styles.statIcon}>👁</span>
                  <span>{selectedPolicy.views} views</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statIcon}>⬇</span>
                  <span>{selectedPolicy.downloads} downloads</span>
                </div>
              </div>

              <div className={styles.detailActions}>
                <button
                  className={styles.editButton}
                  onClick={handleEditClick}
                >
                  Edit Policy
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDelete(selectedPolicy._id)}
                >
                  Delete Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLocalPolicies;