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
  ExternalLink
} from 'lucide-react';
import styles from './SolicitationRequests.module.css';

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
      const response = await fetch('/api/solicitations/my', {
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
        text: 'Pending Review',
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

  const viewRequest = (request) => {
    setSelectedRequest(request);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedRequest(null);
  };

  const downloadSolicitationLetter = () => {
    if (selectedRequest?.solicitationLetter) {
      window.open(selectedRequest.solicitationLetter, '_blank');
    }
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
          <h1 className={styles.title}>My Solicitation Requests</h1>
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
              <div key={request._id} className={styles.requestCard}>
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
                    <div className={styles.infoRow}>
                      <FileText size={16} />
                      <span>{request.requestType}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <Calendar size={16} />
                      <span>Event: {formatDate(request.eventDate)}</span>
                    </div>
                  </div>

                  <div className={styles.requestDetails}>
                    <h4>Requested Assistance</h4>
                    <p className={styles.assistanceText}>
                      {request.requestedAssistanceDetails.length > 100
                        ? `${request.requestedAssistanceDetails.substring(0, 100)}...`
                        : request.requestedAssistanceDetails
                      }
                    </p>
                  </div>

                  {request.purpose && (
                    <div className={styles.purposeSection}>
                      <h4>Purpose</h4>
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
                  <span className={styles.submittedDate}>
                    Submitted: {formatDate(request.createdAt)}
                  </span>
                  <button 
                    className={styles.viewButton}
                    onClick={() => viewRequest(request)}
                  >
                    <Eye size={16} />
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
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Status Section */}
              <div className={styles.statusSection}>
                <div className={`${styles.statusBadge} ${styles.large} ${getStatusDisplay(selectedRequest.status).className}`}>
                  {getStatusDisplay(selectedRequest.status).icon}
                  <span>{getStatusDisplay(selectedRequest.status).text}</span>
                </div>
                <p className={styles.requestDate}>
                  Submitted on {formatDate(selectedRequest.createdAt)}
                </p>
              </div>

              {/* Organization Details Section */}
              <div className={styles.detailsSection}>
                <h3>Organization Information</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Contact Person</span>
                    <span>{selectedRequest.contactPerson}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Organization Type</span>
                    <span>{selectedRequest.organizationType}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Contact Number</span>
                    <span>{selectedRequest.contactNumber}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Request Type</span>
                    <span>{selectedRequest.requestType}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Event Date</span>
                    <span>{formatDate(selectedRequest.eventDate)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Address</span>
                    <span>{selectedRequest.address}</span>
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
                </div>
              </div>

              {/* Solicitation Letter Section */}
              {selectedRequest.solicitationLetter && (
                <div className={styles.documentSection}>
                  <h3>Solicitation Letter</h3>
                  <div className={styles.documentInfo}>
                    <div className={styles.fileInfo}>
                      <FileText size={20} />
                      <span>Solicitation Letter</span>
                    </div>
                    <div className={styles.documentActions}>
                      <button 
                        className={styles.viewDocButton}
                        onClick={downloadSolicitationLetter}
                      >
                        <ExternalLink size={16} />
                        View Document
                      </button>
                    </div>
                  </div>
                </div>
              )}

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

export default SolicitationRequests;