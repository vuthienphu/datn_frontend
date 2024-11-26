// Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/Navbar.css';

const Navbar = () => {
    return (
      <nav className="navbar">
        
        <div className="dropdown">
        <Link to="/" className="dropbtn">Quản lý tuyến đường</Link>
        <div className="dropdown-content">
            <Link to="/">Lộ trình</Link>
            <Link to="/route">Tạo tuyến</Link>
            <Link to="/route/manage">Quản lý tuyến</Link>
          </div>
        </div>
        <div className="dropdown">
          <Link to="/location" className="dropbtn">Địa điểm</Link>
          <div className="dropdown-content">
            <Link to="/location/location-search">Thêm mới</Link>
            <Link to="/location">Quản lý</Link>
          </div>
        </div>
        <div className="dropdown">
          <Link to="/config" className="dropbtn">Cấu hình</Link>
          <div className="dropdown-content">
            <Link to="/config/config-form">Thêm mới</Link>
            <Link to="/config">Quản lý</Link>
          </div>
        </div>
      </nav>
    );
  };
  
  export default Navbar;
  