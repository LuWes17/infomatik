import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare,
  Filter, 
  Plus, 
  Search, 
  User, 
  Calendar,
  FileText, 
  Tag,
  ChevronDown,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Feedback.module.css';
import { useNotification } from '../../contexts/NotificationContext';
import { useLocation } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL; // e.g. http://localhost:4000/api

const Feedback = () => {
  // Auth context
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showSuccess, showError } = useNotification();

  // State management
  const [feedbackList, setFeedbackList] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showFeedbackDetails, setShowFeedbackDetails] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Filter and search states
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Custom dropdown states
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [visibilityDropdownOpen, setVisibilityDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef(null);
  const visibilityDropdownRef = useRef(null);

  // Field validation states
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const location = useLocation();

  // Form data
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: '',
    isPublic: 'yes'
  });

  // Categories constant
  const categories = [
    'General Feedback',
    'Service Complaint', 
    'Service Commendation',
    'Suggestion',
    'Inquiry',
    'Report Issue',
    'Other'
  ];

  // Function to get short category label for display
  const getShortCategoryLabel = (category) => {
    const shortLabels = {
      'General Feedback': 'General',
      'Service Complaint': 'Complaint',
      'Service Commendation': 'Commendation',
      'Suggestion': 'Suggestion',
      'Inquiry': 'Inquiry',
      'Report Issue': 'Report Issue',
      'Other': 'Other'
    };
    return shortLabels[category] || category;
  };

  // Function to get status display text
  const getStatusDisplay = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'in_progress': 'In Progress', 
      'resolved': 'Resolved'
    };
    return statusMap[status] || status;
  };

  // Function to get CSS class name for status badges
  const getStatusCssClass = (status) => {
    return status.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-');
  };

  useEffect(() => {
    if (location.state?.openForm && isAuthenticated) {
      setShowFeedbackForm(true);
      document.body.style.overflow = "hidden";
      
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    } else if (location.state?.openForm && !isAuthenticated) {
      setShowAuthPrompt(true);
      
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, isAuthenticated]);

  // Fetch public feedback
  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/feedback/public`);
      const data = await response.json();
      
      if (data.success) {
        // Sort by latest created first
        const sortedFeedback = data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setFeedbackList(sortedFeedback);
        setFilteredFeedback(sortedFeedback);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setFeedbackList([]);
      setFilteredFeedback([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
      if (visibilityDropdownRef.current && !visibilityDropdownRef.current.contains(event.target)) {
        setVisibilityDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = [...feedbackList];

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(feedback => feedback.category === filterCategory);
    }

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(feedback =>
        feedback.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${feedback.submittedBy.firstName} ${feedback.submittedBy.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFeedback(filtered);
  }, [feedbackList, filterCategory, searchTerm]);

  // Field validation function
  const getFieldValidation = (name, value) => {
    let isValid = true;
    let errorMessage = '';

    switch (name) {
      case 'subject':
        if (!value || !value.trim()) {
          isValid = false;
          errorMessage = 'Subject is required.';
        } else if (value.trim().length < 5) {
          isValid = false;
          errorMessage = 'Subject must be at least 5 characters.';
        } else if (value.trim().length > 150) {
          isValid = false;
          errorMessage = 'Subject must be less than 150 characters.';
        }
        break;
      
      case 'message':
        if (!value || !value.trim()) {
          isValid = false;
          errorMessage = 'Message is required.';
        } else if (value.trim().length < 10) {
          isValid = false;
          errorMessage = 'Please provide more detailed feedback (at least 10 characters).';
        } else if (value.trim().length > 2000) {
          isValid = false;
          errorMessage = 'Message must be less than 2000 characters.';
        }
        break;
      
      case 'category':
        if (!value) {
          isValid = false;
          errorMessage = 'Please select a category.';
        }
        break;
      
      case 'isPublic':
        if (!value) {
          isValid = false;
          errorMessage = 'Please select visibility.';
        }
        break;
      
      default:
        break;
    }

    return { isValid, errorMessage };
  };

  // Validate individual field
  const validateField = (name, value) => {
    const validation = getFieldValidation(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: validation.errorMessage
    }));
    return validation.isValid;
  };

  // Get input class based on validation state
  const getInputClass = (fieldName) => {
    if (!touched[fieldName]) {
      return styles.inputWithIcon;
    }
    
    const hasError = fieldErrors[fieldName] && fieldErrors[fieldName] !== '';
    return `${styles.inputWithIcon} ${hasError ? styles.inputInvalid : styles.inputValid}`;
  };

  // Handle input changes with validation
  const handleInputChange = (field, value) => {
    setFormData({...formData, [field]: value});
    
    // Validate field on change if already touched
    if (touched[field]) {
      validateField(field, value);
    }
  };

  // Handle input blur
  const handleInputBlur = (field, value) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    validateField(field, value);
  };

  // Validate entire form
  const validateForm = () => {
    const newTouched = {
      subject: true,
      message: true,
      category: true,
      isPublic: true
    };
    setTouched(newTouched);

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

  // Handle feedback form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }
    
    if (!validateForm()) {
      showError('Please fix the errors in the form before proceeding.');
      return;
    }
    
    try {
      setSubmitting(true);

      const submitData = {
        subject: formData.subject,
        message: formData.message,
        category: formData.category,
        isPublic: formData.isPublic === 'yes'
      };

      const response = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (data.success) {
        setShowFeedbackForm(false);
        resetForm();
        showSuccess('Feedback submitted successfully!');
        fetchFeedback();
      } else {
        throw new Error(data.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showError('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      subject: '',
      message: '',
      category: '',
      isPublic: 'yes'
    });

    setFieldErrors({});
    setTouched({});
    setSubmitting(false);
    
    setShowFeedbackForm(false);
    document.body.style.overflow = "auto";
  };

  // Handle feedback click
  const handleFeedbackClick = (feedback) => {
    setSelectedFeedback(feedback);
    setShowFeedbackDetails(true);
    document.body.style.overflow = "hidden";
  };

  // Handle submit button click
  const handleSubmitClick = (e) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }
    
    setShowFeedbackForm(true);
    document.body.style.overflow = "hidden";
  };

  // Close all modals
  const closeAllModals = () => {
    if (submitting) return;

    setShowFeedbackDetails(false);
    setShowFeedbackForm(false);
    setShowAuthPrompt(false);
    setSelectedFeedback(null);
    setCategoryDropdownOpen(false);
    setVisibilityDropdownOpen(false);

    // Reset validation states
    setFieldErrors({});
    setTouched({});

    document.body.style.overflow = "auto";
  };

  // Filter dropdown handlers
  const handleFilterChange = (category) => {
    setFilterCategory(category);
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Custom dropdown handlers
  const handleCategoryChange = (category) => {
    setFormData({...formData, category: category});
    setCategoryDropdownOpen(false);

    if (touched.category) {
      validateField('category', category);
    }
  };

  const toggleCategoryDropdown = () => {
    setCategoryDropdownOpen(!categoryDropdownOpen);
  };

  const handleVisibilityChange = (visibility) => {
    setFormData({...formData, isPublic: visibility});
    setVisibilityDropdownOpen(false);

    if (touched.isPublic) {
      validateField('isPublic', visibility);
    }
  };

  const toggleVisibilityDropdown = () => {
    setVisibilityDropdownOpen(!visibilityDropdownOpen);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading || authLoading) {
    return (
      <div className={styles.feedbackPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.feedbackPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <MessageSquare size={92} className={styles.icon} />
          <div className={styles.headerContent}>
            <h1>Community Feedback</h1>
            <p>Share your thoughts and read feedback from fellow community members.</p>
          </div>
        </div>

        <div className={styles.filterSection}>
          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Filter Dropdown */}
          <div className={styles.filterDropdown} ref={dropdownRef}>
            <Filter size={20} className={styles.filterIcon} />
            <button
              onClick={toggleDropdown}
              className={`${styles.dropdownButton} ${dropdownOpen ? styles.active : ''}`}
            >
              <span>{filterCategory === 'all' ? 'All Categories' : filterCategory}</span>
              <ChevronDown size={16} className={`${styles.dropdownArrow} ${dropdownOpen ? styles.open : ''}`} />
            </button>
            <div className={`${styles.dropdownContent} ${dropdownOpen ? styles.show : ''}`}>
              <button
                onClick={() => handleFilterChange('all')}
                className={`${styles.dropdownItem} ${filterCategory === 'all' ? styles.active : ''}`}
              >
                All Categories
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleFilterChange(category)}
                  className={`${styles.dropdownItem} ${filterCategory === category ? styles.active : ''}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className={styles.content}>
        {/* Always show the feedback grid */}
        <div className={styles.feedbackGrid}>
          {/* Submit New Feedback Card - Always first item */}
          <div
            onClick={handleSubmitClick}
            className={styles.submitCard}
          >
            <div className={styles.submitCardContent}>
              <div className={styles.submitIconContainer}>
                <Plus size={48} className={styles.submitIcon} />
              </div>
              <h3 className={styles.submitTitle}>Submit New Feedback</h3>
              <p className={styles.submitDescription}>
                Share your thoughts and feedback with the community
              </p>
            </div>
          </div>

          {/* Conditionally render either "no feedback" message or the actual feedback cards */}
          {filteredFeedback.length === 0 ? (
            <div className={styles.noFeedback}>
              <FileText size={80} />
              <h3>No feedback found</h3>
              <p>
                {searchTerm || filterCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'There is no community feedback to display.'}
              </p>
            </div>
          ) : (
            filteredFeedback.map((feedback) => (
              <div
                key={feedback._id}
                onClick={() => handleFeedbackClick(feedback)}
                className={styles.feedbackCard}
              >
                {/* Status Badge - Replaced category badge */}
                <div className={`${styles.statusBadge} ${styles[getStatusCssClass(feedback.status || 'pending')]}`}>
                  {getStatusDisplay(feedback.status || 'pending')}
                </div>

                {/* Subject */}
                <h3 className={styles.feedbackSubject}>{feedback.subject}</h3>

                {/* Feedback Info */}
                <div className={styles.feedbackInfo}>
                  <div className={styles.infoItem}>
                    <User size={16} />
                    <span>{`${feedback.submittedBy.firstName} ${feedback.submittedBy.lastName}`}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <Tag size={16} />
                    <span>{(feedback.category)}</span>
                  </div>
                </div>

                {/* Message Preview */}
                <div className={styles.messagePreview}>
                  <strong>Message:</strong>
                  <p>{feedback.message.substring(0, 100)}...</p>
                </div>

                {/* Card Actions */}
                <div className={styles.cardActions}>
                  <button 
                    className={styles.viewMoreBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFeedbackClick(feedback);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Feedback Details Modal */}
      {showFeedbackDetails && selectedFeedback && (
        <div className={styles.modal} onClick={closeAllModals}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <h2>{selectedFeedback.subject}</h2>
                {/* Status Badge - Replaced category badge */}
                <span className={`${styles.statusBadge} ${styles[getStatusCssClass(selectedFeedback.status || 'pending')]}`}>
                  {getStatusDisplay(selectedFeedback.status || 'pending')}
                </span>
              </div>
              <button onClick={closeAllModals} className={styles.closeButton}>
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>        
              {/* Feedback Details Grid */}
              <div className={styles.feedbackDetailsGrid}>
                <div className={styles.detailItem}>
                  <User size={20} />
                  <div>
                    <strong>Submitted By:</strong> {`${selectedFeedback.submittedBy.firstName} ${selectedFeedback.submittedBy.lastName}`}
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <Tag size={20} />
                  <div>
                    <strong>Category:</strong> {selectedFeedback.category}
                  </div>
                </div>
              </div>
              
              {/* Message */}
              <div className={styles.section}>
                <h4>Feedback Message</h4>
                <p className={styles.description}>{selectedFeedback.message}</p>
              </div>
              
              {/* Admin Response if exists */}
              {selectedFeedback.adminResponse && selectedFeedback.adminResponse.message && (
                <div className={styles.section}>
                  <h4>Admin Response</h4>
                  <div className={styles.adminResponseBox}>
                    <p className={styles.description}>{selectedFeedback.adminResponse.message}</p>
                    <div className={styles.responseMetadata}>
                      <small>
                        Responded on {formatDateTime(selectedFeedback.adminResponse.respondedAt)}
                        {selectedFeedback.adminResponse.isEdited && (
                          <span className={styles.editedIndicator}> (edited)</span>
                        )}
                      </small>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Metadata */}
              <div className={styles.modalMetadata}>
                <div className={styles.metaItem}>
                  <strong>Submitted:</strong> {formatDateTime(selectedFeedback.createdAt)}
                </div>
                {selectedFeedback.updatedAt !== selectedFeedback.createdAt && (
                  <div className={styles.metaItem}>
                    <strong>Last Updated:</strong> {formatDateTime(selectedFeedback.updatedAt)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Form Modal */}
      {showFeedbackForm && (
        <div className={styles.modal} onClick={closeAllModals}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <h2>Submit Feedback</h2>
              </div>
              <button onClick={closeAllModals} className={styles.closeButton} disabled={submitting}>
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <form onSubmit={handleFormSubmit} className={styles.applicationForm}>
                <div className={styles.formGrid}>
                  {/* Subject */}
                  <div className={styles.formGroup}>
                    <label>Subject *</label>
                    <div className={styles.inputWrapper}>
                      <FileText size={16} className={styles.inputIcon} />
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        onBlur={(e) => handleInputBlur('subject', e.target.value)}
                        required
                        placeholder="Enter feedback subject"
                        className={getInputClass('subject')}
                        maxLength={150}
                      />
                    </div>
                    {touched.subject && fieldErrors.subject && (
                      <div className={styles.errorMessage}>
                        {fieldErrors.subject}
                      </div>
                    )}
                  </div>

                  {/* Category - Custom Dropdown */}
                  <div className={styles.formGroup}>
                    <label>Category *</label>
                    <div className={styles.inputWrapper}>
                      <Tag size={16} className={styles.inputIcon} />
                      <div className={styles.customDropdown} ref={categoryDropdownRef}>
                        <button
                          type="button"
                          onClick={toggleCategoryDropdown}
                          onBlur={(e) => {
                            if (!categoryDropdownRef.current?.contains(e.relatedTarget)) {
                              handleInputBlur('category', formData.category);
                            }
                          }}
                          className={`${styles.customDropdownButton} ${categoryDropdownOpen ? styles.active : ''} ${!formData.category ? styles.placeholder : ''} ${touched.category && fieldErrors.category ? styles.inputInvalid : touched.category ? styles.inputValid : ''}`}
                          required
                        >
                          <span>
                            {formData.category || 'Select category'}
                          </span>
                          <ChevronDown size={16} className={`${styles.dropdownArrow} ${categoryDropdownOpen ? styles.open : ''}`} />
                        </button>
                        <div className={`${styles.customDropdownContent} ${categoryDropdownOpen ? styles.show : ''}`}>
                          {categories.map((category) => (
                            <button
                              key={category}
                              type="button"
                              onClick={() => {
                                handleCategoryChange(category);
                                setTouched(prev => ({ ...prev, category: true }));
                              }}
                              className={`${styles.customDropdownItem} ${formData.category === category ? styles.active : ''}`}
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {touched.category && fieldErrors.category && (
                      <div className={styles.errorMessage}>
                        {fieldErrors.category}
                      </div>
                    )}
                  </div>

                  {/* Message */}
                  <div className={styles.formGroup}>
                    <label>Message *</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      onBlur={(e) => handleInputBlur('message', e.target.value)}
                      required
                      placeholder="Share your detailed feedback here..."
                      rows={6}
                      maxLength={2000}
                      className={touched.message && fieldErrors.message ? styles.inputInvalid : touched.message ? styles.inputValid : ''}
                    />
                    {touched.message && fieldErrors.message && (
                      <div className={styles.errorMessage}>
                        {fieldErrors.message}
                      </div>
                    )}
                    <small className={styles.charCount}>
                      {formData.message.length}/2000 characters
                    </small>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button 
                    type="button" 
                    className={styles.cancelBtn}
                    onClick={closeAllModals}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={styles.submitBtn}
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Feedback'} 
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Authentication Prompt Modal */}
      {showAuthPrompt && (
        <div className={styles.modal} onClick={closeAllModals}>
          <div className={styles.authPrompt} onClick={(e) => e.stopPropagation()}>
            <div className={styles.authPromptHeader}>
              <User size={32} />
              <h3>Account Required</h3>
            </div>
            <p>You need to have an account to submit feedback.</p>
            <div className={styles.authActions}>
              <button 
                className={styles.loginBtn}
                onClick={() => window.location.href = '/login'}
              >
                Login
              </button>
              <button 
                className={styles.registerBtn}
                onClick={() => window.location.href = '/register'}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;