import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  User,
  Home, 
  Megaphone, 
  Trophy, 
  Briefcase, 
  FileText, 
  Wheat, 
  Scale, 
  MessageCircle,
  LogOut
} from 'lucide-react';
import styles from './AdminLayout.module.css';

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    { path: '/admin/', label: 'Dashboard', icon: Home },
    { path: '/admin/announcements', label: 'Announcements', icon: Megaphone },
    { path: '/admin/accomplishments', label: 'Accomplishments', icon: Trophy },
    { path: '/admin/job-openings', label: 'Job Openings', icon: Briefcase },
    { path: '/admin/solicitation-requests', label: 'Solicitation Requests', icon: FileText },
    { path: '/admin/rice-distribution', label: 'Monthly Rice Distribution', icon: Wheat },
    { path: '/admin/local-policies', label: 'Local Policies', icon: Scale },
    { path: '/admin/feedback', label: 'Feedback', icon: MessageCircle },
  ];

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
        {/* Admin Info Section - Always visible, clickable avatar to toggle */}
        <div className={styles.adminInfo}>
          <div className={styles.adminProfile}>
          <button 
            className={styles.adminAvatar} 
            onClick={toggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <User size={24} className={styles.userIcon} />
          </button>
            {!isCollapsed && (
              <div className={styles.adminDetails}>
                <p className={styles.adminName}>System Admin</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className={styles.sidebarNav}>
          <ul className={styles.sidebarMenu}>
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`${styles.sidebarLink} ${isActive ? styles.active : ''}`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <IconComponent size={20} className={styles.sidebarIcon} />
                    {!isCollapsed && (
                      <span className={styles.sidebarLabel}>{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
<div className={styles.sidebarFooter}>
  <button 
    className={styles.logoutBtn} 
    onClick={handleLogout}
    title={isCollapsed ? 'Logout' : ''}
  >
    <LogOut size={isCollapsed ? 24 : 18} />
    {!isCollapsed && <span>Logout</span>}
  </button>
</div>
      </aside>

      {/* Main Content Area */}
      <main className={`${styles.adminMain} ${isCollapsed ? styles.mainCollapsed : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;