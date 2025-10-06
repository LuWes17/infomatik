import React, { useState, useEffect } from 'react';
import './styles/AdminSolicitationRequests.css';

const API_BASE = import.meta.env.VITE_API_URL; // e.g. http://localhost:4000/api

const AdminSolicitationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [proofImage, setProofImage] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  const requestTypes = [
    'all',
    'Medical',
    'Financial', 
    'Construction Materials',
    'Educational Supplies'
  ];

  const statusTypes = ['all', 'pending', 'approved', 'rejected', 'completed'];

  // Fetch all solicitation requests
  const fetchSolicitationRequests = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (selectedFilter !== 'all') {
        queryParams.append('type', selectedFilter);
      }
      
      if (statusFilter !== 'all') {
        queryParams.append('status', statusFilter);
      }

      const response = await fetch(`${API_BASE}/solicitations/all?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setRequests(data.data);
        setFilteredRequests(data.data);
      }
    } catch (error) {
      console.error('Error fetching solicitation requests:', error);
      alert('Failed to fetch solicitation requests');
    } finally {
      setLoading(false);
    }
  };

  // Fetch single solicitation details
  const fetchSolicitationDetails = async (requestId) => {
    try {
      const response = await fetch(`${API_BASE}/solicitations/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSelectedRequest(data.data);
        setShowRequestDetails(true);
        if (data.data.proofOfTransaction) {
          setProofPreview(data.data.proofOfTransaction);
        }
      }
    } catch (error) {
      console.error('Error fetching solicitation details:', error);
      alert('Failed to fetch solicitation details');
    }
  };

  // Search functionality
  useEffect(() => {
    const filtered = requests.filter(request => {
      const searchMatch = 
        request.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.submittedBy?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.submittedBy?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return searchMatch;
    });
    
    setFilteredRequests(filtered);
  }, [searchTerm, requests]);

  // Filter effect
  useEffect(() => {
    fetchSolicitationRequests();
  }, [selectedFilter, statusFilter]);

  // Accept request
  const acceptRequest = async (requestId) => {
    const requestorName = selectedRequest.submittedBy 
      ? `${selectedRequest.submittedBy.firstName} ${selectedRequest.submittedBy.lastName}`
      : 'this requestor';

    if (!window.confirm(`Accept request from ${requestorName}? They will be notified via SMS.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/solicitations/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: 'approved',
          adminNotes: 'Application approved by admin'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Solicitation request approved! SMS notification sent to applicant.');
        setShowRequestDetails(false);
        fetchSolicitationRequests();
      }
    } catch (error) {
      console.error('Error accepting solicitation:', error);
      alert('Failed to accept solicitation request');
    }
  };

  // Reject request
  const rejectRequest = async (requestId) => {
    const requestorName = selectedRequest.submittedBy 
      ? `${selectedRequest.submittedBy.firstName} ${selectedRequest.submittedBy.lastName}`
      : 'this requestor';

    const reason = window.prompt(`Please provide a reason for rejecting the request from ${requestorName}:`);
    
    if (!reason) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/solicitations/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: 'rejected',
          adminNotes: reason
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Solicitation request rejected! SMS notification sent to applicant.');
        setShowRequestDetails(false);
        fetchSolicitationRequests();
      }
    } catch (error) {
      console.error('Error rejecting solicitation:', error);
      alert('Failed to reject solicitation request');
    }
  };

    // Handle proof image selection
  const handleProofImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      setProofImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload proof of transaction
  const uploadProof = async () => {
    if (!proofImage && !selectedRequest.proofOfTransaction) {
      alert('Please select an image first');
      return;
    }

    if (!proofImage) {
      // If no new image selected but proof exists, just mark as completed
      markAsCompleted(selectedRequest._id);
      return;
    }

    setUploadingProof(true);

    try {
      const formData = new FormData();
      formData.append('proofImage', proofImage);

      const response = await fetch(
        `${API_BASE}/solicitations/${selectedRequest._id}/upload-proof`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('Proof uploaded successfully!');
        // Now mark as completed
        await markAsCompleted(selectedRequest._id);
      } else {
        alert(data.message || 'Failed to upload proof');
      }
    } catch (error) {
      console.error('Error uploading proof:', error);
      alert('Failed to upload proof of transaction');
    } finally {
      setUploadingProof(false);
    }
  };

  // Mark as completed
  const markAsCompleted = async (requestId) => {
    if (!window.confirm('Mark this solicitation as completed?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/solicitations/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: 'completed',
          adminNotes: 'Solicitation marked as completed'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Solicitation marked as completed!');
        setShowRequestDetails(false);
        setProofImage(null);
        setProofPreview(null);
        fetchSolicitationRequests();
      }
    } catch (error) {
      console.error('Error marking solicitation as completed:', error);
      alert('Failed to mark solicitation as completed');
    }
  };

  const closeModal = () => {
    setShowRequestDetails(false);
    setProofImage(null);
    setProofPreview(null);
  };

  // Status badge color
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#ffc107';
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'completed': return '#6c757d';
      default: return '#6c757d';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="adminSolicitationRequests">
      <div className="header">
        <h1>Solicitation Requests</h1>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="loadingContainer">
          <div className="spinner"></div>
          <p>Loading solicitation requests...</p>
        </div>
      ) : (
        <>
          {/* Statistics Summary */}
          <div className="statsBar">
            <div className="statItem">
              <span className="statLabel">Total:</span>
              <span className="statValue">{filteredRequests.length}</span>
            </div>
            <div className="statItem">
              <span className="statLabel">Pending:</span>
              <span className="statValue pending">
                {filteredRequests.filter(r => r.status === 'pending').length}
              </span>
            </div>
            <div className="statItem">
              <span className="statLabel">Approved:</span>
              <span className="statValue approved">
                {filteredRequests.filter(r => r.status === 'approved').length}
              </span>
            </div>
            <div className="statItem">
              <span className="statLabel">Rejected:</span>
              <span className="statValue rejected">
                {filteredRequests.filter(r => r.status === 'rejected').length}
              </span>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="requestsGrid">
            {filteredRequests.length === 0 ? (
              <div className="noRequests">
                <p>No solicitation requests found.</p>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <div 
                  key={request._id} 
                  className="requestCard"
                  onClick={() => fetchSolicitationDetails(request._id)}
                >
                  <div className="cardHeader">
                    <span 
                      className="statusBadge" 
                      style={{ backgroundColor: getStatusColor(request.status) }}
                    >
                      {request.status.toUpperCase()}
                    </span>
                    <span className="requestType">{request.requestType}</span>
                  </div>
                  
                  <div className="cardBody">
                    <h3>{request.organizationName || 'Individual Request'}</h3>
                    <p className="requestor">
                      {request.submittedBy 
                        ? `${request.submittedBy.firstName} ${request.submittedBy.lastName}`
                        : 'Unknown Requestor'}
                    </p>
                    <p className="purpose">{request.purpose}</p>
                    
                    {request.submittedBy?.barangay && (
                      <p className="barangay">
                        <i className="icon-location"></i> Barangay {request.submittedBy.barangay}
                      </p>
                    )}
                  </div>
                  
                  <div className="cardFooter">
                    <span className="date">
                      <i className="icon-calendar"></i> {formatDate(request.createdAt)}
                    </span>
                    {request.eventDate && (
                      <span className="eventDate">
                        <i className="icon-event"></i> Event: {formatDate(request.eventDate)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Request Details Modal */}
      {showRequestDetails && selectedRequest && (
        <div className="modal">
          <div className="modalContent">
            <div className="modalHeader">
              <h2>Solicitation Request Details</h2>
              <button 
                className="closeButton"
                onClick={() => setShowRequestDetails(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modalBody">
              {/* Status and Type */}
              <div className="detailSection">
                <div className="detailRow">
                  <span 
                    className="statusBadgeLarge" 
                    style={{ backgroundColor: getStatusColor(selectedRequest.status) }}
                  >
                    {selectedRequest.status.toUpperCase()}
                  </span>
                  <span className="requestTypeLarge">{selectedRequest.requestType}</span>
                </div>
              </div>

              {/* Requestor Information */}
              <div className="detailSection">
                <h3>Requestor Information</h3>
                <div className="detailGrid">
                  <div className="detailItem">
                    <label>Name:</label>
                    <span>
                      {selectedRequest.submittedBy 
                        ? `${selectedRequest.submittedBy.firstName} ${selectedRequest.submittedBy.lastName}`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="detailItem">
                    <label>Contact Number:</label>
                    <span>{selectedRequest.submittedBy?.contactNumber || 'N/A'}</span>
                  </div>
                  <div className="detailItem">
                    <label>Barangay:</label>
                    <span>{selectedRequest.submittedBy?.barangay || 'N/A'}</span>
                  </div>
                  {selectedRequest.organizationName && (
                    <div className="detailItem">
                      <label>Organization:</label>
                      <span>{selectedRequest.organizationName}</span>
                    </div>
                  )}
                  {selectedRequest.organizationType && (
                    <div className="detailItem">
                      <label>Organization Type:</label>
                      <span>{selectedRequest.organizationType}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Request Details */}
              <div className="detailSection">
                <h3>Request Details</h3>
                <div className="detailItem">
                  <label>Purpose:</label>
                  <p className="detailText">{selectedRequest.purpose}</p>
                </div>
                <div className="detailItem">
                  <label>Requested Assistance:</label>
                  <p className="detailText">{selectedRequest.requestedAssistanceDetails}</p>
                </div>
                {selectedRequest.additionalDetails && (
                  <div className="detailItem">
                    <label>Additional Details:</label>
                    <p className="detailText">{selectedRequest.additionalDetails}</p>
                  </div>
                )}
                {selectedRequest.eventDate && (
                  <div className="detailItem">
                    <label>Event Date:</label>
                    <span>{formatDate(selectedRequest.eventDate)}</span>
                  </div>
                )}
              </div>

              {/* Documents Section */}
              <div className="detailSection">
                <h3>Documents</h3>
                <div className="documentsContainer">
                  <div className="documentItem">
                    <div className="documentInfo">
                      <i className="icon-pdf"></i>
                      <span>Solicitation Letter</span>
                    </div>
                    <div className="documentActions">
                      <button
                        className="viewButton"
                        onClick={() => window.open(selectedRequest.solicitationLetter, '_blank')}
                      >
                        View PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* NEW: Proof of Transaction Section - Only for approved status */}
              {selectedRequest.status === 'approved' && (
                <div className="detailSection">
                  <h3>Proof of Transaction</h3>
                  <div className="proofUploadContainer">
                    {proofPreview ? (
                      <div className="proofPreviewContainer">
                        <img 
                          src={proofPreview} 
                          alt="Proof of transaction" 
                          className="proofPreview"
                        />
                        {!selectedRequest.proofOfTransaction && (
                          <button
                            className="removeProofButton"
                            onClick={() => {
                              setProofImage(null);
                              setProofPreview(null);
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="proofUploadArea">
                        <input
                          type="file"
                          id="proofImage"
                          accept="image/*"
                          onChange={handleProofImageChange}
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="proofImage" className="proofUploadLabel">
                          <i className="icon-upload"></i>
                          <span>Click to upload proof image</span>
                          <small>Supports: JPG, PNG, GIF (Max 5MB)</small>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Section */}
              {selectedRequest.status !== 'pending' && (
                <div className="detailSection">
                  <h3>Admin Processing</h3>
                  <div className="detailGrid">
                    {selectedRequest.reviewedAt && (
                      <div className="detailItem">
                        <label>Reviewed Date:</label>
                        <span>{formatDate(selectedRequest.reviewedAt)}</span>
                      </div>
                    )}
                    {selectedRequest.adminNotes && (
                      <div className="detailItem">
                        <label>Admin Notes:</label>
                        <p className="detailText">{selectedRequest.adminNotes}</p>
                      </div>
                    )}
                    {selectedRequest.approvedAmount && (
                      <div className="detailItem">
                        <label>Approved Amount:</label>
                        <span>₱{selectedRequest.approvedAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedRequest.approvalConditions && (
                      <div className="detailItem">
                        <label>Approval Conditions:</label>
                        <p className="detailText">{selectedRequest.approvalConditions}</p>
                      </div>
                    )}
                    {selectedRequest.smsNotificationSent && (
                      <div className="detailItem">
                        <label>SMS Notification:</label>
                        <span className="smsStatus">✓ Sent</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="detailSection">
                <div className="timestamps">
                  <span>Submitted: {formatDate(selectedRequest.createdAt)}</span>
                  {selectedRequest.updatedAt !== selectedRequest.createdAt && (
                    <span>Last Updated: {formatDate(selectedRequest.updatedAt)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="modalFooter">
              {selectedRequest.status === 'pending' && (
                <>
                  <button
                    className="acceptButton"
                    onClick={() => acceptRequest(selectedRequest._id)}
                  >
                    Accept Request
                  </button>
                  <button
                    className="rejectButton"
                    onClick={() => rejectRequest(selectedRequest._id)}
                  >
                    Decline Request
                  </button>
                </>
              )}
              
              {selectedRequest.status === 'approved' && (
                <button
                  className="completeButton"
                  onClick={uploadProof}
                  disabled={uploadingProof}
                >
                  {uploadingProof ? 'Uploading...' : 
                  proofImage || selectedRequest.proofOfTransaction ? 
                  'Mark as Completed' : 
                  'Upload Proof & Complete'}
                </button>
              )}
              
              <button
                className="cancelButton"
                onClick={closeModal}
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

export default AdminSolicitationRequests;