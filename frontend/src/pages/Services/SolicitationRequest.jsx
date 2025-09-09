import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Filter, Plus, X, Upload, Search, Eye, Building2, Phone, MapPin, FileText, Calendar as CalendarIcon, User, Type, DollarSign, Users, Mail, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './SolicitationRequests.module.css';
import { useNotification } from '../../contexts/NotificationContext'

const SolicitationRequests = () => {
  // Auth context
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // State management
  const [solicitationRequests, setSolicitationRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Filter and search states
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Custom dropdown states
  const [barangayDropdownOpen, setBarangayDropdownOpen] = useState(false);
  const [organizationTypeDropdownOpen, setOrganizationTypeDropdownOpen] = useState(false);
  const [requestTypeDropdownOpen, setRequestTypeDropdownOpen] = useState(false);
  const barangayDropdownRef = useRef(null);
  const organizationTypeDropdownRef = useRef(null);
  const requestTypeDropdownRef = useRef(null);

  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  // **NEW: Field validation states**
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const [submitting, setSubmitting] = useState(false);

  // Barangays list
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

  // Form data - Updated structure
  const [formData, setFormData] = useState({
    contactPersonFirstName: '',
    contactPersonLastName: '',
    contactNumber: '',
    organizationType: '',
    organizationName: '',
    street: '',
    barangay: '',
    eventDate: '',
    requestType: '',
    requestedAssistanceDetails: '',
    purpose: '',
    solicitationLetter: null
  });

  // Load data on component mount
  useEffect(() => {
    fetchSolicitationRequests();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (barangayDropdownRef.current && !barangayDropdownRef.current.contains(event.target)) {
        setBarangayDropdownOpen(false);
      }
      if (organizationTypeDropdownRef.current && !organizationTypeDropdownRef.current.contains(event.target)) {
        setOrganizationTypeDropdownOpen(false);
      }
      if (requestTypeDropdownRef.current && !requestTypeDropdownRef.current.contains(event.target)) {
        setRequestTypeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto-populate form with user data when form opens
  useEffect(() => {
    if (showRequestForm && isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        contactPersonFirstName: user.firstName || '',
        contactPersonLastName: user.lastName || '',
        contactNumber: user.contactNumber || '',
        barangay: user.barangay || '',
      }));
    }
  }, [showRequestForm, isAuthenticated, user]);

  const fetchSolicitationRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/solicitations/approved');
      
      if (!response.ok) {
        throw new Error('Failed to fetch solicitation requests');
      }

      const data = await response.json();
      setSolicitationRequests(data.data || []);
      setFilteredRequests(data.data || []);
    } catch (error) {
      console.error('Error fetching solicitation requests:', error);
      setSolicitationRequests([]);
      setFilteredRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search functionality
  useEffect(() => {
    let filtered = [...solicitationRequests];

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(request => request.requestType === categoryFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requestedAssistanceDetails.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [solicitationRequests, categoryFilter, searchTerm]);

  // **NEW: Field validation function**
  const getFieldValidation = (name, value) => {
    let isValid = true;
    let errorMessage = '';

    switch (name) {
      case 'contactPersonFirstName':
      case 'contactPersonLastName':
        if (!value || !value.trim()) {
          isValid = false;
          errorMessage = `${name === 'contactPersonFirstName' ? 'First' : 'Last'} name is required`;
        } else if (value.trim().length < 2) {
          isValid = false;
          errorMessage = `${name === 'contactPersonFirstName' ? 'First' : 'Last'} name must be at least 2 characters`;
        } else if (value.trim().length > 50) {
          isValid = false;
          errorMessage = `${name === 'contactPersonFirstName' ? 'First' : 'Last'} name must be less than 50 characters`;
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          isValid = false;
          errorMessage = `${name === 'contactPersonFirstName' ? 'First' : 'Last'} name can only contain letters and spaces`;
        }
        break;
      
      case 'contactNumber':
        const digits = value.replace(/\D/g, '');
        if (!digits) {
          isValid = false;
          errorMessage = 'Contact number is required';
        } else if (digits.length !== 11) {
          isValid = false;
          errorMessage = 'Contact number must be exactly 11 digits';
        } else if (!digits.startsWith('09')) {
          isValid = false;
          errorMessage = 'Contact number must start with 09';
        }
        break;
      
      case 'organizationType':
        if (!value) {
          isValid = false;
          errorMessage = 'Please select an organization type';
        }
        break;
      
      case 'organizationName':
        if (!value || !value.trim()) {
          isValid = false;
          errorMessage = 'Organization name is required';
        } else if (value.trim().length < 2) {
          isValid = false;
          errorMessage = 'Organization name must be at least 2 characters';
        } else if (value.trim().length > 150) {
          isValid = false;
          errorMessage = 'Organization name must be less than 150 characters';
        }
        break;
      
      case 'street':
        if (!value || !value.trim()) {
          isValid = false;
          errorMessage = 'Street address is required';
        } else if (value.trim().length < 5) {
          isValid = false;
          errorMessage = 'Street address must be at least 5 characters';
        } else if (value.trim().length > 200) {
          isValid = false;
          errorMessage = 'Street address must be less than 200 characters';
        }
        break;
      
      case 'barangay':
        if (!value) {
          isValid = false;
          errorMessage = 'Please select a barangay';
        }
        break;
      
      case 'requestType':
        if (!value) {
          isValid = false;
          errorMessage = 'Please select a request type';
        }
        break;
      
      case 'requestedAssistanceDetails':
        if (!value || !value.trim()) {
          isValid = false;
          errorMessage = 'Specific request details are required';
        } else if (value.trim().length < 10) {
          isValid = false;
          errorMessage = 'Please provide more detailed request information (at least 10 characters)';
        } else if (value.trim().length > 1000) {
          isValid = false;
          errorMessage = 'Request details must be less than 1000 characters';
        }
        break;
      
      case 'purpose':
        if (!value || !value.trim()) {
          isValid = false;
          errorMessage = 'Purpose is required';
        } else if (value.trim().length < 10) {
          isValid = false;
          errorMessage = 'Please provide more detailed purpose information (at least 10 characters)';
        } else if (value.trim().length > 800) {
          isValid = false;
          errorMessage = 'Purpose must be less than 800 characters';
        }
        break;
      
      case 'solicitationLetter':
        if (!value) {
          isValid = false;
          errorMessage = 'Solicitation letter is required';
        } else {
          const allowedTypes = ['application/pdf'];
          const maxSize = 5 * 1024 * 1024; // 5MB
          
          if (!allowedTypes.includes(value.type)) {
            isValid = false;
            errorMessage = 'Only PDF files are allowed';
          } else if (value.size > maxSize) {
            isValid = false;
            errorMessage = 'File size must be less than 5MB';
          }
        }
        break;
      
      default:
        break;
    }

    return { isValid, errorMessage };
  };

  // **NEW: Validate individual field**
  const validateField = (name, value) => {
    const validation = getFieldValidation(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: validation.errorMessage
    }));
    return validation.isValid;
  };

  // **NEW: Get input class based on validation state**
  const getInputClass = (fieldName) => {
    if (!touched[fieldName]) {
      return styles.inputWithIcon;
    }
    
    const hasError = fieldErrors[fieldName] && fieldErrors[fieldName] !== '';
    return `${styles.inputWithIcon} ${hasError ? styles.inputInvalid : styles.inputValid}`;
  };

  // **NEW: Handle input changes with validation**
  const handleInputChange = (field, value) => {
    // Handle phone number formatting
    if (field === 'contactNumber') {
      let cleanValue = value.replace(/\D/g, '');
      // Ensure it starts with 09 if user types numbers
      if (cleanValue && !cleanValue.startsWith('09')) {
        cleanValue = '09' + cleanValue.substring(cleanValue.startsWith('9') ? 1 : 0);
      }
      // Limit to 11 digits
      cleanValue = cleanValue.substring(0, 11);
      value = cleanValue;
    }

    setFormData({...formData, [field]: value});
    
    // Validate field on change if already touched
    if (touched[field]) {
      validateField(field, value);
    }
  };

  // **NEW: Handle input blur**
  const handleInputBlur = (field, value) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    validateField(field, value);
  };

  // **NEW: Validate entire form**
  const validateForm = () => {
    const newTouched = {
      contactPersonFirstName: true,
      contactPersonLastName: true,
      contactNumber: true,
      organizationType: true,
      organizationName: true,
      street: true,
      barangay: true,
      requestType: true,
      requestedAssistanceDetails: true,
      purpose: true,
      solicitationLetter: true
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

  const handleRequestClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setShowRequestForm(true);
      document.body.style.overflow = "hidden";
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    if (!validateForm()) {
      showError('Please fix the errors in the form before proceeding.');
      return;
    }
    
    try {
      setSubmitting(true);

      const submitData = new FormData();
      
      // Map form data to API expected format
      submitData.append('contactPerson', `${formData.contactPersonFirstName} ${formData.contactPersonLastName}`);
      submitData.append('organizationName', formData.organizationName);
      submitData.append('organizationType', formData.organizationType);
      submitData.append('contactNumber', formData.contactNumber);
      submitData.append('address', `${formData.street}, ${formData.barangay}`);
      submitData.append('requestType', formData.requestType);
      submitData.append('requestedAssistanceDetails', formData.requestedAssistanceDetails);
      submitData.append('purpose', formData.purpose);
      submitData.append('solicitationLetter', formData.solicitationLetter);

      const response = await fetch(`http://localhost:4000/api/solicitations/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submitData
      });

      if (response.ok) {
        setShowRequestForm(false);
        resetForm();
        showSuccess('Solicitation request submitted successfully!');
        fetchSolicitationRequests();
      } else {
        const error = await response.json();
        console.log(`Error: ${error.message}`)
        showError('Failed to submit solicitation request');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showError('Failed to submit solicitation request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      contactPersonFirstName: '',
      contactPersonLastName: '',
      contactNumber: '',
      organizationType: '',
      organizationName: '',
      street: '',
      barangay: '',
      eventDate: '',
      requestType: '',
      requestedAssistanceDetails: '',
      purpose: '',
      solicitationLetter: null
    });

    // **NEW: Reset validation states**
    setFieldErrors({});
    setTouched({});
    setSubmitting(false);
    
    setShowRequestForm(false);
    document.body.style.overflow = "auto";
  };


  const openDetailsModal = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeViewModal = () => {
    setShowDetailsModal(false);
    setSelectedRequest(null);
    document.body.style.overflow = "auto";
  };

  // Filter dropdown handlers
  const handleFilterChange = (category) => {
    setCategoryFilter(category);
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Custom dropdown handlers
  const handleBarangayChange = (barangay) => {
    setFormData({...formData, barangay: barangay});
    setBarangayDropdownOpen(false);

     // Validate if touched
    if (touched.barangay) {
      validateField('barangay', barangay);
    }
  };

  const toggleBarangayDropdown = () => {
    setBarangayDropdownOpen(!barangayDropdownOpen);
  };

  const handleOrganizationTypeChange = (type) => {
    setFormData({...formData, organizationType: type});
    setOrganizationTypeDropdownOpen(false);

    if (touched.organizationType) {
    validateField('organizationType', type);
    }
  };

  const toggleOrganizationTypeDropdown = () => {
    setOrganizationTypeDropdownOpen(!organizationTypeDropdownOpen);
  };

  const handleRequestTypeChange = (type) => {
    setFormData({...formData, requestType: type});
    setRequestTypeDropdownOpen(false);

    // Validate if touched
    if (touched.requestType) {
      validateField('requestType', type);
    }
  };

  const toggleRequestTypeDropdown = () => {
    setRequestTypeDropdownOpen(!requestTypeDropdownOpen);
  };

  // Format barangay name for display
  const formatBarangayName = (barangay) => {
    return barangay.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Close all modals
  const closeAllModals = () => {
    if (submitting) return;

    setShowRequestForm(false);
    setShowAuthModal(false);
    setShowDetailsModal(false);
    setSelectedRequest(null);
    setBarangayDropdownOpen(false);
    setOrganizationTypeDropdownOpen(false);
    setRequestTypeDropdownOpen(false);

    // Reset validation states
    setFieldErrors({});
    setTouched({});

    document.body.style.overflow = "auto";
  };

  const organizationTypes = ['NGA', 'NGO', 'CSO', 'LGU', 'Barangay', 'SK', 'Others'];
  const requestTypes = ['Medical', 'Financial', 'Construction Materials', 'Educational Supplies', 'Others'];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading || authLoading) {
    return (
      <div className={styles.solicitationRequests}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading solicitation requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.solicitationRequests}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <Mail size={92} className={styles.icon} />
          <div className={styles.headerContent}>
            <h1>Solicitation Requests</h1>
            <p>View completed solicitation requests and submit your own request for assistance.</p>
          </div>
        </div>

        <div className={styles.filterSection}>
          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search organizations or purposes..."
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
              {requestTypes.map(type => (
                <button
                  key={type}
                  onClick={() => handleFilterChange(type)}
                  className={`${styles.dropdownItem} ${categoryFilter === type ? styles.active : ''}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* View Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className={styles.modal} onClick={closeViewModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <h2>{selectedRequest.organizationName}</h2>
                <span className={`${styles.requestTypeBadge} ${styles.large} ${styles[selectedRequest.requestType.toLowerCase().replace(' ', '-')]}`}>
                  {selectedRequest.requestType}
                </span>
              </div>
              <button onClick={closeViewModal} className={styles.closeButton}>
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>        
              {/* Request Details Grid */}
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <User size={20} />
                  <div>
                    <strong>Contact Person: </strong>{selectedRequest.contactPerson}
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <Building2 size={20} />
                  <div>
                    <strong>Organization Type: </strong>{selectedRequest.organizationType}
                  </div>
                </div>
              </div>
              
              {/* Purpose */}
              <div className={styles.section}>
                <h4>Purpose</h4>
                <p className={styles.requirements}>{selectedRequest.purpose}</p>
              </div>
              
              {/* Requested Assistance Details */}
              <div className={styles.section}>
                <h4>Specific Request Details</h4>
                <p className={styles.description}>{selectedRequest.requestedAssistanceDetails}</p>
              </div>

              {/* Modal Metadata */}
              <div className={styles.modalMetadata}>
                <div className={styles.metaItem}>
                  <strong>Published:</strong> {formatDateTime(selectedRequest.createdAt)}
                </div>
                {selectedRequest.updatedAt !== selectedRequest.createdAt && (
                <div className={styles.metaItem}>
                  <strong>Last Updated:</strong> {formatDateTime(selectedRequest.updatedAt)}
                </div>
               )}
              </div>
              
            </div>
          </div>
        </div>
      )}

      {/* Requests Grid with Add New Request Card */}
      {filteredRequests.length === 0 && !searchTerm && categoryFilter === 'all' ? (
        <div className={styles.noRequests}>
          <FileText size={64} className={styles.noRequestsIcon} />
          <h3>No requests found</h3>
          <p>There are no completed solicitation requests to display.</p>
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.requestsGrid}>
            {/* Add New Solicitation Request */}
            <div
              onClick={handleRequestClick}
              className={styles.addRequestCard}
            >
              <div className={styles.addRequestContent}>
                <div className={styles.addRequestIconContainer}>
                  <Plus size={48} className={styles.addRequestIcon} />
                </div>
                <h3 className={styles.addRequestTitle}>Submit New Request</h3>
                <p className={styles.addRequestDescription}>
                  Submit a new solicitation request for assistance
                </p>
              </div>
            </div>

            {filteredRequests.length === 0 ? (
              <div className={styles.noFilteredRequests}>
                <FileText size={64} className={styles.noRequestsIcon} />
                <h3>No requests found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <div
                  key={request._id}
                  onClick={() => openDetailsModal(request)}
                  className={styles.requestCard}
                >
                  <div className={styles.requestCardHeader}>
                    <div className={styles.organizationInfo}>
                      <h3 className={styles.organizationName}>{request.organizationName}</h3>
                    </div>
                    <div className={`${styles.requestTypeBadge} ${styles[request.requestType.toLowerCase().replace(' ', '-')]}`}>
                      {request.requestType}
                    </div>
                  </div>

                  <div className={styles.requestDetails}>
                    <div className={styles.detailItem}>
                      <User size={16} />
                      <span>{`${request.contactPerson}`}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <Building2 size={16} />
                      <span>{(request.organizationType)}</span>
                    </div>
                  </div>
                  
                  {/* Purpose Preview */}
                  <div className={styles.purpose}>
                    <strong>Purpose:</strong>
                    <p>{request.purpose.substring(0, 100)}...</p>
                  </div>
                  
                  <div className={styles.cardFooter}>
                    <span className={styles.publishDate}>
                      {formatDate(request.createdAt)}
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

      {/* Solicitation Request Form Modal */}
      {showRequestForm && (
        <div className={styles.modal} onClick={closeAllModals}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <h2>Submit Solicitation Request</h2>
              </div>
              <button onClick={closeAllModals} className={styles.closeButton} disabled={submitting}>
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <form onSubmit={handleFormSubmit} className={styles.applicationForm}>
                <div className={styles.formGrid}>
                  {/* Contact Person First Name */}
                  <div className={styles.formGroup}>
                    <label>Contact Person First Name *</label>
                    <div className={styles.inputWrapper}>
                      <User size={16} className={styles.inputIcon} />
                      <input
                        type="text"
                        value={formData.contactPersonFirstName}
                        onChange={(e) => handleInputChange('contactPersonFirstName', e.target.value)}
                        onBlur={(e) => handleInputBlur('contactPersonFirstName', e.target.value)}
                        required
                        placeholder="First Name"
                        className={getInputClass('contactPersonFirstName')}
                        maxLength={50}
                      />
                    </div>
                      {touched.contactPersonFirstName && fieldErrors.contactPersonFirstName && (
                        <div className={styles.errorMessage}>
                          {fieldErrors.contactPersonFirstName}
                        </div>
                      )}
                  </div>

                  {/* Contact Person Last Name */}
                  <div className={styles.formGroup}>
                    <label>Contact Person Last Name *</label>
                    <div className={styles.inputWrapper}>
                      <User size={16} className={styles.inputIcon} />
                      <input
                        type="text"
                        value={formData.contactPersonLastName}
                        onChange={(e) => handleInputChange('contactPersonLastName', e.target.value)}
                        onBlur={(e) => handleInputBlur('contactPersonLastName', e.target.value)}
                        required
                        placeholder="Last Name"
                        className={getInputClass('contactPersonLastName')}
                        maxLength={50}
                      />
                    </div>
                      {touched.contactPersonLastName && fieldErrors.contactPersonLastName && (
                        <div className={styles.errorMessage}>
                          {fieldErrors.contactPersonLastName}
                        </div>
                      )}
                  </div>

                  {/* Contact Number */}
                  <div className={styles.formGroup}>
                    <label>Contact Number *</label>
                    <div className={styles.phoneInputWrapper}>
                      <Phone size={16} className={styles.inputIcon} />
                      <span className={styles.phonePrefix}>+63</span>
                      <input
                        type="tel"
                        value={formData.contactNumber.replace(/^(\+63|63)/, '').replace(/^0/, '')}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value && !value.startsWith('09')) {
                            value = '09' + value.substring(value.startsWith('9') ? 1 : 0);
                          }
                          value = value.substring(0, 11);
                          handleInputChange('contactNumber', value);
                        }}
                        onBlur={(e) => handleInputBlur('contactNumber', formData.contactNumber)}
                        required
                        placeholder="09XX XXX XXXX"
                        className={`${styles.phoneInputWithIcon} ${getInputClass('contactNumber').split(' ').pop()}`}
                        maxLength={11}
                      />
                      </div>
                      {touched.contactNumber && fieldErrors.contactNumber && (
                        <div className={styles.errorMessage}>
                          {fieldErrors.contactNumber}
                        </div>
                      )}
                  </div>

                  {/* Organization Type - Custom Dropdown */}
                  <div className={styles.formGroup}>
                    <label>Organization Type *</label>
                    <div className={styles.inputWrapper}>
                      <Building2 size={16} className={styles.inputIcon} />
                      <div className={styles.customDropdown} ref={organizationTypeDropdownRef}>
                        <button
                          type="button"
                          onClick={toggleOrganizationTypeDropdown}
                          onBlur={(e) => {
                            // Only trigger blur validation if clicking outside the dropdown
                            if (!organizationTypeDropdownRef.current?.contains(e.relatedTarget)) {
                              handleInputBlur('organizationType', formData.organizationType);
                            }
                          }}
                          className={`${styles.customDropdownButton} ${organizationTypeDropdownOpen ? styles.active : ''} ${!formData.organizationType ? styles.placeholder : ''} ${touched.organizationType && fieldErrors.organizationType ? styles.inputInvalid : touched.organizationType ? styles.inputValid : ''}`}
                          required
                        >
                          <span>
                            {formData.organizationType || 'Select organization type'}
                          </span>
                          <ChevronDown size={16} className={`${styles.dropdownArrow} ${organizationTypeDropdownOpen ? styles.open : ''}`} />
                        </button>
                        <div className={`${styles.customDropdownContent} ${organizationTypeDropdownOpen ? styles.show : ''}`}>
                          {organizationTypes.map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                handleOrganizationTypeChange(type);
                                setTouched(prev => ({ ...prev, organizationType: true }));
                              }}
                              className={`${styles.customDropdownItem} ${formData.organizationType === type ? styles.active : ''}`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {touched.organizationType && fieldErrors.organizationType && (
                      <div className={styles.errorMessage}>
                        {fieldErrors.organizationType}
                      </div>
                    )}
                  </div>

                  {/* Organization Name */}
                  <div className={styles.formGroup}>
                    <label>Organization Name *</label>
                    <div className={styles.inputWrapper}>
                      <Building2 size={16} className={styles.inputIcon} />
                      <input
                        type="text"
                        value={formData.organizationName}
                        onChange={(e) => handleInputChange('organizationName', e.target.value)}
                        onBlur={(e) => handleInputBlur('organizationName', e.target.value)}
                        required
                        placeholder="Enter organization name"
                        className={getInputClass('organizationName')}
                        maxLength={150}
                      />
                    </div>
                    {touched.organizationName && fieldErrors.organizationName && (
                        <div className={styles.errorMessage}>
                          {fieldErrors.organizationName}
                        </div>
                      )}
                  </div>

                  {/* Street Address */}
                  <div className={styles.formGroup}>
                    <label>Street Address *</label>
                    <div className={styles.inputWrapper}>
                      <MapPin size={16} className={styles.inputIcon} />
                      <input
                        type="text"
                        value={formData.street}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                        onBlur={(e) => handleInputBlur('street', e.target.value)}
                        required
                        placeholder="House/Unit No., Street Name"
                        maxLength={200}
                        className={getInputClass('street')}
                        />
                      </div>
                        {touched.street && fieldErrors.street && (
                          <div className={styles.errorMessage}>
                             {fieldErrors.street}
                          </div>
                        )}
                  </div>

                  {/* Barangay Dropdown */}
                  <div className={styles.formGroup}>
                    <label>Barangay *</label>
                    <div className={styles.inputWrapper}>
                      <MapPin size={16} className={styles.inputIcon} />
                      <div className={styles.customDropdown} ref={barangayDropdownRef}>
                        <button
                          type="button"
                          onClick={toggleBarangayDropdown}
                          onBlur={(e) => {
                            // Only trigger blur validation if clicking outside the dropdown
                            if (!barangayDropdownRef.current?.contains(e.relatedTarget)) {
                              handleInputBlur('barangay', formData.barangay);
                            }
                          }}
                          className={`${styles.customDropdownButton} ${barangayDropdownOpen ? styles.active : ''} ${!formData.barangay ? styles.placeholder : ''} ${touched.barangay && fieldErrors.barangay ? styles.inputInvalid : touched.barangay ? styles.inputValid : ''}`}
                        >
                          <span>
                            {formData.barangay ? formatBarangayName(formData.barangay) : 'Select Barangay'}
                          </span>
                          <ChevronDown size={16} className={`${styles.dropdownArrow} ${barangayDropdownOpen ? styles.open : ''}`} />
                        </button>
                        <div className={`${styles.customDropdownContent} ${barangayDropdownOpen ? styles.show : ''}`}>
                          {barangays.map((barangay) => (
                            <button
                              key={barangay}
                              type="button"
                              onClick={() => {
                                handleBarangayChange(barangay);
                                setTouched(prev => ({ ...prev, barangay: true }));
                              }}
                              className={`${styles.customDropdownItem} ${formData.barangay === barangay ? styles.active : ''}`}
                            >
                              {formatBarangayName(barangay)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {touched.barangay && fieldErrors.barangay && (
                      <div className={styles.errorMessage}>
                        {fieldErrors.barangay}
                      </div>
                    )}
                  </div>

                  {/* Request Type - Custom Dropdown */}
                  <div className={styles.formGroup}>
                    <label>Request Type *</label>
                    <div className={styles.inputWrapper}>
                      <Type size={16} className={styles.inputIcon} />
                      <div className={styles.customDropdown} ref={requestTypeDropdownRef}>
                        <button
                          type="button"
                          onClick={toggleRequestTypeDropdown}
                          onBlur={(e) => {
                            // Only trigger blur validation if clicking outside the dropdown
                            if (!requestTypeDropdownRef.current?.contains(e.relatedTarget)) {
                              handleInputBlur('requestType', formData.requestType);
                            }
                          }}
                          className={`${styles.customDropdownButton} ${requestTypeDropdownOpen ? styles.active : ''} ${!formData.requestType ? styles.placeholder : ''} ${touched.requestType && fieldErrors.requestType ? styles.inputInvalid : touched.requestType ? styles.inputValid : ''}`}
                          required
                        >
                          <span>
                            {formData.requestType || 'Select request type'}
                          </span>
                          <ChevronDown size={16} className={`${styles.dropdownArrow} ${requestTypeDropdownOpen ? styles.open : ''}`} />
                        </button>
                        <div className={`${styles.customDropdownContent} ${requestTypeDropdownOpen ? styles.show : ''}`}>
                          {requestTypes.map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                handleRequestTypeChange(type);
                                setTouched(prev => ({ ...prev, requestType: true }));
                              }}
                              className={`${styles.customDropdownItem} ${formData.requestType === type ? styles.active : ''}`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {touched.requestType && fieldErrors.requestType && (
                      <div className={styles.errorMessage}>
                        {fieldErrors.requestType}
                      </div>
                    )}
                  </div>

                  {/* Specific Request Details */}
                  <div className={styles.formGroup}>
                    <label>Specific Request Details *</label>
                    <textarea
                      value={formData.requestedAssistanceDetails}
                      onChange={(e) => handleInputChange('requestedAssistanceDetails', e.target.value)}
                      onBlur={(e) => handleInputBlur('requestedAssistanceDetails', e.target.value)}
                      required
                      placeholder="Describe the specific assistance you are requesting..."
                      rows={4}
                      maxLength={1000}
                    />
                  </div>
                  {touched.requestedAssistanceDetails && fieldErrors.requestedAssistanceDetails && (
                    <div className={styles.errorMessage}>
                      {fieldErrors.requestedAssistanceDetails}
                    </div>
                  )}

                  {/* Purpose */}
                  <div className={styles.formGroup}>
                    <label>Purpose *</label>
                    <textarea
                      value={formData.purpose}
                      onChange={(e) => handleInputChange('purpose', e.target.value)}
                      onBlur={(e) => handleInputBlur('purpose', e.target.value)}
                      required
                      placeholder="Explain the purpose and importance of this request..."
                      rows={4}
                      maxLength={800}
                    />
                  </div>
                  {touched.purpose && fieldErrors.purpose && (
                    <div className={styles.errorMessage}>
                      {fieldErrors.purpose}
                    </div>
                  )}

                  {/* Solicitation Letter Upload */}
                  <div className={styles.formGroup}>
                    <label>Upload Solicitation Letter *</label>
                    <div className={styles.fileUpload}>
                      <input
                        type="file"
                        id="solicitationFile"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          handleInputChange('solicitationLetter', file);
                          setTouched(prev => ({ ...prev, solicitationLetter: true }));
                        }}
                        required
                        className={styles.fileInput}
                      />
                      <label 
                        htmlFor="solicitationFile" 
                        className={`${styles.fileLabel} ${touched.solicitationLetter && fieldErrors.solicitationLetter ? styles.fileError : touched.solicitationLetter && !fieldErrors.solicitationLetter ? styles.fileValid : ''}`}
                      >
                        <Upload size={18} />
                        {formData.solicitationLetter ? formData.solicitationLetter.name : 'Choose Solicitation Letter (PDF only)'}
                      </label>
                      </div>
                      {touched.solicitationLetter && fieldErrors.solicitationLetter && (
                        <div className={styles.errorMessage}>
                          {fieldErrors.solicitationLetter}
                        </div>
                      )}
                    <small className={styles.fileHint}>
                      Maximum file size: 5MB. Accepted formats: PDF only
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
                    {submitting ? 'Submitting...' : 'Submit Request'} 
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
            <p>You need to have an account to submit a solicitation request.</p>
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

export default SolicitationRequests;