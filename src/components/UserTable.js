import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Pagination from './Pagination';
import '../assets/styles/UserTable.css';

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('USER');
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://localhost:8080/api/users')
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error('Lỗi khi gọi API:', error);
      });
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

  const openDeleteModal = (id) => {
    setSelectedUserId(id);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  };

  const confirmDelete = () => {
    if (selectedUserId) {
      axios
        .delete(`http://localhost:8080/api/user/${selectedUserId}`)
        .then(() => {
          setUsers(users.filter((user) => user.id !== selectedUserId));
          closeDeleteModal();
        })
        .catch((error) => {
          console.error('Lỗi khi xóa:', error);
        });
    } else {
      console.error('Không có ID người dùng để xóa.');
    }
  };

  const openRoleModal = (id) => {
    setSelectedUserId(id);
    setIsRoleModalOpen(true);
  };

  const closeRoleModal = () => {
    setIsRoleModalOpen(false);
    setSelectedUserId(null);
    setSelectedRole('USER');
  };

  const confirmRoleChange = () => {
    console.log('Selected Role:', selectedRole);
    if (selectedUserId) {
        axios
            .put(`http://localhost:8080/api/user/${selectedUserId}`, { role: selectedRole })
            .then(() => {
                // Cập nhật danh sách người dùng để phản ánh quyền mới
                setUsers(users.map(user => 
                    user.id === selectedUserId ? { ...user, role: selectedRole } : user
                ));
                closeRoleModal(); // Đóng modal
            })
            .catch((error) => {
                console.error('Lỗi khi thay đổi quyền:', error);
            });
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
                <button className="role-button" onClick={() => openRoleModal(user.id)}>
                  Thay đổi quyền
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

      {isRoleModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Thay đổi quyền</h3>
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <div className="modal-actions">
              <button className="cancel-button" onClick={closeRoleModal}>
                Hủy
              </button>
              <button className="confirm-button" onClick={confirmRoleChange}>
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
