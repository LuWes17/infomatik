import React from 'react';
import styles from './Announcements.module.css';

const Announcements = () => {
  const sampleAnnouncements = [
    {
      id: 1,
      title: "Community Health Program Launch",
      date: "2025-01-25",
      category: "Update",
      details: "We are excited to announce the launch of our new community health program starting next month."
    },
    {
      id: 2,
      title: "Town Hall Meeting",
      date: "2025-02-01",
      category: "Event",
      details: "Join us for our monthly town hall meeting to discuss community concerns and upcoming projects."
    }
  ];

  return (
    <div className={styles.announcements}>
      <div className="container">
        <header className={styles.header}>
          <h1>Announcements</h1>
          <p>Stay updated with the latest news and events from our office</p>
        </header>

        <div className={styles.announcementGrid}>
          {sampleAnnouncements.map((announcement) => (
            <div key={announcement.id} className={`card ${styles.announcementCard}`}>
              <div className="card-header">
                <div className={styles.cardHeader}>
                  <h3>{announcement.title}</h3>
                  <span className={`${styles.category} ${styles[announcement.category.toLowerCase()]}`}>
                    {announcement.category}
                  </span>
                </div>
                <p className={styles.date}>{announcement.date}</p>
              </div>
              <div className="card-body">
                <p>{announcement.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Announcements;