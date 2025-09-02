// frontend/src/pages/JobOpenings/JobOpenings.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  MapPin, 
  BriefcaseBusiness, 
  Filter, 
  X, 
  Eye,
  User,
  Phone,
  FileText,
  Clock,
  Upload,
  MapPin as LocationIcon,
  Calendar as CalendarIcon,
  Search,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './JobOpenings.module.css';

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
  
  // Added search and dropdown states
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [barangayDropdownOpen, setBarangayDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const barangayDropdownRef = useRef(null);
  
  // Barangays list for dropdown
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
  
  const [applicationData, setApplicationData] = useState({
    firstName: '',
    lastName: '',
    birthday: '',
    phone: '',
    street: '',
    barangay: '',
    city: '',
    cvFile: null
  });

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
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (barangayDropdownRef.current && !barangayDropdownRef.current.contains(event.target)) {
        setBarangayDropdownOpen(false);
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
        barangay: user.barangay || '',
        city: 'General Trias' // Default city based on your location
      }));
    }
  }, [showApplicationForm, isAuthenticated, user]);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
    
    setSelectedJob(job);
    setShowApplicationForm(true);
  };

  // Handle application form submission
  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    
    if (!applicationData.cvFile) {
      alert('Please upload your CV file');
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
      formData.append('address', `${applicationData.street}, ${applicationData.barangay}, ${applicationData.city}`);
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
        alert('Application submitted successfully!');
        setShowApplicationForm(false);
        setApplicationData({
          firstName: '',
          lastName: '',
          birthday: '',
          phone: '',
          street: '',
          barangay: '',
          city: '',
          cvFile: null
        });
      } else {
        alert(data.message || 'Failed to submit application');
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

  const toggleBarangayDropdown = () => {
    setBarangayDropdownOpen(!barangayDropdownOpen);
  };

  const handleBarangaySelect = (barangay) => {
    setApplicationData({...applicationData, barangay: barangay});
    setBarangayDropdownOpen(false);
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
                Open ({jobs.filter(job => job.status === 'open').length})
              </button>
              <button
                onClick={() => handleFilterChange('closed')}
                className={`${styles.dropdownItem} ${filterStatus === 'closed' ? styles.active : ''}`}
              >
                Closed ({jobs.filter(job => job.status === 'closed').length})
              </button>
              <button
                onClick={() => handleFilterChange('all')}
                className={`${styles.dropdownItem} ${filterStatus === 'all' ? styles.active : ''}`}
              >
                All ({jobs.length})
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
                    <button 
                      className={styles.applyBtn}
                      onClick={(e) => handleApplyClick(e, job)}
                    >
                      Apply Now
                    </button>
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
              <h2>{selectedJob.title}</h2>
              {/* Job Status Badge - moved to header */}
              <div className={`${styles.statusBadge} ${styles[selectedJob.status]} ${styles.large}`}>
                {selectedJob.status === 'open' ? 'Open Position' : 'Position Closed'}
              </div>
              <button className={styles.closeBtn} onClick={closeAllModals}>
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
                  <button 
                    className={styles.applyBtn}
                    onClick={() => handleApplyClick({stopPropagation: () => {}}, selectedJob)}
                  >
                    Apply for this Position
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Application Form Modal - UPDATED WITH REGISTRATION FORM STYLING */}
      {showApplicationForm && selectedJob && (
        <div className={styles.modal} onClick={closeAllModals}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <h2>Apply for {selectedJob.title}</h2>
              </div>
              <button className={styles.closeBtn} onClick={closeAllModals}>
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <form onSubmit={handleApplicationSubmit} className={styles.applicationForm}>
                <div className={styles.formGrid}>
                  {/* First Name Input */}
                  <div className={styles.formGroup}>
                    <label>
                      First Name <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.inputWrapper}>
                      <User size={16} className={styles.inputIcon} />
                      <input
                        type="text"
                        value={applicationData.firstName}
                        onChange={(e) => setApplicationData({...applicationData, firstName: e.target.value})}
                        required
                        placeholder="First Name"
                        className={styles.inputWithIcon}
                        maxLength={50}
                      />
                    </div>
                  </div>

                  {/* Last Name Input */}
                  <div className={styles.formGroup}>
                    <label>
                      Last Name <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.inputWrapper}>
                      <User size={16} className={styles.inputIcon} />
                      <input
                        type="text"
                        value={applicationData.lastName}
                        onChange={(e) => setApplicationData({...applicationData, lastName: e.target.value})}
                        required
                        placeholder="Last Name"
                        className={styles.inputWithIcon}
                        maxLength={50}
                      />
                    </div>
                  </div>

                  {/* Birthday Input */}
                  <div className={styles.formGroup}>
                    <label>
                      Birthday <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.inputWrapper}>
                      <CalendarIcon size={16} className={styles.inputIcon} />
                      <input
                        type="date"
                        value={applicationData.birthday}
                        onChange={(e) => setApplicationData({...applicationData, birthday: e.target.value})}
                        required
                        max={new Date().toISOString().split('T')[0]}
                        className={styles.inputWithIcon}
                      />
                    </div>
                  </div>

                  {/* Phone Number Input */}
                  <div className={styles.formGroup}>
                    <label>
                      Phone Number <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.phoneInputWrapper}>
                      <Phone size={16} className={styles.inputIcon} />
                      <span className={styles.phonePrefix}>+63</span>
                      <input
                        type="tel"
                        value={applicationData.phone.replace(/^(\+63|63)/, '').replace(/^09/, '9')}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          // Ensure it starts with 9 if user types numbers
                          if (value && !value.startsWith('9')) {
                            value = '9' + value.substring(1);
                          }
                          // Limit to 10 digits (9xxxxxxxxx)
                          value = value.substring(0, 10);
                          setApplicationData({...applicationData, phone: `09${value.substring(1)}`});
                        }}
                        required
                        placeholder="9XX XXX XXXX"
                        pattern="^9\d{9}$"
                        title="Please enter a valid Philippine mobile number (9XXXXXXXXX)"
                        className={styles.phoneInputWithIcon}
                        maxLength={10}
                      />
                    </div>
                  </div>

                  {/* Street Address Input */}
                  <div className={styles.formGroup}>
                    <label>
                      Street Address <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.inputWrapper}>
                      <LocationIcon size={16} className={styles.inputIcon} />
                      <input
                        type="text"
                        value={applicationData.street}
                        onChange={(e) => setApplicationData({...applicationData, street: e.target.value})}
                        required
                        placeholder="House/Unit No., Street Name"
                        maxLength={200}
                        className={styles.inputWithIcon}
                      />
                    </div>
                  </div>

                  {/* Barangay Custom Dropdown */}
                  <div className={styles.formGroup}>
                    <label>
                      Barangay <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.barangayFilterDropdown} ref={barangayDropdownRef}>
                      <MapPin size={16} className={styles.barangayFilterIcon} />
                      <button
                        type="button"
                        onClick={toggleBarangayDropdown}
                        className={`${styles.barangayDropdownButton} ${barangayDropdownOpen ? styles.active : ''}`}
                      >
                        <span className={!applicationData.barangay ? styles.placeholder : ''}>
                          {applicationData.barangay ? 
                            applicationData.barangay.split(' ').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ') 
                            : 'Select Barangay'
                          }
                        </span>
                        <ChevronDown size={16} className={`${styles.barangayDropdownArrow} ${barangayDropdownOpen ? styles.open : ''}`} />
                      </button>
                      <div className={`${styles.barangayDropdownContent} ${barangayDropdownOpen ? styles.show : ''}`}>
                        {barangays.map((barangay) => (
                          <button
                            key={barangay}
                            type="button"
                            onClick={() => handleBarangaySelect(barangay)}
                            className={`${styles.barangayDropdownItem} ${applicationData.barangay === barangay ? styles.active : ''}`}
                          >
                            {barangay.split(' ').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* City Input (Pre-filled and readonly) */}
                  <div className={styles.formGroup}>
                    <label>
                      City <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.inputWrapper}>
                      <LocationIcon size={16} className={styles.inputIcon} />
                      <input
                        type="text"
                        value={applicationData.city}
                        onChange={(e) => setApplicationData({...applicationData, city: e.target.value})}
                        required
                        placeholder="City"
                        className={styles.inputWithIcon}
                        maxLength={100}
                      />
                    </div>
                  </div>

                  {/* CV Upload Input */}
                  <div className={styles.formGroup}>
                    <label>
                      Upload CV/Resume <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.fileUpload}>
                      <input
                        type="file"
                        id="cvFile"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setApplicationData({...applicationData, cvFile: e.target.files[0]})}
                        required
                        className={styles.fileInput}
                      />
                      <label htmlFor="cvFile" className={styles.fileLabel}>
                        <Upload size={18} />
                        {applicationData.cvFile ? applicationData.cvFile.name : 'Choose CV file (PDF, DOC, DOCX)'}
                      </label>
                    </div>
                    <small className={styles.fileHint}>
                      Maximum file size: 5MB. Accepted formats: PDF, DOC, DOCX
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