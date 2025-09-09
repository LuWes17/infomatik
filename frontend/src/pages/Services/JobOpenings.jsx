import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  MapPin, 
  BriefcaseBusiness, 
  Filter, 
  X, 
  User,
  Phone,
  Upload,
  MapPin as LocationIcon,
  Calendar as CalendarIcon,
  Search,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './JobOpenings.module.css';
import { useNotification } from '../../contexts/NotificationContext';

const JobOpenings = () => {
  const { isAuthenticated, user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('open');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userApplications, setUserApplications] = useState(new Set());
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  
  // Added search and dropdown states
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [barangayDropdownOpen, setBarangayDropdownOpen] = useState(false);
  const barangayDropdownRef = useRef(null);

  // **NEW: Field validation states**
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const [applicationData, setApplicationData] = useState({
    firstName: '',
    lastName: '',
    birthday: '',
    phone: '',
    street: '',
    barangay: '',
    cvFile: null
  });
  
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
  
  const formatBarangayName = (barangay) => {
  return barangay.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

// Add this function to handle barangay selection
const handleBarangayChange = (barangay) => {
  setApplicationData({...applicationData, barangay: barangay});
  setBarangayDropdownOpen(false);

   // Validate if touched
  if (touched.barangay) {
    validateField('barangay', barangay);
  }
};

// Add this function to toggle barangay dropdown
const toggleBarangayDropdown = () => {
  setBarangayDropdownOpen(!barangayDropdownOpen);
};


  // Fetch user applications
  const fetchUserApplications = async () => {
    if (!isAuthenticated) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/jobs/my/applications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Fix: Use data.data instead of data.applications, and handle potential undefined
        const appliedJobIds = new Set(
          data.data.map(app => app.jobPosting?._id || app.jobPosting).filter(Boolean)
        );
        setUserApplications(appliedJobIds);
      }
    } catch (error) {
      console.error('Error fetching user applications:', error);
      // Don't throw error, just log it and continue
    }
  };

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/jobs');
      const data = await response.json();
      
      if (data.success) {
        // Sort by latest created first
        const sortedJobs = data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setJobs(sortedJobs);
        setFilteredJobs(sortedJobs.filter(job => job.status === 'open'));
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchUserApplications();
  }, [isAuthenticated]);

  // Close dropdown when clicking outside
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

  // Filter jobs - Updated to include search
  useEffect(() => {
    let filtered = jobs;

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(job => job.status === filterStatus);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.requirements.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredJobs(filtered);
  }, [jobs, filterStatus, searchTerm]);

  // Auto-populate form with user data when application form opens
  useEffect(() => {
    if (showApplicationForm && isAuthenticated && user) {
      setApplicationData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.contactNumber || '',
        barangay: user.barangay || ''
      }));
    }
  }, [showApplicationForm, isAuthenticated, user]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (barangayDropdownRef.current && !barangayDropdownRef.current.contains(event.target)) {
        setBarangayDropdownOpen(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getFieldValidation = (name, value) => {
    let isValid = true;
    let errorMessage = '';

    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value || !value.trim()) {
          isValid = false;
          errorMessage = `${name === 'firstName' ? 'First' : 'Last'} name is required.`;
        } else if (value.trim().length < 2) {
          isValid = false;
          errorMessage = `${name === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters.`;
        } else if (value.trim().length > 50) {
          isValid = false;
          errorMessage = `${name === 'firstName' ? 'First' : 'Last'} name must be less than 50 characters.`;
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          isValid = false;
          errorMessage = `${name === 'firstName' ? 'First' : 'Last'} name can only contain letters and spaces.`;
        }
        break;
      
      case 'birthday':
        if (!value) {
          isValid = false;
          errorMessage = 'Birthday is required.';
        } else {
          const today = new Date();
          const birthDate = new Date(value);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          
          if (birthDate > today) {
            isValid = false;
            errorMessage = 'Birthday cannot be in the future.';
          } else if (age < 16) {
            isValid = false;
            errorMessage = 'You must be at least 16 years old to apply.';
          } else if (age > 100) {
            isValid = false;
            errorMessage = 'Please enter a valid birth date.';
          }
        }
        break;
      
      case 'phone':
        const digits = value.replace(/\D/g, '');
        if (!digits) {
          isValid = false;
          errorMessage = 'Phone number is require.';
        } else if (digits.length !== 11) {
          isValid = false;
          errorMessage = 'Phone number must be exactly 11 digits.';
        } else if (!digits.startsWith('09')) {
          isValid = false;
          errorMessage = 'Phone number must start with 09.';
        }
        break;
      
      case 'street':
        if (!value || !value.trim()) {
          isValid = false;
          errorMessage = 'Street address is required.';
        } else if (value.trim().length < 5) {
          isValid = false;
          errorMessage = 'Street address must be at least 5 characters.';
        } else if (value.trim().length > 200) {
          isValid = false;
          errorMessage = 'Street address must be less than 200 characters.';
        }
        break;
      
      case 'barangay':
        if (!value) {
          isValid = false;
          errorMessage = 'Please select a barangay.';
        }
        break;
      
      case 'cvFile':
        if (!value) {
          isValid = false;
          errorMessage = 'CV file is required';
        } else {
          const allowedTypes = ['application/pdf'];
          const maxSize = 5 * 1024 * 1024; // 5MB
          
          if (!allowedTypes.includes(value.type)) {
            isValid = false;
            errorMessage = 'Only PDF files are allowed.';
          } else if (value.size > maxSize) {
            isValid = false;
            errorMessage = 'File size must be less than 5MB.';
          }
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

  // **NEW: Get input class based on validation state**
  const getInputClass = (fieldName) => {
    if (!touched[fieldName]) {
      return styles.inputWithIcon;
    }
    
    const hasError = fieldErrors[fieldName] && fieldErrors[fieldName] !== '';
    return `${styles.inputWithIcon} ${hasError ? styles.inputInvalid : styles.inputValid}`;
  };

  const handleInputChange = (field, value) => {
    // Handle phone number formatting
    if (field === 'phone') {
      let cleanValue = value.replace(/\D/g, '');
      // Ensure it starts with 09 if user types numbers
      if (cleanValue && !cleanValue.startsWith('09')) {
        cleanValue = '09' + cleanValue.substring(cleanValue.startsWith('9') ? 1 : 0);
      }
      // Limit to 11 digits
      cleanValue = cleanValue.substring(0, 11);
      value = cleanValue;
    }

    setApplicationData({...applicationData, [field]: value});
    
    // Validate field on change if already touched
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleInputBlur = (field, value) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    validateField(field, value);
  };

  const validateForm = () => {
    const newTouched = {
      firstName: true,
      lastName: true,
      birthday: true,
      phone: true,
      street: true,
      barangay: true,
      cvFile: true
    };
    setTouched(newTouched);

    let isFormValid = true;
    const newFieldErrors = {};
    
    Object.keys(applicationData).forEach(key => {
      const validation = getFieldValidation(key, applicationData[key]);
      newFieldErrors[key] = validation.errorMessage;
      if (!validation.isValid) {
        isFormValid = false;
      }
    });

    setFieldErrors(newFieldErrors);
    return isFormValid;
  };

  // Format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  
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


  // Check if deadline passed
  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };

  // Handle job card click
  const handleJobClick = (job) => {
    setSelectedJob(job);
    setShowJobDetails(true);
    document.body.style.overflow = "hidden";
  };

  // Handle apply button click
  const handleApplyClick = (e, job) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }
    
    // Check if user already applied for this job
    if (userApplications.has(job._id)) {
      setSelectedJob(job);
      return;
    }
    
    setSelectedJob(job);
    setShowApplicationForm(true);
    // Freeze background when application form opens
    document.body.style.overflow = "hidden";
  };

  // Check if user has applied for a specific job
  const hasUserApplied = (jobId) => {
    return userApplications.has(jobId);
  };

  // Handle application form submission
  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
    showError('Please fix the errors in the form before proceeding.');
    return;
    }
    
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('fullName', `${applicationData.firstName} ${applicationData.lastName}`);
      formData.append('birthday', applicationData.birthday);
      formData.append('phone', applicationData.phone);
      formData.append('address', `${applicationData.street}, ${applicationData.barangay}`);
      formData.append('cvFile', applicationData.cvFile);
      
      const response = await fetch(`http://localhost:4000/api/jobs/${selectedJob._id}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess('Application submitted successfully. You will be notified via SMS for status regarding your application.', 5000)
        setShowApplicationForm(false);
        // Add the job to user applications set
        setUserApplications(prev => new Set(prev.add(selectedJob._id)));
        setApplicationData({
          firstName: '',
          lastName: '',
          birthday: '',
          phone: '',
          street: '',
          barangay: '',
          cvFile: null
        });
        // Unfreeze background when form closes after successful submission
        document.body.style.overflow = "auto";
      } else {
        showError('Application submission failed. Please try again later.')
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  // Close all modals
  const closeAllModals = () => {
    setShowJobDetails(false);
    setShowApplicationForm(false);
    setShowAuthPrompt(false);
    setSelectedJob(null);

    setApplicationData({
    firstName: '',
    lastName: '',
    birthday: '',
    phone: '',
    street: '',
    barangay: '',
    cvFile: null
    });
    setFieldErrors({});
    setTouched({});

    // Unfreeze background when any modal closes
    document.body.style.overflow = "auto";
  };

  // Added filter dropdown handlers
  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  if (loading) {
    return (
      <div className={styles.jobOpenings}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading job openings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.jobOpenings}>
      {/* Header - Updated with search and filter */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <BriefcaseBusiness size={92} className={styles.icon} />
          <div className={styles.headerContent}>
            <h1>Job Openings</h1>
            <p>Mga trabahong pagkakataon sa aming komunidad. Makakasama namin kayo sa paglilingkod sa bayan.</p>
          </div>
        </div>
        
        <div className={styles.filterSection}>
          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search job openings..."
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
              <span>{filterStatus === 'open' ? 'Open' : filterStatus === 'closed' ? 'Closed' : 'All Jobs'}</span>
              <ChevronDown size={16} className={`${styles.dropdownArrow} ${dropdownOpen ? styles.open : ''}`} />
            </button>
            <div className={`${styles.dropdownContent} ${dropdownOpen ? styles.show : ''}`}>
              <button
                onClick={() => handleFilterChange('open')}
                className={`${styles.dropdownItem} ${filterStatus === 'open' ? styles.active : ''}`}
              >
                Open 
              </button>
              <button
                onClick={() => handleFilterChange('closed')}
                className={`${styles.dropdownItem} ${filterStatus === 'closed' ? styles.active : ''}`}
              >
                Closed 
              </button>
              <button
                onClick={() => handleFilterChange('all')}
                className={`${styles.dropdownItem} ${filterStatus === 'all' ? styles.active : ''}`}
              >
                All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className={styles.content}>
        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <div className={styles.noJobs}>
            <BriefcaseBusiness size={80} />
            <h3>No jobs found</h3>
            <p>
              {searchTerm || filterStatus !== 'open' 
                ? 'Try adjusting your search or filter criteria' 
                : 'There are no open positions at the moment. Please check back later.'}
            </p>
          </div>
        ) : (
          <div className={styles.jobsGrid}>
            {filteredJobs.map(job => (
              <div 
                key={job._id} 
                className={`${styles.jobCard} ${job.status === 'closed' ? styles.closedJob : ''}`}
                onClick={() => handleJobClick(job)}
              >
                {/* Job Status Badge */}
                <div className={`${styles.statusBadge} ${styles[job.status]}`}>
                  {job.status === 'open' ? 'Open' : 'Closed'}
                </div>

                {/* Job Title */}
                <h3 className={styles.jobTitle}>{job.title}</h3>

                {/* Job Info */}
                <div className={styles.jobInfo}>
                  <div className={styles.infoItem}>
                    <MapPin size={16} />
                    <span>{job.location || 'Not specified'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <BriefcaseBusiness size={16} />
                    <span>{job.employmentType || 'Full-Time'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <Calendar size={16} />
                    <span>
                    {formatDate(job.applicationDeadline)}
                      {isDeadlinePassed(job.applicationDeadline) && (
                        <span className={styles.expired}> (Expired)</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Requirements Preview */}
                <div className={styles.requirements}>
                  <strong>Requirements:</strong>
                  <p>{job.requirements.substring(0, 100)}...</p>
                </div>

                {/* Card Actions */}
                <div className={styles.cardActions}>
                  <button 
                    className={styles.viewMoreBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJobClick(job);
                    }}
                  >
                    View Details
                  </button>
                  
                  {job.status === 'open' && !isDeadlinePassed(job.applicationDeadline) && (
                  hasUserApplied(job._id) ? (
                    <div 
                      className={styles.appliedBtn}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Already Applied
                    </div>
                  ) : (
                    <button 
                      className={styles.applyBtn}
                      onClick={(e) => handleApplyClick(e, job)}
                    >
                      Apply Now
                    </button>
                  )
                )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {showJobDetails && selectedJob && (
        <div className={styles.modal} onClick={closeAllModals}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <h2>{selectedJob.title}</h2>
                <span className={`${styles.statusBadge} ${styles[selectedJob.status]}`}>
                  {selectedJob.status === 'open' ? 'Open' : 'Closed'}
                </span>
              </div>
              <button onClick={closeAllModals} className={styles.closeButton}>
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>        
              {/* Job Details Grid */}
              <div className={styles.jobDetailsGrid}>
                <div className={styles.detailItem}>
                  <MapPin size={20} />
                  <div>
                    <strong>Location:</strong> {selectedJob.location || 'Not specified'}
                  </div>
                </div>
                
                <div className={styles.detailItem}>
                  <BriefcaseBusiness size={20} />
                  <div>
                    <strong>Employment Type:</strong> {selectedJob.employmentType || 'Full-Time'}
                  </div>
                </div>
              
                <div className={styles.detailItem}>
                  <Calendar size={20} />
                  <div>
                    <strong>Application Deadline:</strong> {formatDate(selectedJob.applicationDeadline)}
                    {isDeadlinePassed(selectedJob.applicationDeadline) && (
                      <span className={styles.expired}> (Expired)</span>
                    )}
                  </div>
                </div>
              
                <div className={styles.detailItem}>
                  <User size={20} />
                  <div>
                    <strong>Available Positions:</strong> {selectedJob.positionsAvailable}{' '}
                    {selectedJob.positionsAvailable === 1 ? 'Opening' : 'Openings'}
                  </div>
                </div>
              </div>
      
              {/* Job Description */}
              <div className={styles.section}>
                <h4>Job Description</h4>
                <p className={styles.description}>{selectedJob.description}</p>
              </div>
      
              {/* Requirements */}
              <div className={styles.section}>
                <h4>Requirements</h4>
                <p className={styles.requirements}>{selectedJob.requirements}</p>
              </div>
      
              {/* Apply Button */}
              {selectedJob.status === 'open' && !isDeadlinePassed(selectedJob.applicationDeadline) && (
                <div className={styles.modalActions}>
                  {hasUserApplied(selectedJob._id) ? (
                    <div
                      className={styles.appliedBtn}
                    >
                      Already Applied
                    </div>
                  ) : (
                    <button 
                      className={styles.applyBtn}
                      onClick={() => handleApplyClick({stopPropagation: () => {}}, selectedJob)}
                    >
                      Apply for this Position
                    </button>
                  )}
                </div>
              )}
              
                <div className={styles.modalMetadata}>
                  <div className={styles.metaItem}>
                    <strong>Published:</strong> {formatDateTime(selectedJob.createdAt)}
                  </div>
                  {selectedJob.updatedAt !== selectedJob.createdAt && (
                    <div className={styles.metaItem}>
                      <strong>Last Updated:</strong> {formatDateTime(selectedJob.updatedAt)}
                    </div>
                  )}
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Form Modal */}
      {showApplicationForm && selectedJob && (
        <div className={styles.modal} onClick={closeAllModals}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <h2>Apply for {selectedJob.title}</h2>
              </div>
              <button className={styles.closeButton} onClick={closeAllModals}>
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <form onSubmit={handleApplicationSubmit} className={styles.applicationForm}>
                <div className={styles.formGrid}>
                  {/* First Name Input */}
                  <div className={styles.formGroup}>
                    <label>
                      First Name *
                    </label>
                    <div className={styles.inputWrapper}>
                      <User size={16} className={styles.inputIcon} />
                      <input
                        type="text"
                        value={applicationData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        onBlur={(e) => handleInputBlur('firstName', e.target.value)}
                        required
                        placeholder="First Name"
                        className={getInputClass('firstName')}
                        maxLength={50}
                      />
                      </div>
                      {touched.firstName && fieldErrors.firstName && (
                        <div className={styles.errorMessage}>
                          {fieldErrors.firstName}
                        </div>
                      )}
                  </div>

                  {/* Last Name Input */}
                  <div className={styles.formGroup}>
                    <label>
                      Last Name *
                    </label>
                    <div className={styles.inputWrapper}>
                      <User size={16} className={styles.inputIcon} />
                      <input
                        type="text"
                        value={applicationData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        onBlur={(e) => handleInputBlur('lastName', e.target.value)}
                        required
                        placeholder="Last Name"
                        className={getInputClass('lastName')}
                        maxLength={50}
                      />
                    </div>
                    {touched.lastName && fieldErrors.lastName && (
                      <div className={styles.errorMessage}>
                        {fieldErrors.lastName}
                      </div>
                    )}
                  </div>

                  {/* Birthday Input */}
                  <div className={styles.formGroup}>
                    <label>
                      Birthday *
                    </label>
                    <div className={styles.inputWrapper}>
                      <CalendarIcon size={16} className={styles.inputIcon} />
                      <input
                        type="date"
                        value={applicationData.birthday}
                        onChange={(e) => handleInputChange('birthday', e.target.value)}
                        onBlur={(e) => handleInputBlur('birthday', e.target.value)}
                        required
                        max={new Date().toISOString().split('T')[0]}
                        className={getInputClass('birthday')}
                      />
                    </div>
                    {touched.birthday && fieldErrors.birthday && (
                      <div className={styles.errorMessage}>
                        {fieldErrors.birthday}
                      </div>
                    )}
                  </div>

                  {/* Phone Number Input */}
                  <div className={styles.formGroup}>
                    <label>
                      Phone Number *
                    </label>
                    <div className={styles.phoneInputWrapper}>
                      <Phone size={16} className={styles.inputIcon} />
                      <span className={styles.phonePrefix}>+63</span>
                      <input
                        type="tel"
                        value={applicationData.phone.replace(/^(\+63|63)/, '').replace(/^0/, '')}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          // Format as 09XXXXXXXXX
                          if (value && !value.startsWith('09')) {
                            value = '09' + value.substring(value.startsWith('9') ? 1 : 0);
                          }
                          value = value.substring(0, 11);
                          handleInputChange('phone', value);
                        }}
                        onBlur={(e) => handleInputBlur('phone', applicationData.phone)}
                        required
                        placeholder="09XX XXX XXXX"
                        className={`${styles.phoneInputWithIcon} ${getInputClass('phone').split(' ').pop()}`}
                        maxLength={11}
                      />
                    </div>
                    {touched.phone && fieldErrors.phone && (
                      <div className={styles.errorMessage}>
                        {fieldErrors.phone}
                      </div>
                    )}
                  </div>

                  {/* Street Address Input */}
                  <div className={styles.formGroup}>
                    <label>
                      Street Address *
                    </label>
                    <div className={styles.inputWrapper}>
                      <LocationIcon size={16} className={styles.inputIcon} />
                      <input
                        type="text"
                        value={applicationData.street}
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
                              handleInputBlur('barangay', applicationData.barangay);
                            }
                          }}
                          className={`${styles.customDropdownButton} ${barangayDropdownOpen ? styles.active : ''} ${!applicationData.barangay ? styles.placeholder : ''} ${touched.barangay && fieldErrors.barangay ? styles.inputInvalid : touched.barangay ? styles.inputValid : ''}`}
                        >
                          <span>
                            {applicationData.barangay ? formatBarangayName(applicationData.barangay) : 'Select Barangay'}
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
                              className={`${styles.customDropdownItem} ${applicationData.barangay === barangay ? styles.active : ''}`}
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

                  {/* CV Upload Input */}
                  <div className={styles.formGroup}>
                    <label>
                      Upload CV/Resume *
                    </label>
                    <div className={styles.fileUpload}>
                      <input
                        type="file"
                        id="cvFile"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          handleInputChange('cvFile', file);
                          setTouched(prev => ({ ...prev, cvFile: true }));
                        }}
                        required
                        className={styles.fileInput}
                      />
                      <label 
                        htmlFor="cvFile" 
                        className={`${styles.fileLabel} ${touched.cvFile && fieldErrors.cvFile ? styles.fileError : touched.cvFile && !fieldErrors.cvFile ? styles.fileValid : ''}`}
                      >
                        <Upload size={18} />
                        {applicationData.cvFile ? applicationData.cvFile.name : 'Choose CV file (PDF only)'}
                      </label>
                    </div>
                    {touched.cvFile && fieldErrors.cvFile && (
                      <div className={styles.errorMessage}>
                        {fieldErrors.cvFile}
                      </div>
                    )}
                    <small className={styles.fileHint}>
                      Maximum file size: 5MB. Accepted format: PDF only.
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
                    {submitting ? 'Submitting...' : 'Submit Application'}
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
            <p>You need to have an account to apply for job positions.</p>
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

export default JobOpenings;