import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Pagination from './Pagination'; // Import the Pagination component
import '../assets/styles/UserTable.css';

const UserTable = () => {
  const [users, setUsers] = useState([]); // Thay đổi tên state thành users
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  // Fetch dữ liệu từ API
  useEffect(() => {
    axios
      .get('http://localhost:8080/api/users') // Thay đổi URL API cho người dùng
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error('Lỗi khi gọi API:', error);
      });
  }, []);

  // Calculate the current items to display
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

  const openDeleteModal = (id) => {
    setSelectedUserId(id);
    setIsModalOpen(true);
  };

  // Đóng modal
  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  };

  // Xử lý xác nhận xóa
  const confirmDelete = () => {
    if (selectedUserId) { // Kiểm tra xem selectedUserId có hợp lệ không
        axios
          .delete(`http://localhost:8080/api/user/${selectedUserId}`) // Thay đổi URL API cho xóa người dùng
          .then(() => {
            setUsers(users.filter((user) => user.id !== selectedUserId));
            closeDeleteModal();
          })
          .catch((error) => {
            console.error('Lỗi khi xóa:', error);
          });
      } else {
        console.error('Không có ID người dùng để xóa.'); // Thêm thông báo lỗi nếu không có ID
      }
  };

  return (
    <div className="user-container">
      <h1 className="user-title">Danh sách người dùng</h1>
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Họ và Tên</th>
            <th>Số Điện Thoại</th>
            <th>Vai Trò</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.fullName}</td>
              <td>{user.phoneNumber}</td>
              <td>{user.role}</td>
              <td>
                <button className="delete-button" onClick={() => openDeleteModal(user.id)}>
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        totalItems={users.length}
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

export default UserTable;
