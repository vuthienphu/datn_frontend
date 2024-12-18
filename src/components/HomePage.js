import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <img 
          src="/logo.png" // Thay đường dẫn này bằng logo/hình ảnh của bạn
          alt="Logo Hệ thống"
          className="home-logo"
        />
        <h1>Hệ Thống Quản Lý Tuyến Đường</h1>
        <div className="auth-buttons">
          <Link to="/login" className="auth-button login">
            Đăng nhập
          </Link>
          <Link to="/register" className="auth-button register">
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;