import React from 'react';
import styles from './Accomplishments.module.css';

const Accomplishments = () => {
  const accomplishments = [
    {
      id: 1,
      title: "New Community Center Construction",
      description: "Successfully completed the construction of a modern community center serving 5 barangays",
      completionDate: "2024-12-15",
      image: "🏢"
    },
    {
      id: 2,
      title: "Street Lighting Project",
      description: "Installed 200+ LED streetlights across 15 barangays improving safety and security",
      completionDate: "2024-11-30",
      image: "💡"
    },
    {
      id: 3,
      title: "Clean Water Access Initiative",
      description: "Provided clean water access to 1,000+ households through new water infrastructure",
      completionDate: "2024-10-20",
      image: "💧"
    }
  ];

  return (
    <div className={styles.accomplishments}>
      <div className="container">
        <header className={styles.header}>
          <h1>Our Accomplishments</h1>
          <p>Celebrating the projects and initiatives that have made a difference in our community</p>
        </header>

        <div className={styles.timelineContainer}>
          {accomplishments.map((accomplishment, index) => (
            <div key={accomplishment.id} className={styles.timelineItem}>
              <div className={styles.timelineMarker}>{index + 1}</div>
              <div className={`card ${styles.accomplishmentCard}`}>
                <div className="card-body">
                  <div className={styles.accomplishmentIcon}>
                    {accomplishment.image}
                  </div>
                  <h3>{accomplishment.title}</h3>
                  <p className={styles.description}>{accomplishment.description}</p>
                  <div className={styles.completionDate}>
                    Completed: {new Date(accomplishment.completionDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Accomplishments;