import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Auth.module.css';
import infomatiklogo from '../../assets/infomatik-logo.png';
import { UserRound, Phone, Lock, Eye, EyeOff, MapPin } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError, isAuthenticated } = useAuth();

  // State for form and UI
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signup');
  
  // Form data state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
    barangay: ''
  });

  // Form validation state
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    contactNumber: false,
    password: false,
    confirmPassword: false,
    barangay: false
  });

  // Phone number formatting state
  const [phoneNumberFocused, setPhoneNumberFocused] = useState(false);
  const [displayPhoneNumber, setDisplayPhoneNumber] = useState('');

  // Barangays list (from your PRD)
  const barangays = [
    'agnas', 'bacolod', 'bangkilingan', 'bantayan', 'baranghawon', 'basagan', 
    'basud', 'bognabong', 'bombon', 'bonot', 'san isidro', 'buang', 'buhian', 
    'cabagnan', 'cobo', 'comon', 'cormidal', 'divino rostro', 'fatima', 
    'guinobat', 'hacienda', 'magapo', 'mariroc', 'matagbac', 'oras', 'oson', 
    'panal', 'pawa', 'pinagbobong', 'quinale cabasan', 'quinastillojan', 'rawis', 
    'sagurong', 'salvacion', 'san antonio', 'san carlos', 'san juan', 'san lorenzo', 
    'san ramon', 'san roque', 'san vicente', 'santo cristo', 'sua-igot', 'tabiguian', 
    'tagas', 'tayhi', 'visita'
  ];

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear error when form data changes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData, clearError, error]);

  // Tab change handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'login') {
      navigate('/login');
    }
  };

  // Phone number formatting
  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    const limitedDigits = digits.substring(0, 10);
    
    if (limitedDigits.length <= 3) {
      return limitedDigits;
    } else if (limitedDigits.length <= 6) {
      return `${limitedDigits.substring(0, 3)} ${limitedDigits.substring(3)}`;
    } else {
      return `${limitedDigits.substring(0, 3)} ${limitedDigits.substring(3, 6)} ${limitedDigits.substring(6)}`;
    }
  };

  // Field validation - CORRECTED VERSION
  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return value.trim().length >= 2 && 
               value.trim().length <= 50 && 
               /^[a-zA-Z\s]+$/.test(value.trim());
      case 'contactNumber':
        const digits = value.replace(/\D/g, '');
        return digits.length === 10;
      case 'password':
        return value.length >= 8 && 
               /(?=.*[a-z])/.test(value) && 
               /(?=.*[A-Z])/.test(value) && 
               /(?=.*\d)/.test(value) && 
               /(?=.*[@$!%*?&])/.test(value);
      case 'confirmPassword':
        return value === formData.password && value.length > 0;
      case 'barangay':
        return value !== '';
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

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'contactNumber') {
      const digits = value.replace(/\D/g, '');
      
      if (digits.length <= 10) {
        setFormData({
          ...formData,
          [name]: digits
        });
        setDisplayPhoneNumber(formatPhoneNumber(digits));
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

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

  // ENHANCED SUBMIT HANDLER WITH DEBUGGING
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Debug logging
    console.log('=== REGISTRATION ATTEMPT ===');
    console.log('Current form data:', formData);
    
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

    console.log('Frontend validation result:', isFormValid);

    // Log individual field validations
    console.log('Field validations:', {
      firstName: validateField('firstName', formData.firstName),
      lastName: validateField('lastName', formData.lastName),
      contactNumber: validateField('contactNumber', formData.contactNumber),
      password: validateField('password', formData.password),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword),
      barangay: validateField('barangay', formData.barangay)
    });

    if (!isFormValid) {
      console.log('Frontend validation failed, not submitting');
      return;
    }

    // Prepare registration data
    const fullPhoneNumber = `+63${formData.contactNumber}`;
    const registrationData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      contactNumber: fullPhoneNumber,
      password: formData.password,
      confirmPassword: formData.password, // ✅ ADDED THIS LINE
      barangay: formData.barangay.toLowerCase()
    };
    console.log('Sending registration data:', registrationData);

    // Validate the prepared data against backend requirements
    console.log('Backend validation checks:', {
      firstNameValid: registrationData.firstName.length >= 2 && 
                     registrationData.firstName.length <= 50 &&
                     /^[a-zA-Z\s]+$/.test(registrationData.firstName),
      lastNameValid: registrationData.lastName.length >= 2 && 
                    registrationData.lastName.length <= 50 &&
                    /^[a-zA-Z\s]+$/.test(registrationData.lastName),
      contactValid: /^(\+639)\d{9}$/.test(registrationData.contactNumber),
      passwordValid: registrationData.password.length >= 8 &&
                    /(?=.*[a-z])/.test(registrationData.password) &&
                    /(?=.*[A-Z])/.test(registrationData.password) &&
                    /(?=.*\d)/.test(registrationData.password) &&
                    /(?=.*[@$!%*?&])/.test(registrationData.password),
      barangayValid: barangays.includes(registrationData.barangay)
    });

    // Call register function from context
    const result = await register(registrationData);
    
    if (result.success) {
      console.log('Registration successful');
    } else {
      console.log('Registration failed:', result.error);
    }
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

            {/* Error Display */}
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

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
                  onBlur={handleBlur}
                  className={`${getInputClass('lastName')} ${styles.inputWithIcon}`}
                  required
                  disabled={isLoading}
                  maxLength={50}
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
                  onBlur={handleBlur}
                  className={`${getInputClass('firstName')} ${styles.inputWithIcon}`}
                  required
                  disabled={isLoading}
                  maxLength={50}
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
                  onFocus={handlePhoneFocus}
                  className={`${getInputClass('contactNumber')} ${styles.phoneInputWithIcon} ${phoneNumberFocused ? styles.phoneInputFocused : ''}`}
                  inputMode="numeric"
                  maxLength="13"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className={styles.inputWrapper}>
                <MapPin className={styles.inputIcon}/>
                <select
                  name="barangay"
                  value={formData.barangay}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getInputClass('barangay')} ${styles.inputWithIcon} ${!formData.barangay ? styles.selectPlaceholder : ''}`}
                  required
                  disabled={isLoading}
                >
                  <option value="">Select Barangay</option>
                  {barangays.map((barangay) => (
                    <option key={barangay} value={barangay}>
                      {barangay.split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.passwordWrapper}>
                <Lock className={styles.inputIcon}/> 
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password (8+ chars, A-Z, a-z, 0-9, @$!%*?&)"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getInputClass('password')} ${styles.inputWithIcon}`}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
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
                  onBlur={handleBlur}
                  className={`${getInputClass('confirmPassword')} ${styles.inputWithIcon}`}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>

              <button 
                type="submit" 
                className={`${styles.submitButton} ${isLoading ? styles.submitButtonLoading : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Sign up'}
              </button>

              <p className={styles.authPrompt}>
                Already have an account? <Link to="/login" className={styles.authLink}>Login here</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;