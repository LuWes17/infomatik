// frontend/src/pages/JobOpenings/JobOpenings.jsx
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Briefcase, 
  Filter, 
  X, 
  Eye,
  User,
  Phone,
  FileText,
  Clock,
  Upload,
  MapPin as LocationIcon,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './JobOpenings.module.css';

const JobOpenings = () => {
  const { isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('open');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [applicationData, setApplicationData] = useState({
    fullName: '',
    birthday: '',
    phone: '',
    address: '',
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

  // Filter jobs
  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredJobs(jobs);
    } else {
      setFilteredJobs(jobs.filter(job => job.status === filterStatus));
    }
  }, [jobs, filterStatus]);

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
      formData.append('fullName', applicationData.fullName);
      formData.append('birthday', applicationData.birthday);
      formData.append('phone', applicationData.phone);
      formData.append('address', applicationData.address);
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
          fullName: '',
          birthday: '',
          phone: '',
          address: '',
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
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading job openings...</p>
      </div>
    );
  }

  return (
    <div className={styles.jobOpenings}>
      {/* Header */}
      <div className={styles.header}>
        <h1>Job Openings</h1>
        <p>Discover career opportunities in our community</p>
      </div>

      {/* Filter Section */}
      <div className={styles.filterSection}>
        <div className={styles.filterIcon}>
          <Filter size={20} />
        </div>
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterBtn} ${filterStatus === 'open' ? styles.active : ''}`}
            onClick={() => setFilterStatus('open')}
          >
            Open Positions ({jobs.filter(job => job.status === 'open').length})
          </button>
          <button
            className={`${styles.filterBtn} ${filterStatus === 'closed' ? styles.active : ''}`}
            onClick={() => setFilterStatus('closed')}
          >
            Closed Positions ({jobs.filter(job => job.status === 'closed').length})
          </button>
          <button
            className={`${styles.filterBtn} ${filterStatus === 'all' ? styles.active : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All Jobs ({jobs.length})
          </button>
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className={styles.noJobs}>
          <Briefcase size={48} />
          <h3>No jobs found</h3>
          <p>
            {filterStatus === 'open' 
              ? 'There are no open positions at the moment. Please check back later.' 
              : `No ${filterStatus} jobs available.`
            }
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
                  <Briefcase size={16} />
                  <span>{job.employmentType || 'Full-time'}</span>
                </div>
                <div className={styles.infoItem}>
                  <Calendar size={16} />
                  <span>
                    Deadline: {formatDate(job.applicationDeadline)}
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
                  <Eye size={16} />
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

      {/* Job Details Modal */}
      {showJobDetails && selectedJob && (
        <div className={styles.modal} onClick={closeAllModals}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{selectedJob.title}</h2>
              <button className={styles.closeBtn} onClick={closeAllModals}>
                <X size={24} />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {/* Job Status */}
              <div className={`${styles.statusBadge} ${styles[selectedJob.status]} ${styles.large}`}>
                {selectedJob.status === 'open' ? 'Open Position' : 'Position Closed'}
              </div>

              {/* Job Details Grid */}
              <div className={styles.jobDetailsGrid}>
                <div className={styles.detailItem}>
                  <MapPin size={18} />
                  <div>
                    <strong>Location:</strong>
                    <p>{selectedJob.location || 'Not specified'}</p>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <Briefcase size={18} />
                  <div>
                    <strong>Employment Type:</strong>
                    <p>{selectedJob.employmentType || 'Full-time'}</p>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <Calendar size={18} />
                  <div>
                    <strong>Application Deadline:</strong>
                    <p>
                      {formatDate(selectedJob.applicationDeadline)}
                      {isDeadlinePassed(selectedJob.applicationDeadline) && (
                        <span className={styles.expired}> (Expired)</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <User size={18} />
                  <div>
                    <strong>Positions Available:</strong>
                    <p>{selectedJob.positionsAvailable}</p>
                  </div>
                </div>
              </div>

              {/* Salary Information */}
              {(selectedJob.salary?.min || selectedJob.salary?.max) && (
                <div className={styles.salaryInfo}>
                  <h4>Salary Range</h4>
                  <p>
                    {selectedJob.salary.currency || 'PHP'} {selectedJob.salary.min ? `${selectedJob.salary.min.toLocaleString()}` : 'N/A'} 
                    {selectedJob.salary.max && selectedJob.salary.min && ' - '}
                    {selectedJob.salary.max ? `${selectedJob.salary.max.toLocaleString()}` : ''}
                  </p>
                </div>
              )}

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

      {/* Application Form Modal */}
      {showApplicationForm && selectedJob && (
        <div className={styles.modal} onClick={closeAllModals}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Apply for {selectedJob.title}</h2>
              <button className={styles.closeBtn} onClick={closeAllModals}>
                <X size={24} />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <form onSubmit={handleApplicationSubmit} className={styles.applicationForm}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>
                      <User size={16} />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={applicationData.fullName}
                      onChange={(e) => setApplicationData({...applicationData, fullName: e.target.value})}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>
                      <CalendarIcon size={16} />
                      Birthday *
                    </label>
                    <input
                      type="date"
                      value={applicationData.birthday}
                      onChange={(e) => setApplicationData({...applicationData, birthday: e.target.value})}
                      required
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>
                      <Phone size={16} />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={applicationData.phone}
                      onChange={(e) => setApplicationData({...applicationData, phone: e.target.value})}
                      required
                      placeholder="09XXXXXXXXX or +639XXXXXXXXX"
                      pattern="^(09|\+639)\d{9}$"
                      title="Please enter a valid Philippine mobile number"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>
                      <LocationIcon size={16} />
                      Complete Address *
                    </label>
                    <textarea
                      value={applicationData.address}
                      onChange={(e) => setApplicationData({...applicationData, address: e.target.value})}
                      required
                      rows={3}
                      placeholder="Enter your complete address"
                      maxLength={300}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>
                      <Upload size={16} />
                      Upload CV/Resume *
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