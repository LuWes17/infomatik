import React from 'react';
import styles from './Home.module.css';

const Home = () => {
  return (
    <div className={styles.home}>
      <div className="container">
        <section className={styles.hero}>
          <h1>Welcome to {import.meta.env.VITE_APP_NAME}</h1>
          <p>Your gateway to city services and community engagement</p>
          <div className={styles.quickActions}>
            <button className="btn btn-primary btn-lg">View Services</button>
            <button className="btn btn-outline btn-lg">Latest News</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;