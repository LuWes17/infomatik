import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  FileText, 
  Download, 
  Eye, 
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import './styles/AdminJobOpenings.css';

const API_BASE = import.meta.env.VITE_API_URL; // e.g. http://localhost:4000/api

const AdminJobOpenings = () => {
  const [jobOpenings, setJobOpenings] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    positionsAvailable: 1,
    status: 'open',
    applicationDeadline: '',
    employmentType: 'Full-Time',
    location: ''
  });

  // Fetch all job openings
  const fetchJobOpenings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/jobs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setJobOpenings(data.data);
      }
    } catch (error) {
      console.error('Error fetching job openings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch applications for a specific job
  const fetchApplications = async (jobId) => {
    try {
      const response = await fetch(`${API_BASE}/jobs/applications/all?jobId=${jobId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setApplications(data.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  useEffect(() => {
    fetchJobOpenings();
  }, []);

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

  // Handle form submission for create/update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirmMessage = editMode 
      ? 'Are you sure you want to update this job opening?' 
      : 'Are you sure you want to create this job opening?';
      
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const url = editMode 
        ? `${API_BASE}/jobs/${selectedJob._id}`
        : `${API_BASE}/jobs`;
      
      const method = editMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        fetchJobOpenings();
        resetForm();
        alert(editMode ? 'Job updated successfully!' : 'Job created successfully!');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Handle delete
  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job opening?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        fetchJobOpenings();
        setShowJobDetails(false);
        alert('Job deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  // Toggle job status
  const toggleJobStatus = async (jobId) => {
    try {
      const response = await fetch(`${API_BASE}/jobs/${jobId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        fetchJobOpenings();
        setSelectedJob(data.data);
      }
    } catch (error) {
      console.error('Error toggling job status:', error);
    }
  };

  // Accept application
  const acceptApplication = async (applicationId, applicant) => {
    if (!window.confirm(`Accept application from ${applicant.fullName}? This will send an SMS notification.`)) return;
    
    try {
      const response = await fetch(`${API_BASE}/jobs/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: 'accepted',
          sendSMS: true,
          adminNotes: 'Application accepted'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        fetchApplications(selectedJob._id);
        alert('Application accepted and SMS notification sent to applicant.');
      }
    } catch (error) {
      console.error('Error accepting application:', error);
      alert('Error accepting application');
    }
  };

    // Accept for interview
  const acceptForInterview = async (applicationId, applicant) => {
    if (!window.confirm(`Select ${applicant.fullName} for interview?`)) return;
    
    try {
      const response = await fetch(`${API_BASE}/jobs/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: 'for-interview',
          adminNotes: 'Selected for interview'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        fetchApplications(selectedJob._id);
        alert('Applicant selected for interview and SMS notification sent.');
      }
    } catch (error) {
      console.error('Error selecting for interview:', error);
      alert('Error selecting for interview');
    }
  };

  // Final accept after interview
  const finalAccept = async (applicationId, applicant) => {
    if (!window.confirm(`Accept ${applicant.fullName} for the position?`)) return;
    
    try {
      const response = await fetch(`${API_BASE}/jobs/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: 'accepted',
          adminNotes: 'Application accepted after interview'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        fetchApplications(selectedJob._id);
        alert('Application accepted and SMS notification sent.');
      }
    } catch (error) {
      console.error('Error accepting application:', error);
      alert('Error accepting application');
    }
  };

  // Reject application
  const rejectApplication = async (applicationId, applicant) => {
    if (!window.confirm(`Reject application from ${applicant.fullName}?`)) return;
    
    try {
      const response = await fetch(`${API_BASE}/jobs/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: 'rejected',
          adminNotes: 'Application rejected'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        fetchApplications(selectedJob._id);
        alert('Application rejected.');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      requirements: '',
      positionsAvailable: 1,
      status: 'open',
      applicationDeadline: '',
      employmentType: 'Full-Time',
      location: ''
    });
    setShowCreateForm(false);
    setEditMode(false);
  };

  // Open job details
  const openJobDetails = async (job) => {
    setSelectedJob(job);
    setShowJobDetails(true);
    await fetchApplications(job._id);
  };

  // Start edit mode
  const startEdit = () => {
    setFormData({
      title: selectedJob.title,
      description: selectedJob.description,
      requirements: selectedJob.requirements,
      positionsAvailable: selectedJob.positionsAvailable,
      status: selectedJob.status,
      applicationDeadline: selectedJob.applicationDeadline ? 
        new Date(selectedJob.applicationDeadline).toISOString().split('T')[0] : '',
      employmentType: selectedJob.employmentType || 'Full-Time',
      location: selectedJob.location || ''
    });
    setEditMode(true);
    setShowJobDetails(false);
    setShowCreateForm(true);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'pending':
        return 'status-pending';
      case 'for-interview':
        return 'status-for-interview';
      case 'accepted':
        return 'status-accepted';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  };

  return (
    <div className="admin-job-container">
      <div className="admin-job-wrapper">
        <div className='header'>
          <h1 className="admin-job-title">Job Openings Management</h1>
        
          {/* Create Job Button */}
          <button
            onClick={() => setShowCreateForm(true)}
            className="create-job-btn"
          >
            <Plus size={20} />
            Create Job Opening
          </button>
        </div>

        {/* Job Cards */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="job-cards-grid">
            {jobOpenings.map((job) => (
              <div
                key={job._id}
                onClick={() => openJobDetails(job)}
                className="job-card"
              >
                <div className="job-card-header">
                  <h3 className="job-card-title">{job.title}</h3>
                  <span className={`job-status-badge ${
                    job.status === 'open' ? 'job-status-open' : 'job-status-closed'
                  }`}>
                    {job.status === 'open' ? 'Open' : 'Closed'}
                  </span>
                </div>
                
                <p className="job-card-description">{job.description}</p>
                
                <div className="job-card-info">
                  <div className="job-info-item">
                    <Briefcase size={16} />
                    {job.positionsAvailable} position{job.positionsAvailable > 1 ? 's' : ''} available
                  </div>
                  <div className="job-info-item">
                    <MapPin size={16} />
                    {job.location || 'Not specified'}
                  </div>
                  <div className="job-info-item">
                    <Users size={16} />
                    {job.totalApplications || 0} application{(job.totalApplications || 0) !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Form Modal */}
        {showCreateForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title">
                  {editMode ? 'Edit Job Opening' : 'Create New Job Opening'}
                </h2>
                <button
                  onClick={resetForm}
                  className="modal-close-btn"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="job-form">
                <div className="form-grid">
                  <div className="form-group form-group-full">
                    <label className="form-label">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="form-input"
                      placeholder="e.g. Administrative Assistant"
                    />
                  </div>

                  <div className="form-group form-group-full">
                    <label className="form-label">
                      Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="form-textarea"
                      rows={4}
                      placeholder="Describe the job responsibilities and overview..."
                    />
                  </div>

                  <div className="form-group form-group-full">
                    <label className="form-label">
                      Requirements *
                    </label>
                    <textarea
                      required
                      value={formData.requirements}
                      onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                      className="form-textarea"
                      rows={4}
                      placeholder="List the qualifications and requirements..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Positions Available *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.positionsAvailable}
                      onChange={(e) => setFormData({...formData, positionsAvailable: parseInt(e.target.value)})}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Employment Type
                    </label>
                    <select
                      value={formData.employmentType}
                      onChange={(e) => setFormData({...formData, employmentType: e.target.value})}
                      className="form-input"
                    >
                      <option value="Full-Time">Full-time</option>
                      <option value="Part-Time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Temporary">Temporary</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="form-input"
                      placeholder="e.g. Barangay Hall, City Center"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      value={formData.applicationDeadline}
                      onChange={(e) => setFormData({...formData, applicationDeadline: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editMode ? 'Update Job' : 'Create Job'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Job Details Modal */}
        {showJobDetails && selectedJob && (
          <div className="modal-overlay">
            <div className="modal-content modal-content-wide">
              <div className="modal-header">
                <h2 className="modal-title">{selectedJob.title}</h2>
                <button
                  onClick={() => setShowJobDetails(false)}
                  className="modal-close-btn"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="job-details-content">
                <div className="job-details-actions">
                  <button
                    onClick={startEdit}
                    className="btn btn-secondary"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => toggleJobStatus(selectedJob._id)}
                    className={`btn ${selectedJob.status === 'open' ? 'btn-warning' : 'btn-primary'}`}
                  >
                    <Clock size={16} />
                    {selectedJob.status === 'open' ? 'Close Job' : 'Open Job'}
                  </button>
                  <button
                    onClick={() => handleDelete(selectedJob._id)}
                    className="btn btn-danger"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>

                <div className="job-details-grid">
                  <div className="job-details-section">
                    <div>
                      <h3 className="section-title">Description</h3>
                      <p className="section-content">{selectedJob.description}</p>
                    </div>
                    <div>
                      <h3 className="section-title">Requirements</h3>
                      <p className="section-content">{selectedJob.requirements}</p>
                    </div>
                  </div>
                  
                  <div className="job-details-section">
                    <div className="job-info-card">
                      <div className="job-info-list">
                        <div className="info-row">
                          <Briefcase size={18} />
                          <span className="info-label">Positions:</span>
                          {selectedJob.positionsAvailable}
                        </div>
                        <div className="info-row">
                          <Clock size={18} />
                          <span className="info-label">Type:</span>
                          {selectedJob.employmentType || 'Full-Time'}
                        </div>
                        <div className="info-row">
                          <MapPin size={18} />
                          <span className="info-label">Location:</span>
                          {selectedJob.location || 'Not specified'}
                        </div>
                        {selectedJob.applicationDeadline && (
                          <div className="info-row">
                            <Calendar size={18} />
                            <span className="info-label">Deadline:</span>
                            {new Date(selectedJob.applicationDeadline).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Applications Section */}
                <div className="applications-section">
                  <h3 className="applications-header">
                    <Users />
                    Applications ({applications.length})
                  </h3>
                  
                  {applications.length === 0 ? (
                    <p className="no-applications">No applications yet</p>
                  ) : (
                    <div className="table-container">
                      <table className="applications-table">
                        <thead className="table-header">
                          <tr>
                            <th className="table-header-cell">Applicant</th>
                            <th className="table-header-cell">Contact</th>
                            <th className="table-header-cell">Applied On</th>
                            <th className="table-header-cell">Status</th>
                            <th className="table-header-cell">CV</th>
                            <th className="table-header-cell">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {applications.map((application) => (
                            <tr key={application._id} className="table-row">
                              <td className="table-cell">
                                <div className="applicant-info">
                                  <div className="applicant-name">
                                    {application.fullName}
                                  </div>
                                  <div className="applicant-email">
                                    {application.email}
                                  </div>
                                </div>
                              </td>
                              <td className="table-cell">
                                <span className="table-text">{application.phone}</span>
                              </td>
                              <td className="table-cell">
                                <span className="table-text">
                                  {new Date(application.createdAt).toLocaleDateString()}
                                </span>
                              </td>
                              <td className="table-cell">
                                <span className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                                  {application.status}
                                </span>
                              </td>
                              <td className="table-cell">
                                {(application.cvFile || application.resume) ? (
                                  <div className="cv-actions">
                                    <button
                                      onClick={() => handleViewCV(application.cvFile || application.resume, application.fullName)}
                                      className="cv-btn cv-btn-view"
                                      title={`View ${application.fullName}'s CV`}
                                    >
                                      <Eye size={16} />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="no-cv">No CV</span>
                                )}
                              </td>
                              <td className="table-cell">
                                {application.status === 'pending' && (
                                <div className="application-actions">
                                  <button
                                    onClick={() => acceptForInterview(application._id, application)}
                                    className="action-btn action-btn-interview"
                                    title="Select for interview and notify via SMS"
                                  >
                                    <Calendar size={16} />
                                    For Interview
                                  </button>
                                  <button
                                    onClick={() => rejectApplication(application._id, application)}
                                    className="action-btn action-btn-reject"
                                    title="Reject application"
                                  >
                                    <XCircle size={16} />
                                    Reject
                                  </button>
                                </div>
                              )}

                              {application.status === 'for-interview' && (
                                <div className="application-actions">
                                  <button
                                    onClick={() => finalAccept(application._id, application)}
                                    className="action-btn action-btn-accept"
                                    title="Accept and notify via SMS"
                                  >
                                    <CheckCircle size={16} />
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => rejectApplication(application._id, application)}
                                    className="action-btn action-btn-reject"
                                    title="Reject application"
                                  >
                                    <XCircle size={16} />
                                    Reject
                                  </button>
                                </div>
                              )}

                              {['accepted', 'rejected'].includes(application.status) && (
                                <div className="status-display">
                                  {application.status === 'accepted' && (
                                    <>
                                      <CheckCircle size={18} className="status-icon-accepted" />
                                      <span className="status-text">Accepted</span>
                                      {application.smsNotificationSent && (
                                        <Send size={14} className="sms-sent-icon" title="SMS sent" />
                                      )}
                                    </>
                                  )}
                                  {application.status === 'for-interview' && (
                                    <>
                                      <Calendar size={18} className="status-icon-interview" />
                                      <span className="status-text">For Interview</span>
                                      {application.smsNotificationSent && (
                                        <Send size={14} className="sms-sent-icon" title="SMS sent" />
                                      )}
                                    </>
                                  )}
                                  {application.status === 'rejected' && (
                                    <>
                                      <XCircle size={18} className="status-icon-rejected" />
                                      <span className="status-text">Rejected</span>
                                    </>
                                  )}
                                </div>
                              )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJobOpenings;