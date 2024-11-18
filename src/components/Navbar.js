// Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/Navbar.css';

const Navbar = () => {
    return (
      <nav className="navbar">
        <Link to="/">Trang chủ</Link>
        <Link to="/location-search">Tìm kiếm địa điểm</Link>
        <div className="dropdown">
          <Link to="/config" className="dropbtn">Cấu hình</Link>
          <div className="dropdown-content">
            <Link to="/config/config-form">Thêm mới</Link>
            <Link to="/config/manage">Quản lý</Link>
          </div>
        </div>
      </nav>
    );
  };
  
  export default Navbar;
  