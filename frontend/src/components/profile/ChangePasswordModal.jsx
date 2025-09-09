// frontend/src/components/profile/ChangePasswordModal.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X, Eye, EyeOff, Lock } from 'lucide-react';
import styles from './ProfileModal.module.css';

const ChangePasswordModal = ({ onClose }) => {
  const { changePassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  // Field-specific errors and touched state
  const [fieldErrors, setFieldErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [touched, setTouched] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false
  });

  // Field validation function
  const getFieldValidation = (name, value) => {
    let isValid = true;
    let errorMessage = '';

    switch (name) {
      case 'currentPassword':
        if (!value.trim()) {
          isValid = false;
          errorMessage = 'Current password is required';
        }
        break;
      
      case 'newPassword':
        if (!value.trim()) {
          isValid = false;
          errorMessage = 'New password is required';
        } else if (value.length < 8) {
          isValid = false;
          errorMessage = 'New password must be at least 8 characters long';
        } else if (formData.currentPassword && value === formData.currentPassword) {
          isValid = false;
          errorMessage = 'New password must be different from current password';
        }
        break;
      
      case 'confirmNewPassword':
        if (!value.trim()) {
          isValid = false;
          errorMessage = 'Please confirm your new password';
        } else if (formData.newPassword && value !== formData.newPassword) {
          isValid = false;
          errorMessage = 'Passwords do not match';
        }
        break;
      
      default:
        break;
    }

    return { isValid, errorMessage };
  };

  const validateField = (name, value) => {
    const validation = getFieldValidation(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: validation.errorMessage
    }));
    return validation.isValid;
  };

  const getInputClass = (fieldName) => {
    if (!touched[fieldName]) {
      return styles.formInput;
    }
    
    const hasError = fieldErrors[fieldName] && fieldErrors[fieldName] !== '';
    return `${styles.formInput} ${hasError ? styles.inputError : ''}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate field on change if already touched
    if (touched[name]) {
      validateField(name, value);
    }

    // Special case: validate confirm password when new password changes
    if (name === 'newPassword' && touched.confirmNewPassword && formData.confirmNewPassword) {
      const confirmValidation = getFieldValidation('confirmNewPassword', formData.confirmNewPassword);
      setFieldErrors(prev => ({
        ...prev,
        confirmNewPassword: confirmValidation.errorMessage
      }));
    }

    // Special case: validate new password when current password changes
    if (name === 'currentPassword' && touched.newPassword && formData.newPassword) {
      const newPasswordValidation = getFieldValidation('newPassword', formData.newPassword);
      setFieldErrors(prev => ({
        ...prev,
        newPassword: newPasswordValidation.errorMessage
      }));
    }
    
    // Clear general messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    validateField(name, value);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    // Mark all fields as touched
    const newTouched = {
      currentPassword: true,
      newPassword: true,
      confirmNewPassword: true
    };
    setTouched(newTouched);

    // Validate all fields
    let isFormValid = true;
    const newFieldErrors = {};
    
    Object.keys(formData).forEach(key => {
      const validation = getFieldValidation(key, formData[key]);
      newFieldErrors[key] = validation.errorMessage;
      if (!validation.isValid) {
        isFormValid = false;
      }
    });

    setFieldErrors(newFieldErrors);
    return isFormValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix the errors in the form before proceeding.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const passwordData = {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmNewPassword
      };

      const result = await changePassword(passwordData);
      
      if (result.success) {
        setSuccess('Password changed successfully!');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(result.error || 'Failed to change password');
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
          <h2 className={styles.modalTitle}>Change Password</h2>
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
          
          {success && (
            <div className={styles.successMessage}>
              {success}
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Current Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} />
              <div className={styles.passwordInputWrapper}>
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getInputClass('currentPassword')} ${styles.inputWithIcon}`}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => togglePasswordVisibility('current')}
                  disabled={isLoading}
                >
                  {showPasswords.current ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>
            {touched.currentPassword && fieldErrors.currentPassword && (
              <div className={styles.fieldError}>
                {fieldErrors.currentPassword}
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>New Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} />
              <div className={styles.passwordInputWrapper}>
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getInputClass('newPassword')} ${styles.inputWithIcon}`}
                  required
                  minLength={8}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => togglePasswordVisibility('new')}
                  disabled={isLoading}
                >
                  {showPasswords.new ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>
            {touched.newPassword && fieldErrors.newPassword && (
              <div className={styles.fieldError}>
                {fieldErrors.newPassword}
              </div>
            )}
            <small className={styles.passwordHint}>
              Must be at least 8 characters long and different from your current password
            </small>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Confirm New Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} />
              <div className={styles.passwordInputWrapper}>
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmNewPassword"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getInputClass('confirmNewPassword')} ${styles.inputWithIcon}`}
                  required
                  minLength={8}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => togglePasswordVisibility('confirm')}
                  disabled={isLoading}
                >
                  {showPasswords.confirm ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>
            {touched.confirmNewPassword && fieldErrors.confirmNewPassword && (
              <div className={styles.fieldError}>
                {fieldErrors.confirmNewPassword}
              </div>
            )}
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
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;