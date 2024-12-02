import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams để lấy routeCode từ URL
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { defaultCustomMarkerIcon, startIcon } from './MapUtils';
import 'leaflet/dist/leaflet.css';
import '../assets/styles/Route.css';

const RouteDetail = () => {
  const { routeCode } = useParams(); // Lấy routeCode từ URL
  const [optimizedRoute, setOptimizedRoute] = useState([]);
  const [locations, setLocations] = useState([]);
  const polylineRef = useRef(null);

  useEffect(() => {
    fetchLocations();
    fetchRouteDetails();
  }, [routeCode]);
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

  const fetchRouteDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/route/${routeCode}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setOptimizedRoute(data.optimizeRouteCoordinates);
    } catch (error) {
      console.error('Error fetching route details:', error);
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
  );
};

export default RouteDetail;
