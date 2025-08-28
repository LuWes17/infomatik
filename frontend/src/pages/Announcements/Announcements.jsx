import React, { useState, useEffect } from 'react'
import styles from './Announcements.module.css'
import { Megaphone } from 'lucide-react';

const Announcements = () => {
  const [announcements,setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Public Fetch Announcements
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/announcements/');

      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }

      const data = await response.json();
      setAnnouncements(data.data); // adjust based on your backend's response
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);  

  const openViewModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowViewModal(true);
  }

  if (loading) {
      return (
        <div className='loadingContainer'>
          <div className='spinner'></div>
          <p>Loading announcements...</p>
        </div>
      );
    }

  return (
    <div className={styles.publicAnnouncements}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <Megaphone size={120} className={styles.icon}/>
        </div>
        <div className={styles.filterContainer}>

        </div>
      </div>
    </div>
  )
}

export default Announcements