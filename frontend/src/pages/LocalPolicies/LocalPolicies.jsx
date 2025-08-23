import React, { useState } from 'react';
import styles from './LocalPolicies.module.css';

const LocalPolicies = () => {
  const [activeTab, setActiveTab] = useState('ordinances');

  const sampleOrdinances = [
    {
      id: 1,
      title: "Traffic Management Ordinance 2024",
      type: "ordinance",
      implementationDate: "2024-06-15",
      description: "Comprehensive traffic management rules for city streets and public areas."
    },
    {
      id: 2,
      title: "Environmental Protection Ordinance",
      type: "ordinance", 
      implementationDate: "2024-03-20",
      description: "Guidelines for waste management and environmental conservation in the city."
    }
  ];

  const sampleResolutions = [
    {
      id: 1,
      title: "Resolution for Community Health Program",
      type: "resolution",
      implementationDate: "2024-08-10",
      description: "Authorization for the implementation of city-wide health initiatives."
    },
    {
      id: 2,
      title: "Budget Allocation Resolution 2024",
      type: "resolution",
      implementationDate: "2024-01-15",
      description: "Annual budget allocation for various city development projects."
    }
  ];

  const currentData = activeTab === 'ordinances' ? sampleOrdinances : sampleResolutions;

  return (
    <div className={styles.localPolicies}>
      <div className="container">
        <header className={styles.header}>
          <h1>Local Policies</h1>
          <p>Access ordinances and resolutions governing our city</p>
        </header>

        <div className={styles.tabContainer}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'ordinances' ? styles.active : ''}`}
              onClick={() => setActiveTab('ordinances')}
            >
              Ordinances
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'resolutions' ? styles.active : ''}`}
              onClick={() => setActiveTab('resolutions')}
            >
              Resolutions
            </button>
          </div>

          <div className={styles.tabContent}>
            <div className={styles.policiesGrid}>
              {currentData.map((policy) => (
                <div key={policy.id} className={`card ${styles.policyCard}`}>
                  <div className="card-header">
                    <div className={styles.policyHeader}>
                      <h3>{policy.title}</h3>
                      <span className={`${styles.policyType} ${styles[policy.type]}`}>
                        {policy.type.toUpperCase()}
                      </span>
                    </div>
                    <p className={styles.implementationDate}>
                      Implemented: {new Date(policy.implementationDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="card-body">
                    <p>{policy.description}</p>
                    <button className="btn btn-outline">
                      📄 View Document
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalPolicies;