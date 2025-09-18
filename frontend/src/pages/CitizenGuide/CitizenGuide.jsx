import React, { useState } from 'react';
import { Briefcase, Mail, Wheat, MessageSquare, Navigation, BookOpen, Search } from 'lucide-react';
import styles from './CitizenGuide.module.css';

const CitizenGuide = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const guides = [
    {
      id: 1,
      title: "Job Application Process",
      icon: Briefcase,
      steps: [
        "Create an account or log in to your existing account.",
        "Navigate to Services > Job Openings.",
        "Browse available positions and read requirements.",
        "Click 'Apply' on your desired position.",
        "Fill out the application form completely.",
        "Upload your CV in PDF format.",
        "Submit your application.",
        "Track your request status in your profile.",
        "Wait for SMS notification about your application status."
      ]
    },
    {
      id: 2,
      title: "Solicitation Request Process",
      icon: Mail,
      steps: [
        "Create an account or log in to your existing account.",
        "Prepare your solicitation letter and supporting documents.",
        "Go to Services > Solicitation Request.",
        "Fill out the request form with accurate details.",
        "Select the appropriate request type and organization type.",
        "Upload your solicitation letter in PDF format.",
        "Submit your request for review.",
        "Track your request status in your profile.",
        "Wait for SMS notification about your application status."
      ]
    },
    {
      id: 3,
      title: "Monthly Rice Distribution Process",
      icon: Wheat,
      steps: [
        "Check if your barangay is selected for the current month.",
        "SMS notifications are sent to all eligible residents.",
        "Bring valid ID and proof of residence.",
        "Go to your barangay distribution center on the scheduled date.",
        "Present your documents to your barangay coordinator.",
        "Claim your rice allocation.",
      ]
    },
    {
      id: 4,
      title: "Submitting Community Feedback",
      icon: MessageSquare,
      steps: [
        "Create an account or log in to your existing account.",
        "Go to About Us > Community Feedback.",
        "Read existing feedback to avoid duplicates.",
        "Click 'Submit Feedback' button.",
        "Write your feedback clearly and attach a photo if necessary.",
        "Submit your feedback.",
        "Your feedback will be publicly visible.",
      ]
    },
    {
      id: 5,
      title: "Website Navigation Guide",
      icon: Navigation,
      steps: [
        "Home: Latest news and quick access to services.",
        "Announcements: Updates and upcoming events.",
        "Services: Job applications, solicitation requests, rice distribution.",
        "Accomplishments: Completed projects and initiatives.", 
        "Local Policies: Ordinances and resolutions.",
        "Citizen Guide: This helpful guide section.",
        "About Us: Leadership info and community feedback.",
        "Login/Register: Account access for services."
      ]
    }
  ];

  // Filter guides based on search term
  const filteredGuides = guides.filter(guide =>
    guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.steps.some(step => step.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={styles.container}>
      {/* Header Section - Matching other pages exact pattern */}
      <header className={styles.header}>
        <div className={styles.headerText}>
          <BookOpen size={92} className={styles.icon} />
          <div className={styles.headerContent}>
            <h1>Citizen Guide</h1>
            <p>Step-by-step instructions for accessing our services and navigating our website.</p>
          </div>
        </div>
        
        <div className={styles.filterSection}>
          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search guides or steps..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className={styles.citizenGuideContainer}>
        {/* Guides Grid */}
        <div className={styles.guidesGrid}>
          {filteredGuides.length > 0 ? (
            filteredGuides.map((guide) => {
              const IconComponent = guide.icon;
              return (
                <div key={guide.id} className={styles.guideCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardIcon}>
                      <IconComponent size={32} />
                    </div>
                    <h3 className={styles.cardTitle}>{guide.title}</h3>
                  </div>
                  
                  <div className={styles.cardBody}>
                    <ol className={styles.stepsList}>
                      {guide.steps.map((step, index) => (
                        <li key={index} className={styles.step}>
                          <span className={styles.stepNumber}>{index + 1}</span>
                          <span className={styles.stepText}>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.noResults}>
              <Search size={48} />
              <h3>No guides found</h3>
              <p>Try adjusting your search terms to find what you're looking for.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitizenGuide;