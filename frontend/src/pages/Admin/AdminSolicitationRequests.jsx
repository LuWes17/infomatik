import React, { useState, useEffect } from 'react';
import './styles/AdminSolicitationRequests.css';

const AdminSolicitationRequests = () => {
  const [solicitationRequests, setSolicitationRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all solicitations requests
  const fetchSolicitationRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch ('/api/solicitations/all', {
        headers: {
          'Authorization' : `Bearer ${localStorage.getItem('token')}`

        }
      });
      const data = await response.json();
      if(data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error('Error fetching solicitation requests:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSolicitationRequests();
  }, []);

  const acceptRequest = async (requestId, requestor) => {
    if (!window.confirm(`Accept request from ${requestor.fullName}? They will be notified via SMS.`)) return;

    try {
      const response = await fetch(`api/solicitations/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: 'accepted',
          adminNotes: 'Application Accepted'
        })
      });

      const data = await response.json();
      if(data.success){
        fetchSolicitationRequests(selectedRequest._id);
        alert('Solicitation Request accepted! SMS notification sent to applicant.');
      }
    } catch (error) {
      console.error('Error accepting solicitation:', error);
      alert('Error accepting solicitation');
    }
  }

  const rejectRequest = async (requestId, requestor) => {
    if (!window.confirm(`Reject request from ${requestor.fullName}? They will be notified via SMS.`)) return;

    try {
      const response = await fetch(`api/solicitations/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: 'rejected',
          adminNotes: 'Application Rejected'
        })
      });

      const data = await response.json();
      if(data.success){
        fetchSolicitationRequests(selectedRequest._id);
        alert('Solicitation Request rejected.');
      }
    } catch (error) {
      console.error('Error rejecting solicitation:', error);
      alert('Error rejecting solicitation');
    }
  }
  return (
    <div>AdminSolicitationRequest</div>
  )
}

export default AdminSolicitationRequests