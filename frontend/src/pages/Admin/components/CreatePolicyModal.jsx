// frontend/src/components/Admin/CreatePolicyModal.jsx
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import styles from './CreatePolicyModal.module.css';

const POLICY_CATEGORIES = [
  'Public Safety',
  'Health and Sanitation',
  'Environment',
  'Transportation',
  'Business and Commerce',
  'Education',
  'Social Services',
  'Infrastructure',
  'Finance and Budget',
  'Governance',
  'Other'
];

const CreatePolicyModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'ordinance',
    policyNumber: '',
    implementationDate: '',
    summary: '',
    category: 'Public Safety',
    isPublished: true,
    isPubliclyVisible: true
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Validate file type
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.policyNumber.trim()) {
      newErrors.policyNumber = 'Policy number is required';
    }
    
    if (!formData.implementationDate) {
      newErrors.implementationDate = 'Implementation date is required';
    }
    
    if (!formData.summary.trim()) {
      newErrors.summary = 'Summary is required';
    } else if (formData.summary.length > 1000) {
      newErrors.summary = 'Summary must not exceed 1000 characters';
    }
    
    if (!file) {
      newErrors.file = 'Policy document is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    
    try {
      const submitData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      
      // Add file
      submitData.append('document', file);
      
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Create New Policy</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            {/* Title */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Title <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                placeholder="Enter policy title"
                maxLength={200}
              />
              {errors.title && (
                <span className={styles.error}>{errors.title}</span>
              )}
            </div>

            {/* Type and Policy Number */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Type <span className={styles.required}>*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="ordinance">Ordinance</option>
                  <option value="resolution">Resolution</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Policy Number <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="policyNumber"
                  value={formData.policyNumber}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.policyNumber ? styles.inputError : ''}`}
                  placeholder="e.g., 2024-001"
                  maxLength={50}
                />
                {errors.policyNumber && (
                  <span className={styles.error}>{errors.policyNumber}</span>
                )}
              </div>
            </div>

            {/* Category and Implementation Date */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Category <span className={styles.required}>*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={styles.select}
                >
                  {POLICY_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Implementation Date <span className={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  name="implementationDate"
                  value={formData.implementationDate}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.implementationDate ? styles.inputError : ''}`}
                />
                {errors.implementationDate && (
                  <span className={styles.error}>{errors.implementationDate}</span>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Summary <span className={styles.required}>*</span>
              </label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                className={`${styles.textarea} ${errors.summary ? styles.inputError : ''}`}
                placeholder="Enter a brief summary of the policy..."
                rows={4}
                maxLength={1000}
              />
              <div className={styles.charCount}>
                {formData.summary.length}/1000 characters
              </div>
              {errors.summary && (
                <span className={styles.error}>{errors.summary}</span>
              )}
            </div>

            {/* File Upload */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Policy Document (PDF) <span className={styles.required}>*</span>
              </label>
              <div className={styles.fileUpload}>
                <input
                  type="file"
                  id="document"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                />
                <label htmlFor="document" className={styles.fileLabel}>
                  {file ? (
                    <>
                      <span className={styles.fileIcon}>📄</span>
                      <span className={styles.fileName}>{file.name}</span>
                    </>
                  ) : (
                    <>
                      <span className={styles.uploadIcon}>⬆️</span>
                      <span>Click to upload PDF</span>
                    </>
                  )}
                </label>
              </div>
              {errors.file && (
                <span className={styles.error}>{errors.file}</span>
              )}
            </div>

            {/* Publishing Options */}
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  className={styles.checkbox}
                />
                <span>Publish immediately</span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isPubliclyVisible"
                  checked={formData.isPubliclyVisible}
                  onChange={handleChange}
                  className={styles.checkbox}
                />
                <span>Make publicly visible</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? 'Creating...' : 'Create Policy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePolicyModal;