// Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/Navbar.css';

const Navbar = () => {
    return (
      <nav className="navbar">
        <Link to="/">Trang chủ</Link>
        <Link to="/location-search">Tìm kiếm địa điểm</Link>
      </nav>
    );
  };
  
  export default Navbar;