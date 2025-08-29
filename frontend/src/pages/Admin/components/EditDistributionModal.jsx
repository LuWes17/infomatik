import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import styles from './DistributionModal.module.css';

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

const EditDistributionModal = ({ distribution, onClose, onSubmit }) => {
  // Format date for input field
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    title: distribution.title || '',
    selectedBarangays: distribution.selectedBarangays || [],
    distributionSchedule: distribution.distributionSchedule?.map(schedule => ({
      date: formatDateForInput(schedule.date),
      time: schedule.time || '',
      location: schedule.location || '',
      contactPerson: {
        name: schedule.contactPerson?.name || '',
        phone: schedule.contactPerson?.phone || ''
      }
    })) || [{
      date: '',
      time: '',
      location: '',
      contactPerson: {
        name: '',
        phone: ''
      }
    }],
    riceDetails: {
      totalKilos: distribution.riceDetails?.totalKilos || '',
      typeOfRice: distribution.riceDetails?.typeOfRice || '',
      kilosPerFamily: distribution.riceDetails?.kilosPerFamily || '',
      source: distribution.riceDetails?.source || ''
    },
    status: distribution.status || 'planned'
  });

  const [errors, setErrors] = useState({});

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

  const handleScheduleChange = (index, field, value) => {
    const newSchedule = [...formData.distributionSchedule];
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      newSchedule[index][parent][child] = value;
    } else {
      newSchedule[index][field] = value;
    }
    
    setFormData(prev => ({
      ...prev,
      distributionSchedule: newSchedule
    }));
  };

  const addSchedule = () => {
    setFormData(prev => ({
      ...prev,
      distributionSchedule: [
        ...prev.distributionSchedule,
        {
          date: '',
          time: '',
          location: '',
          contactPerson: {
            name: '',
            phone: ''
          }
        }
      ]
    }));
  };

  const removeSchedule = (index) => {
    if (formData.distributionSchedule.length > 1) {
      setFormData(prev => ({
        ...prev,
        distributionSchedule: prev.distributionSchedule.filter((_, i) => i !== index)
      }));
    }
  };

  const handleBarangayToggle = (barangay) => {
    setFormData(prev => ({
      ...prev,
      selectedBarangays: prev.selectedBarangays.includes(barangay)
        ? prev.selectedBarangays.filter(b => b !== barangay)
        : [...prev.selectedBarangays, barangay]
    }));
  };

  const selectAllBarangays = () => {
    setFormData(prev => ({
      ...prev,
      selectedBarangays: prev.selectedBarangays.length === BARANGAYS.length ? [] : [...BARANGAYS]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.selectedBarangays.length === 0) {
      newErrors.selectedBarangays = 'Please select at least one barangay';
    }
    
    formData.distributionSchedule.forEach((schedule, index) => {
      if (!schedule.date) {
        newErrors[`schedule_${index}_date`] = 'Date is required';
      }
      if (!schedule.time) {
        newErrors[`schedule_${index}_time`] = 'Time is required';
      }
      if (!schedule.location) {
        newErrors[`schedule_${index}_location`] = 'Location is required';
      }
    });
    
    if (!formData.riceDetails.totalKilos) {
      newErrors.totalKilos = 'Total kilos is required';
    }
    
    if (!formData.riceDetails.typeOfRice) {
      newErrors.typeOfRice = 'Type of rice is required';
    }
    
    if (!formData.riceDetails.kilosPerFamily) {
      newErrors.kilosPerFamily = 'Kilos per family is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Edit Rice Distribution Record</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.modalBody}>
            {/* Title */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Title <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="e.g., Q1 2025 Rice Distribution"
              />
              {errors.title && <span className={styles.error}>{errors.title}</span>}
            </div>
            
            {/* Selected Barangays */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Selected Barangays <span className={styles.required}>*</span>
              </label>
              <div className={styles.barangayHeader}>
                <button
                  type="button"
                  onClick={selectAllBarangays}
                  className={styles.selectAllButton}
                >
                  {formData.selectedBarangays.length === BARANGAYS.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className={styles.selectedCount}>
                  {formData.selectedBarangays.length} of {BARANGAYS.length} selected
                </span>
              </div>
              <div className={styles.barangayGrid}>
                {BARANGAYS.map((barangay) => (
                  <label key={barangay} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.selectedBarangays.includes(barangay)}
                      onChange={() => handleBarangayToggle(barangay)}
                      className={styles.checkbox}
                    />
                    <span>{barangay}</span>
                  </label>
                ))}
              </div>
              {errors.selectedBarangays && <span className={styles.error}>{errors.selectedBarangays}</span>}
            </div>
            
            {/* Distribution Schedule */}
            <div className={styles.formGroup}>
              <div className={styles.sectionHeader}>
                <label className={styles.label}>
                  Distribution Schedule <span className={styles.required}>*</span>
                </label>
                <button
                  type="button"
                  onClick={addSchedule}
                  className={styles.addButton}
                >
                  <Plus size={16} />
                  Add Schedule
                </button>
              </div>
              
              {formData.distributionSchedule.map((schedule, index) => (
                <div key={index} className={styles.scheduleCard}>
                  <div className={styles.scheduleHeader}>
                    <h4>Schedule {index + 1}</h4>
                    {formData.distributionSchedule.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSchedule(index)}
                        className={styles.removeButton}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div className={styles.scheduleGrid}>
                    <div>
                      <label className={styles.label}>Date <span className={styles.required}>*</span></label>
                      <input
                        type="date"
                        value={schedule.date}
                        onChange={(e) => handleScheduleChange(index, 'date', e.target.value)}
                        className={styles.input}
                      />
                      {errors[`schedule_${index}_date`] && (
                        <span className={styles.error}>{errors[`schedule_${index}_date`]}</span>
                      )}
                    </div>
                    
                    <div>
                      <label className={styles.label}>Time <span className={styles.required}>*</span></label>
                      <input
                        type="time"
                        value={schedule.time}
                        onChange={(e) => handleScheduleChange(index, 'time', e.target.value)}
                        className={styles.input}
                      />
                      {errors[`schedule_${index}_time`] && (
                        <span className={styles.error}>{errors[`schedule_${index}_time`]}</span>
                      )}
                    </div>
                    
                    <div className={styles.fullWidth}>
                      <label className={styles.label}>Location <span className={styles.required}>*</span></label>
                      <input
                        type="text"
                        value={schedule.location}
                        onChange={(e) => handleScheduleChange(index, 'location', e.target.value)}
                        className={styles.input}
                        placeholder="e.g., Barangay Hall"
                      />
                      {errors[`schedule_${index}_location`] && (
                        <span className={styles.error}>{errors[`schedule_${index}_location`]}</span>
                      )}
                    </div>
                    
                    <div>
                      <label className={styles.label}>Contact Person</label>
                      <input
                        type="text"
                        value={schedule.contactPerson.name}
                        onChange={(e) => handleScheduleChange(index, 'contactPerson.name', e.target.value)}
                        className={styles.input}
                        placeholder="Name"
                      />
                    </div>
                    
                    <div>
                      <label className={styles.label}>Contact Number</label>
                      <input
                        type="tel"
                        value={schedule.contactPerson.phone}
                        onChange={(e) => handleScheduleChange(index, 'contactPerson.phone', e.target.value)}
                        className={styles.input}
                        placeholder="09XX XXX XXXX"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Rice Details */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Rice Details</label>
              <div className={styles.riceGrid}>
                <div>
                  <label className={styles.label}>
                    Total Kilos <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    name="riceDetails.totalKilos"
                    value={formData.riceDetails.totalKilos}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="e.g., 5000"
                    min="1"
                  />
                  {errors.totalKilos && <span className={styles.error}>{errors.totalKilos}</span>}
                </div>
                
                <div>
                  <label className={styles.label}>
                    Type of Rice <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="riceDetails.typeOfRice"
                    value={formData.riceDetails.typeOfRice}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="e.g., NFA Rice"
                  />
                  {errors.typeOfRice && <span className={styles.error}>{errors.typeOfRice}</span>}
                </div>
                
                <div>
                  <label className={styles.label}>
                    Kilos per Family <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    name="riceDetails.kilosPerFamily"
                    value={formData.riceDetails.kilosPerFamily}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="e.g., 5"
                    min="1"
                  />
                  {errors.kilosPerFamily && <span className={styles.error}>{errors.kilosPerFamily}</span>}
                </div>
                
                <div>
                  <label className={styles.label}>Source</label>
                  <input
                    type="text"
                    name="riceDetails.source"
                    value={formData.riceDetails.source}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="e.g., DSWD"
                  />
                </div>
              </div>
            </div>
            
            {/* Status */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={styles.select}
              >
                <option value="planned">Planned</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Update Distribution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDistributionModal;