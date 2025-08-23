import React from 'react';
import styles from './CitizenGuide.module.css';

const CitizenGuide = () => {
  const guides = [
    {
      id: 1,
      title: "How to Apply for Jobs",
      icon: "💼",
      steps: [
        "Create an account or log in to your existing account",
        "Navigate to Services > Job Openings",
        "Browse available positions and read requirements",
        "Click 'Apply' on your desired position",
        "Fill out the application form completely",
        "Upload your CV in PDF format",
        "Submit your application",
        "Wait for SMS notification about your application status"
      ]
    },
    {
      id: 2,
      title: "Solicitation Request Process",
      icon: "🤝",
      steps: [
        "Register for an account with valid contact information",
        "Prepare your solicitation letter and supporting documents",
        "Go to Services > Solicitation Request",
        "Fill out the request form with accurate details",
        "Select the appropriate request type and organization type",
        "Upload your solicitation letter",
        "Submit your request for review",
        "Track your request status in your profile",
        "Receive SMS notification when approved"
      ]
    },
    {
      id: 3,
      title: "Monthly Rice Distribution",
      icon: "🌾",
      steps: [
        "Check if your barangay is selected for the current month",
        "SMS notifications are sent to all eligible residents",
        "Bring valid ID and proof of residence",
        "Go to your barangay distribution center on the scheduled date",
        "Present your documents to the distribution team",
        "Receive your rice allocation",
        "Sign the distribution record"
      ]
    },
    {
      id: 4,
      title: "Submitting Community Feedback",
      icon: "💬",
      steps: [
        "Create an account or log in",
        "Navigate to About Us > Community Feedback",
        "Read existing feedback to avoid duplicates",
        "Click 'Submit Feedback' button",
        "Write your feedback clearly and constructively",
        "Submit your feedback",
        "Your feedback will be publicly visible",
        "Wait for official response from our office"
      ]
    },
    {
      id: 5,
      title: "Website Navigation Guide",
      icon: "🧭",
      steps: [
        "Home: Latest news and quick access to services",
        "Announcements: Updates and upcoming events",
        "Services: Job applications, solicitation requests, rice distribution",
        "Accomplishments: Completed projects and initiatives", 
        "Local Policies: Ordinances and resolutions",
        "Citizen Guide: This helpful guide section",
        "About Us: Leadership info and community feedback",
        "Login/Register: Account access for services"
      ]
    }
  ];

  return (
    <div className={styles.citizenGuide}>
      <div className="container">
        <header className={styles.header}>
          <h1>Citizen Guide</h1>
          <p>Step-by-step instructions for accessing our services and navigating our website</p>
        </header>

        <div className={styles.guidesContainer}>
          {guides.map((guide) => (
            <div key={guide.id} className={`card ${styles.guideCard}`}>
              <div className="card-header">
                <div className={styles.guideHeader}>
                  <span className={styles.guideIcon}>{guide.icon}</span>
                  <h3>{guide.title}</h3>
                </div>
              </div>
              <div className="card-body">
                <ol className={styles.stepsList}>
                  {guide.steps.map((step, index) => (
                    <li key={index} className={styles.step}>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CitizenGuide;