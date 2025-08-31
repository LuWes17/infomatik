// frontend/src/pages/Profile/Profile.jsx
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProfileLayout from '../../layouts/ProfileLayout';
import JobApplications from './pages/JobApplications';
import SolicitationRequests from './pages/SolicitationRequests';
import FeedbackSent from './pages/FeedbackSent';
import './Profile.module.css';

const Profile = () => {
  return (
    <ProfileLayout>
      <Routes>
        <Route index element={<Navigate to="job-applications" replace />} />
        <Route path="job-applications" element={<JobApplications />} />
        <Route path="solicitation-requests" element={<SolicitationRequests />} />
        <Route path="feedback-sent" element={<FeedbackSent />} />
      </Routes>
    </ProfileLayout>
  );
};

export default Profile;