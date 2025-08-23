import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className="container">
        <nav className={styles.nav}>
          <Link to="/" className={styles.logo}>
            <h1>{import.meta.env.VITE_APP_NAME}</h1>
          </Link>
          
          <ul className={styles.navList}>
            <li><Link to="/" className={styles.navLink}>Home</Link></li>
            <li><Link to="/announcements" className={styles.navLink}>Announcements</Link></li>
            <li><Link to="/services" className={styles.navLink}>Services</Link></li>
            <li><Link to="/accomplishments" className={styles.navLink}>Accomplishments</Link></li>
            <li><Link to="/policies" className={styles.navLink}>Local Policies</Link></li>
            <li><Link to="/guide" className={styles.navLink}>Citizen Guide</Link></li>
            <li><Link to="/about" className={styles.navLink}>About Us</Link></li>
          </ul>
          
          <div className={styles.authButtons}>
            <Link to="/login" className="btn btn-outline">Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;