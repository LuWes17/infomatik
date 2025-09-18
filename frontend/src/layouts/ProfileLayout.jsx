// frontend/src/layouts/ProfileLayout.jsx
import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Edit3, Lock, LogOut, Settings } from 'lucide-react';
import EditProfileModal from '../components/profile/EditProfileModal';
import ChangePasswordModal from '../components/profile/ChangePasswordModal';
import styles from './ProfileLayout.module.css';

const ProfileLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isTabletView, setIsTabletView] = useState(false);
  const navRef = useRef(null);
  const contentRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  // Freeze background when modals are open
  useEffect(() => {
    const isModalOpen = showEditModal || showPasswordModal;
    
    if (isModalOpen) {
      // Store the current scroll position
      const scrollY = window.scrollY;
      
      // Add class to body to prevent scrolling
      document.body.classList.add('modal-open');
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Remove the scroll lock and restore position
      const scrollY = document.body.style.top;
      document.body.classList.remove('modal-open');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    // Cleanup function to ensure body class is removed if component unmounts
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [showEditModal, showPasswordModal]);

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
  };

  // Freeze background when modals are open
  useEffect(() => {
    const isModalOpen = showEditModal || showPasswordModal;
    
    if (isModalOpen) {
      // Store the current scroll position
      const scrollY = window.scrollY;
      
      // Add class to body to prevent scrolling
      document.body.classList.add('modal-open');
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Remove the scroll lock and restore position
      const scrollY = document.body.style.top;
      document.body.classList.remove('modal-open');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    // Cleanup function to ensure body class is removed if component unmounts
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [showEditModal, showPasswordModal]);

  // Check if current view is tablet
  const checkTabletView = () => {
    const width = window.innerWidth;
    const isTablet = width >= 769 && width <= 1024;
    setIsTabletView(isTablet);
  };

  // Update sliding indicator position
  const updateActiveIndicator = () => {
    const nav = navRef.current;
    const activeLink = nav?.querySelector(`.${styles.navLinkActive}`);
    
    if (nav && activeLink) {
      const navRect = nav.getBoundingClientRect();
      const activeRect = activeLink.getBoundingClientRect();
      
      const left = activeRect.left - navRect.left;
      const width = activeRect.width;
      
      nav.style.setProperty('--indicator-left', `${left}px`);
      nav.style.setProperty('--indicator-width', `${width}px`);
    }
  };

  // Handle smooth page transitions for desktop and tablet
  useEffect(() => {
    if (window.innerWidth > 768) {
      setIsTransitioning(true);
      
      // Add transition class to content
      if (contentRef.current) {
        contentRef.current.style.opacity = '0';
        contentRef.current.style.transform = 'translateY(10px)';
        
        // Animate in after a short delay
        setTimeout(() => {
          if (contentRef.current) {
            contentRef.current.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            contentRef.current.style.opacity = '1';
            contentRef.current.style.transform = 'translateY(0)';
          }
          setIsTransitioning(false);
        }, 50);
      }
    }

    // Update sliding indicator when route changes
    setTimeout(updateActiveIndicator, 100);
  }, [location.pathname]);

  // Update indicator and tablet view on window resize
  useEffect(() => {
    const handleResize = () => {
      updateActiveIndicator();
      checkTabletView();
    };

    // Check tablet view on initial load
    checkTabletView();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Enhanced mobile navigation scroll handling with smooth transitions
  useEffect(() => {
    const navElement = navRef.current;
    if (!navElement) return;

    const checkScrollability = () => {
      const isScrollable = navElement.scrollWidth > navElement.clientWidth;
      const canScrollLeft = navElement.scrollLeft > 0;
      const canScrollRight = navElement.scrollLeft < (navElement.scrollWidth - navElement.clientWidth);
      
      if (isScrollable) {
        navElement.classList.add('showScrollIndicator');
      } else {
        navElement.classList.remove('showScrollIndicator');
      }
    };

    // Check initially and on resize
    checkScrollability();
    window.addEventListener('resize', checkScrollability);

    // Enhanced touch handling with momentum and smooth transitions
    let isScrolling = false;
    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;
    let velocity = 0;
    let amplitude = 0;
    let target = 0;
    let timeConstant = 325; // ms
    let raf = null;

    const track = () => {
      const now = Date.now();
      const elapsed = now - timestamp;
      const delta = offset - frame;
      frame = offset;
      
      const v = 1000 * delta / (1 + elapsed);
      velocity = 0.8 * v + 0.2 * velocity;
    };

    const autoScroll = () => {
      if (amplitude) {
        const elapsed = Date.now() - timestamp;
        const delta = -amplitude * Math.exp(-elapsed / timeConstant);
        
        if (delta > 0.5 || delta < -0.5) {
          navElement.scrollLeft = target + delta;
          raf = requestAnimationFrame(autoScroll);
        } else {
          navElement.scrollLeft = target;
        }
      }
    };

    let timestamp = 0;
    let frame = 0;
    let offset = 0;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      isScrolling = true;
      startX = touch.pageX - navElement.offsetLeft;
      startY = touch.pageY;
      scrollLeft = navElement.scrollLeft;
      
      // Initialize tracking
      timestamp = Date.now();
      frame = offset = scrollLeft;
      velocity = amplitude = 0;
      
      // Cancel any ongoing momentum scroll
      if (raf) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    };

    const handleTouchMove = (e) => {
      if (!isScrolling) return;
      
      const touch = e.touches[0];
      const x = touch.pageX - navElement.offsetLeft;
      const y = touch.pageY;
      
      // Check if this is a horizontal swipe
      const deltaX = Math.abs(x - startX);
      const deltaY = Math.abs(y - startY);
      
      if (deltaX > deltaY) {
        e.preventDefault(); // Prevent vertical scrolling
        
        const walk = (x - startX) * 1.5; // Scroll speed multiplier
        offset = scrollLeft - walk;
        navElement.scrollLeft = offset;
        
        track();
      }
    };

    const handleTouchEnd = (e) => {
      if (!isScrolling) return;
      isScrolling = false;
      
      // Start momentum scrolling
      if (velocity > 10 || velocity < -10) {
        amplitude = 0.8 * velocity;
        target = Math.round(offset + amplitude);
        timestamp = Date.now();
        raf = requestAnimationFrame(autoScroll);
      }
      
      checkScrollability();
    };

    // Add scroll event listener for indicator updates
    const handleScroll = () => {
      checkScrollability();
    };

    // Add event listeners for touch devices
    if (window.innerWidth <= 768) {
      navElement.addEventListener('touchstart', handleTouchStart, { passive: false });
      navElement.addEventListener('touchmove', handleTouchMove, { passive: false });
      navElement.addEventListener('touchend', handleTouchEnd, { passive: true });
      navElement.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('resize', checkScrollability);
      navElement.removeEventListener('touchstart', handleTouchStart);
      navElement.removeEventListener('touchmove', handleTouchMove);
      navElement.removeEventListener('touchend', handleTouchEnd);
      navElement.removeEventListener('scroll', handleScroll);
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, []);

  // Auto-scroll to active nav item on mobile with smooth animation
  useEffect(() => {
    const activeLink = navRef.current?.querySelector(`.${styles.navLinkActive}`);
    if (activeLink && window.innerWidth <= 768) {
      // Add a small delay to ensure the component is fully rendered
      const timeoutId = setTimeout(() => {
        const navContainer = navRef.current;
        const containerWidth = navContainer.clientWidth;
        const linkRect = activeLink.getBoundingClientRect();
        const containerRect = navContainer.getBoundingClientRect();
        
        // Calculate the position to center the active link
        const linkCenter = linkRect.left - containerRect.left + linkRect.width / 2;
        const scrollPosition = navContainer.scrollLeft + linkCenter - containerWidth / 2;
        
        // Smooth scroll to position
        navContainer.scrollTo({
          left: Math.max(0, scrollPosition),
          behavior: 'smooth'
        });
      }, 150);

      return () => clearTimeout(timeoutId);
    }
  }, [location.pathname]); // Re-run when route changes

  return (
    <div className={styles.profileContainer}>
      {/* Left Side - Profile Card */}
      <div className={styles.profileSidebar}>
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <div className={styles.profileAvatarContainer}>
              <div className={styles.profileAvatar}>
                <User size={48} />
              </div>
            </div>
            <div className={styles.profileInfo}>
              <h2 className={styles.profileName}>
                {user?.firstName} {user?.lastName}
              </h2>
              <p className={styles.profileEmail}>
                {user?.contactNumber}
              </p>
              <p className={styles.profileBarangay}>
                {user?.barangay && `Barangay ${user.barangay.charAt(0).toUpperCase() + user.barangay.slice(1)}`}
              </p>
            </div>
          </div>
          
          {/* Mobile Action Buttons Grid - Visible only on Mobile */}
          <div className={styles.mobileActionsGrid}>
            <button 
              className={styles.mobileActionButton}
              onClick={handleEditProfile}
            >
              <Edit3 size={18} />
              <span>Edit Profile</span>
            </button>
            <button 
              className={styles.mobileActionButton}
              onClick={handleChangePassword}
            >
              <Lock size={18} />
              <span>Change Password</span>
            </button>
          </div>
          
          {/* Desktop Action Buttons - Hidden on Mobile */}
          <div className={styles.profileActions}>
            <button 
              className={styles.actionButton}
              onClick={handleEditProfile}
            >
              <Edit3 size={16} />
              Edit Profile
            </button>
            <button 
              className={styles.actionButton}
              onClick={handleChangePassword}
            >
              <Lock size={16} />
              Change Password
            </button>
          </div>
        </div>

        {/* Desktop & Tablet Logout Button - Hidden only on Mobile */}
        <button 
          className={styles.logoutButton}
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
      
      {/* Right Side - Content Area with Navigation */}
      <div className={styles.profileContent}>
        <nav className={styles.profileNav} ref={navRef}>
          <NavLink 
            to="/profile/job-applications" 
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Job Applications
          </NavLink>
          <NavLink 
            to="/profile/solicitation-requests" 
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Solicitation Requests
          </NavLink>
          <NavLink 
            to="/profile/feedback-sent" 
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Feedback Sent
          </NavLink>
        </nav>

        <div className={styles.profileMain} ref={contentRef}>
          {children}
        </div>
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditProfileModal 
          onClose={() => setShowEditModal(false)} 
        />
      )}
      {showPasswordModal && (
        <ChangePasswordModal 
          onClose={() => setShowPasswordModal(false)} 
        />
      )}
    </div>
  );
};

export default ProfileLayout;