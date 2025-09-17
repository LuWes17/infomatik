// frontend/src/pages/Profile/pages/JobApplications.jsx
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  MapPin, 
  BriefcaseBusiness, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  X,
  Download,
  Users
} from 'lucide-react';
import styles from './JobApplications.module.css';

const API_BASE = import.meta.env.VITE_API_URL; // e.g. http://localhost:4000/api

const JobApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's job applications
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/jobs/my/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setApplications(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to load job applications');
    } finally {
      setLoading(false);
    }
  };

  // Fetch detailed job information when viewing application details
  const fetchJobDetails = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching job details:', error);
      return null;
    }
  };

  useEffect(() => {
    if (showDetails) {
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '17px'; // Prevent layout shift from scrollbar
    } else {
      // Restore scrolling when modal is closed
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [showDetails]);

  // Handle card click to show details
  const handleCardClick = async (application) => {
    setSelectedApplication(application);
    
    // If we need more job details, fetch them
    if (application.jobPosting && typeof application.jobPosting === 'string') {
      const jobDetails = await fetchJobDetails(application.jobPosting);
      if (jobDetails) {
        setSelectedApplication({
          ...application,
          jobPosting: jobDetails
        });
      }
    }
    
    setShowDetails(true);
  };

  // Close details modal
  const closeDetails = () => {
    setShowDetails(false);
    setSelectedApplication(null);

    document.body.style.overflow = 'unset';
    document.body.style.paddingRight = '0px';
  };

  // Handle CV view - opens CV in new tab
  const handleViewCV = (cvUrl, applicantName) => {
    if (!cvUrl) {
      alert('CV file not available');
      return;
    }
    
    try {
      // Open CV in new tab
      window.open(cvUrl, '_blank');
    } catch (error) {
      console.error('Error opening CV:', error);
      alert('Unable to open CV file');
    }
  };

  // Get status icon and color
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'accepted':
        return {
          icon: <CheckCircle size={20} />,
          className: styles.statusAccepted,
          text: 'Accepted'
        };
      case 'rejected':
        return {
          icon: <XCircle size={20} />,
          className: styles.statusRejected,
          text: 'Rejected'
        };
      case 'pending':
      default:
        return {
          icon: <Clock size={20} />,
          className: styles.statusPending,
          text: 'Under Review'
        };
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const capitalizeBarangay = (address) => {
  if (!address) return address;
  
  // Split address by comma to get parts
  const parts = address.split(',').map(part => part.trim());
  
  // Capitalize the first letter of each part (assuming barangay is one of the parts)
  const capitalizedParts = parts.map(part => {
    if (part.length === 0) return part;
    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
  });
  
  return capitalizedParts.join(', ');
};

  useEffect(() => {
    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>My Job Applications</h2>
          <p className={styles.subtitle}>Track your application status</p>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading your applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>My Job Applications</h2>
          <p className={styles.subtitle}>Track your application status</p>
        </div>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <button onClick={fetchApplications} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {applications.length === 0 ? (
        <div className={styles.emptyState}>
          <FileText size={64} className={styles.emptyIcon} />
          <h3>No Applications Yet</h3>
          <p>You haven't applied for any jobs yet. Browse our job openings to get started!</p>
          <a href="/services/job-openings" className={styles.browseButton}>
            Browse Jobs
          </a>
        </div>
      ) : (
        <div className={styles.applicationsGrid}>
          {applications.map((application) => {
            const statusDisplay = getStatusDisplay(application.status);
            
            return (
              <div 
                key={application._id} 
                className={styles.applicationCard}
                onClick={() => handleCardClick(application)}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>
                    <h3>{application.jobPosting?.title || 'Job Position'}</h3>
                  </div>
                  <div className={`${styles.statusBadge} ${statusDisplay.className}`}>
                    {statusDisplay.icon}
                    <span>{statusDisplay.text}</span>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardMeta}>
                    {application.jobPosting?.location && (
                      <div className={styles.metaItem}>
                        <MapPin size={16} />
                        <span>{application.jobPosting.location}</span>
                      </div>
                    )}
                    {application.jobPosting?.employmentType && (
                      <div className={styles.metaItem}>
                        <BriefcaseBusiness size={16} />
                        <span className={styles.employmentType}>
                          {application.jobPosting.employmentType}
                        </span>
                      </div>
                    )}
                    <div className={styles.metaItem}>
                      <Calendar size={16} />
                      <span>{formatDate(application.jobPosting.applicationDeadline)}</span>
                    </div>
                  </div>

                  {application.jobPosting?.requirements && (
                    <div className={styles.requirements}>
                      <strong>Requirements:</strong>
                      <p>
                        {application.jobPosting.requirements.length > 100 
                          ? `${application.jobPosting.requirements.substring(0, 100)}...`
                          : application.jobPosting.requirements
                        }
                      </p>
                    </div>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <button className={styles.viewButton}>
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Application Details Modal */}
      {showDetails && selectedApplication && (
        <div className={styles.modalOverlay} onClick={closeDetails}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{selectedApplication.jobPosting?.title || 'Job Application'}</h2>
              <button 
                className={styles.closeButton}
                onClick={closeDetails}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Status Section */}
              <div className={styles.statusSection}>
                <p className={styles.applicationDate}>
                  Applied on {formatDate(selectedApplication.createdAt)}
                </p>
                <div className={`${styles.statusBadge} ${getStatusDisplay(selectedApplication.status).className}`}>
                  {getStatusDisplay(selectedApplication.status).icon}
                  <span>{getStatusDisplay(selectedApplication.status).text}</span>
                </div>
              </div>

              {/* Job Details Section */}
              {selectedApplication.jobPosting && (
              <div className={styles.jobDetailsSection}>
                <h3>Job Details</h3>
                
                {/* Job Details Grid */}
                <div className={styles.jobDetailsGrid}>
                  {selectedApplication.jobPosting.location && (
                    <div className={styles.detailItem}>
                      <MapPin size={18} />
                      <div>
                        <strong>Location:</strong> {selectedApplication.jobPosting.location}
                      </div>
                    </div>
                  )}
                  
                  {selectedApplication.jobPosting.employmentType && (
                    <div className={styles.detailItem}>
                      <BriefcaseBusiness size={18} />
                      <div>
                        <strong>Employment Type:</strong> {selectedApplication.jobPosting.employmentType}
                      </div>
                    </div>
                  )}
                
                  {selectedApplication.jobPosting.applicationDeadline && (
                    <div className={styles.detailItem}>
                      <Calendar size={18} />
                      <div>
                        <strong>Application Deadline:</strong> {formatDate(selectedApplication.jobPosting.applicationDeadline)}
                      </div>
                    </div>
                  )}
                
                  {selectedApplication.jobPosting.positionsAvailable && (
                    <div className={styles.detailItem}>
                      <Users size={18} />
                      <div>
                        <strong>Available Positions:</strong> {selectedApplication.jobPosting.positionsAvailable}{' '}
                        {selectedApplication.jobPosting.positionsAvailable === 1 ? 'Opening' : 'Openings'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Job Description */}
                {selectedApplication.jobPosting.description && (
                  <div className={styles.section}>
                    <h4>Job Description</h4>
                    <p className={styles.description}>{selectedApplication.jobPosting.description}</p>
                  </div>
                )}

                {/* Requirements */}
                {selectedApplication.jobPosting.requirements && (
                  <div className={styles.section}>
                    <h4>Requirements</h4>
                    <p className={styles.requirements}>{selectedApplication.jobPosting.requirements}</p>
                  </div>
                )}
              </div>
            )}

              {/* Application Details Section */}
              <div className={styles.applicationDetailsSection}>
                <h3>Your Application</h3>
                
                <div className={styles.applicantInfo}>
                  <strong>Personal Information</strong>
                  <div className={styles.infoGrid}>
                    {selectedApplication.fullName && (
                      <div className={styles.infoItem}>
                        <strong>Full Name:</strong>
                        <span>{selectedApplication.fullName}</span>
                      </div>
                    )}
                    {selectedApplication.birthday && (
                      <div className={styles.infoItem}>
                        <strong>Birthday:</strong>
                        <span>{formatDate(selectedApplication.birthday)}</span>
                      </div>
                    )}
                    {selectedApplication.phone && (
                      <div className={styles.infoItem}>
                        <strong>Phone:</strong>
                        <span>{selectedApplication.phone}</span>
                      </div>
                    )}
                    {selectedApplication.address && (
                      <div className={styles.infoItem}>
                        <strong>Address:</strong>
                        <span>{capitalizeBarangay(selectedApplication.address)}</span>
                      </div>
                    )}
                  </div>
                </div>
                

              {selectedApplication.cvFile && (
                <div className={styles.cvSection}>
                  <strong>Resume/CV</strong>
                  <div className={styles.documentSection}>
                    <a
                      href={selectedApplication.cvFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.documentLink}
                    >
                      <FileText size={20} />
                      <span className={styles.downloadLink}>
                        View Resume/CV Document
                      </span>
                    </a>
                  </div>
                </div>
              )}

                {selectedApplication.adminNotes && (
                  <div className={styles.adminNotesSection}>
                    <h4>Admin Notes</h4>
                    <p>{selectedApplication.adminNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplications;