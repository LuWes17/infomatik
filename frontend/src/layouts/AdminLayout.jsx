import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Menu, 
  X, 
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <button className={styles.sidebarToggle} onClick={toggleSidebar}>
          <Menu size={20} />
        </button>
        <h1 className={styles.adminTitle}>System Administrator</h1>
      </div>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Admin Panel</h2>
          <button className={styles.sidebarClose} onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.adminInfo}>
          <p className={styles.welcomeText}>Welcome, Admin!</p>
        </div>

        <nav className={styles.sidebarNav}>
          <ul className={styles.sidebarMenu}>
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`${styles.sidebarLink} ${
                      location.pathname === item.path ? styles.active : ''
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <IconComponent size={18} className={styles.sidebarIcon} />
                    <span className={styles.sidebarLabel}>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div className={styles.sidebarOverlay} onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Main Content Area */}
      <main className={styles.adminMain}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;