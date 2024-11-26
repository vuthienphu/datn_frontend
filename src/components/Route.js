import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import {defaultCustomMarkerIcon} from './MapUtils';
import 'leaflet/dist/leaflet.css';
import { FaTimes } from 'react-icons/fa';
import '../assets/styles/Route.css';
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

const Route = () => {
  const [points, setPoints] = useState([]); // Điểm đã chọn
  const [locations, setLocations] = useState([]); // Danh sách tất cả các địa điểm từ API
  const [routeCode, setRouteCode] = useState(''); // Mã tuyến
  // Fetch danh sách locations từ API
  useEffect(() => {
    fetchLocations();
  }, []);

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

  // Xử lý thêm điểm mới
  const handleAddPoint = () => {
    setPoints([...points, { id: Date.now(), name: '', location: '' }]);
  };

  // Xử lý thay đổi tên điểm
  const handlePointNameChange = (id, selectedOption) => {
    const location = locations.find(loc => loc.id === selectedOption.value);
    if (location) {
      setPoints(points.map(point => 
        point.id === id ? { ...point, name: location.point_name, location: location.address } : point
      ));
    }
  };

  // Xử lý xóa một điểm
  const handleDeletePoint = (id) => {
    setPoints(points.filter(point => point.id !== id));
  };

  // Xử lý xóa tất cả các điểm
  const handleDeleteAll = () => {
    setPoints([]);
  };

  // Xử lý tìm đường
  const handleFindRoute = async () => {
    const coordinates = points
      .map(point => {
        const location = locations.find(loc => loc.point_name === point.name);
        return location ? [location.longitude, location.latitude] : null;
      })
      .filter(coord => coord !== null);

    if (coordinates.length < 2) {
      alert('Vui lòng chọn ít nhất 2 điểm để tìm đường');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/distance-matrix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coordinates }),
      });

      if (!response.ok) {
        throw new Error('Không thể tìm được đường đi');
      }

      const result = await response.json();
      console.log('Kết quả tìm đường:', result);
    } catch (error) {
      console.error('Lỗi khi tìm đường:', error);
      alert('Có lỗi xảy ra khi tìm đường');
    }
  };
  const handleSaveRoute = () => {
    if (!routeCode) {
      alert('Vui lòng nhập mã tuyến');
      return;
    }
    // Logic để lưu tuyến đi
    console.log('Lưu tuyến đi với mã:', routeCode, 'và các điểm:', points);
  };

  return (
    <div className="route-container">
      <div className="route-code-input">
        <label htmlFor="routeCode">Mã tuyến:</label>
        <input
          type="text"
          id="routeCode"
          value={routeCode}
          onChange={(e) => setRouteCode(e.target.value)}
          placeholder="Nhập mã tuyến"
        />
      </div>

      <table className="points-table">
        <thead>
          <tr>
            <th>Tên điểm</th>
            <th>Địa điểm</th>
            <th>Xóa</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.id}>
              <td>
                <Select
                  value={locations.find(loc => loc.point_name === point.name) ? { value: locations.find(loc => loc.point_name === point.name).id, label: point.name } : null}
                  onChange={(selectedOption) => handlePointNameChange(point.id, selectedOption)}
                  options={locations.map(location => ({ value: location.id, label: location.point_name }))}
                  className="location-select"
                  placeholder="Chọn điểm"
                  styles={customStyles}
                />
              </td>
              <td>{point.location}</td>
              <td>
                <button 
                  onClick={() => handleDeletePoint(point.id)}
                  className="delete-btn"
                >
                  <FaTimes />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="button-group">
        <button onClick={handleAddPoint}>Thêm điểm</button>
        <button onClick={handleDeleteAll}>Xóa tất cả</button>
        <button onClick={handleFindRoute} disabled={points.length < 2}>
          Tìm đường
        </button>
        <button onClick={handleSaveRoute}>Lưu tuyến đi</button>
      </div>
    </div>
  );
};

export default Route;

