import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

// Route Protection Components
import ProtectedRoute from '@components/auth/ProtectedRoute';
import PublicRoute from '@components/auth/PublicRoute';
import AdminRoute from '@components/auth/AdminRoute';

// User Pages
import Home from '@pages/Home/Home';
import Announcements from '@pages/Announcements/Announcements';
import Accomplishments from '@pages/Accomplishments/Accomplishments';
import CitizenGuide from '@pages/CitizenGuide/CitizenGuide';

// Services Pages
import JobOpenings from '@pages/Services/JobOpenings';
import SolicitationRequest from './pages/Services/SolicitationRequest';
import RiceDistribution from './pages/Services/RiceDistribution';

// Local Policies Pages
import Ordinance from './pages/LocalPolicies/Ordinance';
import Resolution from './pages/LocalPolicies/Resolution';

// About Us Pages
import Leadership from './pages/AboutUs/Leadership';
import Feedback from './pages/AboutUs/Feedback';

// Auth Pages
import Login from '@pages/Auth/Login';
import Register from '@pages/Auth/Register';

// Protected/Dashboard Pages
import Profile from '@pages/Profile/Profile';

// Admin Pages
import AdminDashboard from '@pages/Admin/AdminDashboard';
import AdminAnnouncements from '@pages/Admin/AdminAnnouncements';
import AdminAccomplishments from '@pages/Admin/AdminAccomplishments';
import AdminJobOpenings from '@pages/Admin/AdminJobOpenings';
import AdminSolicitationRequests from '@pages/Admin/AdminSolicitationRequests';
import AdminRiceDistribution from '@pages/Admin/AdminRiceDistribution';
import AdminLocalPolicies from '@pages/Admin/AdminLocalPolicies';
import AdminFeedback from '@pages/Admin/AdminFeedback';

// Error Pages
import Unauthorized from '@pages/Error/Unauthorized';
import NotFound from '@pages/Error/NotFound';

// Styles
import '@styles/globals.css';
import '@styles/components.css';

// Admin Redirect Component
const AdminRedirect = () => {
  const { user } = useAuth();
  
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  return <Navigate to="/profile" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes with User Layout */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/services/job-openings" element={<JobOpenings />} />
            <Route path="/services/solicitation-requests" element={<SolicitationRequest />} />
            <Route path="/services/monthly-rice-distribution" element={<RiceDistribution />} />
            <Route path="/accomplishments" element={<Accomplishments />} />
            <Route path="/policies/ordinance" element={<Ordinance />} />
            <Route path="/policies/resolution" element={<Resolution />} />
            <Route path="/guide" element={<CitizenGuide />} />
            <Route path="/about/leadership" element={<Leadership />} />
            <Route path="/about/feedback" element={<Feedback />} />

            {/* Auth Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />

            {/* Protected User Routes */}
            <Route 
              path="/profile/*" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />

            {/* Error Routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin Routes with Admin Layout */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="accomplishments" element={<AdminAccomplishments />} />
            <Route path="job-openings" element={<AdminJobOpenings />} />
            <Route path="solicitation-requests" element={<AdminSolicitationRequests />} />
            <Route path="rice-distribution" element={<AdminRiceDistribution />} />
            <Route path="local-policies" element={<AdminLocalPolicies />} />
            <Route path="feedback" element={<AdminFeedback />} />
          </Route>

          {/* Redirect authenticated users to appropriate dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <AdminRedirect />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;