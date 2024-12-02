import React, { useEffect, useState,useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
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
  const handleViewRoute = () => {
    if (selectRouteCode) {
      navigate(`/route/manager/${selectRouteCode}`); // Sử dụng navigate để chuyển hướng
    } else {
      console.log('Vui lòng chọn mã tuyến trước khi xem.');
    }
  };

  function handleDeleteButtonClick(routeCode) {
    deleteRoute(routeCode);
  }
  function deleteRoute(routeCode) {
    const url = `http://localhost:8080/api/route/${routeCode}`;
    
    fetch(url, {
        method: 'DELETE',
    })
    .then(response => {
        if (response.ok) {
            console.log('Route deleted successfully');
            // Cập nhật giao diện người dùng nếu cần
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
        onChange={(selectedOption) => setSelectRouteCode(selectedOption.value)}
      />
      <button onClick={handleViewRoute} className="view-route-button">
        Xem tuyến đường
      </button>
      <button onClick={() => handleDeleteButtonClick(selectRouteCode)}>
        Xóa Tuyến Đường
      </button>
    </>
  );
};

export default RouteManager;
