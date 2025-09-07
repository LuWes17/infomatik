import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './Header.module.css';
import infomatiklogo from '../../../assets/infomatik-logo.png';
import { ChevronDown, Menu, X, CircleUserRound } from 'lucide-react';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDropdown = (dropdownName) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [dropdownName]: !prev[dropdownName]
    }));
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setOpenDropdowns({});
  };

  const handleUserIconClick = () => {
    // Navigate to profile page based on user role
    if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/profile');
    }
  };

  // Helper function to check if a path is active
  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Helper function to check if any dropdown item is active
  const isDropdownActive = (paths) => {
    return paths.some(path => isActivePath(path));
  };

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest(`.${styles.userDropdown}`)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showUserDropdown]);

  return (
    <header className={styles.header}>
      <div className="container">
        <nav className={styles.nav}>
          <div className={styles.logoContainer}>
            <Link to="/">
              <img src={infomatiklogo} alt="infomatik" className={styles.logoImg} />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <ul className={styles.navList}>
            <li><Link to="/" className={`${styles.navLink} ${isActivePath('/') ? styles.activeNavLink : ''}`}>Home</Link></li>
            <li><Link to="/announcements" className={`${styles.navLink} ${isActivePath('/announcements') ? styles.activeNavLink : ''}`}>Announcements</Link></li>
            
            {/* Services Dropdown */}
            <li className={`${styles.dropdown} ${isDropdownActive(['/services']) ? styles.activeDropdown : ''}`}>
              <p className={`${styles.navLink} ${isDropdownActive(['/services']) ? styles.activeNavLink : ''}`}>
                Services
                <ChevronDown size={14} className={styles.dropdownArrow} />
              </p>
              <div className={styles.dropdownContent}>
                <Link 
                  to="/services/job-openings" 
                  className={`${styles.dropdownLink} ${isActivePath('/services/job-openings') ? styles.activeDropdownLink : ''}`}
                >
                  Job Openings
                </Link>
                <Link 
                  to="/services/solicitation-requests" 
                  className={`${styles.dropdownLink} ${isActivePath('/services/solicitation-requests') ? styles.activeDropdownLink : ''}`}
                >
                  Solicitation Requests
                </Link>
                <Link 
                  to="/services/monthly-rice-distribution" 
                  className={`${styles.dropdownLink} ${isActivePath('/services/monthly-rice-distribution') ? styles.activeDropdownLink : ''}`}
                >
                  Monthly Rice Distribution
                </Link>
              </div>
            </li>
            
            <li><Link to="/accomplishments" className={`${styles.navLink} ${isActivePath('/accomplishments') ? styles.activeNavLink : ''}`}>Accomplishments</Link></li>
            
            {/* Local Policies Dropdown */}
            <li className={`${styles.dropdown} ${isDropdownActive(['/policies']) ? styles.activeDropdown : ''}`}>
              <p className={`${styles.navLink} ${isDropdownActive(['/policies']) ? styles.activeNavLink : ''}`}>
                Local Policies
                <ChevronDown size={14} className={styles.dropdownArrow} />
              </p>
              <div className={styles.dropdownContent}>
                <Link 
                  to="/policies/ordinance" 
                  className={`${styles.dropdownLink} ${isActivePath('/policies/ordinance') ? styles.activeDropdownLink : ''}`}
                >
                  Ordinance
                </Link>
                <Link 
                  to="/policies/resolution" 
                  className={`${styles.dropdownLink} ${isActivePath('/policies/resolution') ? styles.activeDropdownLink : ''}`}
                >
                  Resolution
                </Link>
              </div>
            </li>
            
            <li><Link to="/guide" className={`${styles.navLink} ${isActivePath('/guide') ? styles.activeNavLink : ''}`}>Citizen Guide</Link></li>
            
            {/* About Us Dropdown */}
            <li className={`${styles.dropdown} ${isDropdownActive(['/about']) ? styles.activeDropdown : ''}`}>
              <p className={`${styles.navLink} ${isDropdownActive(['/about']) ? styles.activeNavLink : ''}`}>
                About Us
                <ChevronDown size={14} className={styles.dropdownArrow} />
              </p>
              <div className={styles.dropdownContent}>
                <Link 
                  to="/about/leadership" 
                  className={`${styles.dropdownLink} ${isActivePath('/about/leadership') ? styles.activeDropdownLink : ''}`}
                >
                  Leadership
                </Link>
                <Link 
                  to="/about/feedback" 
                  className={`${styles.dropdownLink} ${isActivePath('/about/feedback') ? styles.activeDropdownLink : ''}`}
                >
                  Feedback
                </Link>
              </div>
            </li>
          </ul>

          {/* Auth Section */}
          <div className={styles.authButtons}>
            {isAuthenticated ? (
              <button 
                className={styles.userButton}
                onClick={handleUserIconClick}
                aria-label={`Go to ${user?.role === 'admin' ? 'Dashboard' : 'Profile'}`}
              >
                <CircleUserRound size={28} />
              </button>
            ) : (
              <Link to="/login" className="btn btn-outline">Login</Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={styles.mobileMenuBtn}
            onClick={toggleSidebar}
            aria-label="Toggle navigation menu"
          >
            <Menu size={24} />
          </button>
        </nav>
      </div>

      {/* Mobile Sidebar */}
      <div className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <img src={infomatiklogo} alt="infomatik" className={styles.sidebarLogo} />
          <button 
            className={styles.closeSidebarBtn}
            onClick={closeSidebar}
            aria-label="Close navigation menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          <ul className={styles.sidebarNavList}>
            <li>
              <Link 
                to="/" 
                className={`${styles.sidebarNavLink} ${isActivePath('/') ? styles.activeSidebarNavLink : ''}`} 
                onClick={closeSidebar}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/announcements" 
                className={`${styles.sidebarNavLink} ${isActivePath('/announcements') ? styles.activeSidebarNavLink : ''}`} 
                onClick={closeSidebar}
              >
                Announcements
              </Link>
            </li>
            
            {/* Services Dropdown - Mobile */}
            <li className={`${styles.sidebarDropdown} ${isDropdownActive(['/services']) ? styles.activeSidebarDropdown : ''}`}>
              <div className={styles.sidebarDropdownHeader} onClick={() => toggleDropdown('services')}>
                <p className={`${styles.sidebarNavLink} ${isDropdownActive(['/services']) ? styles.activeSidebarNavLink : ''}`}>Services</p>
                <ChevronDown 
                  size={18} 
                  className={`${styles.sidebarDropdownArrow} ${openDropdowns.services ? styles.sidebarDropdownArrowOpen : ''}`}
                />
              </div>
              <div className={`${styles.sidebarDropdownContent} ${openDropdowns.services ? styles.sidebarDropdownContentOpen : ''}`}>
                <Link 
                  to="/services/job-openings" 
                  className={`${styles.sidebarDropdownLink} ${isActivePath('/services/job-openings') ? styles.activeSidebarDropdownLink : ''}`} 
                  onClick={closeSidebar}
                >
                  Job Openings
                </Link>
                <Link 
                  to="/services/solicitation-requests" 
                  className={`${styles.sidebarDropdownLink} ${isActivePath('/services/solicitation-requests') ? styles.activeSidebarDropdownLink : ''}`} 
                  onClick={closeSidebar}
                >
                  Solicitation Requests
                </Link>
                <Link 
                  to="/services/monthly-rice-distribution" 
                  className={`${styles.sidebarDropdownLink} ${isActivePath('/services/monthly-rice-distribution') ? styles.activeSidebarDropdownLink : ''}`} 
                  onClick={closeSidebar}
                >
                  Monthly Rice Distribution
                </Link>
              </div>
            </li>

            <li>
              <Link 
                to="/accomplishments" 
                className={`${styles.sidebarNavLink} ${isActivePath('/accomplishments') ? styles.activeSidebarNavLink : ''}`} 
                onClick={closeSidebar}
              >
                Accomplishments
              </Link>
            </li>
            
            {/* Local Policies Dropdown - Mobile */}
            <li className={`${styles.sidebarDropdown} ${isDropdownActive(['/policies']) ? styles.activeSidebarDropdown : ''}`}>
              <div className={styles.sidebarDropdownHeader} onClick={() => toggleDropdown('policies')}>
                <p className={`${styles.sidebarNavLink} ${isDropdownActive(['/policies']) ? styles.activeSidebarNavLink : ''}`}>Local Policies</p>
                <ChevronDown 
                  size={18} 
                  className={`${styles.sidebarDropdownArrow} ${openDropdowns.policies ? styles.sidebarDropdownArrowOpen : ''}`}
                />
              </div>
              <div className={`${styles.sidebarDropdownContent} ${openDropdowns.policies ? styles.sidebarDropdownContentOpen : ''}`}>
                <Link 
                  to="/policies/ordinance" 
                  className={`${styles.sidebarDropdownLink} ${isActivePath('/policies/ordinance') ? styles.activeSidebarDropdownLink : ''}`} 
                  onClick={closeSidebar}
                >
                  Ordinance
                </Link>
                <Link 
                  to="/policies/resolution" 
                  className={`${styles.sidebarDropdownLink} ${isActivePath('/policies/resolution') ? styles.activeSidebarDropdownLink : ''}`} 
                  onClick={closeSidebar}
                >
                  Resolution
                </Link>
              </div>
            </li>
            
            <li>
              <Link 
                to="/guide" 
                className={`${styles.sidebarNavLink} ${isActivePath('/guide') ? styles.activeSidebarNavLink : ''}`} 
                onClick={closeSidebar}
              >
                Citizen Guide
              </Link>
            </li>
            
            {/* About Us Dropdown - Mobile */}
            <li className={`${styles.sidebarDropdown} ${isDropdownActive(['/about']) ? styles.activeSidebarDropdown : ''}`}>
              <div className={styles.sidebarDropdownHeader} onClick={() => toggleDropdown('about')}>
                <p className={`${styles.sidebarNavLink} ${isDropdownActive(['/about']) ? styles.activeSidebarNavLink : ''}`}>About Us</p>
                <ChevronDown 
                  size={18} 
                  className={`${styles.sidebarDropdownArrow} ${openDropdowns.about ? styles.sidebarDropdownArrowOpen : ''}`}
                />
              </div>
              <div className={`${styles.sidebarDropdownContent} ${openDropdowns.about ? styles.sidebarDropdownContentOpen : ''}`}>
                <Link 
                  to="/about/leadership" 
                  className={`${styles.sidebarDropdownLink} ${isActivePath('/about/leadership') ? styles.activeSidebarDropdownLink : ''}`} 
                  onClick={closeSidebar}
                >
                  Leadership
                </Link>
                <Link 
                  to="/about/feedback" 
                  className={`${styles.sidebarDropdownLink} ${isActivePath('/about/feedback') ? styles.activeSidebarDropdownLink : ''}`} 
                  onClick={closeSidebar}
                >
                  Feedback
                </Link>
              </div>
            </li>
          </ul>

          {/* Mobile Auth Section */}
          <div className={styles.sidebarAuthButtons}>
            {isAuthenticated ? (
              <div className={styles.sidebarUserSection}>
                <div className={styles.sidebarUserActions}>
                  <button 
                    className={styles.sidebarLogoutButton}
                    onClick={() => {
                      closeSidebar();
                      logout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" onClick={closeSidebar}>
                Login
              </Link>
            )}
          </div>
        </nav>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && <div className={styles.sidebarOverlay} onClick={closeSidebar}></div>}
    </header>
  );
};

export default Header;