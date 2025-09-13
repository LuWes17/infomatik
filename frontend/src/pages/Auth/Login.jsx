import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Auth.module.css';
import infomatiklogo from '../../assets/infomatik-logo.png';
import { Phone, Lock, Eye, EyeOff, X, AlertCircle } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading: authLoading, error, clearError, user } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  const [formData, setFormData] = useState({
    contactNumber: '',
    password: ''
  });

  const [touched, setTouched] = useState({
    contactNumber: false,
    password: false
  });

  const [fieldErrors, setFieldErrors] = useState({
    contactNumber: '',
    password: ''
  });

  const [phoneNumberFocused, setPhoneNumberFocused] = useState(false);
  const [displayPhoneNumber, setDisplayPhoneNumber] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Forgot Password States
  const [showForgotPasswordPopup, setShowForgotPasswordPopup] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState('phone'); // 'phone', 'verify'
  const [forgotPasswordData, setForgotPasswordData] = useState({
    contactNumber: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [forgotPasswordErrors, setForgotPasswordErrors] = useState({});
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [maskedNumber, setMaskedNumber] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);

  // Redirect based on user role when authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading && !loginSuccess) {
      // Redirect admin users to /admin, regular users to /profile
      if (user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/profile', { replace: true });
      }
    }
  }, [isAuthenticated, authLoading, navigate, location, loginSuccess, user]);

  // OTP Timer effect
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(timer => timer - 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Clear error when component mounts or form data changes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData, clearError]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'signup') {
      navigate('/register');
    }
  };

  // Format phone number for display
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

  // Validation functions
  const getFieldValidation = (name, value) => {
    let isValid = true;
    let errorMessage = '';

    switch (name) {
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
        } else if (value.length < 6) {
          isValid = false;
          errorMessage = 'Password must be at least 6 characters';
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
    
    const hasError = fieldErrors[fieldName] && fieldErrors[fieldName] !== '';
    return `${styles.input} ${hasError ? styles.inputInvalid : styles.inputValid}`;
  };

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

     if (touched[name]) {
        validateField(name, value);
      }

      if (error) {
      clearError();
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
    const newFieldErrors = {};
    let isFormValid = true;

    Object.keys(formData).forEach(field => {
      const validation = getFieldValidation(field, formData[field]);
      if (!validation.isValid) {
        newFieldErrors[field] = validation.errorMessage;
        isFormValid = false;
      }
    });

    setFieldErrors(newFieldErrors);
    setTouched({
      contactNumber: true,
      password: true
    });

    return isFormValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {
      contactNumber: true,
      password: true
    };
    setTouched(allTouched);

    if (!validateForm()) {
      showError('Please fix the errors in the form before proceeding.');
      return;
    }

    setIsLoading(true);

    // Convert phone number to full format for submission
    const phoneNumber = formData.contactNumber.length === 10 ? 
    `0${formData.contactNumber}` : formData.contactNumber;
    const loginData = {
      contactNumber: phoneNumber,
      password: formData.password
    };

    // Call login function from context
    const result = await login(loginData);
    
    if (result.success) {
      setLoginSuccess(true);
      // Navigation will happen automatically via useEffect due to isAuthenticated change
      console.log('Login successful');
      showSuccess('Welcome back! Redirecting to your dashboard...', { duration: 3000 });
    } else {
        console.error('Login failed:', result.error);
        showError('Invalid account details. Account does not exist')
        setLoginSuccess(false);
    }
    setIsLoading(false);
  };

  // Forgot Password Functions
  const resetForgotPasswordState = () => {
    setForgotPasswordStep('phone');
    setForgotPasswordData({
      contactNumber: '',
      otp: '',
      newPassword: '',
      confirmPassword: ''
    });
    setForgotPasswordErrors({});
    setForgotPasswordLoading(false);
    setMaskedNumber('');
    setOtpTimer(0);
  };

  const handleForgotPasswordClick = () => {
    resetForgotPasswordState();
    setShowForgotPasswordPopup(true);
  };

  const closeForgotPasswordPopup = () => {
    setShowForgotPasswordPopup(false);
    resetForgotPasswordState();
  };

  const validateForgotPasswordField = (name, value) => {
    let isValid = true;
    let errorMessage = '';

    switch (name) {
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
      case 'otp':
        if (!value) {
          isValid = false;
          errorMessage = 'Verification code is required';
        } else if (value.length !== 6) {
          isValid = false;
          errorMessage = 'Verification code must be 6 digits';
        }
        break;
      case 'newPassword':
        if (!value) {
          isValid = false;
          errorMessage = 'New password is required';
        } else if (value.length < 6) {
          isValid = false;
          errorMessage = 'Password must be at least 6 characters';
        }
        break;
      case 'confirmPassword':
        if (!value) {
          isValid = false;
          errorMessage = 'Please confirm your password';
        } else if (value !== forgotPasswordData.newPassword) {
          isValid = false;
          errorMessage = 'Passwords do not match';
        }
        break;
      default:
        break;
    }

    return { isValid, errorMessage };
  };

  const handleForgotPasswordChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'contactNumber') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 10) {
        setForgotPasswordData(prev => ({
          ...prev,
          [name]: digits
        }));
      }
    } else if (name === 'otp') {
      // Only allow digits for OTP
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 6) {
        setForgotPasswordData(prev => ({
          ...prev,
          [name]: digits
        }));
      }
    } else {
      setForgotPasswordData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error for this field
    if (forgotPasswordErrors[name]) {
      setForgotPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSendVerificationCode = async () => {
    setForgotPasswordLoading(true);
    setForgotPasswordErrors({});

    const validation = validateForgotPasswordField('contactNumber', forgotPasswordData.contactNumber);
    if (!validation.isValid) {
      setForgotPasswordErrors({ contactNumber: validation.errorMessage });
      setForgotPasswordLoading(false);
      return;
    }

    try {
      const phoneNumber = forgotPasswordData.contactNumber.length === 10 ? 
        `0${forgotPasswordData.contactNumber}` : forgotPasswordData.contactNumber;

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactNumber: phoneNumber
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMaskedNumber(data.data.maskedNumber);
        setForgotPasswordStep('verify');
        setOtpTimer(300); // 5 minutes
        showSuccess('Verification code sent successfully!');
      } else {
        setForgotPasswordErrors({ general: data.message || 'Failed to send verification code' });
        if (data.message && data.message.toLowerCase().includes('not found')) {
          showError('Phone number not found. Please check and try again.');
        }
      }
    } catch (error) {
      console.error('Send verification code error:', error);
      setForgotPasswordErrors({ general: 'Network error. Please try again.' });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleVerifyAndReset = async () => {
    setForgotPasswordLoading(true);
    setForgotPasswordErrors({});

    // Validate all reset fields
    const otpValidation = validateForgotPasswordField('otp', forgotPasswordData.otp);
    const passwordValidation = validateForgotPasswordField('newPassword', forgotPasswordData.newPassword);
    const confirmValidation = validateForgotPasswordField('confirmPassword', forgotPasswordData.confirmPassword);

    const errors = {};
    if (!otpValidation.isValid) errors.otp = otpValidation.errorMessage;
    if (!passwordValidation.isValid) errors.newPassword = passwordValidation.errorMessage;
    if (!confirmValidation.isValid) errors.confirmPassword = confirmValidation.errorMessage;

    if (Object.keys(errors).length > 0) {
      setForgotPasswordErrors(errors);
      setForgotPasswordLoading(false);
      return;
    }

    try {
      const phoneNumber = forgotPasswordData.contactNumber.length === 10 ? 
        `0${forgotPasswordData.contactNumber}` : forgotPasswordData.contactNumber;

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactNumber: phoneNumber,
          otp: forgotPasswordData.otp,
          newPassword: forgotPasswordData.newPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Password reset successfully! You can now login with your new password.');
        closeForgotPasswordPopup();
      } else {
        setForgotPasswordErrors({ general: data.message || 'Failed to reset password' });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setForgotPasswordErrors({ general: 'Network error. Please try again.' });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setForgotPasswordLoading(true);
    try {
      const phoneNumber = forgotPasswordData.contactNumber.length === 10 ? 
        `0${forgotPasswordData.contactNumber}` : forgotPasswordData.contactNumber;

      const response = await fetch('/api/auth/resend-forgot-password-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactNumber: phoneNumber
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOtpTimer(300); // Reset timer
        showSuccess('New verification code sent!');
      } else {
        showError(data.message || 'Failed to resend verification code');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      showError('Network error. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
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

             {/* Show loading state during successful login */}
            {loginSuccess && (
              <div className={styles.successMessage}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    border: '2px solid #16a34a', 
                    borderTop: '2px solid transparent', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite' 
                  }}></div>
                  Logging you in...
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && !loginSuccess && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
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
                  disabled={isLoading}
                />
              </div>
              {touched.contactNumber && fieldErrors.contactNumber && (
                <div className={styles.fieldError}>
                  {fieldErrors.contactNumber}
                </div>
              )}

              <div className={styles.passwordWrapper}>  
                <Lock className={styles.inputIcon} /> 
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
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
              {touched.password && fieldErrors.password && (
                <div className={styles.fieldError}>
                  {fieldErrors.password}
                </div>
              )}

              {/* Forgot Password Link */}
              <div style={{ textAlign: 'left', marginBottom: '1rem', marginLeft: '0.8rem', marginTop: '-0.5rem'}}>
                <button
                  type="button"
                  onClick={handleForgotPasswordClick}
                  className={styles.forgotPasswordLink}
                  disabled={isLoading}
                >
                  Forgot Password?
                </button>
              </div>

              <button 
                type="submit" 
                className={`${styles.submitButton} ${isLoading ? styles.submitButtonLoading : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>

              <p className={styles.authPrompt}>
                Don't have an account? <Link to="/register" className={styles.authLink}>Register here</Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Forgot Password Popup */}
      {showForgotPasswordPopup && (
        <div className={styles.modalOverlay}>
          <div className={styles.forgotPasswordModal}>
            <div className={styles.modalHeader}>
              <h2>Reset Password</h2>
              <button
                className={styles.closeButton}
                onClick={closeForgotPasswordPopup}
                disabled={forgotPasswordLoading}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalContent}>
              {forgotPasswordErrors.general && (
                <div className={styles.errorMessage}>
                  <AlertCircle size={16} />
                  {forgotPasswordErrors.general}
                </div>
              )}

              {forgotPasswordStep === 'phone' && (
                <div className={styles.forgotPasswordStep}>
                  <h3>Enter your phone number</h3>
                  <p>We'll send you a verification code to reset your password.</p>
                  
                  <div className={styles.phoneInputWrapper}>
                    <Phone className={styles.inputIcon} />
                    <span className={styles.phonePrefix}>+63</span>
                    <input
                      type="tel"
                      name="contactNumber"
                      placeholder="Contact Number"
                      value={formatPhoneNumber(forgotPasswordData.contactNumber)}
                      onChange={handleForgotPasswordChange}
                      className={`${styles.input} ${styles.phoneInputWithIcon} ${forgotPasswordErrors.contactNumber ? styles.inputInvalid : ''}`}
                      inputMode="numeric"
                      maxLength="12"
                      disabled={forgotPasswordLoading}
                    />
                  </div>
                  {forgotPasswordErrors.contactNumber && (
                    <div className={styles.fieldError}>
                      {forgotPasswordErrors.contactNumber}
                    </div>
                  )}

                  <button
                    className={styles.submitButton}
                    onClick={handleSendVerificationCode}
                    disabled={forgotPasswordLoading}
                  >
                    {forgotPasswordLoading ? 'Sending...' : 'Send Verification Code'}
                  </button>
                </div>
              )}

              {forgotPasswordStep === 'verify' && (
                <div className={styles.forgotPasswordStep}>
                  <h3>Enter verification code</h3>
                  <p>
                    Enter the 6-digit code sent to <strong>{maskedNumber}</strong>
                  </p>

                  <div className={styles.otpSection}>
                    <input
                      type="text"
                      name="otp"
                      placeholder="000000"
                      value={forgotPasswordData.otp}
                      onChange={handleForgotPasswordChange}
                      className={`${styles.input} ${styles.otpInput} ${forgotPasswordErrors.otp ? styles.inputInvalid : ''}`}
                      inputMode="numeric"
                      maxLength="6"
                      disabled={forgotPasswordLoading}
                    />
                    {forgotPasswordErrors.otp && (
                      <div className={styles.fieldError}>
                        {forgotPasswordErrors.otp}
                      </div>
                    )}

                    {otpTimer > 0 ? (
                      <p className={styles.timer}>
                        Code expires in {formatTime(otpTimer)}
                      </p>
                    ) : (
                      <button
                        type="button"
                        className={styles.resendButton}
                        onClick={handleResendOTP}
                        disabled={forgotPasswordLoading}
                      >
                        Resend Code
                      </button>
                    )}
                  </div>

                  <div className={styles.passwordSection}>
                    <h4>Set new password</h4>
                    
                    <div className={styles.passwordWrapper}>
                      <Lock className={styles.inputIcon} />
                      <input
                        type="password"
                        name="newPassword"
                        placeholder="New Password"
                        value={forgotPasswordData.newPassword}
                        onChange={handleForgotPasswordChange}
                        className={`${styles.input} ${styles.inputWithIcon} ${forgotPasswordErrors.newPassword ? styles.inputInvalid : ''}`}
                        disabled={forgotPasswordLoading}
                      />
                    </div>
                    {forgotPasswordErrors.newPassword && (
                      <div className={styles.fieldError}>
                        {forgotPasswordErrors.newPassword}
                      </div>
                    )}

                    <div className={styles.passwordWrapper}>
                      <Lock className={styles.inputIcon} />
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm New Password"
                        value={forgotPasswordData.confirmPassword}
                        onChange={handleForgotPasswordChange}
                        className={`${styles.input} ${styles.inputWithIcon} ${forgotPasswordErrors.confirmPassword ? styles.inputInvalid : ''}`}
                        disabled={forgotPasswordLoading}
                      />
                    </div>
                    {forgotPasswordErrors.confirmPassword && (
                      <div className={styles.fieldError}>
                        {forgotPasswordErrors.confirmPassword}
                      </div>
                    )}
                  </div>

                  <button
                    className={styles.submitButton}
                    onClick={handleVerifyAndReset}
                    disabled={forgotPasswordLoading}
                  >
                    {forgotPasswordLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;