import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from '@components/common/header/Header';
import Home from '@pages/Home/Home';
import Announcements from '@pages/Announcements/Announcements';
import Services from '@pages/Services/Services';
import Accomplishments from '@pages/Accomplishments/Accomplishments';
import LocalPolicies from '@pages/LocalPolicies/LocalPolicies';
import CitizenGuide from '@pages/CitizenGuide/CitizenGuide';
import AboutUs from '@pages/AboutUs/AboutUs';
import Login from '@pages/Auth/Login';
import Register from '@pages/Auth/Register';
import '@styles/globals.css';
import '@styles/components.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/services" element={<Services />} />
            <Route path="/accomplishments" element={<Accomplishments />} />
            <Route path="/policies" element={<LocalPolicies />} />
            <Route path="/guide" element={<CitizenGuide />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;