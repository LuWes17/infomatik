// frontend/src/pages/Admin/AdminLocalPolicies.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { policyService } from '@/services/policyService';
import CreatePolicyModal from '../Admin/components/CreatePolicyModal';
import PolicyDetailsModal from '../Admin/components/PolicyDetailsModal';
import DeleteConfirmModal from '../Admin/components/DeleteConfirmModal';
import styles from './styles/AdminLocalPolicies.module.css';

const AdminLocalPolicies = () => {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Filter states
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await policyService.getAllPolicies();
      setPolicies(response.data);
    } catch (error) {
      toast.error('Failed to fetch policies');
      console.error('Fetch policies error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = async (policyData) => {
    try {
      const response = await policyService.createPolicy(policyData);
      setPolicies([response.data, ...policies]);
      setShowCreateModal(false);
      toast.success('Policy created successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create policy');
      console.error('Create policy error:', error);
    }
  };

  const handleUpdatePolicy = async (policyId, updateData) => {
    try {
      const response = await policyService.updatePolicy(policyId, updateData);
      setPolicies(policies.map(p => 
        p._id === policyId ? response.data : p
      ));
      setShowEditModal(false);
      setSelectedPolicy(null);
      toast.success('Policy updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update policy');
      console.error('Update policy error:', error);
    }
  };

  const handleDeletePolicy = async () => {
    try {
      await policyService.deletePolicy(selectedPolicy._id);
      setPolicies(policies.filter(p => p._id !== selectedPolicy._id));
      setShowDeleteModal(false);
      setSelectedPolicy(null);
      toast.success('Policy deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete policy');
      console.error('Delete policy error:', error);
    }
  };

  const handleCardClick = (policy) => {
    setSelectedPolicy(policy);
    setShowDetailsModal(true);
  };

  const handleEditClick = (policy) => {
    setSelectedPolicy(policy);
    setShowDetailsModal(false);
    setShowEditModal(true);
  };

  const handleDeleteClick = (policy) => {
    setSelectedPolicy(policy);
    setShowDetailsModal(false);
    setShowDeleteModal(true);
  };

  // Filter policies based on type and search term
  const filteredPolicies = policies.filter(policy => {
    const matchesType = filterType === 'all' || policy.type === filterType;
    const matchesSearch = policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Local Policies Management</h1>
        <p className={styles.subtitle}>Manage ordinances and resolutions</p>
      </div>

      <div className={styles.controls}>
        <button 
          className={styles.createButton}
          onClick={() => setShowCreateModal(true)}
        >
          <span className={styles.icon}>+</span>
          Create Policy
        </button>

        <div className={styles.filters}>
          <input
            type="text"
            placeholder="Search policies..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className={styles.filterSelect}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="ordinance">Ordinances</option>
            <option value="resolution">Resolutions</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading policies...</p>
        </div>
      ) : filteredPolicies.length === 0 ? (
        <div className={styles.empty}>
          <p>No policies found</p>
          {searchTerm && (
            <p className={styles.emptyHint}>
              Try adjusting your search term
            </p>
          )}
        </div>
      ) : (
        <div className={styles.policiesGrid}>
          {filteredPolicies.map((policy) => (
            <div
              key={policy._id}
              className={styles.policyCard}
              onClick={() => handleCardClick(policy)}
            >
              <div className={styles.cardHeader}>
                <span className={`${styles.policyType} ${styles[policy.type]}`}>
                  {policy.type.toUpperCase()}
                </span>
                <span className={styles.policyNumber}>
                  {policy.policyNumber}
                </span>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.policyTitle}>{policy.title}</h3>
                <p className={styles.policySummary}>
                  {policy.summary.length > 150 
                    ? `${policy.summary.substring(0, 150)}...` 
                    : policy.summary}
                </p>

                <div className={styles.cardMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Category:</span>
                    <span className={styles.metaValue}>{policy.category}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Implementation:</span>
                    <span className={styles.metaValue}>
                      {new Date(policy.implementationDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.stats}>
                    <span className={styles.stat}>
                      <span className={styles.statIcon}>👁</span>
                      {policy.views || 0} views
                    </span>
                    <span className={styles.stat}>
                      <span className={styles.statIcon}>⬇</span>
                      {policy.downloads || 0} downloads
                    </span>
                  </div>
                  <div className={styles.status}>
                    {policy.isPublished ? (
                      <span className={styles.published}>Published</span>
                    ) : (
                      <span className={styles.draft}>Draft</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreatePolicyModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePolicy}
        />
      )}

      {showDetailsModal && selectedPolicy && (
        <PolicyDetailsModal
          policy={selectedPolicy}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedPolicy(null);
          }}
          onEdit={() => handleEditClick(selectedPolicy)}
          onDelete={() => handleDeleteClick(selectedPolicy)}
        />
      )}

      {showEditModal && selectedPolicy && (
        <EditPolicyModal
          policy={selectedPolicy}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPolicy(null);
          }}
          onSubmit={(updateData) => handleUpdatePolicy(selectedPolicy._id, updateData)}
        />
      )}

      {showDeleteModal && selectedPolicy && (
        <DeleteConfirmModal
          title="Delete Policy"
          message={`Are you sure you want to delete "${selectedPolicy.title}"? This action cannot be undone.`}
          onConfirm={handleDeletePolicy}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedPolicy(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminLocalPolicies;