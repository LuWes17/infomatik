// frontend/src/components/OTP/OTPVerificationPopup.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, RefreshCw, Shield } from 'lucide-react';
import styles from './OTPVerificationPopup.module.css';

const OTPVerificationPopup = ({ 
  isOpen, 
  onClose, 
  onVerify, 
  onResend, 
  maskedNumber, 
  isLoading, 
  error 
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Timer effect
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Reset on open/close
  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setTimeLeft(300);
      setCanResend(false);
      // Focus first input
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
    }
  }, [isOpen]);

useEffect(() => {
  if (error && error.trim() !== '') {
    console.log('🔴 OTP Error received:', error);
    // Clear OTP inputs when there's an error to allow easy retry
    setOtp(['', '', '', '', '', '']);
    // Focus first input for immediate retry
    setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 100); // Reduce delay
  }
}, [error]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP input change
  const handleOTPChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only the last digit
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerify(newOtp.join(''));
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    if (!/^\d{6}$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    setOtp(newOtp);
    
    // Focus last input
    inputRefs.current[5]?.focus();
    
    // Auto-submit
    handleVerify(pastedData);
  };

  // Handle verification
  const handleVerify = (otpValue = null) => {
    const otpToVerify = otpValue || otp.join('');
    if (otpToVerify.length === 6 && !isLoading) {
      onVerify(otpToVerify);
    }
  };

  // Handle resend
  const handleResend = () => {
    onResend();
    setTimeLeft(300);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  // Handle close
  const handleClose = () => {
    setOtp(['', '', '', '', '', '']);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>Verify Your Phone Number</h2>
          </div>
          <button 
            className={styles.closeButton}
            onClick={handleClose}
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <p className={styles.description}>
            We've sent a 6-digit verification code to:
          </p>
          <p className={styles.phoneNumber}>{maskedNumber}</p>

          {/* Error Message */}
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          {/* OTP Input */}
          <div className={styles.otpContainer}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOTPChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className={`${styles.otpInput} ${error ? styles.otpInputError : ''}`}
                disabled={isLoading}
              />
            ))}
          </div>

          {/* Timer */}
          <div className={styles.timerContainer}>
            {timeLeft > 0 ? (
              <p className={styles.timer}>
                Code expires in {formatTime(timeLeft)}
              </p>
            ) : (
              <p className={styles.timerExpired}>
                Code has expired
              </p>
            )}
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              className={styles.verifyButton}
              onClick={() => handleVerify()}
              disabled={isLoading || otp.some(digit => digit === '')}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>

            <div className={styles.resendContainer}>
              <span className={styles.resendText}>Didn't receive the code?</span>
              <button
                className={styles.resendButton}
                onClick={handleResend}
                disabled={!canResend || isLoading}
              >
                <RefreshCw size={16} />
                Resend Code
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPopup;