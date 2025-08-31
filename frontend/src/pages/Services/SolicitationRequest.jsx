import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Plus, X, Upload, Search, Eye, Building2, Phone, MapPin, FileText, Calendar as CalendarIcon, User, Type, DollarSign, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './SolicitationRequests.css';

const SolicitationRequests = () => {
  // Auth context
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // State management
  const [solicitationRequests, setSolicitationRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Filter states
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    contactPerson: '',
    organizationName: '',
    organizationType: '',
    contactNumber: '',
    eventDate: '',
    address: '',
    requestType: '',
    requestedAssistanceDetails: '',
    purpose: '',
    additionalDetails: '',
    solicitationLetter: null
  });

  // Load data on component mount
  useEffect(() => {
    fetchSolicitationRequests();
  }, []);

  const fetchSolicitationRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/solicitations/approved');
      
      if (!response.ok) {
        throw new Error('Failed to fetch solicitation requests');
      }

      const data = await response.json();
      setSolicitationRequests(data.data || []);
      setFilteredRequests(data.data || []);
    } catch (error) {
      console.error('Error fetching solicitation requests:', error);
      setSolicitationRequests([]);
      setFilteredRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search functionality
  useEffect(() => {
    let filtered = [...solicitationRequests];

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(request => request.requestType === categoryFilter);
    }

    // Date filter
    if (dateFilter.startDate) {
      filtered = filtered.filter(request => 
        new Date(request.createdAt) >= new Date(dateFilter.startDate)
      );
    }
    if (dateFilter.endDate) {
      filtered = filtered.filter(request => 
        new Date(request.createdAt) <= new Date(dateFilter.endDate)
      );
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requestedAssistanceDetails.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [solicitationRequests, dateFilter, categoryFilter, searchTerm]);

  const handleRequestClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setShowRequestForm(true);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    try {
      const submitData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'solicitationLetter' && formData[key]) {
          submitData.append(key, formData[key]);
        } else if (key !== 'solicitationLetter') {
          submitData.append(key, formData[key]);
        }
      });

      const response = await fetch(`http://localhost:4000/api/solicitations/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submitData
      });

      if (response.ok) {
        // Success - close modal and refresh data
        setShowRequestForm(false);
        resetForm();
        alert('Solicitation request submitted successfully!');
        fetchSolicitationRequests();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to submit request'}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit request. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      contactPerson: '',
      organizationName: '',
      organizationType: '',
      contactNumber: '',
      eventDate: '',
      address: '',
      requestType: '',
      requestedAssistanceDetails: '',
      purpose: '',
      additionalDetails: '',
      solicitationLetter: null
    });
    setShowRequestForm(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF or image file (JPEG, PNG, JPG)');
        return;
      }

      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
      }

      setFormData({...formData, solicitationLetter: file});
    }
  };

  const openDetailsModal = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const organizationTypes = ['NGA', 'NGO', 'CSO', 'LGU', 'Barangay', 'SK'];
  const requestTypes = ['Medical', 'Financial', 'Construction Materials', 'Educational Supplies'];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="solicitation-requests-container">
      <div className="solicitation-requests-wrapper">
        {/* Header */}
        <div className="header-section">
          <h1 className="page-title">Solicitation Requests</h1>
          <p className="page-description">
            View completed solicitation requests and submit your own request for assistance.
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="controls-section">
          <div className="filters-row">
            <div className="search-container">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search organizations or purposes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="date-filters">
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
                className="date-input"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
                className="date-input"
                placeholder="End Date"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="category-filter"
            >
              <option value="all">All Categories</option>
              {requestTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRequestClick}
            className="request-button"
          >
            <Plus size={20} />
            Send Solicitation Request
          </button>
        </div>

        {/* Requests Grid */}
        {loading || authLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading solicitation requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="no-requests">
            <FileText size={64} className="no-requests-icon" />
            <h3>No requests found</h3>
            <p>There are no completed solicitation requests to display.</p>
          </div>
        ) : (
          <div className="requests-grid">
            {filteredRequests.map((request) => (
              <div
                key={request._id}
                onClick={() => openDetailsModal(request)}
                className="request-card"
              >
                <div className="request-card-header">
                  <div className="organization-info">
                    <h3 className="organization-name">{request.organizationName}</h3>
                    <span className="organization-type">{request.organizationType}</span>
                  </div>
                  <div className={`request-type-badge ${request.requestType.toLowerCase().replace(' ', '-')}`}>
                    {request.requestType}
                  </div>
                </div>

                <div className="request-details">
                  <div className="detail-item">
                    <User size={16} />
                    <span>{request.contactPerson}</span>
                  </div>
                  <div className="detail-item">
                    <CalendarIcon size={16} />
                    <span>{formatDate(request.eventDate)}</span>
                  </div>
                  <div className="detail-item">
                    <MapPin size={16} />
                    <span>{request.address}</span>
                  </div>
                </div>

                <p className="request-purpose">
                  {request.purpose.length > 120 
                    ? `${request.purpose.substring(0, 120)}...` 
                    : request.purpose}
                </p>

                <div className="request-footer">
                  <span className="submitted-date">
                    Submitted: {formatDate(request.createdAt)}
                  </span>
                  <button className="view-details-btn">
                    <Eye size={16} />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Authentication Modal */}
        {showAuthModal && (
          <div className="modal-overlay">
            <div className="modal-content auth-modal">
              <div className="modal-header">
                <h2 className="modal-title">Account Required</h2>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="modal-close-btn"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="auth-modal-body">
                <p>You need to have an account to submit a solicitation request.</p>
                <div className="auth-modal-actions">
                  <a href="/login" className="btn btn-primary">Login</a>
                  <a href="/register" className="btn btn-secondary">Register</a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Solicitation Request Form Modal */}
        {showRequestForm && (
          <div className="modal-overlay">
            <div className="modal-content form-modal">
              <div className="modal-header">
                <h2 className="modal-title">Submit Solicitation Request</h2>
                <button
                  onClick={resetForm}
                  className="modal-close-btn"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleFormSubmit} className="solicitation-form">
                <div className="form-grid">
                  {/* Organization Information */}
                  <div className="form-section">
                    <h3 className="form-section-title">Organization Information</h3>
                    
                    <div className="form-group">
                      <label className="form-label">Contact Person *</label>
                      <input
                        type="text"
                        required
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                        className="form-input"
                        placeholder="Enter contact person name"
                        maxLength={100}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Organization Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.organizationName}
                        onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                        className="form-input"
                        placeholder="Enter organization name"
                        maxLength={150}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Organization Type *</label>
                        <select
                          required
                          value={formData.organizationType}
                          onChange={(e) => setFormData({...formData, organizationType: e.target.value})}
                          className="form-select"
                        >
                          <option value="">Select organization type</option>
                          {organizationTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Contact Number *</label>
                        <input
                          type="tel"
                          required
                          value={formData.contactNumber}
                          onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                          className="form-input"
                          placeholder="09XXXXXXXXX"
                          pattern="(09|\+639)\d{9}"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="form-section">
                    <h3 className="form-section-title">Event Details</h3>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Event Date *</label>
                        <input
                          type="date"
                          required
                          value={formData.eventDate}
                          onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                          className="form-input"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Address *</label>
                      <textarea
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="form-textarea"
                        placeholder="Enter complete address"
                        rows={3}
                        maxLength={300}
                      />
                    </div>
                  </div>

                  {/* Request Information */}
                  <div className="form-section">
                    <h3 className="form-section-title">Request Information</h3>
                    
                    <div className="form-group">
                      <label className="form-label">Request Type *</label>
                      <select
                        required
                        value={formData.requestType}
                        onChange={(e) => setFormData({...formData, requestType: e.target.value})}
                        className="form-select"
                      >
                        <option value="">Select request type</option>
                        {requestTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Requested Assistance Details *</label>
                      <textarea
                        required
                        value={formData.requestedAssistanceDetails}
                        onChange={(e) => setFormData({...formData, requestedAssistanceDetails: e.target.value})}
                        className="form-textarea"
                        placeholder="Describe the specific assistance you are requesting..."
                        rows={4}
                        maxLength={1000}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Purpose *</label>
                      <textarea
                        required
                        value={formData.purpose}
                        onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                        className="form-textarea"
                        placeholder="Explain the purpose and importance of this request..."
                        rows={4}
                        maxLength={800}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Additional Details</label>
                      <textarea
                        value={formData.additionalDetails}
                        onChange={(e) => setFormData({...formData, additionalDetails: e.target.value})}
                        className="form-textarea"
                        placeholder="Any additional information that might be helpful..."
                        rows={3}
                        maxLength={1000}
                      />
                    </div>
                  </div>

                  {/* Document Upload */}
                  <div className="form-section">
                    <h3 className="form-section-title">Document Upload</h3>
                    
                    <div className="form-group">
                      <label className="form-label">Solicitation Letter *</label>
                      <div className="file-upload-container">
                        <input
                          type="file"
                          required
                          onChange={handleFileChange}
                          className="file-input"
                          accept=".pdf,.jpg,.jpeg,.png"
                          id="solicitation-letter"
                        />
                        <label htmlFor="solicitation-letter" className="file-upload-label">
                          <Upload size={20} />
                          {formData.solicitationLetter 
                            ? formData.solicitationLetter.name 
                            : 'Choose file (PDF, JPG, PNG)'}
                        </label>
                      </div>
                      <small className="file-help-text">
                        Maximum file size: 5MB. Accepted formats: PDF, JPG, PNG
                      </small>
                    </div>
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
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Request Details Modal */}
        {showDetailsModal && selectedRequest && (
          <div className="modal-overlay">
            <div className="modal-content details-modal">
              <div className="modal-header">
                <div>
                  <h2 className="modal-title">{selectedRequest.organizationName}</h2>
                  <span className={`request-type-badge ${selectedRequest.requestType.toLowerCase().replace(' ', '-')}`}>
                    {selectedRequest.requestType}
                  </span>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="modal-close-btn"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="details-content">
                <div className="details-grid">
                  <div className="details-section">
                    <h3 className="details-section-title">Organization Information</h3>
                    <div className="details-list">
                      <div className="detail-row">
                        <User size={16} />
                        <div>
                          <span className="detail-label">Contact Person:</span>
                          <span className="detail-value">{selectedRequest.contactPerson}</span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <Building2 size={16} />
                        <div>
                          <span className="detail-label">Organization:</span>
                          <span className="detail-value">{selectedRequest.organizationName}</span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <Type size={16} />
                        <div>
                          <span className="detail-label">Type:</span>
                          <span className="detail-value">{selectedRequest.organizationType}</span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <Phone size={16} />
                        <div>
                          <span className="detail-label">Contact:</span>
                          <span className="detail-value">{selectedRequest.contactNumber}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="details-section">
                    <h3 className="details-section-title">Event Information</h3>
                    <div className="details-list">
                      <div className="detail-row">
                        <CalendarIcon size={16} />
                        <div>
                          <span className="detail-label">Event Date:</span>
                          <span className="detail-value">{formatDate(selectedRequest.eventDate)}</span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <MapPin size={16} />
                        <div>
                          <span className="detail-label">Address:</span>
                          <span className="detail-value">{selectedRequest.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="details-section full-width">
                  <h3 className="details-section-title">Request Details</h3>
                  <div className="request-details-content">
                    <div className="detail-block">
                      <h4 className="detail-block-title">Requested Assistance</h4>
                      <p className="detail-block-text">{selectedRequest.requestedAssistanceDetails}</p>
                    </div>
                    <div className="detail-block">
                      <h4 className="detail-block-title">Purpose</h4>
                      <p className="detail-block-text">{selectedRequest.purpose}</p>
                    </div>
                    {selectedRequest.additionalDetails && (
                      <div className="detail-block">
                        <h4 className="detail-block-title">Additional Details</h4>
                        <p className="detail-block-text">{selectedRequest.additionalDetails}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="request-meta">
                  <span className="meta-item">Submitted: {formatDate(selectedRequest.createdAt)}</span>
                  {selectedRequest.completedAt && (
                    <span className="meta-item">Completed: {formatDate(selectedRequest.completedAt)}</span>
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

export default SolicitationRequests;