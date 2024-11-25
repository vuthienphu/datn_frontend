import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate,useParams } from 'react-router-dom'; // Import useNavigate
import Pagination from './Pagination'; // Import the Pagination component
import '../assets/styles/ConfigTable.css';

const ConfigTable = () => {
  const [configs, setConfigs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConfigId, setSelectedConfigId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    config_id: '',
    config_name: '',
    description: '',
    value: '',
    status: '',
  });
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate(); // Initialize useNavigate
  const { id } = useParams(); // Get the id from the URL

  // Fetch dữ liệu từ API
  useEffect(() => {
    axios
      .get('http://localhost:8080/api/config')
      .then((response) => {
        setConfigs(response.data);
      })
      .catch((error) => {
        console.error('Lỗi khi gọi API:', error);
      });
  }, []);

  // Calculate the current items to display
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentConfigs = configs.slice(indexOfFirstItem, indexOfLastItem);

  // Mở modal xác nhận xóa
  const openDeleteModal = (id) => {
    setSelectedConfigId(id);
    setIsModalOpen(true);
  };

  // Đóng modal
  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setSelectedConfigId(null);
  };

  // Xử lý xác nhận xóa
  const confirmDelete = () => {
    axios
      .delete(`http://localhost:8080/api/config/${selectedConfigId}`)
      .then(() => {
        setConfigs(configs.filter((config) => config.id !== selectedConfigId));
        closeDeleteModal();
      })
      .catch((error) => {
        console.error('Lỗi khi xóa:', error);
      });
  };

  // Xử lý toggle checkbox
  const handleStatusToggle = (id) => {
    const updatedConfigs = configs.map((config) => {
      if (config.id === id) {
        return { ...config, status: !config.status };
      }
      return config;
    });
    setConfigs(updatedConfigs);
  };

  const openEditModal = (config) => {
    setFormData({
      id: config.id,
      config_id: config.configId,
      config_name: config.configName,
      description: config.description,
      value: config.value,
      status: config.status ? '1' : '0',
    });
    setIsEditModalOpen(true);
  };

  // Đóng modal chỉnh sửa
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setMessage('');
    navigate('/config');
  };

  // Xử lý thay đổi trong form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Lưu thay đổi khi chỉnh sửa
  const handleSave = () => {
    const updatedConfig = {
      configId: formData.config_id,
      configName: formData.config_name,
      description: formData.description,
      value: formData.value,
      status: formData.status === '1',
    };

    axios
      .put(`http://localhost:8080/api/config/${formData.id}`, updatedConfig)
      .then((response) => {
        setConfigs((prevConfigs) =>
          prevConfigs.map((config) =>
            config.id === formData.id ? response.data : config
          )
        );
        setMessage('Cập nhật thành công!');
        setTimeout(() => closeEditModal(), 2000); // Đóng modal sau 2 giây
      })
      .catch((error) => {
        console.error('Lỗi khi cập nhật:', error);
        setMessage('Cập nhật thất bại. Vui lòng thử lại.');
      });
  };
// New function to handle navigation
const handleEditNavigation = (config) => {
  navigate(`/config/${config.id}`);
  openEditModal(config)
};

  return (
    <div className="config-container">
      <h1 className="config-title">Danh sách tham số cấu hình</h1>
      <table className="config-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Mã cấu hình</th>
            <th>Tên cấu hình</th>
            <th>Mô tả cấu hình</th>
            <th>Giá trị</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {currentConfigs.map((config) => (
            <tr key={config.id}>
              <td>{config.id}</td>
              <td>{config.configId}</td>
              <td>{config.configName}</td>
              <td>{config.description}</td>
              <td>{config.value}</td>
              <td>
                <input
                  type="checkbox"
                  className="status-checkbox"
                  checked={config.status}
                  onChange={() => handleStatusToggle(config.id)}
                />
              </td>
              <td className="action-buttons">
                <button className="edit-button" onClick={() => handleEditNavigation(config)}>
                  Chỉnh sửa
                </button>
                <button className="delete-button" onClick={() => openDeleteModal(config.id)}>
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        totalItems={configs.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* Modal xác nhận xóa */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc chắn muốn xóa mục này không?</p>
            <div className="modal-actions">
              <button className="cancel-button" onClick={closeDeleteModal}>
                Hủy
              </button>
              <button className="confirm-button" onClick={confirmDelete}>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="heading">Chỉnh sửa cấu hình</h2>
            {message && <p className="message">{message}</p>}
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
                <button
                  type="button"
                  onClick={handleSave}
                  className="button save-button"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="button cancel-button"
                >
                  Hủy bỏ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigTable;
