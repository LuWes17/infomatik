// UserListModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import styles from './styles/UserListModal.module.css';

const API_BASE = import.meta.env.VITE_API_URL; // e.g. http://localhost:4000/api

const UserListModal = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Fetch users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/users?limit=1000`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUsers(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    
    const searchLower = searchTerm.toLowerCase();
    return users.filter(user => 
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      user.barangay?.toLowerCase().includes(searchLower) ||
      user.contactNumber?.includes(searchTerm) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower)
    );
  }, [users, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredUsers.length;
    const active = filteredUsers.filter(user => user.isActive).length;
    const verified = filteredUsers.filter(user => user.isVerified).length;
    const admins = filteredUsers.filter(user => user.role === 'admin').length;
    
    return { total, active, verified, admins };
  }, [filteredUsers]);

  // Get user initials for avatar
  const getUserInitials = (user) => {
    const first = user.firstName?.charAt(0)?.toUpperCase() || '';
    const last = user.lastName?.charAt(0)?.toUpperCase() || '';
    return `${first}${last}` || 'U';
  };

  // Format barangay name
  const formatBarangay = (barangay) => {
    if (!barangay) return 'No Barangay';
    return barangay.charAt(0).toUpperCase() + barangay.slice(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle modal close
  const handleClose = () => {
    setSearchTerm('');
    setCurrentPage(1);
    onClose();
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <svg className={styles.userIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197H9m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            All Registered Users
          </h2>
          <button className={styles.closeButton} onClick={handleClose}>
            ×
          </button>
        </div>

        {/* Search Section */}
        <div className={styles.searchSection}>
          <input
            type="text"
            placeholder="Search users by name, barangay, or contact number..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>

        {/* Stats Section */}
        <div className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{stats.total}</div>
              <div className={styles.statLabel}>Total Users</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{stats.active}</div>
              <div className={styles.statLabel}>Active</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{stats.verified}</div>
              <div className={styles.statLabel}>Verified</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{stats.admins}</div>
              <div className={styles.statLabel}>Admins</div>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className={styles.modalContent}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Loading users...</p>
            </div>
          ) : error ? (
            <div className={styles.emptyState}>
              <h3>Error Loading Users</h3>
              <p>{error}</p>
              <button 
                onClick={fetchUsers}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  background: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>{searchTerm ? 'No Users Found' : 'No Users Available'}</h3>
              <p>
                {searchTerm 
                  ? 'Try adjusting your search criteria.' 
                  : 'There are no registered users in the system.'}
              </p>
            </div>
          ) : (
            <div className={styles.userList}>
              {paginatedUsers.map((user) => (
                <div key={user._id} className={styles.userItem}>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      {getUserInitials(user)}
                    </div>
                    <div className={styles.userDetails}>
                      <h3 className={styles.userName}>
                        {user.firstName} {user.lastName}
                      </h3>
                      <div className={styles.userMeta}>
                        <div className={styles.userBarangay}>
                          <svg className={styles.locationIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {formatBarangay(user.barangay)}
                        </div>
                        {user.contactNumber && (
                          <div className={styles.userContact}>
                            <svg className={styles.phoneIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {user.contactNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={styles.userBadges}>
                    <span className={`${styles.statusBadge} ${user.isActive ? styles.active : styles.inactive}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`${styles.roleBadge} ${styles[user.role]}`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && filteredUsers.length > 0 && (
          <div className={styles.pagination}>
            <button
              className={styles.paginationButton}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            <span className={styles.paginationInfo}>
              Page {currentPage} of {totalPages} ({filteredUsers.length} users)
            </span>
            
            <button
              className={styles.paginationButton}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserListModal;