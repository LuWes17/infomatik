import React, { useState, useEffect } from 'react';
import './styles/AdminSolicitationRequests.css';

const AdminSolicitationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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

      const response = await fetch(`/api/solicitations/all?${queryParams}`, {
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
      const response = await fetch(`/api/solicitations/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSelectedRequest(data.data);
        setShowRequestDetails(true);
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
      const response = await fetch(`/api/solicitations/${requestId}/status`, {
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
      const response = await fetch(`/api/solicitations/${requestId}/status`, {
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

  // Mark as completed
  const markAsCompleted = async (requestId) => {
    if (!window.confirm('Mark this solicitation as completed?')) {
      return;
    }

    try {
      const response = await fetch(`/api/solicitations/${requestId}/status`, {
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
        fetchSolicitationRequests();
      }
    } catch (error) {
      console.error('Error marking solicitation as completed:', error);
      alert('Failed to mark solicitation as completed');
    }
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
                  onClick={() => markAsCompleted(selectedRequest._id)}
                >
                  Mark as Completed
                </button>
              )}
              
              <button
                className="cancelButton"
                onClick={() => setShowRequestDetails(false)}
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