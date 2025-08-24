import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Auth.module.css';
import infomatiklogo from '../../assets/infomatik-logo.png'
import { UserRound, Phone, Building2, ChevronDown, Lock, Eye, EyeOff} from 'lucide-react';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signup');
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  
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

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'login') {
      navigate('/login');
    }
  };

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
      
      // Limit to 10 digits maximum
      if (digits.length <= 10) {
        setFormData({
          ...formData,
          [name]: digits
        });
        // Always update display format when typing
        setDisplayPhoneNumber(formatPhoneNumber(digits));
      }
      // If digits.length > 10, do nothing (ignore the input)
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

  const handlePhoneBlur = () => {
    // Keep the focused state for better UX on mobile
    if (!isMobile) {
      setPhoneNumberFocused(false);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });

    // Handle phone blur separately
    if (name === 'contactNumber') {
      handlePhoneBlur();
    }
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

  // Prevent zoom on iOS when focusing inputs
  const handleInputFocus = (e) => {
    if (isMobile && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
      const viewport = document.querySelector('meta[name=viewport]');
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
    }
  };

  const handleInputBlur = (e) => {
    if (isMobile && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
      const viewport = document.querySelector('meta[name=viewport]');
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
    }
    handleBlur(e);
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
            <div className={styles.tabContainer}>
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
              <div className={styles.inputWrapper}>
                <UserRound className={styles.inputIcon}/>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className={`${getInputClass('lastName')} ${styles.inputWithIcon}`}
                  required
                />
              </div>
              
              <div className={styles.inputWrapper}>
                <UserRound className={styles.inputIcon}/>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className={`${getInputClass('firstName')} ${styles.inputWithIcon}`}
                  required
                />
              </div>

              <div className={styles.phoneInputWrapper}>
                <Phone className={styles.inputIcon}/>               
                <span className={styles.phonePrefix}>+63</span>
                <input
                  type="tel"
                  name="contactNumber"
                  placeholder={phoneNumberFocused ? "123 456 7890" : "Contact Number"}
                  value={displayPhoneNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={(e) => {
                    handleInputFocus(e);
                    handlePhoneFocus();
                  }}
                  className={`${getInputClass('contactNumber')} ${styles.phoneInputWithIcon} ${phoneNumberFocused ? styles.phoneInputFocused : ''}`}
                  inputMode="numeric"
                  maxLength="13"
                  required
                />
              </div>

              <div className={styles.selectWrapper}>
                <Building2 className={styles.inputIcon}/>
                <select
                  name="barangay"
                  value={formData.barangay}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className={`${getInputClass('barangay')} ${formData.barangay === '' ? styles.selectPlaceholder : ''} ${styles.customSelect} ${styles.inputWithIcon}`}
                  required
                >
                  <option value="" disabled hidden>Barangay</option>
                  {barangays.map((barangay) => (
                    <option key={barangay} value={barangay}>
                      {barangay}
                    </option>
                  ))}
                </select>
                <ChevronDown className={styles.selectArrow} size={16} />
              </div>

              <div className={styles.passwordWrapper}>  
                <Lock className={styles.inputIcon} /> 
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password (min. 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className={`${getInputClass('password')} ${styles.inputWithIcon}`}
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>

              <div className={styles.passwordWrapper}>
                <Lock className={styles.inputIcon}/> 
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className={`${getInputClass('confirmPassword')} ${styles.inputWithIcon}`}
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>

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