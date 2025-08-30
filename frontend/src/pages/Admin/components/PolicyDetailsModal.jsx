// frontend/src/components/Admin/PolicyDetailsModal.jsx
import React from 'react';
import styles from './PolicyDetailsModal.module.css';

const PolicyDetailsModal = ({ policy, onClose, onEdit, onDelete }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = () => {
    // Implement download logic here
    if (policy.fullDocument?.filePath) {
      window.open(policy.fullDocument.filePath, '_blank');
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <h2 className={styles.modalTitle}>Policy Details</h2>
            <span className={`${styles.policyType} ${styles[policy.type]}`}>
              {policy.type.toUpperCase()}
            </span>
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className={styles.modalContent}>
          {/* Basic Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Basic Information</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Title:</span>
                <span className={styles.infoValue}>{policy.title}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Policy Number:</span>
                <span className={styles.infoValue}>{policy.policyNumber}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Category:</span>
                <span className={styles.infoValue}>{policy.category}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Implementation Date:</span>
                <span className={styles.infoValue}>
                  {formatDate(policy.implementationDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Summary</h3>
            <p className={styles.summary}>{policy.summary}</p>
          </div>

          {/* Document Information */}
          {policy.fullDocument && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Document</h3>
              <div className={styles.documentInfo}>
                <div className={styles.documentDetails}>
                  <span className={styles.documentIcon}>📄</span>
                  <div>
                    <p className={styles.documentName}>
                      {policy.fullDocument.fileName || 'Policy Document'}
                    </p>
                    <p className={styles.documentMeta}>
                      Uploaded on {formatDate(policy.fullDocument.uploadedAt)}
                    </p>
                  </div>
                </div>
                <button
                  className={styles.downloadButton}
                  onClick={handleDownload}
                >
                  ⬇ Download
                </button>
              </div>
            </div>
          )}

          {/* Status and Analytics */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Status & Analytics</h3>
            <div className={styles.statusGrid}>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Publication Status:</span>
                <span className={policy.isPublished ? styles.published : styles.draft}>
                  {policy.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Visibility:</span>
                <span className={styles.statusValue}>
                  {policy.isPubliclyVisible ? 'Public' : 'Private'}
                </span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Views:</span>
                <span className={styles.statusValue}>{policy.views || 0}</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Downloads:</span>
                <span className={styles.statusValue}>{policy.downloads || 0}</span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Metadata</h3>
            <div className={styles.metadataGrid}>
              <div className={styles.metadataItem}>
                <span className={styles.metadataLabel}>Created By:</span>
                <span className={styles.metadataValue}>
                  {policy.createdBy?.firstName} {policy.createdBy?.lastName}
                </span>
              </div>
              <div className={styles.metadataItem}>
                <span className={styles.metadataLabel}>Created At:</span>
                <span className={styles.metadataValue}>
                  {formatDate(policy.createdAt)}
                </span>
              </div>
              {policy.updatedBy && (
                <>
                  <div className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>Last Updated By:</span>
                    <span className={styles.metadataValue}>
                      {policy.updatedBy?.firstName} {policy.updatedBy?.lastName}
                    </span>
                  </div>
                  <div className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>Last Updated At:</span>
                    <span className={styles.metadataValue}>
                      {formatDate(policy.updatedAt)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className={styles.modalActions}>
          <button
            className={styles.editButton}
            onClick={onEdit}
          >
            ✏️ Edit Policy
          </button>
          <button
            className={styles.deleteButton}
            onClick={onDelete}
          >
            🗑️ Delete Policy
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolicyDetailsModal;