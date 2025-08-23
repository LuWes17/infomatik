import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Auth.module.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
    barangay: ''
  });

  const barangays = [
    'Agnas', 'Bacolod', 'Bangkilingan', 'Bantayan', 'Baranghawon', 'Basagan', 
    'Basud', 'Bognabong', 'Bombon', 'Bonot', 'San Isidro', 'Buang', 'Buhian',
    'Cabagnan', 'Cobo', 'Comon', 'Cormidal', 'Divino Rostro', 'Fatima',
    'Guinobat', 'Hacienda', 'Magapo', 'Mariroc', 'Matagbac', 'Oras', 'Oson',
    'Panal', 'Pawa', 'Pinagbobong', 'Quinale Cabasan', 'Quinastillojan',
    'Rawis', 'Sagurong', 'Salvacion', 'San Antonio', 'San Carlos', 'San Juan',
    'San Lorenzo', 'San Ramon', 'San Roque', 'San Vicente', 'Santo Cristo',
    'Sua-igot', 'Tabiguian', 'Tagas', 'Tayhi', 'Visita'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    console.log('Registration attempt:', formData);
    // TODO: Implement actual registration logic
  };

  return (
    <div className={styles.authContainer}>
      <div className={`card ${styles.authCard}`}>
        <div className="card-header">
          <h2>Create Your Account</h2>
          <p>Register to access city services and submit applications</p>
        </div>
        
        <div className="card-body">
          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  required
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  required
                  className={styles.formInput}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="contactNumber">Contact Number</label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="Enter your contact number"
                required
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="barangay">Barangay</label>
              <select
                id="barangay"
                name="barangay"
                value={formData.barangay}
                onChange={handleChange}
                required
                className={styles.formInput}
              >
                <option value="">Select your barangay</option>
                {barangays.map((barangay) => (
                  <option key={barangay} value={barangay}>
                    {barangay}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  className={styles.formInput}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{width: '100%'}}>
              Create Account
            </button>
          </form>
        </div>

        <div className="card-footer">
          <p>Already have an account? <Link to="/login" className={styles.authLink}>Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
