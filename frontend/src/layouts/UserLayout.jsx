import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/header/Header';
import Footer from '../components/common/footer/Footer';

const UserLayout = () => {
  return (
    <div className="user-layout">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;