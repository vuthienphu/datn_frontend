import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams để lấy routeCode từ URL
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { defaultCustomMarkerIcon, startIcon } from './MapUtils';
import 'leaflet/dist/leaflet.css';
import '../assets/styles/EditRouteDetails.css';
import { FaTimes } from 'react-icons/fa';
import Select from 'react-select';
import 'leaflet-arrowheads'; 
import L from 'leaflet'; 
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


const EditRouteDetails = () => {
  const { routeCodeEdit } = useParams(); // Lấy routeCodeEdit từ URL
  const [points, setPoints] = useState([]); // Điểm đã chọn
  const [routeCode, setRouteCode] = useState(''); // Mã tuyến
  const [optimizedRoute, setOptimizedRoute] = useState([]);
  const [route, setRoute] = useState([]);
  const [locations, setLocations] = useState([]);
  const [actualRouteCoordinates, setActualRouteCoordinates] = useState([]);
const [polylineInstance, setPolylineInstance] = useState(null);
  const polylineRef = useRef(null);
  const mapRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState(''); // Thêm state cho số xe
  const [errorMessage, setErrorMessage] = useState(''); // Thêm state cho thông báo lỗi
  useEffect(() => {
    fetchLocations();
    fetchVehicleNumber();
    //fetchOptimizeRouteDetails();
  }, []); // Load locations first
  
 

  useEffect(() => {
    const fetchData = async () => {
      if (locations.length > 0) { // Only fetch route details after locations are loaded
        await fetchRouteDetails(); // Chờ fetchRouteDetails hoàn thành
        await fetchOptimizeRouteDetails(); // Sau đó mới gọi fetchOptimizeRouteDetails
      }
    };
  
    fetchData();
  }, [locations, routeCodeEdit]);
  
  /*
  useEffect(() => {
    if (optimizedRoute.length > 0 && locations.length > 0) {
      const updatedPoints = optimizedRoute.map((pointCode, index) => {
        const location = locations.find(loc => loc.pointCode === pointCode);
        return location
          ? { id: index, name: location.pointName, location: location.address }
          : { id: index, name: '', location: '' };
      });
      setPoints(updatedPoints);
    }
  }, [optimizedRoute, locations]); // Kích hoạt lại khi dữ liệu thay đổi
  */
  /*
  useEffect(() => {
    if (polylineRef.current) {
      polylineRef.current.arrowheads({
        size: '20px', // Độ lớn của mũi tên
        frequency: '200px', // Tần suất xuất hiện mũi tên
        fill: true,
      });
    }
  }, [optimizedRoute, locations]); // Kích hoạt lại khi tuyến đường hoặc vị trí 
*/
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
  const fetchVehicleNumber = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/vehiclenumber/${routeCodeEdit}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setVehicleNumber(data.vehicleNumber); // Cập nhật state với số xe
    } catch (error) {
      console.error('Error fetching vehicle number:', error);
    }
  };
  const fetchRouteDetails = async () => {
    try {
      // Fetch thông tin tuyến đường
      const response = await fetch(`http://localhost:8080/api/route/${routeCodeEdit}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log("Fetched route details:", data);
  
      // Cập nhật state
      setRouteCode(data.routeCode);
      setRoute(data.optimizeRouteCoordinates);
      
      // Chỉ xử lý tọa độ nếu có dữ liệu hợp lệ
      
  
          // Cập nhật points để hiển thị trong bảng
          const updatedPoints = data.optimizeRouteCoordinates.map((pointCode, index) => {
            const location = locations.find(loc => loc.pointCode === pointCode);
            return location
              ? { id: index, name: location.pointName, location: location.address }
              : { id: index, name: '', location: '' };
          });
          setPoints(updatedPoints);
       
    } catch (error) {
      console.error('Error fetching route details:', error);
    }
  };
  
  
  const fetchOptimizeRouteDetails = async () => {
    try {
      // Fetch thông tin tuyến đường
      const response = await fetch(`http://localhost:8080/api/optimizeroute/${routeCodeEdit}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log("Fetched route details:", data);
  
      // Cập nhật state
      setOptimizedRoute(data.optimizeRouteCoordinates);
      console.log("Optimized Route:", data.optimizeRouteCoordinates); // Log để kiểm tra optimizedRoute
      
      // Chỉ xử lý tọa độ nếu có dữ liệu hợp lệ
      const allActualRoutes = await Promise.all(
        data.optimizeRouteCoordinates.map(async (route) => {
          const coordinates = getCoordinatesFromOptimizedRoute(route, locations);
          return await getActualRoutesBetweenPoints(coordinates);
        })
      );

      setActualRouteCoordinates(allActualRoutes);
    } catch (error) {
      console.error('Error fetching route details:', error);
    }
  };

  const routeColors = [
    "blue", "green", "red", "purple", "orange", "brown", "pink", "cyan", "yellow"
  ];
  // Nếu số lượng xe lớn hơn số màu có sẵn, tự động lặp lại màu sắc
  const getColorForRoute = (index) => routeColors[index % routeColors.length];

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
    // Kiểm tra điều kiện trước khi thực hiện
  if (points.length < 2) {
    alert('Vui lòng chọn ít nhất 2 điểm để tìm đường');
    return;
  }

  // Lấy danh sách mã điểm (pointCode) từ các điểm đã chọn
  const coordinates = points
    .map(point => {
      const location = locations.find(loc => loc.pointName === point.name);
      return location ? location.pointCode : null;
    })
    .filter(coord => coord !== null);

  // Kiểm tra lại coordinates
  if (coordinates.length < 2) {
    alert('Không thể lấy được đủ thông tin tọa độ các điểm');
    return;
  }

  try {
    // 1. Xóa tuyến đường cũ
    console.log('Đang xóa tuyến đường cũ...');
    const deleteResponse = await fetch(`http://localhost:8080/api/route/edit/${routeCodeEdit}`, {
      method: 'DELETE',
    });

    if (!deleteResponse.ok) {
      throw new Error('Không thể xóa dữ liệu tuyến cũ');
    }
    console.log('Đã xóa tuyến đường cũ thành công');

    // 2. Tạo tuyến đường mới
    console.log('Đang tạo tuyến đường mới...');
    const routeResponse = await fetch('http://localhost:8080/api/route', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ routeCode, coordinates }),
    });

    if (!routeResponse.ok) {
      throw new Error('Không thể tạo tuyến đường mới');
    }
    const routeResult = await routeResponse.json();
    console.log('Tạo tuyến đường mới thành công:', routeResult);

    // 3. Tính toán ma trận khoảng cách
    console.log('Đang tính toán ma trận khoảng cách...');
    const distanceResponse = await fetch('http://localhost:8080/api/distance-matrix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ routeCode, distancematrixCoordinates: coordinates }),
    });

    if (!distanceResponse.ok) {
      throw new Error('Không thể tính toán ma trận khoảng cách');
    }
    const distanceResult = await distanceResponse.json();
    console.log('Tính toán ma trận khoảng cách thành công:', distanceResult);

    // 4. Tối ưu hóa tuyến đường
    console.log('Đang tối ưu hóa tuyến đường...');
    const optimizeResponse = await fetch('http://localhost:8080/api/route/optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ routeCode, optimizeRouteCoordinates: coordinates,vehicleNumber }),
    });

    if (!optimizeResponse.ok) {
      throw new Error('Không thể tối ưu hóa tuyến đường');
    }
    const optimizeResult = await optimizeResponse.json();
    console.log('Tối ưu hóa tuyến đường thành công:', optimizeResult);

    // 5. Cập nhật state và hiển thị tuyến đường
    if (optimizeResult && optimizeResult.length > 0) {
      setOptimizedRoute(optimizeResult);
      
      // Lấy tọa độ từ tuyến đường đã tối ưu
      const allRouteCoordinates = optimizeResult.map(route => getCoordinatesFromOptimizedRoute(route, locations));
      console.log('Tọa độ các tuyến đường tối ưu:', allRouteCoordinates);
    
      // Lọc ra các tuyến đường có ít nhất 2 tọa độ
      const validRouteCoordinates = allRouteCoordinates.filter(routeCoords => routeCoords.length >= 2);
    
      if (validRouteCoordinates.length > 0) {
        // Lấy tuyến đường thực tế từ OSRM cho từng tuyến đường
        console.log('Đang lấy tuyến đường thực tế...');
        const actualRoutes = await Promise.all(validRouteCoordinates.map(routeCoords => getActualRoutesBetweenPoints(routeCoords)));
        console.log('Tuyến đường thực tế:', actualRoutes);
        
        // Cập nhật state với các tuyến đường thực tế
        setActualRouteCoordinates(actualRoutes);
      } else {
        console.log('Không có tuyến đường hợp lệ với ít nhất 2 tọa độ.');
      }
    } else {
      throw new Error('Không nhận được kết quả tối ưu hóa hợp lệ');
    }

  //6.Gửi request post lưu số xe trong mỗi tuyến

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

  } catch (error) {
    console.error('Lỗi trong quá trình xử lý:', error);
    alert(`Có lỗi xảy ra: ${error.message}`);
  }
  };

  


  const handleVehicleNumberChange = (e) => {
    const value = e.target.value;
    setVehicleNumber(value);
    
    // Validate if the input is a number
    if (isNaN(value) || value.trim() === '') {
      setErrorMessage('Vui lòng nhập một số hợp lệ'); // Error message
    } else {
      setErrorMessage(''); // Clear error message
    }
  };

  const getCoordinatesFromOptimizedRoute = (route, allLocations) => {
    return route
      .map((pointCode) => {
        const location = allLocations.find((loc) => loc.pointCode === pointCode);
        console.log('Point Code:', pointCode, 'Location:', location); // Log để kiểm tra
        return location ? [location.latitude, location.longitude] : null;
      })
      .filter((pos) => pos !== null); // Lọc bỏ các điểm không hợp lệ
  };
  const getActualRoutesBetweenPoints = async (coordinates) => {
    try {
      const routePromises = [];
      for (let i = 0; i < coordinates.length - 1; i++) {
        const start = coordinates[i];
        const end = coordinates[i + 1];
        const coordinateString = `${start[1]},${start[0]};${end[1]},${end[0]}`;
        routePromises.push(
          fetch(`http://router.project-osrm.org/route/v1/driving/${coordinateString}?overview=full&geometries=geojson`)
            .then((response) => response.json())
        );
      }

      const results = await Promise.all(routePromises);
      let allCoordinates = [];
      results.forEach((data) => {
        if (data.routes && data.routes[0] && data.routes[0].geometry) {
          const segmentCoords = data.routes[0].geometry.coordinates.map((coord) => [coord[1], coord[0]]);
          allCoordinates = [...allCoordinates, ...segmentCoords];
        }
      });

      return allCoordinates;
    } catch (error) {
      console.error('Error fetching actual route:', error);
      return [];
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
          {errorMessage && <div className="error-message">{errorMessage}</div>}
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
        <MapContainer center={[21.0285, 105.8542]} zoom={13} style={{ height: '100%', width: '100%' }} whenCreated={(map) => {
            mapRef.current = map;
            setIsMapReady(true);
          }} >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
 {/* Hiển thị các điểm trên bản đồ */}
 {Array.isArray(optimizedRoute) && optimizedRoute.map((route, routeIndex) =>
  Array.isArray(route) && route.map((pointCode, pointIndex) => {
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
          {Array.isArray(actualRouteCoordinates) && actualRouteCoordinates.map((routeCoords, index) => {
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

export default EditRouteDetails;
