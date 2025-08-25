import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import infomatiklogo from '../../../assets/infomatik-logo.png';
import { ChevronDown, Menu, X } from 'lucide-react';
const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});

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
  };useEffect(() => {
  if (isSidebarOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }
  
  // Cleanup function to restore scroll when component unmounts
  return () => {
    document.body.style.overflow = 'unset';
  };}, [isSidebarOpen]);

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
            <li><Link to="/" className={styles.navLink}>Home</Link></li>
            <li><Link to="/announcements" className={styles.navLink}>Announcements</Link></li>
            
            {/* Services Dropdown */}
            <li className={styles.dropdown}>
              <Link to="/services" className={styles.navLink}>
                Services
                <ChevronDown size={14} className={styles.dropdownArrow} />
              </Link>
              <div className={styles.dropdownContent}>
                <Link to="/services/job-openings" className={styles.dropdownLink}>Job Openings</Link>
                <Link to="/services/solicitation-requests" className={styles.dropdownLink}>Solicitation Requests</Link>
                <Link to="/services/monthly-rice-distribution" className={styles.dropdownLink}>Monthly Rice Distribution</Link>
              </div>
            </li>
            
            <li><Link to="/accomplishments" className={styles.navLink}>Accomplishments</Link></li>
            
            {/* Local Policies Dropdown */}
            <li className={styles.dropdown}>
              <Link to="/policies" className={styles.navLink}>
                Local Policies
                <ChevronDown size={14} className={styles.dropdownArrow} />
              </Link>
              <div className={styles.dropdownContent}>
                <Link to="/policies/ordinance" className={styles.dropdownLink}>Ordinance</Link>
                <Link to="/policies/resolution" className={styles.dropdownLink}>Resolution</Link>
              </div>
            </li>
            
            <li><Link to="/guide" className={styles.navLink}>Citizen Guide</Link></li>
            
            {/* About Us Dropdown */}
            <li className={styles.dropdown}>
              <Link to="/about" className={styles.navLink}>
                About Us
                <ChevronDown size={14} className={styles.dropdownArrow} />
              </Link>
              <div className={styles.dropdownContent}>
                <Link to="/about/leadership" className={styles.dropdownLink}>Leadership</Link>
                <Link to="/about/feedback" className={styles.dropdownLink}>Feedback</Link>
              </div>
            </li>
          </ul>

          <div className={styles.authButtons}>
            <Link to="/login" className="btn btn-outline">Login</Link>
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
              <Link to="/" className={styles.sidebarNavLink} onClick={closeSidebar}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/announcements" className={styles.sidebarNavLink} onClick={closeSidebar}>
                Announcements
              </Link>
            </li>
            
            {/* Services Dropdown - Mobile */}
            <li className={styles.sidebarDropdown}>
              <div className={styles.sidebarDropdownHeader} onClick={() => toggleDropdown('services')}>
                <Link to="/services" className={styles.sidebarNavLink}>Services</Link>
                <ChevronDown 
                  size={18} 
                  className={`${styles.sidebarDropdownArrow} ${openDropdowns.services ? styles.sidebarDropdownArrowOpen : ''}`}
                />
              </div>
              <div className={`${styles.sidebarDropdownContent} ${openDropdowns.services ? styles.sidebarDropdownContentOpen : ''}`}>
                <Link to="/services/job-openings" className={styles.sidebarDropdownLink} onClick={closeSidebar}>
                  Job Openings
                </Link>
                <Link to="/services/solicitation-requests" className={styles.sidebarDropdownLink} onClick={closeSidebar}>
                  Solicitation Requests
                </Link>
                <Link to="/services/monthly-rice-distribution" className={styles.sidebarDropdownLink} onClick={closeSidebar}>
                  Monthly Rice Distribution
                </Link>
              </div>
            </li>

            <li>
              <Link to="/accomplishments" className={styles.sidebarNavLink} onClick={closeSidebar}>
                Accomplishments
              </Link>
            </li>
            
            {/* Local Policies Dropdown - Mobile */}
            <li className={styles.sidebarDropdown}>
              <div className={styles.sidebarDropdownHeader} onClick={() => toggleDropdown('policies')}>
                <Link to="/policies" className={styles.sidebarNavLink}>Local Policies</Link>
                <ChevronDown 
                  size={18} 
                  className={`${styles.sidebarDropdownArrow} ${openDropdowns.policies ? styles.sidebarDropdownArrowOpen : ''}`}
                />
              </div>
              <div className={`${styles.sidebarDropdownContent} ${openDropdowns.policies ? styles.sidebarDropdownContentOpen : ''}`}>
                <Link to="/policies/ordinance" className={styles.sidebarDropdownLink} onClick={closeSidebar}>
                  Ordinance
                </Link>
                <Link to="/policies/resolution" className={styles.sidebarDropdownLink} onClick={closeSidebar}>
                  Resolution
                </Link>
              </div>
            </li>
            
            <li>
              <Link to="/guide" className={styles.sidebarNavLink} onClick={closeSidebar}>
                Citizen Guide
              </Link>
            </li>
            
            {/* About Us Dropdown - Mobile */}
            <li className={styles.sidebarDropdown}>
              <div className={styles.sidebarDropdownHeader} onClick={() => toggleDropdown('about')}>
                <Link to="/about" className={styles.sidebarNavLink}>About Us</Link>
                <ChevronDown 
                  size={18} 
                  className={`${styles.sidebarDropdownArrow} ${openDropdowns.about ? styles.sidebarDropdownArrowOpen : ''}`}
                />
              </div>
              <div className={`${styles.sidebarDropdownContent} ${openDropdowns.about ? styles.sidebarDropdownContentOpen : ''}`}>
                <Link to="/about/leadership" className={styles.sidebarDropdownLink} onClick={closeSidebar}>
                  Leadership
                </Link>
                <Link to="/about/feedback" className={styles.sidebarDropdownLink} onClick={closeSidebar}>
                  Feedback
                </Link>
              </div>
            </li>
          </ul>

          <div className={styles.sidebarAuthButtons}>
            <Link to="/login" onClick={closeSidebar}>
              Login
            </Link>
          </div>
        </nav>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && <div className={styles.sidebarOverlay} onClick={closeSidebar}></div>}
    </header>
  );
};

export default Header;