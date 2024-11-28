// src/components/LocationTable.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Pagination from './Pagination';
import '../assets/styles/LocationTable.css';

const LocationTable = () => {
    const [locations, setLocations] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLocationId, setSelectedLocationId] = useState(null);
    const navigate = useNavigate();
    const itemsPerPage = 10;

    useEffect(() => {
      fetch('http://localhost:8080/api/locations')
        .then(response => response.json())
        .then(data => setLocations(data))
        .catch(error => console.error('Error fetching data:', error));
    }, []);
  
    // Mở modal xác nhận xóa
  const openDeleteModal = (id) => {
    setSelectedLocationId(id);
    setIsModalOpen(true);
  };

  // Đóng modal
  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setSelectedLocationId(null);
  };

  // Xử lý xác nhận xóa
  const confirmDelete = () => {
    axios
      .delete(`http://localhost:8080/api/locations/${selectedLocationId}`)
      .then(() => {
        setLocations(locations.filter((location) => location.id !== selectedLocationId));
        closeDeleteModal();
      })
      .catch((error) => {
        console.error('Lỗi khi xóa:', error);
      });
  };

  
    const handleEdit = (location) => {
        navigate(`/location/${location.id}`);  // Set the selected location
    };
  
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLocations = locations.slice(indexOfFirstItem, indexOfLastItem);
  
    return (
        <div className="location-container">
            <h1 className="location-title">Danh sách địa điểm</h1>
            <table className="location-table">
                <thead>
                    <tr>
                        <th>Mã Điểm</th>
                        <th>Tên Điểm</th>
                        <th>Địa Điểm</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {currentLocations.map(location => (
                        <tr key={location.id}>
                            <td>{location.pointCode}</td>
                            <td>{location.pointName}</td>
                            <td>{location.address}</td>
                            <td className="action-buttons">
                                <button className="edit-button" onClick={() => handleEdit(location)}>Chỉnh sửa</button>
                                <button className="delete-button" onClick={() => openDeleteModal(location.id)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination
                totalItems={locations.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />
            
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
        </div>
    );
};

export default LocationTable;

