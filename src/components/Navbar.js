// Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/Navbar.css';
import {jwtDecode} from 'jwt-decode';

const Navbar = () => {


  const token = localStorage.getItem('token');
  let role = null;

  if (token) {
    const decoded = jwtDecode(token);
    role = decoded.role;
    console.log(role); // Lấy role từ decoded JWT
  }

    return (
      <nav className="navbar">
        
        <div className="dropdown">
        <Link to="/route" className="dropbtn">Quản lý tuyến đường</Link>
        <div className="dropdown-content">
            <Link to="/route">Lộ trình</Link>
        
            <Link to="/route/manager">Quản lý tuyến</Link>
          </div>
        </div>
        <div className="dropdown">
          <Link to="/location" className="dropbtn">Địa điểm</Link>
          <div className="dropdown-content">
            <Link to="/location/location-search">Thêm mới</Link>
            <Link to="/location">Quản lý</Link>
          </div>
        </div>
        {role === 'ADMIN' && (
        <>
          <div className="dropdown">
            <Link to="/config" className="dropbtn">Cấu hình</Link>
            <div className="dropdown-content">
              <Link to="/config/config-form">Thêm mới</Link>
              <Link to="/config">Quản lý</Link>
            </div>
          </div>

          <div className="dropdown">
            <Link to="/users" className="dropbtn">Tài khoản</Link>
          </div>
        </>
      )}
      </nav>
    );
  };
  
  export default Navbar;
  