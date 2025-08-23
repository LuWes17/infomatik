import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import contactus from '../../../assets/footer icon/contact-us.png'
const Footer = () => {
    return(
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.emergencySection}>
                    <div className={styles.emergencyHeader}>
                        <div className={styles.contactusContainer}>
                                    <Link to="/">
                                      <img 
                                        src={contactus} 
                                        alt="contact-us" 
                                        className={styles.contactIcon}
                                      />
                                    </Link>
                                  </div>
                        Emergency Hotlines:
                    </div>

                    <div className={styles.hotlinesGrid}>
                        <div className={styles.hotlineItem}>
                            <div className={styles.hotlineContent}>CDRMMO Operations Center and Ambulance Services: 0995 290 5288   0939 782 9833  0909 224 5858  0999 475 8582</div>
                        </div>
                        <div className={styles.hotlineItem}>
                            <div className={styles.hotlineLabel}>Office of the Councilor: 09xx xxx xxxx</div>
                        </div>
                        <div className={styles.hotlineItem}>
                            <div className={styles.hotlineLabel}>Office of the Councilor: 09xx xxx xxxx</div>
                        </div>
                        <div className={styles.hotlineItem}>
                            <div className={styles.hotlineLabel}>Office of the Councilor: 09xx xxx xxxx</div>
                        </div>
                        <div className={styles.hotlineItem}>
                            <div className={styles.hotlineLabel}>Office of the Councilor: 09xx xxx xxxx</div>
                        </div>
                        <div className={styles.hotlineItem}>
                            <div className={styles.hotlineLabel}>Office of the Councilor: 09xx xxx xxxx</div>
                        </div>
                    </div>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.footerBottom}>
                    <div className={styles.copyright}>2025 © | Councilor Generoso I. Bon</div>
                    <div className={styles.poweredBy}>Powered by XXX</div>
                </div>
            </div>    
        </footer>
    )
}

export default Footer;