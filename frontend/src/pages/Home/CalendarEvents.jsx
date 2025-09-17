// frontend/src/pages/Home/CalendarEvents.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import styles from './CalendarEvents.module.css';

const API_BASE = import.meta.env.VITE_API_URL; // e.g. http://localhost:4000/api

const CalendarEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Fetch announcements with Event category
      const response = await fetch(`${API_BASE}/announcements?category=Event&limit=50`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      
      // Filter for upcoming events and sort by event date
      const now = new Date();
      const upcomingEvents = data.data
        .filter(event => event.eventDate && new Date(event.eventDate) >= now)
        .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
      
      setEvents(upcomingEvents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long'
    });
  };

  const getDateNumber = (dateString) => {
    return new Date(dateString).getDate();
  };

  const getMonth = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short'
    });
  };

  // Calendar logic
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const hasEvent = (day) => {
    if (!day) return false;
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.some(event => {
      const eventDate = new Date(event.eventDate);
      return eventDate.toDateString() === checkDate.toDateString();
    });
  };

  const getEventsForDay = (day) => {
    if (!day) return [];
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter(event => {
      const eventDate = new Date(event.eventDate);
      return eventDate.toDateString() === checkDate.toDateString();
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const monthYear = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const days = getDaysInMonth(currentDate);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <section className={styles.calendarEventsSection}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerText}>
              <h2 className={styles.title}>Calendar of Events</h2>
              <p className={styles.subtitle}>
                Manatiling updated sa mga paparating na kaganapan at aktibidad ng komunidad
              </p>
            </div>
          </div>
        </div>

        <div className={styles.calendarContainer}>
          {/* Calendar Widget */}
          <div className={styles.calendarWidget}>
            <div className={styles.calendarHeader}>
              <h3 className={styles.monthTitle}>{monthYear}</h3>
              <div className={styles.calendarNavigation}>
                <button 
                  className={styles.navButton}
                  onClick={() => navigateMonth(-1)}
                  aria-label="Previous month"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  className={styles.navButton}
                  onClick={() => navigateMonth(1)}
                  aria-label="Next month"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className={styles.calendarGrid}>
              {/* Week days header */}
              {weekDays.map(day => (
                <div key={day} className={styles.weekDay}>
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {days.map((day, index) => (
                <div 
                  key={index} 
                  className={`${styles.calendarDay} ${!day ? styles.emptyDay : ''} ${hasEvent(day) ? styles.hasEvent : ''}`}
                >
                  {day && (
                    <>
                      <span className={styles.dayNumber}>{day}</span>
                      {hasEvent(day) && <div className={styles.eventDot}></div>}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events List */}
          <div className={styles.upcomingEvents}>
            <h3 className={styles.upcomingTitle}>Upcoming Events</h3>
            
            {error && (
              <div className={styles.errorMessage}>
                <p>Unable to load events. Please try again later.</p>
              </div>
            )}

            {!error && events.length === 0 && (
              <div className={styles.noEvents}>
                <Calendar size={48} />
                <p>No upcoming events scheduled</p>
                <span>Check back later for new events!</span>
              </div>
            )}

            {!error && events.length > 0 && (
              <div className={styles.eventsList}>
                {events.slice(0, 3).map((event) => (
                  <Link 
                    key={event._id} 
                    to={`/announcements/?highlight=${event._id}`}
                    className={styles.eventCard}
                  >
                    <div className={styles.eventDate}>
                      <span className={styles.eventDay}>{getDateNumber(event.eventDate)}</span>
                      <span className={styles.eventMonth}>{getMonth(event.eventDate)}</span>
                    </div>
                    
                    <div className={styles.eventDetails}>
                      <h4 className={styles.eventTitle}>{event.title}</h4>
                      <div className={styles.eventMeta}>
                        <div className={styles.eventTime}>
                          <Clock size={14} />
                          <span>{formatTime(event.eventDate)}</span>
                        </div>
                        {event.eventLocation && (
                          <div className={styles.eventLocation}>
                            <MapPin size={14} />
                            <span>{event.eventLocation}</span>
                          </div>
                        )}
                      </div>
                      <p className={styles.eventDescription}>
                        {event.details.length > 120 
                          ? `${event.details.substring(0, 120)}...` 
                          : event.details
                        }
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            

            {events.length > 3 && (
              <div className={styles.viewMoreContainer}>
                <Link to="/announcements?filter=Event" className={styles.viewMoreBtn}>
                  View All Events
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CalendarEvents;