import React from 'react';
import styles from './Home.module.css';
import konsiroy from '../../assets/home slides/konsi-roy.jpg'
const Home = () => {
  return (
    <div className={styles.home}>
      {/* Green hero/slider section */}
      <div className={styles.hero}>
        <img src={konsiroy} alt="Konsehal Roy Bon" className={styles.heroImage}/>
      </div>

      {/* Bottom text overlay */}
      <div className={styles.welcomeContainer}>
        <div className={styles.highlight}>Welcome to InfoMatik!</div>
        
        <div className={styles.welcomeText}>
          Ang inyong sentralisado at organisadong plataporma para sa impormasyon,
          kahilingan, at mga anunsyo ng komunidad mula kay 
          <strong> Konsehal Roy Bon.</strong>
        </div>
      </div>
    </div>
  );
};

export default Home;
