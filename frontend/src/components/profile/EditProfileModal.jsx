// frontend/src/components/profile/EditProfileModal.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X } from 'lucide-react';
import styles from './ProfileModal.module.css';

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
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    barangay: user?.barangay || '',
    bio: user?.profile?.bio || '',
    address: user?.profile?.address || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          onClose();
        }, 1500);
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
          
          {success && (
            <div className={styles.successMessage}>
              {success}
            </div>
          )}

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={styles.formInput}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={styles.formInput}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Barangay</label>
            <select
              name="barangay"
              value={formData.barangay}
              onChange={handleChange}
              className={styles.formSelect}
              required
            >
              <option value="">Select your barangay</option>
              {BARANGAYS.map(barangay => (
                <option key={barangay} value={barangay}>
                  {barangay.charAt(0).toUpperCase() + barangay.slice(1)}
                </option>
              ))}
            </select>
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
              {isLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;