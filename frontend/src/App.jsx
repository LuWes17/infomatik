// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Components
import Header from '@components/common/header/Header';
import Footer from '@components/common/footer/Footer';

// Route Protection Components
import ProtectedRoute from '@components/auth/ProtectedRoute';
import PublicRoute from '@components/auth/PublicRoute';
import AdminRoute from '@components/auth/AdminRoute';

// Pages
import Home from '@pages/Home/Home';
import Announcements from '@pages/Announcements/Announcements';
import Services from '@pages/Services/Services';
import Accomplishments from '@pages/Accomplishments/Accomplishments';
import LocalPolicies from '@pages/LocalPolicies/LocalPolicies';
import CitizenGuide from '@pages/CitizenGuide/CitizenGuide';
import AboutUs from '@pages/AboutUs/AboutUs';

// Auth Pages
import Login from '@pages/Auth/Login';
import Register from '@pages/Auth/Register';

// Protected/Dashboard Pages (create these as needed)
import Dashboard from '@pages/Dashboard/Dashboard';


// Error Pages
import Unauthorized from '@pages/Error/Unauthorized';
import NotFound from '@pages/Error/NotFound';

// Styles
import '@styles/globals.css';
import '@styles/components.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main>
            <Routes>
              {/* Public Routes - accessible to everyone */}
              <Route path="/" element={<Home />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/services" element={<Services />} />
              <Route path="/accomplishments" element={<Accomplishments />} />
              <Route path="/policies" element={<LocalPolicies />} />
              <Route path="/guide" element={<CitizenGuide />} />
              <Route path="/about" element={<AboutUs />} />

              {/* Public-Only Routes - only accessible when not authenticated */}
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

              {/* Protected Routes - require authentication */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-applications" 
                element={
                  <ProtectedRoute>
                    
                  </ProtectedRoute>
                } 
              />

              {/* Admin-Only Routes */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <AdminRoute>
                    
                  </AdminRoute>
                } 
              />

              {/* Error Routes */}
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;