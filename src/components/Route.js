import React, { useEffect, useState,useRef} from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { defaultCustomMarkerIcon,startIcon } from './MapUtils';
import 'leaflet/dist/leaflet.css';
import { FaTimes } from 'react-icons/fa';
import '../assets/styles/Route.css';
import Select from 'react-select';
import L from 'leaflet';  
import 'leaflet-arrowheads'; 

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
  const [optimizedRoute, setOptimizedRoute] = useState([]); // Đường tối ưu
  const polylineRef = useRef(null); 
  // Fetch danh sách locations từ API
  useEffect(() => {
    fetchLocations();
  }, []);

 

  useEffect(() => {
    if (polylineRef.current) {
      polylineRef.current.arrowheads({
        size: '20px', // Độ lớn của mũi tên
        frequency: '200px', // Tần suất xuất hiện mũi tên
        fill: true,
      });
    }
  }, [optimizedRoute, locations]); // Kích hoạt lại khi tuyến đường hoặc vị trí 



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
        point.id === id ? { ...point, name: location.pointName, location: location.address } : point
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
        const location = locations.find(loc => loc.pointName === point.name);
        return location ? location.pointCode : null;
      })
      .filter(coord => coord !== null);

    if (coordinates.length < 2) {
      alert('Vui lòng chọn ít nhất 2 điểm để tìm đường');
      return;
    }

    const distancematrixCoordinates = points
      .map(point => {
        const location = locations.find(loc => loc.pointName === point.name);
        return location ? location.pointCode : null;
      })
      .filter(coord => coord !== null);

    if (distancematrixCoordinates.length < 2) {
      alert('Vui lòng chọn ít nhất 2 điểm để tính khoảng cách');
      return;
    }

    const optimizeRouteCoordinates = points
      .map(point => {
        const location = locations.find(loc => loc.pointName === point.name);
        return location ? location.pointCode : null;
      })
      .filter(coord => coord !== null);

    if (optimizeRouteCoordinates.length < 2) {
      alert('Vui lòng chọn ít nhất 2 điểm để tìm đường tối ưu');
      return;
    }

    try {
      // Gửi cả ba yêu cầu đồng thời
      const [routeResponse, distanceResponse, optimizeRouteResponse] = await Promise.all([
        fetch('http://localhost:8080/api/route', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ routeCode, coordinates }),
        }),
        fetch('http://localhost:8080/api/distance-matrix', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ routeCode, distancematrixCoordinates }),
        }),
        fetch('http://localhost:8080/api/route/optimize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ routeCode, optimizeRouteCoordinates }),
        }),
      ]);

      // Kiểm tra phản hồi từ yêu cầu tìm đường
      if (!routeResponse.ok) {
        throw new Error('Không thể tìm được đường đi');
      }
      const routeResult = await routeResponse.json();
      console.log('Kết quả tìm đường:', routeResult);

      // Kiểm tra phản hồi từ yêu cầu tính khoảng cách
      if (!distanceResponse.ok) {
        throw new Error('Không thể tính toán khoảng cách');
      }
      const distanceResult = await distanceResponse.json();
      console.log('Kết quả khoảng cách:', distanceResult);

      // Kiểm tra phản hồi từ yêu cầu tìm đường đi tối ưu
      if (!optimizeRouteResponse.ok) {
        throw new Error('Không thể tìm đường đi tối ưu');
      }
      const optimizeRouteResult = await optimizeRouteResponse.json();
      console.log('Kết quả tìm đường tối ưu:', optimizeRouteResult);

      if (optimizeRouteResult && optimizeRouteResult.length > 0) {
        setOptimizedRoute(optimizeRouteResult);
      } else {
        console.error('Dữ liệu tối ưu không hợp lệ hoặc rỗng:', optimizeRouteResult);
      }

      console.log('optimizedRoute:', optimizedRoute);
  console.log('locations:', locations);
  console.log(
    'Coordinates:',
    getCoordinatesFromOptimizedRoute(optimizedRoute, locations)
  );
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu:', error);
      alert('Có lỗi xảy ra khi gửi yêu cầu');
    }
  };

  
  const getCoordinatesFromOptimizedRoute = (route, allLocations) => {
    return route
      .map((pointCode) => {
        const location = allLocations.find((loc) => loc.pointCode === pointCode);
        return location ? [location.latitude, location.longitude] : null;
      })
      .filter((pos) => pos !== null); // Lọc bỏ các điểm không hợp lệ
  };
  return (
    <>
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
                    value={locations.find(loc => loc.pointName === point.name) ? { value: locations.find(loc => loc.pointName === point.name).id, label: point.name } : null}
                    onChange={(selectedOption) => handlePointNameChange(point.id, selectedOption)}
                    options={locations.map(location => ({ value: location.id, label: location.pointName }))}
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
         
        </div>
      </div>
      <div className="map-container">
      <MapContainer center={[21.0285, 105.8542]} zoom={13} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

{optimizedRoute.length > 0 && locations.length > 0 && (
  <>
    {/* Hiển thị điểm xuất phát */}
    {(() => {
      const startLocation = locations.find(
        (loc) => loc.pointCode === optimizedRoute[0] // Điểm đầu tiên của tuyến tối ưu
      );
      if (startLocation) {
        return (
          <Marker
            position={[startLocation.latitude, startLocation.longitude]}
            icon={startIcon} // Biểu tượng màu đỏ cho điểm xuất phát
          >
            <Popup>
              <strong>Điểm xuất phát:</strong> {startLocation.pointName} <br />
              <strong>Địa chỉ:</strong> {startLocation.address}
            </Popup>
          </Marker>
        );
      }
      return null;
    })()}

    {/* Hiển thị các điểm còn lại */}
    {optimizedRoute.slice(1).map((pointCode, index) => {
      const location = locations.find((loc) => loc.pointCode === pointCode);
      if (location) {
        return (
          <Marker
            key={index}
            position={[location.latitude, location.longitude]}
            icon={defaultCustomMarkerIcon} // Biểu tượng mặc định cho các điểm khác
          >
            <Popup>
              <strong>Tên điểm:</strong> {location.pointName} <br />
              <strong>Địa chỉ:</strong> {location.address}
            </Popup>
          </Marker>
        );
      }
      return null;
    })}
  </>
)}



        {/* Vẽ tuyến đường tối ưu */}
        {getCoordinatesFromOptimizedRoute(optimizedRoute, locations).length > 1 && (
          <Polyline
          ref={polylineRef} // Thêm ref để truy cập Polyline
          positions={getCoordinatesFromOptimizedRoute(optimizedRoute, locations)}
          color="blue"
          />
        )}

       
      </MapContainer>
   
</div>
    </>
  );
};

export default Route;
