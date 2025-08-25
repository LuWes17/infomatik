import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import infomatiklogo from '../../../assets/infomatik-logo.png';
import { ChevronDown } from 'lucide-react';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className="container">
        <nav className={styles.nav}>
          <div className={styles.logoContainer}>
            <Link to="/">
              <img src={infomatiklogo} alt="infomatik" className={styles.logoImg} />
            </Link>
          </div>

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
        </nav>
      </div>
    </header>
  );
};

export default Header;