import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Auth.module.css';
import infomatiklogo from '../../assets/infomatik-logo.png';
import { UserRound, Phone, Lock, Eye, EyeOff, MapPin, CheckCircle, ChevronDown } from 'lucide-react';
import OTPVerificationPopup from '../../components/OTP/OTPVerificationPopup';

const Register = () => {
  const navigate = useNavigate();
  const { verifyOTP, isAuthenticated, isLoading: authLoading, user, error, clearError } = useAuth();

  // State for form and UI
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signup');
  const [showOTPPopup, setShowOTPPopup] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [maskedNumber, setMaskedNumber] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [barangayDropdownOpen, setBarangayDropdownOpen] = useState(false);
  const barangayDropdownRef = useRef(null);
  
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      console.log('User is authenticated, redirecting to profile:', user);
      navigate('/profile', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, user]);

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

  const [fieldErrors, setFieldErrors] = useState({
    firstName: '',
    lastName: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
    barangay: ''
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

  useEffect(() => {
    console.log('=== REGISTER STATE DEBUG ===');
    console.log('showOTPPopup:', showOTPPopup);
    console.log('otpError:', otpError);
    console.log('otpLoading:', otpLoading);
    console.log('registrationSuccess:', registrationSuccess);
    console.log('============================');
  }, [showOTPPopup, otpError, otpLoading, registrationSuccess]);

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
    const limitedDigits = digits.substring(0, 10); // Allow up to 10 digits
    
    if (limitedDigits.length <= 3) {
      return limitedDigits; // "123"
    } else if (limitedDigits.length <= 6) {
      return `${limitedDigits.substring(0, 3)} ${limitedDigits.substring(3)}`; // "123 456"
    } else {
      return `${limitedDigits.substring(0, 3)} ${limitedDigits.substring(3, 6)} ${limitedDigits.substring(6)}`; // "123 456 7890"
    }
  };

  // Field validation - CORRECTED VERSION
  const getFieldValidation = (name, value) => {
    let isValid = true;
    let errorMessage = '';

    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) {
          isValid = false;
          errorMessage = `${name === 'firstName' ? 'First' : 'Last'} name is required`;
        } else if (value.trim().length < 2) {
          isValid = false;
          errorMessage = `${name === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`;
        } else if (value.trim().length > 50) {
          isValid = false;
          errorMessage = `${name === 'firstName' ? 'First' : 'Last'} name must be less than 50 characters`;
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          isValid = false;
          errorMessage = `${name === 'firstName' ? 'First' : 'Last'} name can only contain letters and spaces`;
        }
        break;
      
      case 'contactNumber':
        const digits = value.replace(/\D/g, '');
        if (!digits) {
          isValid = false;
          errorMessage = 'Contact number is required';
        } else if (digits.length !== 10) {
          isValid = false;
          errorMessage = 'Contact number must be exactly 10 digits';
        }
        break;
      
      case 'password':
        if (!value) {
          isValid = false;
          errorMessage = 'Password is required';
        } else if (value.length < 8) {
          isValid = false;
          errorMessage = 'Password must be at least 8 characters';
        }
        break;
      
      case 'confirmPassword':
        if (!value) {
          isValid = false;
          errorMessage = 'Please confirm your password';
        } else if (value !== formData.password) {
          isValid = false;
          errorMessage = 'Passwords do not match';
        }
        break;
      
      case 'barangay':
        if (!value) {
          isValid = false;
          errorMessage = 'Please select a barangay';
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
      return styles.input;
    }
    
    // Use current field error state instead of calling validation
    const hasError = fieldErrors[fieldName] && fieldErrors[fieldName] !== '';
    return `${styles.input} ${hasError ? styles.inputInvalid : styles.inputValid}`;
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'contactNumber') {
      const digits = value.replace(/\D/g, '');
      const limitedDigits = digits.substring(0, 10);
      const formattedValue = formatPhoneNumber(limitedDigits);
      
      setDisplayPhoneNumber(formattedValue);
      setFormData(prev => ({
        ...prev,
        [name]: limitedDigits
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // *** NEW: Validate field on change if already touched ***
    if (touched[name]) {
        validateField(name, value);
    }
    
    clearError();
  };

  useEffect(() => {
    if (touched.confirmPassword && formData.confirmPassword) {
      const validation = getFieldValidation('confirmPassword', formData.confirmPassword);
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: validation.errorMessage
      }));
    }
  }, [formData.password, formData.confirmPassword, touched.confirmPassword]);


  const handlePhoneFocus = () => {
    setPhoneNumberFocused(true);
    if (formData.contactNumber === '') {
      setDisplayPhoneNumber('');
    } else {
      setDisplayPhoneNumber(formatPhoneNumber(formData.contactNumber));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    if (name === 'contactNumber') {
      setPhoneNumberFocused(false);
    }
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const valueToValidate = name === 'contactNumber' ? value.replace(/\D/g, '').substring(0, 10) : value;
    validateField(name, valueToValidate);
  };


   const validateForm = () => {
    const newTouched = {
      firstName: true,
      lastName: true,
      contactNumber: true,
      password: true,
      confirmPassword: true,
      barangay: true
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

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {

      const phoneNumber = formData.contactNumber.length === 10 ? 
      `0${formData.contactNumber}` : formData.contactNumber;
      
      console.log('Sending phone number:', phoneNumber); // Debug log
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          contactNumber: phoneNumber,
          password: formData.password,
          barangay: formData.barangay
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMaskedNumber(data.data.maskedNumber);
        setShowOTPPopup(true);
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          const newFieldErrors = { ...fieldErrors };
          data.errors.forEach(error => {
            if (error.field && error.message) {
              newFieldErrors[error.field] = error.message;
              setTouched(prev => ({ ...prev, [error.field]: true }));
            }
          });
          setFieldErrors(newFieldErrors);
        } else {
          setOtpError(data.message || 'Failed to send OTP');
        }
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      setOtpError('Network error. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
    console.log('🔄 Starting OTP verification...');
    setOtpLoading(true);
    
    try {

      const phoneNumber = formData.contactNumber.length === 10 ? 
      `0${formData.contactNumber}` : formData.contactNumber;
      
      console.log('Verifying with phone number:', phoneNumber);

      const result = await verifyOTP(phoneNumber, otp);

      console.log('OTP verification result:', result);

      if (result.success) {
        console.log('OTP verification successful, user data:', result.data.user);
        setShowOTPPopup(false);
        setRegistrationSuccess(true);
        setOtpError('');
        
        // The AuthContext should now have isAuthenticated = true
        // The useEffect above will handle the redirect automatically
        console.log('Registration successful, waiting for auth state update...');
        
        // Backup redirect in case the useEffect doesn't trigger
        setTimeout(() => {
          if (!isAuthenticated) {
            console.log('Backup redirect triggered');
            navigate('/profile', { replace: true });
          }
        }, 2000);

      } else {
        setOtpError(result.error || 'Invalid OTP');
        console.log('❌ OTP FAILED - Setting error:', result.error);
        console.log('❌ showOTPPopup should still be:', showOTPPopup);
        console.log('❌ otpError now set to:', result.error || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      setOtpError('Network error. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

// NEW FUNCTION - Resend OTP handler
const handleResendOTP = async () => {
  setOtpLoading(true);
  setOtpError('');

  try {
    const response = await fetch('/api/auth/resend-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contactNumber: `09${formData.contactNumber}`
      }),
    });

    const data = await response.json();

    if (data.success) {
      setMaskedNumber(data.data.maskedNumber);
    } else {
      setOtpError(data.message || 'Failed to resend OTP');
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    setOtpError('Network error. Please try again.');
  } finally {
    setOtpLoading(false);
  }
};

// Handle barangay dropdown
const toggleBarangayDropdown = () => {
  setBarangayDropdownOpen(!barangayDropdownOpen);
};

const handleBarangayChange = (barangay) => {
  setFormData({ ...formData, barangay });
  setBarangayDropdownOpen(false);
  if (touched.barangay) {
    validateField('barangay', barangay);
  }
};

const formatBarangayName = (barangay) => {
  return barangay.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};


const getDropdownButtonClass = () => {
  let classes = styles.customDropdownButton;
  
  if (barangayDropdownOpen) {
    classes += ` ${styles.active}`;
  }
  
  if (!formData?.barangay) {
    classes += ` ${styles.placeholder}`;
  }
  
  if (touched?.barangay) {
    if (error?.barangay) {
      classes += ` ${styles.error}`;
    } else if (formData?.barangay) { // Only add success class if barangay is selected
      classes += ` ${styles.success}`;
    }
  }
  
  return classes;
};

// NEW FUNCTION - Close OTP popup
  const handleCloseOTPPopup = () => {
    setShowOTPPopup(false);
    setOtpError('');
  };

  if (registrationSuccess) {
  return (
    <div className={styles.container}>
      <div className={styles.authWrapper}>
        <div className={styles.successContainer}>
          <div className={styles.successContent}>
            <CheckCircle className={styles.successIcon} />
            <h2 className={styles.successTitle}>Account Created Successfully!</h2>
            <p className={styles.successMessage}>
              Your account has been verified and created. Redirecting to your profile...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


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
            {(error) && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSendOTP} className={styles.form}>
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
                  disabled={authLoading}
                  maxLength={50}
                />
              </div>
               {/* *** NEW: Error message below field *** */}
              {touched.lastName && fieldErrors.lastName && (
                <div className={styles.fieldError}>
                  {fieldErrors.lastName}
                </div>
              )}

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
                  disabled={authLoading}
                  maxLength={50}
                />
              </div>
              {/* *** NEW: Error message below field *** */}
              {touched.firstName && fieldErrors.firstName && (
                <div className={styles.fieldError}>
                  {fieldErrors.firstName}
                </div>
              )}

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
                  maxLength="12"
                  required
                  disabled={authLoading}
                />
              </div>
              {/* *** NEW: Error message below field *** */}
              {touched.contactNumber && fieldErrors.contactNumber && (
                <div className={styles.fieldError}>
                  {fieldErrors.contactNumber}
                </div>
              )}

              <div className={styles.customDropdown} ref={barangayDropdownRef}>
                <MapPin className={styles.inputIcon} />
                <button
                  type="button"
                  onClick={toggleBarangayDropdown}
                  className={getDropdownButtonClass()}
                  disabled={authLoading}
                  onBlur={() => {
                    if (!barangayDropdownOpen) {
                      setTouched(prev => ({ ...prev, barangay: true }));
                      validateField('barangay', formData.barangay);
                    }
                  }}
                >
                 <span>
                    {formData?.barangay ? formatBarangayName(formData.barangay) : 'Select Barangay'}
                  </span>
                  <ChevronDown 
                    size={16} 
                    className={`${styles.dropdownArrow} ${barangayDropdownOpen ? styles.open : ''}`} 
                  />
                </button>
                <div className={`${styles.customDropdownContent} ${barangayDropdownOpen ? styles.show : ''}`}>
                  {barangays.map((barangay) => (
                    <button
                      key={barangay}
                      type="button"
                      onClick={() => handleBarangayChange(barangay)}
                      className={`${styles.customDropdownItem} ${formData?.barangay === barangay ? styles.active : ''}`}
                    >
                      {formatBarangayName(barangay)}
                    </button>
                  ))}
                </div>
              </div>
              {touched.barangay && fieldErrors.barangay && (
                <div className={styles.fieldError}>
                  {fieldErrors.barangay}
                </div>
              )}

              <div className={styles.passwordWrapper}>
                <Lock className={styles.inputIcon}/> 
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password (min. 8 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getInputClass('password')} ${styles.inputWithIcon}`}
                  required
                  disabled={authLoading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={authLoading}
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
              {/* *** NEW: Error message below field *** */}
              {touched.password && fieldErrors.password && (
                <div className={styles.fieldError}>
                  {fieldErrors.password}
                </div>
              )}

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
                  disabled={authLoading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  disabled={authLoading}
                >
                  {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div> 
              {touched.confirmPassword && fieldErrors.confirmPassword && (
                <div className={styles.fieldError}>
                  {fieldErrors.confirmPassword}
                </div>
              )}

              <button 
                type="submit" 
                className={`${styles.submitButton} ${(authLoading || otpLoading) ? styles.submitButtonLoading : ''}`}
                disabled={authLoading || otpLoading}
              >
                {otpLoading ? 'Sending OTP...' : 'Send Verification Code'}
              </button>

              <p className={styles.authPrompt}>
                Already have an account? <Link to="/login" className={styles.authLink}>Login here</Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      <OTPVerificationPopup
        isOpen={showOTPPopup}
        onClose={handleCloseOTPPopup}
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
        maskedNumber={maskedNumber}
        isLoading={otpLoading}
        error={otpError}
      />
    </div>
  );
};

export default Register;