import React, {useState} from 'react';
import styles from './AboutUs.module.css';
import profile from '../../assets/konsi-profile.png'

const AboutUs = () => {

  return (
    <div className={styles.aboutUs}>
      <div className={styles.header}>
        Our City Officials
      </div>
      <div className={styles.profileContainer}>
        <div className={styles.textContainer}>

        </div>
        <div className={styles.imageContainer}>
          
        </div>
      </div>
      <div className={styles.line}></div>
      <div className={styles.staffContainer}>
        
      </div>
    </div>
  );
};

export default AboutUs;