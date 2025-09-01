// frontend/src/pages/Profile/pages/JobApplications.jsx
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  MapPin, 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  X,
  Download,
  Users
} from 'lucide-react';
import styles from './JobApplications.module.css';

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
      
      const response = await fetch('http://localhost:4000/api/jobs/my/applications', {
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
      
      const response = await fetch(`http://localhost:4000/api/jobs/${jobId}`, {
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

  useEffect(() => {
    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>My Job Applications</h2>
          <p className={styles.subtitle}>Track your application progress</p>
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
          <p className={styles.subtitle}>Track your application progress</p>
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
      <div className={styles.header}>
        <h2>My Job Applications</h2>
        <p className={styles.subtitle}>Track your application progress</p>
      </div>

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
                    <Briefcase size={20} className={styles.jobIcon} />
                    <h3>{application.jobPosting?.title || 'Job Position'}</h3>
                  </div>
                  <div className={`${styles.statusBadge} ${statusDisplay.className}`}>
                    {statusDisplay.icon}
                    <span>{statusDisplay.text}</span>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardMeta}>
                    <div className={styles.metaItem}>
                      <Calendar size={16} />
                      <span>Applied: {formatDate(application.createdAt)}</span>
                    </div>
                    {application.jobPosting?.location && (
                      <div className={styles.metaItem}>
                        <MapPin size={16} />
                        <span>{application.jobPosting.location}</span>
                      </div>
                    )}
                    {application.jobPosting?.employmentType && (
                      <div className={styles.metaItem}>
                        <Briefcase size={16} />
                        <span className={styles.employmentType}>
                          {application.jobPosting.employmentType}
                        </span>
                      </div>
                    )}
                  </div>

                  {application.coverLetter && (
                    <div className={styles.coverLetterPreview}>
                      <p>
                        {application.coverLetter.length > 100 
                          ? `${application.coverLetter.substring(0, 100)}...`
                          : application.coverLetter
                        }
                      </p>
                    </div>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <button className={styles.viewButton}>
                    <Eye size={16} />
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
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Status Section */}
              <div className={styles.statusSection}>
                <div className={`${styles.statusBadge} ${getStatusDisplay(selectedApplication.status).className}`}>
                  {getStatusDisplay(selectedApplication.status).icon}
                  <span>{getStatusDisplay(selectedApplication.status).text}</span>
                </div>
                <p className={styles.applicationDate}>
                  Applied on {formatDate(selectedApplication.createdAt)}
                </p>
              </div>

              {/* Job Details Section */}
              {selectedApplication.jobPosting && (
                <div className={styles.jobDetailsSection}>
                  <h3>Job Details</h3>
                  <div className={styles.jobInfo}>
                    <div className={styles.jobMeta}>
                      {selectedApplication.jobPosting.location && (
                        <div className={styles.metaItem}>
                          <MapPin size={16} />
                          <span>{selectedApplication.jobPosting.location}</span>
                        </div>
                      )}
                      {selectedApplication.jobPosting.employmentType && (
                        <div className={styles.metaItem}>
                          <Briefcase size={16} />
                          <span className={styles.employmentType}>
                            {selectedApplication.jobPosting.employmentType}
                          </span>
                        </div>
                      )}
                      {selectedApplication.jobPosting.positionsAvailable && (
                        <div className={styles.metaItem}>
                          <Users size={16} />
                          <span className={styles.positions}>
                            {selectedApplication.jobPosting.positionsAvailable} position(s) available
                          </span>
                        </div>
                      )}
                      {selectedApplication.jobPosting.applicationDeadline && (
                        <div className={styles.metaItem}>
                          <Calendar size={16} />
                          <span>Deadline: {formatDate(selectedApplication.jobPosting.applicationDeadline)}</span>
                        </div>
                      )}
                    </div>
                    
                    {selectedApplication.jobPosting.description && (
                      <div className={styles.jobDescription}>
                        <h4>Job Description</h4>
                        <p>{selectedApplication.jobPosting.description}</p>
                      </div>
                    )}
                    
                    {selectedApplication.jobPosting.requirements && (
                      <div className={styles.jobRequirements}>
                        <h4>Requirements</h4>
                        <p>{selectedApplication.jobPosting.requirements}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Application Details Section */}
              <div className={styles.applicationDetailsSection}>
                <h3>Your Application</h3>
                
                <div className={styles.applicantInfo}>
                  <h4>Personal Information</h4>
                  <div className={styles.infoGrid}>
                    {selectedApplication.fullName && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Full Name:</span>
                        <span>{selectedApplication.fullName}</span>
                      </div>
                    )}
                    {selectedApplication.phone && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Phone:</span>
                        <span>{selectedApplication.phone}</span>
                      </div>
                    )}
                    {selectedApplication.birthday && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Birthday:</span>
                        <span>{formatDate(selectedApplication.birthday)}</span>
                      </div>
                    )}
                    {selectedApplication.address && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Address:</span>
                        <span>{selectedApplication.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                

                {selectedApplication.cvFile && (
                  <div className={styles.cvSection}>
                    <h4>Resume/CV</h4>
                    <div className={styles.fileInfo}>
                      <FileText size={20} />
                      <button
                        onClick={() => handleViewCV(selectedApplication.cvFile)}
                        className="cv-btn cv-btn-view"
                        title={`View ${selectedApplication.fullName}'s CV`}
                      >
                        View CV
                      </button>
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

            <div className={styles.modalFooter}>
              <button 
                className={styles.closeModalButton}
                onClick={closeDetails}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplications;