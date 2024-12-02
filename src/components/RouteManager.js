import React, { useEffect, useState,useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import '../assets/styles/RouteManager.css';
const customStyles = {
  menu: (provided) => ({
    ...provided,
    maxHeight: 100, // Giới hạn chiều cao của menu
    overflowY: 'auto', // Thêm thanh cuộn dọc
  }),
  option: (provided) => ({
    ...provided,
    whiteSpace: 'nowrap', // Ngăn chặn xuống dòng
  }),
  control: (provided) => ({
    ...provided,
    minWidth: 200, // Đảm bảo đủ rộng để hiển thị tên
  }),
};

const RouteManager = () => {
  const [locations, setLocations] = useState([]); // Danh sách tất cả các địa điểm từ API
  const [selectRouteCode, setSelectRouteCode] = useState(null); // Mã tuyến
  const [routeCodes, setRouteCodes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState(''); // Thêm state cho thông báo xóa
  const navigate = useNavigate(); // Thêm state để lưu trữ mã tuyến

  const polylineRef = useRef(null); 
  // Fetch danh sách locations và route codes từ API
  useEffect(() => {
    fetchLocations();
    fetchRouteCodes(); // Gọi hàm fetchRouteCodes
  }, []);

  // Thêm hàm fetchRouteCodes
  const fetchRouteCodes = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/route/route-code');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setRouteCodes(data); // Lưu trữ mã tuyến vào state
    } catch (error) {
      console.error('Error fetching route codes:', error);
    }
  };

 
  const fetchLocations = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/locations');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  // Mở modal xác nhận xóa
  const openDeleteModal = (selectRouteCode) => {
    setSelectRouteCode(selectRouteCode);
    setIsModalOpen(true);
  };

  // Đóng modal
  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setSelectRouteCode(null);
  };

  const handleViewRoute = () => {
    if (selectRouteCode) {
      navigate(`/route/manager/${selectRouteCode}`); // Sử dụng navigate để chuyển hướng
    } else {
      console.log('Vui lòng chọn mã tuyến trước khi xem.');
    }
  };

  function handleDeleteButtonClick() {
    if (selectRouteCode) {
      openDeleteModal(selectRouteCode); // Mở modal với mã tuyến đã chọn
    } else {
      console.log('Vui lòng chọn mã tuyến trước khi xóa.'); // Thông báo nếu không có mã tuyến được chọn
    }
    
  }
  function deleteRoute(routeCode) {
    const url = `http://localhost:8080/api/route/${routeCode}`;
    closeDeleteModal();
    fetch(url, {
        method: 'DELETE',
    })
    .then(response => {
        if (response.ok) {
            console.log('Route deleted successfully');
            // Thông báo xóa thành công
           
            
            // Cập nhật danh sách routeCodes để loại bỏ mã tuyến đã xóa
            setRouteCodes(prevRouteCodes => prevRouteCodes.filter(code => code !== routeCode));

            // Đặt lại selectRouteCode để không còn hiển thị mã tuyến đã xóa
            setSelectRouteCode(null);

            setDeleteSuccessMessage('Xóa tuyến đường thành công!');
          setTimeout(() => setDeleteSuccessMessage(''), 3000); // Ẩn thông báo sau 3 giây
        } else {
            console.error('Error deleting route:', response.statusText);
        }
    })
    .catch(error => {
        console.error('Network error:', error);
    });
}
  return (
    <>
      <Select
        options={routeCodes.map(code => ({ value: code, label: code }))} // Chuyển đổi mã tuyến thành định dạng cho Select
        placeholder="Chọn mã tuyến"
        className="route-code-select"
        styles={customStyles}
        value={selectRouteCode ? { value: selectRouteCode, label: selectRouteCode } : null} // Hiển thị giá trị đã chọn
        onChange={(selectedOption) => setSelectRouteCode(selectedOption ? selectedOption.value : null)}
      />
      <button onClick={handleViewRoute} className="view-route-button">
        Xem tuyến đường
      </button>
      <button onClick={handleDeleteButtonClick}>
        Xóa Tuyến Đường
      </button>
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
              <button className="confirm-button" onClick={() => deleteRoute(selectRouteCode)}>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
        
      )}
      {/* Hiển thị thông báo xóa thành công */}
      {deleteSuccessMessage && (
        <div className="success-message">
          {deleteSuccessMessage}
        </div>
      )}
    </>
  );
};

export default RouteManager;
