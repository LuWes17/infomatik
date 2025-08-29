import React from 'react';
import { X, Edit2, Calendar, Clock, MapPin, Phone, User, Package } from 'lucide-react';
import styles from './DistributionModal.module.css';

const ViewDistributionModal = ({ distribution, onClose, onEdit }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'planned': return styles.statusPlanned;
      case 'ongoing': return styles.statusOngoing;
      case 'completed': return styles.statusCompleted;
      case 'cancelled': return styles.statusCancelled;
      default: return '';
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{distribution.title}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>
        
        <div className={styles.viewContent}>
          {/* Status Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Status</h3>
            <span className={`${styles.statusBadge} ${getStatusBadgeClass(distribution.status)}`}>
              {distribution.status}
            </span>
          </div>
          
          {/* Selected Barangays */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              Selected Barangays ({distribution.selectedBarangays.length})
            </h3>
            <div className={styles.barangayList}>
              {distribution.selectedBarangays.map((barangay) => (
                <span key={barangay} className={styles.barangayTag}>
                  {barangay}
                </span>
              ))}
            </div>
          </div>
          
          {/* Distribution Schedule */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Distribution Schedule</h3>
            {distribution.distributionSchedule.map((schedule, index) => (
              <div key={index} className={styles.scheduleCard}>
                <h4>Schedule {index + 1}</h4>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>
                      <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      Date
                    </span>
                    <span className={styles.infoValue}>{formatDate(schedule.date)}</span>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>
                      <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      Time
                    </span>
                    <span className={styles.infoValue}>{formatTime(schedule.time)}</span>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>
                      <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      Location
                    </span>
                    <span className={styles.infoValue}>{schedule.location}</span>
                  </div>
                  
                  {schedule.contactPerson?.name && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>
                        <User size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Contact Person
                      </span>
                      <span className={styles.infoValue}>
                        {schedule.contactPerson.name}
                        {schedule.contactPerson.phone && ` - ${schedule.contactPerson.phone}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Rice Details */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Rice Details</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>
                  <Package size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Total Kilos
                </span>
                <span className={styles.infoValue}>
                  {distribution.riceDetails.totalKilos.toLocaleString()} kg
                </span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Type of Rice</span>
                <span className={styles.infoValue}>{distribution.riceDetails.typeOfRice}</span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Kilos per Family</span>
                <span className={styles.infoValue}>{distribution.riceDetails.kilosPerFamily} kg</span>
              </div>
              
              {distribution.riceDetails.source && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Source</span>
                  <span className={styles.infoValue}>{distribution.riceDetails.source}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* SMS Notification Status */}
          {distribution.smsNotifications?.sent && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>SMS Notifications</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Status</span>
                  <span className={styles.infoValue}>Sent</span>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Sent At</span>
                  <span className={styles.infoValue}>
                    {formatDate(distribution.smsNotifications.sentAt)}
                  </span>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Recipients</span>
                  <span className={styles.infoValue}>
                    {distribution.smsNotifications.recipientCount}
                  </span>
                </div>
                
                {distribution.smsNotifications.failedCount > 0 && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Failed</span>
                    <span className={styles.infoValue}>
                      {distribution.smsNotifications.failedCount}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Completion Details */}
          {distribution.status === 'completed' && distribution.completedAt && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Completion Details</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Completed At</span>
                  <span className={styles.infoValue}>
                    {formatDate(distribution.completedAt)}
                  </span>
                </div>
                
                {distribution.completionNotes && (
                  <div className={styles.infoItem} style={{ gridColumn: '1 / -1' }}>
                    <span className={styles.infoLabel}>Notes</span>
                    <span className={styles.infoValue}>{distribution.completionNotes}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Created/Updated Info */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Record Information</h3>
            <div className={styles.infoGrid}>
              {distribution.createdBy && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Created By</span>
                  <span className={styles.infoValue}>
                    {distribution.createdBy.firstName} {distribution.createdBy.lastName}
                  </span>
                </div>
              )}
              
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Created At</span>
                <span className={styles.infoValue}>
                  {formatDate(distribution.createdAt)}
                </span>
              </div>
              
              {distribution.updatedBy && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Updated By</span>
                  <span className={styles.infoValue}>
                    {distribution.updatedBy.firstName} {distribution.updatedBy.lastName}
                  </span>
                </div>
              )}
              
              {distribution.updatedAt && distribution.updatedAt !== distribution.createdAt && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Updated At</span>
                  <span className={styles.infoValue}>
                    {formatDate(distribution.updatedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelButton}>
            Close
          </button>
          <button onClick={onEdit} className={styles.submitButton}>
            <Edit2 size={16} />
            Edit Distribution
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewDistributionModal;