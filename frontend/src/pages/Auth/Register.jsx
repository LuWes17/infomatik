import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Auth.module.css';
import infomatiklogo from '../../assets/infomatik-logo.png';
import { UserRound, Phone, Lock, Eye, EyeOff, MapPin, CheckCircle } from 'lucide-react';
import OTPVerificationPopup from '../../components/OTP/OTPVerificationPopup';

const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError, isAuthenticated } = useAuth();

  // State for form and UI
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signup');
  const [showOTPPopup, setShowOTPPopup] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [maskedNumber, setMaskedNumber] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
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
      navigate('/profile', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
  if (error) {
    clearError();
  }
  if (otpError) {
    setOtpError('');
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
  // Limit to exactly 10 digits (will become 11 with '09' prefix)
  const limitedDigits = digits.substring(0, 9);
  
  if (limitedDigits.length <= 2) {
    return limitedDigits; // "12"
    } else if (limitedDigits.length <= 5) {
      return `${limitedDigits.substring(0, 2)} ${limitedDigits.substring(2)}`; // "12 345"
    } else {
      return `${limitedDigits.substring(0, 2)} ${limitedDigits.substring(2, 5)} ${limitedDigits.substring(5)}`; // "12 345 6789"
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
        return digits.length === 9;
      case 'password':
      // UPDATED: Only requires 8 characters minimum
        return value.length >= 8;
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
      const limitedDigits = digits.substring(0, 10);
      const formattedValue = formatPhoneNumber(limitedDigits);
      
      setDisplayPhoneNumber(formattedValue);
      setFormData(prev => ({
        ...prev,
        [name]: limitedDigits // Store only 10 digits
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    clearError();
    setOtpError('');
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

    return Object.keys(formData).every(key => 
      validateField(key, formData[key])
    );
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {

      const phoneNumber = formData.contactNumber.length === 9 ? 
      `09${formData.contactNumber}` : formData.contactNumber;
      
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
        setOtpError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      setOtpError('Network error. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
  setOtpLoading(true);
  setOtpError('');

  try {

     const phoneNumber = formData.contactNumber.length === 9 ? 
    `09${formData.contactNumber}` : formData.contactNumber;
    
    console.log('Verifying with phone number:', phoneNumber);

    const response = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contactNumber: phoneNumber,
        otp: otp
      }),
    });

    const data = await response.json();

    if (data.success) {
      setShowOTPPopup(false);
      setRegistrationSuccess(true);
      
      // Store auth tokens
      if (data.token && data.refreshToken) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      // Redirect after showing success message
      setTimeout(() => {
        navigate('/profile', { replace: true });
      }, 2000);
    } else {
      setOtpError(data.message || 'Invalid OTP');
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
              Your account has been verified and created. You will be redirected to your profile shortly.
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
            {(error || otpError) && (
              <div className={styles.errorMessage}>
                {error || otpError}
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
                <span className={styles.phonePrefix}>+639</span>
                <input
                  type="tel"
                  name="contactNumber"
                  placeholder={phoneNumberFocused ? "12 345 6789" : "Contact Number"}
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
                  placeholder="Password (min. 8 characters)"
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
                className={`${styles.submitButton} ${(isLoading || otpLoading) ? styles.submitButtonLoading : ''}`}
                disabled={isLoading || otpLoading}
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