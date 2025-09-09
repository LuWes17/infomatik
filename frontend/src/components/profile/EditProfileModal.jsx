// frontend/src/components/profile/EditProfileModal.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X , UserRound, MapPin } from 'lucide-react';
import styles from './ProfileModal.module.css';
import { ChevronDown } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';

const BARANGAYS = [
  'agnas', 'bacolod', 'bangkilingan', 'bantayan', 'baranghawon', 'basagan', 
  'basud', 'bognabong', 'bombon', 'bonot', 'san isidro', 'buang', 'buhian', 
  'cabagnan', 'cobo', 'comon', 'cormidal', 'divino rostro', 'fatima', 
  'guinobat', 'hacienda', 'magapo', 'mariroc', 'matagbac', 'oras', 'oson', 
  'panal', 'pawa', 'pinagbobong', 'quinale cabasan', 'quinastillojan', 
  'rawis', 'sagurong', 'salvacion', 'san antonio', 'san carlos', 'san juan', 
  'san lorenzo', 'san ramon', 'san roque', 'san vicente', 'santo cristo', 
  'sua-igot', 'tabiguian', 'tagas', 'tayhi', 'visita'
];

const EditProfileModal = ({ onClose }) => {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [fieldErrors, setFieldErrors] = useState({});

  const [barangayDropdownOpen, setBarangayDropdownOpen] = useState(false);
  const barangayDropdownRef = useRef(null);

  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    barangay: user?.barangay || ''
  });

  // Add these functions:
  const toggleBarangayDropdown = () => {
    setBarangayDropdownOpen(!barangayDropdownOpen);
  };

  const handleBarangayChange = (barangay) => {
    setFormData(prev => ({
      ...prev,
      barangay: barangay
    }));
    setBarangayDropdownOpen(false);
    
    // Clear messages when user makes selection
    if (error) setError('');
    if (success) setSuccess('');
    
    // Validate field if already touched
    setTimeout(() => validateField('barangay', barangay), 100);
  };

  const formatBarangayName = (barangay) => {
    return barangay.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

// Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (barangayDropdownRef.current && !barangayDropdownRef.current.contains(event.target)) {
        setBarangayDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

    const validateField = (name, value) => {
    const errors = { ...fieldErrors };
    
    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          errors.firstName = 'First name is required';
        } else if (value.trim().length < 2) {
          errors.firstName = 'First name must be at least 2 characters';
        } else {
          delete errors.firstName;
        }
        break;
        
      case 'lastName':
        if (!value.trim()) {
          errors.lastName = 'Last name is required';
        } else if (value.trim().length < 2) {
          errors.lastName = 'Last name must be at least 2 characters';
        } else {
          delete errors.lastName;
        }
        break;
        
      case 'barangay':
        if (!value) {
          errors.barangay = 'Barangay is required';
        } else {
          delete errors.barangay;
        }
        break;
        
      default:
        break;
    }
    
    setFieldErrors(errors);
    return !errors[name];
  };

  const validateAllFields = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }
    
    if (!formData.barangay) {
      errors.barangay = 'Barangay is required';
    }
    
    // Check if no changes were made
    if (formData.firstName.trim() === user?.firstName && 
        formData.lastName.trim() === user?.lastName && 
        formData.barangay === user?.barangay) {
      setError('No changes detected. Please modify at least one field.');
      return false;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

   const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');

    // Validate field on blur for better UX
    setTimeout(() => validateField(name, value), 100);
  };

  const hasChanges = () => {
    return formData.firstName.trim() !== user?.firstName || 
           formData.lastName.trim() !== user?.lastName || 
           formData.barangay !== user?.barangay;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAllFields()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        barangay: formData.barangay,
        profile: {
          bio: formData.bio,
          address: formData.address
        }
      };

      const result = await updateProfile(updateData);
      
      if (result.success) {
        setTimeout(() => {
          onClose();
        }, 1500);

        showSuccess('Profile Updated Successfully!')
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Edit Profile</h2>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>First Name</label>
              <div className={styles.inputWrapper}>
                <UserRound className={styles.inputIcon} size={16} />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${styles.formInput} ${styles.inputWithIcon} ${fieldErrors.firstName ? styles.inputError : ''}`}
                  required
                />
              </div>
              {fieldErrors.firstName && (
                <div className={styles.fieldError}>
                  {fieldErrors.firstName}
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Last Name</label>
              <div className={styles.inputWrapper}>
                <UserRound className={styles.inputIcon} size={16} />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${styles.formInput} ${styles.inputWithIcon} ${fieldErrors.lastName ? styles.inputError : ''}`}
                  required
                />
              </div>
              {fieldErrors.lastName && (
                <div className={styles.fieldError}>
                  {fieldErrors.lastName}
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
            <label className={styles.formLabel}>Barangay</label>
            <div className={styles.customDropdown} ref={barangayDropdownRef}>
              <MapPin className={styles.inputIcon} size={16} />
              <button
                type="button"
                onClick={toggleBarangayDropdown}
                className={`${styles.customDropdownButton} ${barangayDropdownOpen ? styles.active : ''} ${!formData.barangay ? styles.placeholder : ''} ${fieldErrors.barangay ? styles.inputError : ''}`}
              >
                <span>
                  {formData.barangay ? formatBarangayName(formData.barangay) : 'Select your barangay'}
                </span>
                <ChevronDown 
                  size={16} 
                  className={`${styles.dropdownArrow} ${barangayDropdownOpen ? styles.open : ''}`} 
                />
              </button>
              <div className={`${styles.customDropdownContent} ${barangayDropdownOpen ? styles.show : ''}`}>
                {BARANGAYS.map((barangay) => (
                  <button
                    key={barangay}
                    type="button"
                    onClick={() => handleBarangayChange(barangay)}
                    className={`${styles.customDropdownItem} ${formData.barangay === barangay ? styles.active : ''}`}
                  >
                    {formatBarangayName(barangay)}
                  </button>
                ))}
              </div>
            </div>
            {fieldErrors.barangay && (
              <div className={styles.fieldError}>
                {fieldErrors.barangay}
              </div>
            )}
          </div>

          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.submitButton} ${!hasChanges() || Object.keys(fieldErrors).length > 0 ? styles.submitButtonDisabled : ''}`}
              disabled={isLoading || !hasChanges() || Object.keys(fieldErrors).length > 0}
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;