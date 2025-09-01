import React, { useState, useEffect } from 'react';
import styles from './Home.module.css';
import konsiroy from '../../assets/home slides/konsi-roy.jpg';
import withkonsi from '../../assets/home slides/withkonsi.jpg';
import konsiCommunity from '../../assets/home slides/konsi-community.jpg';
import { CircleChevronRight, CircleChevronLeft, CalendarDays, BellRing, BriefcaseBusiness, Mail, ScrollText } from "lucide-react";
import FeedbackSection from './FeedbackSection'; 
import LatestUpdates from './LatestUpdates';
import LatestAccomplishments from './LatestAccomplishments';

const Home = () => {
  const slides = [konsiroy, withkonsi, konsiCommunity];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState('next');

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval); // Cleanup on unmount or dependency change
  }, [isAutoPlay, currentIndex]);

  const changeSlide = (newIndex, direction = 'next') => {
    if (isAnimating) return; // Prevent rapid clicking
    
    setSlideDirection(direction);
    setNextIndex(newIndex);
    setIsAnimating(true);
    
    // After animation completes, update current index and reset
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsAnimating(false);
    }, 500); // Match this with CSS transition duration
  };

  const prevSlide = () => {
    const newIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
    changeSlide(newIndex, 'prev');
    // Temporarily pause auto-play when user interacts
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 10000); // Resume after 10 seconds
  };

  const nextSlide = () => {
    const newIndex = currentIndex === slides.length - 1 ? 0 : currentIndex + 1;
    changeSlide(newIndex, 'next');
    // Temporarily pause auto-play when user interacts
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 10000); // Resume after 10 seconds
  };

  const goToSlide = (index) => {
    if (index === currentIndex) return;
    const direction = index > currentIndex ? 'next' : 'prev';
    changeSlide(index, direction);
    // Temporarily pause auto-play when user clicks dots
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 10000); // Resume after 10 seconds
  };
  
  return (
    <div className={styles.home}>
      {/* Hero/slider section */}
      <div className={styles.hero}>
        {/* Current Image */}
        <img
          src={slides[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          className={`${styles.heroImage} ${styles.currentImage} ${
            isAnimating ? (slideDirection === 'next' ? styles.slideOutLeft : styles.slideOutRight) : ''
          }`}
        />
        
        {/* Next Image (only shown during animation) */}
        {isAnimating && (
          <img
            src={slides[nextIndex]}
            alt={`Slide ${nextIndex + 1}`}
            className={`${styles.heroImage} ${styles.nextImage} ${
              slideDirection === 'next' ? styles.slideInRight : styles.slideInLeft
            }`}
          />
        )}

        {/* Overlay text with gradient background */}
        <div className={styles.welcomeContainer}>
          <div className={styles.highlight}>Welcome to InfoMatik!</div>
          <div className={styles.welcomeText}>
            <p>
              Ang inyong sentralisado at organisadong plataporma para sa impormasyon,
            </p>
            <p>
              kahilingan, at mga anunsyo ng komunidad mula kay <strong>Konsehal Roy Bon.</strong>
            </p>
          </div>
        </div>

        {/* Arrows */}
        <button className={`${styles.arrow} ${styles.left}`} onClick={prevSlide}>
          <CircleChevronLeft size={32} />
        </button>
        <button className={`${styles.arrow} ${styles.right}`} onClick={nextSlide}>
          <CircleChevronRight size={32} />
        </button>

        {/* Dots */}
        <div className={styles.dots}>
          {slides.map((_, index) => (
            <span
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
              onClick={() => goToSlide(index)}
            ></span>
          ))}
        </div>
      </div>

      {/* Quick Links Section */}
      <div className={styles.quickLinks}>
        <div className={styles.quickLinksContainer}>
          <div className={styles.quickLinkCard}>
            <CalendarDays size={48} />
            <h3>Events</h3>
          </div>
          
          <div className={styles.quickLinkCard}>
            <BellRing size={48} />
            <h3>Updates</h3>
          </div>
          
          <div className={styles.quickLinkCard}>
            <BriefcaseBusiness size={48} />
            <h3>Job Openings</h3>
          </div>
          
          <div className={styles.quickLinkCard}>
            <Mail size={48} />
            <h3>Solicitation</h3>
          </div>
          
          <div className={styles.quickLinkCard}>
            <ScrollText size={48} />
            <h3>Ordinance</h3>
          </div>
        </div>
      </div>

      <FeedbackSection />

       <LatestUpdates />

       <LatestAccomplishments />
    </div>
  );
};

export default Home;