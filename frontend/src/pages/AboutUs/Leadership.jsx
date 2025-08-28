import React from 'react'
import { Link } from 'react-router-dom'
import styles from './AboutUs.module.css';
import aboutKonsi from '../../assets/aboutUs/aboutus-konsi.png'
import tabaco from '../../assets/aboutUs/tabaco.png'

const Leadership = () => {
  return (
    <>
      {/* Main container for leadership/profile */}
      <div className={styles.container}>
        <div className={styles.profileContainer}>
          <div className={styles.profileColumn}>
            <div className={styles.header}>
              <img 
                src={tabaco}
                className={styles.headerImage} 
              />
              <div className={styles.headerText}>
                <h1 className={styles.headerTitle}>City Councilor</h1>
                <h2 className={styles.councilor}>GENEROSO "ROY" I. BON</h2>
              </div>
            </div>

            <div className={styles.textContainer}>
              <div className={styles.introSection}>
                <p className={styles.introText}>
                  Ako po si <strong>Konsehal Generoso "Roy" I. Bon</strong>, at ako ay 
                  mapagkumbabang naglillingkod bilang <strong>Chairman ng 
                  Committee on Economic Enterprises</strong> at <strong>Committee on 
                  Public Market Affairs</strong>. Sa loob ng aking panunungkulan, 
                  malinaw sa akin ang kahalagahan ng matatag na 
                  ekonomiya at magayos ng kalakalan para sa kabuhayan 
                  ng bawat pamilyang Pilipino. Ang pamilihan ay hindi 
                  lamang lugar ng bentahan, ito rin ay sentro ng 
                  interaksyon, kabuhayan, at kultura ng ating komunidad.
                </p>
              </div>

              <div className={styles.visionSection}>
                <p className={styles.visionText}>
                  Bilang tagapangulo ng mga komiteng aking 
                  pinamumunuan, ako ay nagsusumikap na maisulong 
                  ang mga programang magpapalabas sa ating mga 
                  negosyong lokal, mapapabuti ang pasilidad at kalinisan 
                  ng mga pampublikong pamilihan, at magbibigay ng patas na 
                  oportunidad sa maliliit at malalaking mangangalakal. 
                  Naniniwala ako na sa pamamagitan ng bukas na komunikasyon, 
                  pakikipagtulungan sa iba’t ibang sektor, at malinaw na pananaw 
                  para sa kaunlaran, maitataguyod natin ang isang mas masigla at 
                  mas organisadong pamilihan na magiging sandigan ng ating lokal 
                  na ekonomiya.  Sa huli, ang aking layunin ay simple ngunit 
                  makabuluhanang masigurong bawat mamamayan ay nakikinabang sa paglago ng ating bayan.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.imageContainer}>
            <img 
              src={aboutKonsi} 
              alt="Councilor Generoso Roy I. Bon" 
            />
          </div>
        </div>

        <div className={styles.divider}></div>
      </div>

      {/* Full-width staff section */}
      <div className={styles.staffSection}>
        <div className={styles.staffContent}>
          <div className={styles.staffHeader}>
            <h3 className={styles.staffTitle}>Our Staff</h3>
            <p className={styles.staffSubtitle}>Dedicated public servants working for the community</p>
          </div>
          
          <div className={styles.staffGrid}>
          
            <div className={styles.staffCard}>
              <div className={styles.staffImagePlaceholder}>
                <div className={styles.placeholderIcon}>👤</div>
              </div>
              <div className={styles.staffInfo}>
                <h4 className={styles.staffName}>Staff Member 1</h4>
                <p className={styles.staffPosition}>Position</p>
              </div>
            </div>

            <div className={styles.staffCard}>
              <div className={styles.staffImagePlaceholder}>
                <div className={styles.placeholderIcon}>👤</div>
              </div>
              <div className={styles.staffInfo}>
                <h4 className={styles.staffName}>Staff Member 2</h4>
                <p className={styles.staffPosition}>Position</p>
              </div>
            </div>

            <div className={styles.staffCard}>
              <div className={styles.staffImagePlaceholder}>
                <div className={styles.placeholderIcon}>👤</div>
              </div>
              <div className={styles.staffInfo}>
                <h4 className={styles.staffName}>Staff Member 3</h4>
                <p className={styles.staffPosition}>Position</p>
              </div>
            </div>
            
            <div className={styles.staffCard}>
              <div className={styles.staffImagePlaceholder}>
                <div className={styles.placeholderIcon}>👤</div>
              </div>
              <div className={styles.staffInfo}>
                <h4 className={styles.staffName}>Staff Member 2</h4>
                <p className={styles.staffPosition}>Position</p>
              </div>
            </div>
            
            <div className={styles.staffCard}>
              <div className={styles.staffImagePlaceholder}>
                <div className={styles.placeholderIcon}>👤</div>
              </div>
              <div className={styles.staffInfo}>
                <h4 className={styles.staffName}>Staff Member 2</h4>
                <p className={styles.staffPosition}>Position</p>
              </div>
            </div>
            
            <div className={styles.staffCard}>
              <div className={styles.staffImagePlaceholder}>
                <div className={styles.placeholderIcon}>👤</div>
              </div>
              <div className={styles.staffInfo}>
                <h4 className={styles.staffName}>Staff Member 2</h4>
                <p className={styles.staffPosition}>Position</p>
              </div>
            </div>
            
            <div className={styles.staffCard}>
              <div className={styles.staffImagePlaceholder}>
                <div className={styles.placeholderIcon}>👤</div>
              </div>
              <div className={styles.staffInfo}>
                <h4 className={styles.staffName}>Staff Member 2</h4>
                <p className={styles.staffPosition}>Position</p>
              </div>
            </div>
            
            <div className={styles.staffCard}>
              <div className={styles.staffImagePlaceholder}>
                <div className={styles.placeholderIcon}>👤</div>
              </div>
              <div className={styles.staffInfo}>
                <h4 className={styles.staffName}>Staff Member 2</h4>
                <p className={styles.staffPosition}>Position</p>
              </div>
            </div>
            
            <div className={styles.staffCard}>
              <div className={styles.staffImagePlaceholder}>
                <div className={styles.placeholderIcon}>👤</div>
              </div>
              <div className={styles.staffInfo}>
                <h4 className={styles.staffName}>Staff Member 2</h4>
                <p className={styles.staffPosition}>Position</p>
              </div>
            </div>
            
            <div className={styles.staffCard}>
              <div className={styles.staffImagePlaceholder}>
                <div className={styles.placeholderIcon}>👤</div>
              </div>
              <div className={styles.staffInfo}>
                <h4 className={styles.staffName}>Staff Member 2</h4>
                <p className={styles.staffPosition}>Position</p>
              </div>
            </div>
            
            <div className={styles.staffCard}>
              <div className={styles.staffImagePlaceholder}>
                <div className={styles.placeholderIcon}>👤</div>
              </div>
              <div className={styles.staffInfo}>
                <h4 className={styles.staffName}>Staff Member 2</h4>
                <p className={styles.staffPosition}>Position</p>
              </div>
            </div>
            
            <div className={styles.staffCard}>
              <div className={styles.staffImagePlaceholder}>
                <div className={styles.placeholderIcon}>👤</div>
              </div>
              <div className={styles.staffInfo}>
                <h4 className={styles.staffName}>Staff Member 2</h4>
                <p className={styles.staffPosition}>Position</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Leadership
