import React, { useState } from 'react';
import axios from 'axios'; // Import axios
import '../assets/styles/Configform.css';

const ConfigForm = () => {
  const [formData, setFormData] = useState({
    config_id: '',
    config_name: '',
    description: '',
    value: '',
    status: '',
  });

  const [message, setMessage] = useState(''); // Thông báo sau khi thêm mới

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAdd = async () => {
    // Kiểm tra dữ liệu hợp lệ trước khi gửi
    if (!formData.config_id || !formData.config_name || formData.value === '' || formData.status === '') {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    try {
      // Gửi dữ liệu đến API bằng axios
      const response = await axios.post('http://localhost:8080/api/config', {
        configId: formData.config_id,
        configName: formData.config_name,
        description: formData.description,
        value: parseFloat(formData.value), // Chuyển giá trị sang số
        status: formData.status === '1', // Chuyển giá trị trạng thái thành boolean
      });

      if (response.status === 201 || response.status === 200) {
        setMessage('Đã thêm mới thành công!');
      } else {
        setMessage('Có lỗi xảy ra khi thêm mới!');
      }

      // Reset form sau khi thêm thành công
      setFormData({
        config_id: '',
        config_name: '',
        description: '',
        value: '',
        status: '',
      });
    } catch (error) {
      console.error('Lỗi khi gửi request:', error);
      setMessage('Có lỗi xảy ra khi thêm mới!');
    }
  };

  const handleCancel = () => {
    // Reset form về giá trị ban đầu
    setFormData({
      config_id: '',
      config_name: '',
      description: '',
      value: '',
      status: '',
    });
    setMessage(''); // Xóa thông báo
  };

  return (
    <div className="container">
      <h2 className="heading">Thêm cấu hình mới</h2>
      {message && <p className="message">{message}</p>} {/* Hiển thị thông báo */}
      <form className="form">
        <div className="formGroup">
          <label className="label">Mã cấu hình:</label>
          <input
            type="text"
            name="config_id"
            value={formData.config_id}
            onChange={handleInputChange}
            className="input"
          />
        </div>
        <div className="formGroup">
          <label className="label">Tên cấu hình:</label>
          <input
            type="text"
            name="config_name"
            value={formData.config_name}
            onChange={handleInputChange}
            className="input"
          />
        </div>
        <div className="formGroup">
          <label className="label">Mô tả:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="textarea"
          ></textarea>
        </div>
        <div className="formGroup">
          <label className="label">Giá trị:</label>
          <input
            type="number"
            name="value"
            value={formData.value}
            onChange={handleInputChange}
            className="input"
          />
        </div>
        <div className="formGroup">
          <label className="label">Trạng thái:</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="select"
          >
            <option value="">-- Chọn trạng thái --</option>
            <option value="1">Kích hoạt</option>
            <option value="0">Không kích hoạt</option>
          </select>
        </div>
        <div className="buttonGroup">
          <button type="button" onClick={handleAdd} className="button">
            Thêm mới
          </button>
          <button type="button" onClick={handleCancel} className="button">
            Hủy bỏ
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfigForm;
