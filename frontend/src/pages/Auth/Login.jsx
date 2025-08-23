import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Auth.module.css';

const Login = () => {
  const [formData, setFormData] = useState({
    contactNumber: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', formData);
    // TODO: Implement actual login logic
  };

  return (
    <div className={styles.authContainer}>
      <div className={`card ${styles.authCard}`}>
        <div className="card-header">
          <h2>Login to Your Account</h2>
          <p>Access your citizen services and applications</p>
        </div>
        
        <div className="card-body">
          <form onSubmit={handleSubmit} className={styles.authForm}>
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

            <button type="submit" className="btn btn-primary btn-lg" style={{width: '100%'}}>
              Login
            </button>
          </form>
        </div>

        <div className="card-footer">
          <p>Don't have an account? <Link to="/register" className={styles.authLink}>Register here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;