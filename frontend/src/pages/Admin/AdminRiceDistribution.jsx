import React, { useState, useEffect } from 'react';
import styles from './styles/AdminRiceDistribution.module.css';
import { Plus } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL; // e.g. http://localhost:4000/api

const BARANGAYS = [
  'agnas', 'bacolod', 'bangkilingan', 'bantayan', 'baranghawon', 'basagan', 
  'basud', 'bognabong', 'bombon', 'bonot', 'san isidro', 'buang', 'buhian', 
  'cabagnan', 'cobo', 'comon', 'cormidal', 'divino Rostro', 'fatima', 
  'guinobat', 'hacienda', 'magapo', 'mariroc', 'matagbac', 'oras', 'oson', 
  'panal', 'pawa', 'pinagbobong', 'quinale cabasan', 'quinastillojan', 
  'rawis', 'sagurong', 'salvacion', 'san antonio', 'san carlos', 'san juan', 
  'san lorenzo', 'san ramon', 'san roque', 'san vicente', 'santo cristo', 
  'sua-igot', 'tabiguian', 'tagas', 'tayhi', 'visita'
];

const AdminRiceDistribution = () => {
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  // Form state for create/edit distribution
  const [formData, setFormData] = useState({
    distributionTitle: '',
    distributionMonth: '',
    selectedBarangays: [],
    distributionSchedule: [],
    riceDetails: {
      totalKilos: '',
      kilosPerFamily: ''
    },
    status: 'planned'
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchDistributions();
  }, []);

  const fetchDistributions = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/rice-distribution?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch distributions');
      }

      const data = await response.json();
      setDistributions(data.data || []);
      setPagination(data.pagination || { current: 1, pages: 1, total: 0 });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching distributions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleBarangaySelection = (barangay) => {
    setFormData(prev => {
      const isSelected = prev.selectedBarangays.includes(barangay);
      let updatedBarangays;
      
      if (isSelected) {
        updatedBarangays = prev.selectedBarangays.filter(b => b !== barangay);
      } else {
        updatedBarangays = [...prev.selectedBarangays, barangay];
      }

      // Update distribution schedule based on selected barangays
      const updatedSchedule = updatedBarangays.map(selectedBarangay => {
        const existing = prev.distributionSchedule.find(s => s.barangay === selectedBarangay);
        return existing || {
          barangay: selectedBarangay,
          date: '',
          location: '',
          contactPerson: {
            name: '',
            phone: ''
          }
        };
      });

      return {
        ...prev,
        selectedBarangays: updatedBarangays,
        distributionSchedule: updatedSchedule
      };
    });
  };

  const handleScheduleChange = (barangayIndex, field, value) => {
    setFormData(prev => {
      const updatedSchedule = [...prev.distributionSchedule];
      
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        updatedSchedule[barangayIndex] = {
          ...updatedSchedule[barangayIndex],
          [parent]: {
            ...updatedSchedule[barangayIndex][parent],
            [child]: value
          }
        };
      } else {
        updatedSchedule[barangayIndex] = {
          ...updatedSchedule[barangayIndex],
          [field]: value
        };
      }
      
      return {
        ...prev,
        distributionSchedule: updatedSchedule
      };
    });
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.distributionTitle.trim()) {
      errors.distributionTitle = 'Distribution title is required';
    }

    if (!formData.distributionMonth) {
      errors.distributionMonth = 'Distribution month is required';
    }

    if (formData.selectedBarangays.length === 0) {
      errors.selectedBarangays = 'At least one barangay must be selected';
    }

    if (!formData.riceDetails.totalKilos || formData.riceDetails.totalKilos <= 0) {
      errors.totalKilos = 'Total kilos must be greater than 0';
    }

    if (!formData.riceDetails.kilosPerFamily || formData.riceDetails.kilosPerFamily <= 0) {
      errors.kilosPerFamily = 'Kilos per family must be greater than 0';
    }

    // Validate distribution schedule
    const scheduleErrors = [];
    formData.distributionSchedule.forEach((schedule, index) => {
      const scheduleError = {};
      if (!schedule.date) {
        scheduleError.date = 'Distribution date is required';
      }
      if (!schedule.location.trim()) {
        scheduleError.location = 'Location is required';
      }
      if (Object.keys(scheduleError).length > 0) {
        scheduleErrors[index] = scheduleError;
      }
    });

    if (scheduleErrors.length > 0) {
      errors.schedule = scheduleErrors;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = selectedDistribution 
        ? `${API_BASE}/rice-distribution/${selectedDistribution._id}`
        : `${API_BASE}/rice-distribution`;
      
      const method = selectedDistribution ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save distribution');
      }

      const data = await response.json();
      
      // Close modals and refresh data
      setShowCreateModal(false);
      setShowEditModal(false);
      resetForm();
      fetchDistributions();
      
      alert(data.message || 'Distribution saved successfully!');
    } catch (err) {
      setError(err.message);
      console.error('Error saving distribution:', err);
    }
  };

  const handleDelete = async (distributionId) => {
    if (!window.confirm('Are you sure you want to delete this distribution?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/rice-distribution/${distributionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete distribution');
      }

      setShowViewModal(false);
      fetchDistributions();
      alert('Distribution deleted successfully!');
    } catch (err) {
      setError(err.message);
      console.error('Error deleting distribution:', err);
    }
  };

  const handleUpdateStatus = async (distributionId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/rice-distribution/${distributionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      fetchDistributions();
      setShowViewModal(false);
      alert('Status updated successfully!');
    } catch (err) {
      setError(err.message);
      console.error('Error updating status:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      distributionTitle: '',
      distributionMonth: '',
      selectedBarangays: [],
      distributionSchedule: [],
      riceDetails: {
        totalKilos: '',
        kilosPerFamily: ''
      },
      status: 'planned'
    });
    setFormErrors({});
    setSelectedDistribution(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openViewModal = (distribution) => {
    setSelectedDistribution(distribution);
    setShowViewModal(true);
  };

  const openEditModal = (distribution) => {
    setSelectedDistribution(distribution);
    setFormData({
      distributionTitle: distribution.distributionTitle,
      distributionMonth: distribution.distributionMonth,
      selectedBarangays: distribution.selectedBarangays,
      distributionSchedule: distribution.distributionSchedule,
      riceDetails: distribution.riceDetails,
      status: distribution.status
    });
    setShowEditModal(true);
  };

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
        <p>Loading rice distributions...</p>
      </div>
    );
  }

  return (
    <div className={styles.adminRiceDistribution}>
      {/* Header */}
      <div className={styles.header}>
        <h1>Monthly Rice Distribution Management</h1>
        <button 
          className={styles.createButton}
          onClick={openCreateModal}
        >
          <span className={styles.icon}><Plus size={16}/></span>
          Create Distribution
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* Distribution Cards */}
      <div className={styles.distributionGrid}>
        {distributions.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No distributions found</h3>
            <p>Click "Create Distribution" to add your first rice distribution.</p>
          </div>
        ) : (
          distributions.map((distribution) => (
            <div 
              key={distribution._id}
              className={styles.distributionCard}
              onClick={() => openViewModal(distribution)}
            >
              <div className={styles.cardHeader}>
                <h3>{distribution.distributionTitle}</h3>
                <span className={`${styles.statusBadge} ${styles[distribution.status]}`}>
                  {distribution.status}
                </span>
              </div>
              
              <div className={styles.cardBody}>
                <p className={styles.cardInfo}>
                  <span className={styles.label}>Month:</span>
                  {new Date(distribution.distributionMonth + '-01').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </p>
                
                <p className={styles.cardInfo}>
                  <span className={styles.label}>Barangays:</span>
                  {distribution.selectedBarangays.length} selected
                </p>
                
                <p className={styles.cardInfo}>
                  <span className={styles.label}>Total Rice:</span>
                  {distribution.riceDetails.totalKilos} kg
                </p>
                
                <p className={styles.cardInfo}>
                  <span className={styles.label}>Per Family:</span>
                  {distribution.riceDetails.kilosPerFamily} kg
                </p>
              </div>
              
              <div className={styles.cardFooter}>
                <small>
                  Created: {formatDate(distribution.createdAt)}
                </small>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: pagination.pages }, (_, i) => (
            <button
              key={i + 1}
              className={`${styles.pageButton} ${pagination.current === i + 1 ? styles.active : ''}`}
              onClick={() => fetchDistributions(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{showCreateModal ? 'Create New Distribution' : 'Edit Distribution'}</h2>
              <button 
                className={styles.closeButton}
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.modalBody}>
              {/* Basic Information */}
              <div className={styles.section}>
                <h3>Basic Information</h3>
                
                <div className={styles.formGroup}>
                  <label htmlFor="distributionTitle">Distribution Title *</label>
                  <input
                    type="text"
                    id="distributionTitle"
                    name="distributionTitle"
                    value={formData.distributionTitle}
                    onChange={handleInputChange}
                    className={formErrors.distributionTitle ? styles.error : ''}
                  />
                  {formErrors.distributionTitle && (
                    <span className={styles.errorText}>{formErrors.distributionTitle}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="distributionMonth">Distribution Month *</label>
                  <input
                    type="month"
                    id="distributionMonth"
                    name="distributionMonth"
                    value={formData.distributionMonth}
                    onChange={handleInputChange}
                    className={formErrors.distributionMonth ? styles.error : ''}
                  />
                  {formErrors.distributionMonth && (
                    <span className={styles.errorText}>{formErrors.distributionMonth}</span>
                  )}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="totalKilos">Total Kilos *</label>
                    <input
                      type="number"
                      id="totalKilos"
                      name="riceDetails.totalKilos"
                      value={formData.riceDetails.totalKilos}
                      onChange={handleInputChange}
                      min="1"
                      className={formErrors.totalKilos ? styles.error : ''}
                    />
                    {formErrors.totalKilos && (
                      <span className={styles.errorText}>{formErrors.totalKilos}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="kilosPerFamily">Kilos per Family *</label>
                    <input
                      type="number"
                      id="kilosPerFamily"
                      name="riceDetails.kilosPerFamily"
                      value={formData.riceDetails.kilosPerFamily}
                      onChange={handleInputChange}
                      min="1"
                      className={formErrors.kilosPerFamily ? styles.error : ''}
                    />
                    {formErrors.kilosPerFamily && (
                      <span className={styles.errorText}>{formErrors.kilosPerFamily}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Barangay Selection */}
              <div className={styles.section}>
                <h3>Select Barangays *</h3>
                {formErrors.selectedBarangays && (
                  <span className={styles.errorText}>{formErrors.selectedBarangays}</span>
                )}
                
                <div className={styles.barangayGrid}>
                  {BARANGAYS.map((barangay) => (
                    <label key={barangay} className={styles.barangayLabel}>
                      <input
                        type="checkbox"
                        checked={formData.selectedBarangays.includes(barangay)}
                        onChange={() => handleBarangaySelection(barangay)}
                      />
                      <span className={styles.barangayName}>
                        {barangay.charAt(0).toUpperCase() + barangay.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Distribution Schedule */}
              {formData.selectedBarangays.length > 0 && (
                <div className={styles.section}>
                  <h3>Distribution Schedule</h3>
                  
                  {formData.distributionSchedule.map((schedule, index) => (
                    <div key={schedule.barangay} className={styles.scheduleCard}>
                      <h4>{schedule.barangay.charAt(0).toUpperCase() + schedule.barangay.slice(1)}</h4>
                      
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label>Distribution Date *</label>
                          <input
                            type="date"
                            value={schedule.date ? schedule.date.split('T')[0] : ''}
                            onChange={(e) => handleScheduleChange(index, 'date', e.target.value)}
                            className={formErrors.schedule?.[index]?.date ? styles.error : ''}
                          />
                          {formErrors.schedule?.[index]?.date && (
                            <span className={styles.errorText}>
                              {formErrors.schedule[index].date}
                            </span>
                          )}
                        </div>

                        <div className={styles.formGroup}>
                          <label>Location *</label>
                          <input
                            type="text"
                            value={schedule.location}
                            onChange={(e) => handleScheduleChange(index, 'location', e.target.value)}
                            placeholder="Distribution location"
                            className={formErrors.schedule?.[index]?.location ? styles.error : ''}
                          />
                          {formErrors.schedule?.[index]?.location && (
                            <span className={styles.errorText}>
                              {formErrors.schedule[index].location}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label>Contact Person Name</label>
                          <input
                            type="text"
                            value={schedule.contactPerson?.name || ''}
                            onChange={(e) => handleScheduleChange(index, 'contactPerson.name', e.target.value)}
                            placeholder="Contact person name"
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Contact Person Phone</label>
                          <input
                            type="tel"
                            value={schedule.contactPerson?.phone || ''}
                            onChange={(e) => handleScheduleChange(index, 'contactPerson.phone', e.target.value)}
                            placeholder="09XXXXXXXXX"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </form>

            <div className={styles.modalFooter}>
              <button 
                type="button"
                className={styles.cancelButton}
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className={styles.saveButton}
                onClick={handleSubmit}
              >
                {showCreateModal ? 'Create Distribution' : 'Update Distribution'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedDistribution && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Distribution Details</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowViewModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {/* Distribution Information */}
              <div className={styles.section}>
                <h3>Distribution Information</h3>
                
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Title:</span>
                  <span>{selectedDistribution.distributionTitle}</span>
                </div>
                
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Month:</span>
                  <span>
                    {new Date(selectedDistribution.distributionMonth + '-01').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </span>
                </div>
                
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Status:</span>
                  <span className={`${styles.statusBadge} ${styles[selectedDistribution.status]}`}>
                    {selectedDistribution.status}
                  </span>
                </div>
                
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Total Rice:</span>
                  <span>{selectedDistribution.riceDetails.totalKilos} kg</span>
                </div>
                
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Per Family:</span>
                  <span>{selectedDistribution.riceDetails.kilosPerFamily} kg</span>
                </div>
              </div>

              {/* Selected Barangays */}
              <div className={styles.section}>
                <h3>Selected Barangays ({selectedDistribution.selectedBarangays.length})</h3>
                <div className={styles.barangayList}>
                  {selectedDistribution.selectedBarangays.map((barangay) => (
                    <span key={barangay} className={styles.barangayTag}>
                      {barangay.charAt(0).toUpperCase() + barangay.slice(1)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Distribution Schedule */}
              <div className={styles.section}>
                <h3>Distribution Schedule</h3>
                {selectedDistribution.distributionSchedule.map((schedule) => (
                  <div key={schedule.barangay} className={styles.viewScheduleCard}>
                    <h4>{schedule.barangay.charAt(0).toUpperCase() + schedule.barangay.slice(1)}</h4>
                    
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Date:</span>
                      <span>{formatDate(schedule.date)}</span>
                    </div>
                    
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Location:</span>
                      <span>{schedule.location}</span>
                    </div>
                    
                    {schedule.contactPerson?.name && (
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Contact Person:</span>
                        <span>
                          {schedule.contactPerson.name}
                          {schedule.contactPerson.phone && ` - ${schedule.contactPerson.phone}`}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Timestamps */}
              <div className={styles.section}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Created:</span>
                  <span>{formatDate(selectedDistribution.createdAt)}</span>
                </div>
                
                {selectedDistribution.updatedAt !== selectedDistribution.createdAt && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Last Updated:</span>
                    <span>{formatDate(selectedDistribution.updatedAt)}</span>
                  </div>
                )}
                
                {selectedDistribution.completedAt && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Completed:</span>
                    <span>{formatDate(selectedDistribution.completedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button 
                type="button"
                className={styles.editButton}
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedDistribution);
                }}
              >
                Edit
              </button>
              
              <button 
                type="button"
                className={`${styles.statusButton} ${
                  selectedDistribution.status === 'planned' ? styles.completeStatus : styles.plannedStatus
                }`}
                onClick={() => handleUpdateStatus(
                  selectedDistribution._id,
                  selectedDistribution.status === 'planned' ? 'completed' : 'planned'
                )}
              >
                Mark as {selectedDistribution.status === 'planned' ? 'Completed' : 'Planned'}
              </button>
              
              <button 
                type="button"
                className={styles.deleteButton}
                onClick={() => handleDelete(selectedDistribution._id)}
              >
                Delete
              </button>
              
              <button 
                type="button"
                className={styles.cancelButton}
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRiceDistribution;