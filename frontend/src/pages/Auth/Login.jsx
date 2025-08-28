import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Auth.module.css';
import infomatiklogo from '../../assets/infomatik-logo.png';
import { Phone, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated, user } = useAuth();

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

  // Redirect based on user role when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect admin users to /admin, regular users to /profile
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/profile', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

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
    const limitedDigits = digits.substring(0, 10);
    
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

  const handleSubmit = async (e) => {
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
      return;
    }

    // Convert phone number to full format for submission
    const fullPhoneNumber = `+63${formData.contactNumber}`;
    const loginData = {
      contactNumber: fullPhoneNumber,
      password: formData.password
    };

    // Call login function from context
    const result = await login(loginData);
    
    if (result.success) {
      // Navigation will happen automatically via useEffect due to isAuthenticated change
      console.log('Login successful');
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

            {/* Error Display */}
            {error && (
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
                  maxLength="13"
                  required
                  disabled={isLoading}
                />
              </div>

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