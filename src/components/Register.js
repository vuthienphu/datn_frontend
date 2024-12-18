import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
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
    if (!formData.fullName) tempErrors.fullName = 'Vui lòng nhập họ và tên';
    if (!formData.email) {
      tempErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Email không hợp lệ';
    }
    if (!formData.password) {
      tempErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Mật khẩu không khớp';
    }
    if (!formData.phone) {
      tempErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      tempErrors.phone = 'Số điện thoại không hợp lệ';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await fetch('http://localhost:8080/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            phoneNumber: formData.phone
          })
        });

        if (response.ok) {
          setNotification({
            message: 'Đăng ký thành công!',
            type: 'success'
          });
          // Chuyển hướng sau 3 giây
          setTimeout(() => {
            window.location.href = '/login';
          }, 3000);
        } 
        else if (response.status === 409) { // Email đã tồn tại
            const errorData = await response.json();
            setNotification({
              message: errorData.message || 'Email đã tồn tại.',
              type: 'error'
            });
          } 
        else {
          const errorData = await response.json();
          setNotification({
            message: errorData.message || 'Đăng ký thất bại. Vui lòng thử lại.',
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
    <div className="register-container">
      <div className="register-form">
        <h2>Đăng Ký</h2>
        {notification.message && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ và tên:</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
             
            />
            {errors.fullName && <span className="error">{errors.fullName}</span>}
          </div>

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

          <div className="form-group">
            <label>Nhập lại mật khẩu:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
          </div>

          <div className="form-group">
            <label>Số điện thoại:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>

          <button type="submit" className="register-button">Đăng Ký</button>
          
          <div className="login-link">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;