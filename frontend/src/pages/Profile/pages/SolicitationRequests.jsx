import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  X, 
  Calendar, 
  Building2, 
  User, 
  Phone,
  MapPin, 
  FileText, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  ExternalLink,
  Type
} from 'lucide-react';
import styles from './SolicitationRequests.module.css';

const API_BASE = import.meta.env.VITE_API_URL; // e.g. http://localhost:4000/api

const SolicitationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/solicitations/my`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch solicitation requests');
      }

      const data = await response.json();
      setRequests(data.data || []);
    } catch (error) {
      console.error('Error fetching solicitation requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusDisplay = (status) => {
    const statusConfig = {
      pending: {
        text: 'Under Review',
        className: styles.statusPending,
        icon: <Clock size={16} />
      },
      approved: {
        text: 'Approved',
        className: styles.statusApproved,
        icon: <CheckCircle size={16} />
      },
      rejected: {
        text: 'Rejected',
        className: styles.statusRejected,
        icon: <XCircle size={16} />
      },
      completed: {
        text: 'Completed',
        className: styles.statusCompleted,
        icon: <CheckCircle size={16} />
      }
    };

    return statusConfig[status] || {
      text: status,
      className: styles.statusDefault,
      icon: <AlertCircle size={16} />
    };
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

  const viewRequest = (request) => {
    setSelectedRequest(request);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedRequest(null);

    document.body.style.overflow = 'unset';
    document.body.style.paddingRight = '0px';
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

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading your solicitation requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>My Solicitation Requests</h2>
          <p className={styles.subtitle}>
            Track the status of your submitted solicitation requests
          </p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className={styles.emptyState}>
          <FileText size={48} />
          <h3>No Solicitation Requests</h3>
          <p>You haven't submitted any solicitation requests yet.</p>
          <a href="/services/solicitation-requests" className={styles.submitButton}>
            Submit Request
          </a>
        </div>
      ) : (
        <div className={styles.requestsGrid}>
          {requests.map((request) => {
            const statusDisplay = getStatusDisplay(request.status);
            
            return (
              <div key={request._id} className={styles.requestCard} onClick={() => viewRequest(request)}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.organizationName}>
                    {request.organizationName}
                  </h3>
                  <div className={`${styles.statusBadge} ${statusDisplay.className}`}>
                    {statusDisplay.icon}
                    <span>{statusDisplay.text}</span>
                  </div>
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.requestInfo}>
                    <div className={styles.infoRow}>
                      <User size={16} />
                      <span>{request.contactPerson}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <Building2 size={16} />
                      <span>{request.organizationType}</span>
                    </div>
                  </div>

                
                  {request.purpose && (
                    <div className={styles.purposeSection}>
                      <strong>Purpose:</strong>
                      <p className={styles.purposeText}>
                        {request.purpose.length > 80
                          ? `${request.purpose.substring(0, 80)}...`
                          : request.purpose
                        }
                      </p>
                    </div>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <button 
                    className={styles.viewButton}
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Request Details Modal */}
      {showDetails && selectedRequest && (
        <div className={styles.modalOverlay} onClick={closeDetails}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{selectedRequest.organizationName}</h2>
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
                <p className={styles.requestDate}>
                  Submitted on {formatDate(selectedRequest.createdAt)}
                </p>
                <div className={`${styles.statusBadge} ${styles.large} ${getStatusDisplay(selectedRequest.status).className}`}>
                  {getStatusDisplay(selectedRequest.status).icon}
                  <span>{getStatusDisplay(selectedRequest.status).text}</span>
                </div>
              </div>

              {/* Organization Details Section */}
              <div className={styles.detailsSection}>
                <h3>Organization Information</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <div className={styles.infoItemHeader}> 
                      <User size={16} />
                      <span className={styles.infoLabel}>Contact Person:</span>
                    </div>
                    <span>{selectedRequest.contactPerson}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoItemHeader}> 
                      <Phone size={16} />
                      <span className={styles.infoLabel}>Contact Number:</span>
                    </div>
                    <span>{selectedRequest.contactNumber}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoItemHeader}> 
                      <Building2 size={16} />
                      <span className={styles.infoLabel}>Organization Type:</span>
                    </div>
                    <span>{selectedRequest.organizationType}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoItemHeader}> 
                      <Type size={16} />
                      <span className={styles.infoLabel}>Request Type:</span>
                    </div>
                    <span>{selectedRequest.requestType}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoItemHeader}> 
                      <MapPin size={16} />
                      <span className={styles.infoLabel}>Address:</span>
                    </div>
                    <span>{capitalizeBarangay(selectedRequest.address)}</span>
                  </div>
                </div>
              </div>

              {/* Request Details Section */}
              <div className={styles.detailsSection}>
                <h3>Request Details</h3>
                <div className={styles.requestContent}>
                  <div className={styles.assistanceSection}>
                    <h4>Requested Assistance</h4>
                    <p>{selectedRequest.requestedAssistanceDetails}</p>
                  </div>

                  <div className={styles.purposeSection}>
                    <h4>Purpose</h4>
                    <p>{selectedRequest.purpose}</p>
                  </div>

                  {selectedRequest.additionalDetails && (
                    <div className={styles.additionalSection}>
                      <h4>Additional Details</h4>
                      <p>{selectedRequest.additionalDetails}</p>
                    </div>
                  )}

                  {/* Solicitation Letter Section */}
                    {selectedRequest.solicitationLetter && (
                    <div className={styles.documentSection}>
                      <h4>Solicitation Letter</h4>
                      <div className={styles.documentInfo}>
                        <a
                          href={selectedRequest.solicitationLetter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.documentLink}
                        >
                          <FileText size={20} />
                          <span className={styles.downloadLink}>
                            View Solicitation Letter Document
                          </span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              

              {/* Admin Response Section */}
              {(selectedRequest.adminNotes || selectedRequest.approvedAmount) && (
                <div className={styles.adminSection}>
                  <h3>Administrative Response</h3>
                  {selectedRequest.approvedAmount && (
                    <div className={styles.approvedAmount}>
                      <DollarSign size={16} />
                      <span>Approved Amount: ₱{selectedRequest.approvedAmount?.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedRequest.adminNotes && (
                    <div className={styles.adminNotes}>
                      <h4>Admin Notes</h4>
                      <p>{selectedRequest.adminNotes}</p>
                    </div>
                  )}
                  {selectedRequest.reviewedAt && (
                    <p className={styles.reviewDate}>
                      Reviewed on {formatDate(selectedRequest.reviewedAt)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolicitationRequests;