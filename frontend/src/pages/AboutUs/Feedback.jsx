import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { 
  MessageSquare, 
  Plus, 
  User, 
  Calendar, 
  Eye, 
  EyeOff, 
  Search, 
  Filter,
  ThumbsUp,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  ChevronDown,
  FileText,
  Tag
} from 'lucide-react';
import styles from './Feedback.module.css';

const Feedback = () => {
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();

  // State management
  const [feedback, setFeedback] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Validation state
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'General Feedback',
    isPublic: true
  });

  const categories = [
    'General Feedback',
    'Service Complaint', 
    'Service Commendation',
    'Suggestion',
    'Inquiry',
    'Report Issue',
    'Other'
  ];
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch public feedback
  const fetchFeedback = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/feedback/public');

      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }

      const data = await response.json();
      setFeedback(data.data || []);
      setFilteredFeedback(data.data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setFeedback([]);
      setFilteredFeedback([]);
    } finally {
      setIsLoading(false);
    }
  };

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
      category: true
    };
    setTouched(newTouched);

    let isFormValid = true;
    const newFieldErrors = {};
    
    ['subject', 'message', 'category'].forEach(key => {
      const validation = getFieldValidation(key, formData[key]);
      newFieldErrors[key] = validation.errorMessage;
      if (!validation.isValid) {
        isFormValid = false;
      }
    });

    setFieldErrors(newFieldErrors);
    return isFormValid;
  };

  // Submit feedback
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      showError('Please login to submit feedback');
      return;
    }

    if (!validateForm()) {
      showError('Please fix the errors in the form before proceeding.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Feedback submitted successfully!');
        resetForm();
        fetchFeedback(); // Refresh feedback list
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showError(error.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      message: '',
      category: 'General Feedback',
      isPublic: true
    });
    setFieldErrors({});
    setTouched({});
    setSubmitting(false);
    setShowFeedbackForm(false);
    document.body.style.overflow = "auto";
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleFilterChange = (category) => {
    setCategoryFilter(category);
    setDropdownOpen(false);
  };

  const handleFeedbackClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setShowFeedbackForm(true);
      document.body.style.overflow = "hidden";
    }
  };

  const openDetailsModal = (feedbackItem) => {
    setSelectedFeedback(feedbackItem);
    setShowDetailsModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeViewModal = () => {
    setShowDetailsModal(false);
    setSelectedFeedback(null);
    document.body.style.overflow = "auto";
  };

  // Close all modals
  const closeAllModals = () => {
    if (submitting) return;

    setShowFeedbackForm(false);
    setShowAuthModal(false);
    setShowDetailsModal(false);
    setSelectedFeedback(null);
    setFieldErrors({});
    setTouched({});
    document.body.style.overflow = "auto";
  };

  useEffect(() => {
    fetchFeedback();
  }, []);
  
  // Filter feedback based on search and filters
  useEffect(() => {
    let filtered = [...feedback];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${item.submittedBy.firstName} ${item.submittedBy.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    setFilteredFeedback(filtered);
  }, [feedback, searchTerm, categoryFilter]);

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

  if (isLoading) {
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
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <MessageSquare size={92} className={styles.headerIcon} />
          <div className={styles.headerContent}>
            <h1>Community Feedback</h1>
            <p>Share your thoughts and read feedback from fellow community members</p>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className={styles.filterSection}>
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

          <div className={styles.filterDropdown} ref={dropdownRef}>
            <Filter size={20} className={styles.filterIcon} />
            <button
              onClick={toggleDropdown}
              className={`${styles.dropdownButton} ${dropdownOpen ? styles.active : ''}`}
            >
              <span>{categoryFilter === 'all' ? 'All Categories' : categoryFilter}</span>
              <ChevronDown size={16} className={`${styles.dropdownArrow} ${dropdownOpen ? styles.open : ''}`} />
            </button>
            <div className={`${styles.dropdownContent} ${dropdownOpen ? styles.show : ''}`}>
              <button
                onClick={() => handleFilterChange('all')}
                className={`${styles.dropdownItem} ${categoryFilter === 'all' ? styles.active : ''}`}
              >
                All Categories
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleFilterChange(category)}
                  className={`${styles.dropdownItem} ${categoryFilter === category ? styles.active : ''}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {filteredFeedback.length === 0 && !searchTerm && categoryFilter === 'all' ? (
        <div className={styles.noRequests}>
          <FileText size={64} className={styles.noRequestsIcon} />
          <h3>No feedback found</h3>
          <p>There is no feedback to display.</p>
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.requestsGrid}>
            {/* Add New Feedback Card */}
            <div
              onClick={handleFeedbackClick}
              className={styles.addRequestCard}
            >
              <div className={styles.addRequestContent}>
                <div className={styles.addRequestIconContainer}>
                  <Plus size={48} className={styles.addRequestIcon} />
                </div>
                <h3 className={styles.addRequestTitle}>Submit New Feedback</h3>
                <p className={styles.addRequestDescription}>
                  Share your thoughts and feedback with the community
                </p>
              </div>
            </div>

            {filteredFeedback.length === 0 ? (
              <div className={styles.noFilteredRequests}>
                <FileText size={64} className={styles.noRequestsIcon} />
                <h3>No feedback found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              filteredFeedback.map((feedbackItem) => (
                <div
                  key={feedbackItem._id}
                  onClick={() => openDetailsModal(feedbackItem)}
                  className={styles.requestCard}
                >
                  <div className={styles.requestCardHeader}>
                    <div className={styles.organizationInfo}>
                      <h3 className={styles.organizationName}>{feedbackItem.subject}</h3>
                    </div>
                      <div className={`${styles.statusBadge} ${styles[feedbackItem.status.toLowerCase()]}`}>
                        {feedbackItem.status.charAt(0).toUpperCase() + feedbackItem.status.slice(1)}
                      </div>
                  </div>

                  <div className={styles.requestDetails}>
                    <div className={styles.detailItem}>
                      <User size={16} />
                      <span>{`${feedbackItem.submittedBy.firstName} ${feedbackItem.submittedBy.lastName}`}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <Tag size={16} />
                      <span>{feedbackItem.category}</span>
                    </div>
                  </div>
                  
                  {/* Message Preview */}
                  <div className={styles.purpose}>
                    <strong>Message:</strong>
                    <p>{feedbackItem.message.substring(0, 100)}...</p>
                  </div>
                  
                  <div className={styles.cardFooter}>
                    <span className={styles.publishDate}>
                      {formatDate(feedbackItem.createdAt)}
                    </span>
                    <button className={styles.viewDetailsButton}>
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedFeedback && (
        <div className={styles.modal} onClick={closeViewModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <h2>{selectedFeedback.subject}</h2>
                <span className={`${styles.requestTypeBadge} ${styles.large} ${styles[selectedFeedback.category.toLowerCase().replace(' ', '-')]}`}>
                  {selectedFeedback.category}
                </span>
              </div>
              <button onClick={closeViewModal} className={styles.closeButton}>
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>        
              {/* Feedback Details Grid */}
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <User size={20} />
                  <div>
                    <strong>Submitted By: </strong>{`${selectedFeedback.submittedBy.firstName} ${selectedFeedback.submittedBy.lastName}`}
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <Calendar size={20} />
                  <div>
                    <strong>Date: </strong>{formatDate(selectedFeedback.createdAt)}
                  </div>
                </div>
              </div>
              
              {/* Feedback Message */}
              <div className={styles.section}>
                <h4>Feedback Message</h4>
                <p className={styles.description}>{selectedFeedback.message}</p>
              </div>

              {/* Admin Response Section */}
              {selectedFeedback.adminResponse && selectedFeedback.adminResponse.message && (
                <div className={styles.section}>
                  <h4>Admin Response</h4>
                  <div className={styles.adminResponseContainer}>
                    <p className={styles.description}>{selectedFeedback.adminResponse.message}</p>
                    <div className={styles.responseMetadata}>
                      <small className={styles.responseDate}>
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
                  <strong>Published:</strong> {formatDateTime(selectedFeedback.createdAt)}
                </div>
                {selectedFeedback.updatedAt !== selectedFeedback.createdAt && (
                  <div className={styles.metaItem}>
                    <strong>Last Updated:</strong> {formatDateTime(selectedFeedback.updatedAt)}
                  </div>
                )}
                <div className={styles.metaItem}>
                  <strong>Status:</strong> {selectedFeedback.status.charAt(0).toUpperCase() + selectedFeedback.status.slice(1)}
                </div>
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

                  {/* Category */}
                  <div className={styles.formGroup}>
                    <label>Category *</label>
                    <div className={styles.inputWrapper}>
                      <Tag size={16} className={styles.inputIcon} />
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        onBlur={(e) => handleInputBlur('category', e.target.value)}
                        required
                        className={getInputClass('category')}
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
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
      
      {/* Authentication Modal */}
      {showAuthModal && (
        <div className={styles.modal} onClick={() => setShowAuthModal(false)}>
          <div className={styles.authPrompt} onClick={(e) => e.stopPropagation()}>
            <div className={styles.authPromptHeader}>
              <User size={32} />
              <h3>Account Required</h3>
            </div>
            <p>You need to have an account to submit feedback.</p>
            <div className={styles.authActions}>
              <a href="/login" className={styles.loginBtn}>Login</a>
              <a href="/register" className={styles.registerBtn}>Register</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;