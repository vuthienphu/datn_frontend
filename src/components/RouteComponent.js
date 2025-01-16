import React, { useEffect, useState,useRef} from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { defaultCustomMarkerIcon,startIcon } from './MapUtils';

import 'leaflet/dist/leaflet.css';
import { FaTimes } from 'react-icons/fa';
import '../assets/styles/Route.css';
import Select from 'react-select';
import L from 'leaflet';  
import 'leaflet-arrowheads';
import 'leaflet-arrowheads';


const customStyles = {
  menu: (provided) => ({
    ...provided,
    maxHeight: 144,
  }),
  menuList: (provided) => ({
    ...provided,
    maxHeight: 144,
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: '12px',  // Độ rộng của thanh cuộn
    },
    '&::-webkit-scrollbar-track': {
      background: '#f1f1f1',  // Màu nền của track
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#888',  // Màu của thanh cuộn
      borderRadius: '3px', // Bo tròn góc thanh cuộn
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: '#555',  // Màu khi hover
    },
  }),
  option: (provided) => ({
    ...provided,
    whiteSpace: 'nowrap',
  }),
  control: (provided) => ({
    ...provided,
    minWidth: 200,
  }),
  container: (provided) => ({
    ...provided,
    width: '100%',
  }),
};


const RouteComponent = () => {
  const [points, setPoints] = useState([]); // Điểm đã chọn
  const [locations, setLocations] = useState([]); // Danh sách tất cả các địa điểm từ API
  const [routeCode, setRouteCode] = useState(''); // Mã tuyến
  const [optimizedRoute, setOptimizedRoute] = useState([]); // Đường tối ưu
  const [actualRouteCoordinates, setActualRouteCoordinates] = useState([]); // Tọa độ tuyến đường thực tế
  const polylineRef = useRef(null); 
  const [polylineInstance, setPolylineInstance] = useState(null);
  const mapRef = useRef(null);
  const [vehicleNumber, setVehicleNumber] = useState(''); // New state for vehicle number
  const [vehicleNumberError, setVehicleNumberError] = useState(''); // New state for error message
  
 
  const routeColors = [
    "blue", "green", "red", "purple", "orange", "brown", "pink", "cyan", "yellow"
  ];
  // Nếu số lượng xe lớn hơn số màu có sẵn, tự động lặp lại màu sắc
  const getColorForRoute = (index) => routeColors[index % routeColors.length];


  // Fetch danh sách locations từ API
  useEffect(() => {
    fetchLocations();
  }, []);

  
  useEffect(() => {

    if (!polylineRef.current || actualRouteCoordinates.length < 2) return; 
    if (actualRouteCoordinates.length > 0) {
      const map = polylineRef.current._map;
      if (!map) return;
  
      actualRouteCoordinates.forEach((routeCoords, index) => {
       const polyline = L.polyline(routeCoords, {
          color: getColorForRoute(index),
          weight: 3,
        }).addTo(map);
  
        // Thêm mũi tên vào polyline
        polyline.arrowheads({
          size: '10px',
          frequency: '100px',
          fill: true,
          color: getColorForRoute(index), // Sử dụng màu của tuyến
        });
      });
  
     
    }
  }, [actualRouteCoordinates]);

 

useEffect(() => {
  return () => {
    if (polylineInstance && polylineInstance.arrowheads) {
      polylineInstance.arrowheads().remove(); // Xóa mũi tên
    }
    if (polylineRef.current && polylineRef.current._map) {
      polylineRef.current._map.removeLayer(polylineInstance); // Xóa Polyline
    }
  };
}, [polylineInstance] );
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
          body: JSON.stringify({ routeCode, optimizeRouteCoordinates,vehicleNumber }),
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
      setOptimizedRoute(optimizeRouteResult);
      console.log('Optimized Route:', optimizeRouteResult);
      //const coordinates = getCoordinatesFromOptimizedRoute(optimizeRouteResult, locations);
      // Lấy tuyến đường thực tế
      await getActualRoutesBetweenPoints(optimizeRouteResult);

      const newRequestResponse = await fetch('http://localhost:8080/api/vehiclenumber', { // Replace with your actual endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ routeCode,vehicleNumber }), // Replace with your actual data
      });
  
      // Kiểm tra phản hồi từ yêu cầu m���i
      if (!newRequestResponse.ok) {
        throw new Error('Không thể thực hiện yêu cầu mới');
      }
      const newRequestResult = await newRequestResponse.json();
      console.log('Kết quả yêu cầu mới:', newRequestResult);

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

  /*
  const getCoordinatesFromOptimizedRoute = (route, allLocations) => {
    return route
      .map((pointCode) => {
        const location = allLocations.find((loc) => loc.pointCode === pointCode);
       
        return location ? [location.latitude, location.longitude] : null;
      })
      .filter((pos) => pos !== null); // Lọc bỏ các điểm không hợp lệ
  };
*/

const getCoordinatesFromOptimizedRoute = (route, allLocations) => {
  return route
    .map((pointCode) => {
      const location = allLocations.find((loc) => loc.pointCode === pointCode);
      return location ? [location.latitude, location.longitude] : null;
    })
    .filter((pos) => pos !== null); // Lọc bỏ các điểm không hợp lệ
};
const getActualRoutesBetweenPoints = async (routes) => {
  try {
    const allRoutesCoordinates = await Promise.all(
      routes.map(async (route) => {
        const coordinates = getCoordinatesFromOptimizedRoute(route, locations);
        const routePromises = [];

        for (let i = 0; i < coordinates.length - 1; i++) {
          const start = coordinates[i];
          const end = coordinates[i + 1];
          const coordinateString = `${start[1]},${start[0]};${end[1]},${end[0]}`;
          routePromises.push(
            fetch(
              `http://router.project-osrm.org/route/v1/driving/${coordinateString}?overview=full&geometries=geojson`
            ).then((response) => response.json())
          );
        }

        const results = await Promise.all(routePromises);
        let routeCoordinates = [];
        results.forEach((data) => {
          if (data.routes && data.routes[0]?.geometry) {
            const segmentCoords = data.routes[0].geometry.coordinates.map(
              (coord) => [coord[1], coord[0]]
            );
            routeCoordinates = [...routeCoordinates, ...segmentCoords];
          }
        });

        return routeCoordinates;
      })
    );
    setActualRouteCoordinates(allRoutesCoordinates);
    console.log('Actual Route Coordinates:', allRoutesCoordinates);
  } catch (error) {
    console.error("Error fetching actual routes:", error);
  }
};

  // Update the vehicle number input handler
  const handleVehicleNumberChange = (e) => {
    const value = e.target.value;
    setVehicleNumber(value);
    
    // Validate if the input is a number
    if (isNaN(value) || value.trim() === '') {
      setVehicleNumberError('Vui lòng nhập một số hợp lệ'); // Error message
    } else {
      setVehicleNumberError(''); // Clear error message
    }
  };

  return (
    <div className="route-container">
      <div className="input-container">
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

        <div className="vehicle-number-input">
          <label htmlFor="vehicleNumber">Số xe:</label>
          <input
            type="text"
            id="vehicleNumber"
            value={vehicleNumber}
            onChange={handleVehicleNumberChange}
            placeholder="Nhập số xe"
          />
          {vehicleNumberError && <div className="error-message">{vehicleNumberError}</div>}
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
        <MapContainer center={[21.0285, 105.8542]} zoom={13} style={{ height: '500px', width: '100%' }} whenCreated={(map) => {
          mapRef.current = map;
        }} ref={polylineRef}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {/* Hiển thị các điểm trên bản đồ */}
          {optimizedRoute.map((route, routeIndex) =>
            route.map((pointCode, pointIndex) => {
              const location = locations.find((loc) => loc.pointCode === pointCode);
              if (!location) return null;

              return (
                <Marker
                  key={`${routeIndex}-${pointIndex}`}
                  position={[location.latitude, location.longitude]}
                  icon={pointIndex === 0 ? startIcon : defaultCustomMarkerIcon}
                >
                  <Popup>
                  <strong>Tên điểm:</strong> {location.pointName} <br />
                        <strong>Mã điểm:</strong> {location.pointCode} <br />
                        <strong>Địa chỉ:</strong> {location.address}
                    
                  </Popup>
                </Marker>
              );
            })
          )}
          {/* Hiển thị các tuyến đường thực tế */}
          {actualRouteCoordinates.map((routeCoords, index) => {
            const polyline = (
              <Polyline
                key={index}
                positions={routeCoords}
                color={getColorForRoute(index)} // Màu sắc khác nhau cho từng tuyến
                weight={3}
                ref={(ref) => {
                  if (ref) {
                    ref.arrowheads({
                      size: '10px',
                      frequency: '100px',
                      fill: true,
                      color: getColorForRoute(index), // Sử dụng màu của tuyến
                    });
                  }
                }}
              />
            );
            return polyline;
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default RouteComponent;
