import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Auth.module.css';
import infomatiklogo from '../../assets/infomatik-logo.png'

const Register = () => {
  const [activeTab, setActiveTab] = useState('signup');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
    barangay: ''
  });

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    contactNumber: false,
    password: false,
    confirmPassword: false,
    barangay: false
  });

  const [phoneNumberFocused, setPhoneNumberFocused] = useState(false);
  const [displayPhoneNumber, setDisplayPhoneNumber] = useState('');

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
      case 'firstName':
      case 'lastName':
        return value.trim().length >= 2;
      case 'contactNumber':
        // Check if it has exactly 10 digits (after +63)
        const digits = value.replace(/\D/g, '');
        return digits.length === 10;
      case 'barangay':
        return value !== '';
      case 'password':
        return value.length >= 6;
      case 'confirmPassword':
        return value === formData.password && value.length >= 6;
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
    setTouched({
      ...touched,
      [name]: true
    });
  };


    const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {
      firstName: true,
      lastName: true,
      contactNumber: true,
      password: true,
      confirmPassword: true,
      barangay: true
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

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

     // Convert phone number to full format for submission
    const fullPhoneNumber = `+63${formData.contactNumber}`;
    const submissionData = {
      ...formData,
      contactNumber: fullPhoneNumber
    };

    console.log('Registration attempt:', submissionData);
    // TODO: Implement actual registration logic
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.cardContainer}>
        <div className={styles.welcomeContainer}>
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
            <div className={styles.tabContainer}>
              <button 
                className={`${styles.tab} ${activeTab === 'login' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('login')}
              >
                Login
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'signup' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('signup')}
              >
                Sign up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass('lastName')}
                required
              />
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass('firstName')}
                required
              />

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

              <select
                name="barangay"
                value={formData.barangay}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${getInputClass('barangay')} ${formData.barangay === '' ? styles.selectPlaceholder : ''}`}
                required
              >
                <option value="" disabled hidden>Barangay</option>
                {barangays.map((barangay) => (
                  <option key={barangay} value={barangay}>
                    {barangay}
                  </option>
                ))}
              </select>

              <input
                type="password"
                name="password"
                placeholder="Password (min. 6 characters)"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass('password')}
                required
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass('confirmPassword')}
                required
              />

              <button type="submit" className={styles.submitButton}>
                Sign up
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
