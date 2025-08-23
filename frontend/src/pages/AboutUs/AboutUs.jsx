import React, {useState} from 'react';
import styles from './AboutUs.module.css';

const AboutUs = () => {
  const [feedbackText, setFeedbackText] = useState('');

  const leadership = [
    {
      id: 1,
      name: "Hon. Maria Santos",
      position: "City Councilor",
      description: "Dedicated public servant with 8 years of experience in local governance, focusing on community development and social services.",
      facebook: "mariasantos.councilor",
      email: "councilor.santos@city.gov.ph",
      photo: "👩‍💼"
    },
    {
      id: 2,
      name: "John Martinez",
      position: "Chief of Staff", 
      description: "Administrative leader coordinating daily operations and ensuring efficient delivery of public services.",
      facebook: "john.martinez.staff",
      email: "j.martinez@city.gov.ph",
      photo: "👨‍💼"
    },
    {
      id: 3,
      name: "Ana Rodriguez",
      position: "Community Relations Officer",
      description: "Liaison between the community and the office, handling citizen concerns and feedback.",
      facebook: "ana.rodriguez.cro",
      email: "a.rodriguez@city.gov.ph", 
      photo: "👩‍💻"
    }
  ];

  const sampleFeedback = [
    {
      id: 1,
      citizen: "Juan Dela Cruz",
      date: "2025-01-20",
      feedback: "Thank you for the quick response to our barangay's street lighting request. The new LED lights have greatly improved safety in our area.",
      response: "We're glad to have addressed your community's needs. Safety is our top priority.",
      responseDate: "2025-01-21"
    },
    {
      id: 2,
      citizen: "Maria Garcia", 
      date: "2025-01-18",
      feedback: "The rice distribution program has been very helpful for our family. The process was smooth and well-organized.",
      response: "Thank you for your feedback. We continuously work to improve our distribution programs.",
      responseDate: "2025-01-19"
    }
  ];

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    console.log('Feedback submitted:', feedbackText);
    setFeedbackText('');
    alert('Thank you for your feedback! It has been submitted successfully.');
  };

  return (
    <div className={styles.aboutUs}>
      <div className="container">
        <header className={styles.header}>
          <h1>About Us</h1>
          <p>Meet our team and learn how we serve the community</p>
        </header>

        {/* Leadership Section */}
        <section className={styles.section}>
          <h2>Our Leadership Team</h2>
          <div className={styles.leadershipGrid}>
            {leadership.map((leader) => (
              <div key={leader.id} className={`card ${styles.leaderCard}`}>
                <div className="card-body">
                  <div className={styles.leaderPhoto}>{leader.photo}</div>
                  <h3>{leader.name}</h3>
                  <h4 className={styles.position}>{leader.position}</h4>
                  <p className={styles.description}>{leader.description}</p>
                  <div className={styles.contactInfo}>
                    <a href={`https://facebook.com/${leader.facebook}`} className={styles.contactLink}>
                      📘 Facebook
                    </a>
                    <a href={`mailto:${leader.email}`} className={styles.contactLink}>
                      📧 Email
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Community Feedback Section */}
        <section className={styles.section}>
          <h2>Community Feedback</h2>
          
          {/* Submit Feedback Form */}
          <div className={`card ${styles.feedbackForm}`}>
            <div className="card-header">
              <h3>Submit Your Feedback</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleFeedbackSubmit}>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share your thoughts, suggestions, or concerns about our services..."
                  required
                  className={styles.feedbackTextarea}
                  rows="4"
                />
                <button type="submit" className="btn btn-primary">
                  Submit Feedback
                </button>
              </form>
            </div>
          </div>

          {/* Existing Feedback */}
          <div className={styles.feedbackList}>
            <h3>Recent Community Feedback</h3>
            {sampleFeedback.map((item) => (
              <div key={item.id} className={`card ${styles.feedbackItem}`}>
                <div className="card-body">
                  <div className={styles.feedbackHeader}>
                    <strong>{item.citizen}</strong>
                    <span className={styles.feedbackDate}>{item.date}</span>
                  </div>
                  <p className={styles.feedbackText}>{item.feedback}</p>
                  
                  {item.response && (
                    <div className={styles.response}>
                      <div className={styles.responseHeader}>
                        <strong>Official Response</strong>
                        <span className={styles.responseDate}>{item.responseDate}</span>
                      </div>
                      <p className={styles.responseText}>{item.response}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;