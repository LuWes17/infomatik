import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Services.module.css';

const Services = () => {
  const services = [
    {
      id: 1,
      title: "Job Openings",
      description: "Browse and apply for available positions in our city government",
      icon: "💼",
      link: "/services/jobs"
    },
    {
      id: 2,
      title: "Solicitation Requests",
      description: "Submit requests for assistance and community support",
      icon: "🤝",
      link: "/services/solicitation"
    },
    {
      id: 3,
      title: "Monthly Rice Distribution",
      description: "Information about rice distribution schedule and eligible barangays",
      icon: "🌾",
      link: "/services/rice-distribution"
    }
  ];

  return (
    <div className={styles.services}>
      <div className="container">
        <header className={styles.header}>
          <h1>Our Services</h1>
          <p>Access various services and programs offered by our office</p>
        </header>

        <div className={styles.servicesGrid}>
          {services.map((service) => (
            <div key={service.id} className={`card ${styles.serviceCard}`}>
              <div className="card-body">
                <div className={styles.serviceIcon}>{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Link to={service.link} className="btn btn-primary">
                  Learn More
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;