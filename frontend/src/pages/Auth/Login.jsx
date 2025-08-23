import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Auth.module.css';
import infomatiklogo from '../../assets/infomatik-logo.png'

const Login = () => {
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    contactNumber: '',
    password: ''
  });

  const [touched, setTouched] = useState({
    contactNumber: false,
    password: false
  });

  const [phoneNumberFocused, setPhoneNumberFocused] = useState(false);
  const [displayPhoneNumber, setDisplayPhoneNumber] = useState('');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'signup') {
      navigate('/register');
    }
  };

  // Format phone number for display
  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 10 digits (after +63)
    const limitedDigits = digits.substring(0, 10);
    
    // Format as XXX XXX XXXX
    if (limitedDigits.length <= 3) {
      return limitedDigits;
    } else if (limitedDigits.length <= 6) {
      return `${limitedDigits.substring(0, 3)} ${limitedDigits.substring(3)}`;
    } else {
      return `${limitedDigits.substring(0, 3)} ${limitedDigits.substring(3, 6)} ${limitedDigits.substring(6)}`;
    }
  };

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'contactNumber':
        // Check if it has exactly 10 digits (after +63)
        const digits = value.replace(/\D/g, '');
        return digits.length === 10;
      case 'password':
        return value.length >= 6;
      default:
        return true;
    }
  };

  const getInputClass = (fieldName) => {
    if (!touched[fieldName]) {
      return styles.input;
    }
    
    const isValid = validateField(fieldName, formData[fieldName]);
    return `${styles.input} ${isValid ? styles.inputValid : styles.inputInvalid}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'contactNumber') {
      // Store the raw digits
      const digits = value.replace(/\D/g, '');
      setFormData({
        ...formData,
        [name]: digits
      });
      
      // Update display format
      setDisplayPhoneNumber(formatPhoneNumber(digits));
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    // Mark field as touched when user starts typing
    if (!touched[name]) {
      setTouched({
        ...touched,
        [name]: true
      });
    }
  };

  const handlePhoneFocus = () => {
    setPhoneNumberFocused(true);
    if (formData.contactNumber === '') {
      setDisplayPhoneNumber('');
    } else {
      setDisplayPhoneNumber(formatPhoneNumber(formData.contactNumber));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    
    if (name === 'contactNumber') {
      setPhoneNumberFocused(false);
    }
    
    setTouched({
      ...touched,
      [name]: true
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {
      contactNumber: true,
      password: true
    };
    setTouched(allTouched);

    // Check if all fields are valid
    const isFormValid = Object.keys(formData).every(field => 
      validateField(field, formData[field])
    );

    if (!isFormValid) {
      alert('Please fill in all fields correctly');
      return;
    }

    // Convert phone number to full format for submission
    const fullPhoneNumber = `+63${formData.contactNumber}`;
    const submissionData = {
      ...formData,
      contactNumber: fullPhoneNumber
    };

    console.log('Login attempt:', submissionData);
    // TODO: Implement actual login logic
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.cardContainer}>
        <div className={styles.welcomeContainer}>
          <div className={styles.blobShape}></div> 
          <div className={styles.imageContainer}>
            <img 
              src={infomatiklogo} 
              alt="infomatik" 
              className={styles.logoImg}
            />
          </div>
          <div className={styles.textWelcomeContainer}>
            Ang inyong sentralisadong plataporma para sa komunidad galing kay Konsehal Roy Bon.
          </div>
        </div>
        <div className={styles.formContainer}>
          <div className={styles.formContent}>
            {/* Tab Navigation */}
            <div className={styles.tabContainerLogin}>
              <button 
                className={`${styles.tab} ${activeTab === 'login' ? styles.activeTab : ''}`}
                onClick={() => handleTabChange('login')}
              >
                Login
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'signup' ? styles.activeTab : ''}`}
                onClick={() => handleTabChange('signup')}
              >
                Sign up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.phoneInputWrapper}>
                {phoneNumberFocused && (
                  <span className={styles.phonePrefix}>+63</span>
                )}
                <input
                  type="tel"
                  name="contactNumber"
                  placeholder={phoneNumberFocused ? "123 456 7890" : "Contact Number"}
                  value={phoneNumberFocused ? displayPhoneNumber : (formData.contactNumber ? `09${formData.contactNumber.substring(1)}` : '')}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={handlePhoneFocus}
                  className={`${getInputClass('contactNumber')} ${phoneNumberFocused ? styles.phoneInputFocused : ''}`}
                  required
                />
              </div>

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass('password')}
                required
              />

              <button type="submit" className={styles.submitButton}>
                Login
              </button>

              <p className={styles.authPrompt}>
                Don't have an account? <Link to="/register" className={styles.authLink}>Register here</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;