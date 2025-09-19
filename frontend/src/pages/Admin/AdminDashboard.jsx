import React, { useState, useEffect } from 'react';
import styles from './styles/AdminDashboard.module.css';

const API_BASE = import.meta.env.VITE_API_URL; 

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    statistics: {
      users: { total: 0, active: 0 },
      jobApplications: { total: 0, pending: 0 },
      solicitations: { total: 0, pending: 0 },
      feedback: { total: 0, pending: 0 }
    },
    recentActivities: {
      applications: [],
      solicitations: [],
      feedback: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applications');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/dashboard/statistics`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
      } else {
        console.error('Failed to fetch dashboard data:', data.message);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'var(--warning-color)';
      case 'approved': case 'accepted': return 'var(--success-color)';
      case 'rejected': return 'var(--error-color)';
      case 'completed': return 'var(--gray-600)';
      default: return 'var(--gray-500)';
    }
  };

  const { statistics, recentActivities } = dashboardData;

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <h1>Admin Dashboard</h1>
        <p>Overview of system metrics and recent activities</p>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'var(--primary-light)' }}>
            <svg width="24" height="24" fill="none" stroke="var(--primary-color)" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumbers}>
              <span className={styles.mainNumber}>{statistics.users.total}</span>
              <span className={styles.subNumber}>({statistics.users.active} active)</span>
            </div>
            <p className={styles.statLabel}>Total Users</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'var(--success-light)' }}>
            <svg width="24" height="24" fill="none" stroke="var(--success-color)" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumbers}>
              <span className={styles.mainNumber}>{statistics.jobApplications.total}</span>
              <span className={styles.subNumber}>({statistics.jobApplications.pending} pending)</span>
            </div>
            <p className={styles.statLabel}>Job Applications</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'var(--warning-light)' }}>
            <svg width="24" height="24" fill="none" stroke="var(--warning-color)" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumbers}>
              <span className={styles.mainNumber}>{statistics.solicitations.total}</span>
              <span className={styles.subNumber}>({statistics.solicitations.pending} pending)</span>
            </div>
            <p className={styles.statLabel}>Solicitation Requests</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#E0E7FF' }}>
            <svg width="24" height="24" fill="none" stroke="#6366F1" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumbers}>
              <span className={styles.mainNumber}>{statistics.feedback.total}</span>
              <span className={styles.subNumber}>({statistics.feedback.pending} pending)</span>
            </div>
            <p className={styles.statLabel}>Community Feedback</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className={styles.analyticsSection}>
        <div className={styles.sectionHeader}>
          <h2>System Analytics</h2>
        </div>
        
        <div className={styles.chartsGrid}>
          {/* Status Distribution Chart */}
          <div className={styles.chartCard}>
            <h3>Application Status Distribution</h3>
            <div className={styles.donutChart}>
              <div className={styles.chartLegend}>
                <div className={styles.legendItem}>
                  <div className={styles.colorDot} style={{ backgroundColor: 'var(--warning-color)' }}></div>
                  <span>Pending ({statistics.jobApplications.pending})</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.colorDot} style={{ backgroundColor: 'var(--success-color)' }}></div>
                  <span>Approved ({statistics.jobApplications.total - statistics.jobApplications.pending})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Metrics */}
          <div className={styles.chartCard}>
            <h3>System Activity</h3>
            <div className={styles.activityMetrics}>
              <div className={styles.metric}>
                <div className={styles.metricValue}>
                  {Math.round((statistics.users.active / statistics.users.total) * 100) || 0}%
                </div>
                <div className={styles.metricLabel}>User Activity Rate</div>
              </div>
              <div className={styles.metric}>
                <div className={styles.metricValue}>
                  {Math.round((statistics.jobApplications.pending / statistics.jobApplications.total) * 100) || 0}%
                </div>
                <div className={styles.metricLabel}>Pending Applications</div>
              </div>
              <div className={styles.metric}>
                <div className={styles.metricValue}>
                  {Math.round((statistics.solicitations.pending / statistics.solicitations.total) * 100) || 0}%
                </div>
                <div className={styles.metricLabel}>Pending Solicitations</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className={styles.activitiesSection}>
        <div className={styles.sectionHeader}>
          <h2>Recent Activities</h2>
          <div className={styles.tabNavigation}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'applications' ? styles.active : ''}`}
              onClick={() => setActiveTab('applications')}
            >
              Applications
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'solicitations' ? styles.active : ''}`}
              onClick={() => setActiveTab('solicitations')}
            >
              Solicitations
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'feedback' ? styles.active : ''}`}
              onClick={() => setActiveTab('feedback')}
            >
              Feedback
            </button>
          </div>
        </div>

        <div className={styles.activitiesContent}>
          {activeTab === 'applications' && (
            <div className={styles.activityList}>
              {recentActivities.applications.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No recent job applications</p>
                </div>
              ) : (
                recentActivities.applications.map((application) => (
                  <div key={application._id} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                      </svg>
                    </div>
                    <div className={styles.activityContent}>
                      <div className={styles.activityTitle}>
                        {application.applicant?.firstName} {application.applicant?.lastName} applied for {application.jobPosting?.title}
                      </div>
                      <div className={styles.activityMeta}>
                        <span className={styles.activityDate}>{formatDate(application.createdAt)}</span>
                        <span 
                          className={styles.activityStatus}
                          style={{ color: getStatusColor(application.status) }}
                        >
                          {application.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'solicitations' && (
            <div className={styles.activityList}>
              {recentActivities.solicitations.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No recent solicitation requests</p>
                </div>
              ) : (
                recentActivities.solicitations.map((solicitation) => (
                  <div key={solicitation._id} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className={styles.activityContent}>
                      <div className={styles.activityTitle}>
                        {solicitation.submittedBy?.firstName} {solicitation.submittedBy?.lastName} submitted {solicitation.requestType} request
                      </div>
                      <div className={styles.activityMeta}>
                        <span className={styles.activityDate}>{formatDate(solicitation.createdAt)}</span>
                        <span 
                          className={styles.activityStatus}
                          style={{ color: getStatusColor(solicitation.status) }}
                        >
                          {solicitation.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className={styles.activityList}>
              {recentActivities.feedback.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No recent feedback</p>
                </div>
              ) : (
                recentActivities.feedback.map((feedback) => (
                  <div key={feedback._id} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <div className={styles.activityContent}>
                      <div className={styles.activityTitle}>
                        {feedback.submittedBy?.firstName} {feedback.submittedBy?.lastName} submitted feedback
                      </div>
                      <div className={styles.activityText}>
                        {feedback.message?.length > 100 ? 
                          `${feedback.message.substring(0, 100)}...` : 
                          feedback.message
                        }
                      </div>
                      <div className={styles.activityMeta}>
                        <span className={styles.activityDate}>{formatDate(feedback.createdAt)}</span>
                        <span 
                          className={styles.activityStatus}
                          style={{ color: getStatusColor(feedback.status) }}
                        >
                          {feedback.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;