import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/Login.css';
import {jwtDecode} from 'jwt-decode';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ message: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!formData.email) {
      tempErrors.email = 'Vui lòng nhập email';
    }
    if (!formData.password) {
      tempErrors.password = 'Vui lòng nhập mật khẩu';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await fetch('http://localhost:8080/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('token', data.token);
          //localStorage.setItem('role', data.role); 
          // Giả sử dữ liệu có chứa thông tin role
          console.log(data.token);
         
        
          setNotification({
            message: 'Đăng nhập thành công!',
            type: 'success'
          });
          // Chuyển hướng đến trang chính hoặc dashboard
          window.location.href = '/route'; // Thay đổi đường dẫn theo yêu cầu của bạn
        } else {
          setNotification({
            message: data.message || 'Đăng nhập thất bại. Vui lòng thử lại.',
            type: 'error'
          });
        }
      } catch (error) {
        console.error('Error:', error);
        setNotification({
          message: 'Có lỗi xảy ra. Vui lòng thử lại sau.',
          type: 'error'
        });
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Đăng Nhập</h2>
        {notification.message && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Mật khẩu:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
             
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          <button type="submit" className="login-button">Đăng Nhập</button>
          
          <div className="register-link">
            Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

