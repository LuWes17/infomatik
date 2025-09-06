import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Auth.module.css';
import infomatiklogo from '../../assets/infomatik-logo.png';
import { Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading: authLoading, error, clearError } = useAuth();
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

  // Redirect based on user role when authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading && !loginSuccess) {
      // Redirect admin users to /admin, regular users to /profile
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/profile', { replace: true });
      }
    }
  }, [isAuthenticated, authLoading, navigate, location, loginSuccess]);

  // Clear error when component mounts or form data changes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData]);

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

      setTimeout(() => {
          const from = location.state?.from?.pathname || '/profile';
          navigate(from, { replace: true });
        }, 2000); 
    } else {
        console.error('Login failed:', result.error);
        showError('Invalid account details. Account does not exist')

        setLoginSuccess(false);
    }
    // Error handling is managed by the context and displayed in UI
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

             {/* *** FIXED: Show loading state during successful login *** */}
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
    </div>
  );
};

export default Login;