import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import contactus from '../../../assets/footer icon/contact-us.png'
import { ShieldAlert } from 'lucide-react';
const Footer = () => {
    return(
        <footer className={styles.footer}>
            <div className="container">
            {/* Contact Us Section */}
        <div className={styles.contactSection}>
          <div className={styles.contactHeader}>
            <div className={styles.contactusContainer}>
              <img 
                src={contactus} 
                alt="contact-us" 
                className={styles.contactIcon}
              />
            </div>
            Contact Us:
          </div>
        
          <div className={styles.hotlinesGrid}>
            {/* Office */}
            <div className={styles.contactItem}>
                <div className={styles.contactItem}>
                  <span className={styles.hotlineLabel}>Office of the Councilor:</span>
                  <span className={styles.hotlineDetail}>&nbsp; 0920 211 7274</span>
                </div>
            </div>
        
            {/* Facebook */}
            <div className={styles.contactItem}>
              <div className={styles.hotlineLabel}>Facebook:</div>
              <a 
                href="https://www.facebook.com/roy.bon2" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.hotlineDetail}
              >
                &nbsp;Konsi Roy Bon
              </a>
            </div>
        
            {/* Gmail */}
            <div className={styles.contactItem}>
              <div className={styles.hotlineLabel}>Gmail:</div>
              <span className={styles.hotlineDetail}>&nbsp; konsiroy@gmail.com</span>
            </div>
          </div>
        </div>
            
            
                <div className={styles.emergencySection}>
                  <div className={styles.emergencyHeader}>
                    <div className={styles.emergencyContainer}>
                      <ShieldAlert className={styles.emergencyIcon} />
                    </div>
                    Emergency Hotlines:
                  </div>

                <div className={styles.hotlinesGrid}>
                {/* CDRMMO */}
                <div className={styles.hotlineItem}>
                    <div className={styles.hotlineLabel}>
                          CDRMMO Operations Center and Ambulance Services
                    </div>
                    <div className={styles.hotlineNumbers}>
                        <span>• 0995 290 5288</span>
                        <span>• 0939 782 9833</span>
                        <span>• 0909 224 5858</span>
                        <span>• 0999 475 8582</span>
                    </div>
                </div>
                
                {/* BFP */}
                <div className={styles.hotlineItem}>
                    <div className={styles.hotlineLabel}>Bureau of Fire Protection Tabaco City</div>
                        <div className={styles.hotlineNumbers}>
                            <span>• 0915 837 5720</span>
                            <span>• 0939 915 1789</span>
                        </div>
                </div>
                
                {/* PNP Tabaco */}
                <div className={styles.hotlineItem}>
                    <div className={styles.hotlineLabel}>Philippine National Police Tabaco City</div>
                    <div className={styles.hotlineNumbers}>
                        <span>• 0998 598 5930</span>
                        <span>• 0917 658 2462</span>
                    </div>
                </div>
                
                {/* Public City Office */}
                <div className={styles.hotlineItem}>
                    <div className={styles.hotlineLabel}>Public City Office</div>
                    <div className={styles.hotlineNumbers}>
                        <span>• 0995 530 5726</span>
                    </div>
                </div>
                
                {/* Coastguard */}
                <div className={styles.hotlineItem}>
                    <div className={styles.hotlineLabel}>Coastguard Tabaco City</div>
                        <div className={styles.hotlineNumbers}>
                            <span>• 0963 375 3396</span>
                        </div>
                </div>
                
                {/* PNP Maritime */}
                <div className={styles.hotlineItem}>
                    <div className={styles.hotlineLabel}>Philippine National Police Maritime Tabaco City</div>
                        <div className={styles.hotlineNumbers}>
                            <span>• 0906 041 5925</span>
                        </div>
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