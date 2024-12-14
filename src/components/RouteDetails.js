import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams để lấy routeCode từ URL
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { defaultCustomMarkerIcon, startIcon } from './MapUtils';
import 'leaflet/dist/leaflet.css';
import '../assets/styles/Route.css';
import L from 'leaflet';  
import 'leaflet-arrowheads';

const RouteDetail = () => {
  const { routeCode } = useParams(); // Lấy routeCode từ URL
  const [optimizedRoute, setOptimizedRoute] = useState([]);
  const [locations, setLocations] = useState([]);
  const [actualRouteCoordinates, setActualRouteCoordinates] = useState([]);
const [polylineInstance, setPolylineInstance] = useState(null);
  const polylineRef = useRef(null);

  useEffect(() => {
    fetchLocations();
    //fetchRouteDetails();
  }, [routeCode]);

  useEffect(() => {
    const fetchRouteData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/route/${routeCode}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setOptimizedRoute(data.optimizeRouteCoordinates);
        
        // Lấy tọa độ của tuyến đường tối ưu
        const coordinates = getCoordinatesFromOptimizedRoute(data.optimizeRouteCoordinates, locations);
        
        // Lấy tuyến đường thực tế
        const actualRoute = await getActualRouteBetweenPoints(coordinates);
        setActualRouteCoordinates(actualRoute);
      } catch (error) {
        console.error('Error fetching route details:', error);
      }
    };
  
    if (routeCode && locations.length > 0) {
      fetchRouteData();
    }
  }, [routeCode, locations]);

  useEffect(() => {
    if (polylineRef.current && polylineRef.current._map && actualRouteCoordinates.length > 1) {
      // Kiểm tra xem polylineInstance có tồn tại không trước khi xóa
      if (polylineInstance) {
        if (polylineInstance.arrowheads) {
          polylineInstance.arrowheads().remove();
        }
        polylineRef.current._map.removeLayer(polylineInstance);
      }
  
      const newPolyline = L.polyline(actualRouteCoordinates, {
        color: 'blue',
        weight: 3,
        opacity: 0.8,
        smoothFactor: 1
      });
  
      // Kiểm tra lại một lần nữa trước khi thêm vào map
      if (polylineRef.current && polylineRef.current._map) {
        newPolyline.addTo(polylineRef.current._map);
  
        newPolyline.arrowheads({
          size: '15px',
          frequency: '50px',
          fill: true,
          yawn: 40,
          offsets: { end: 0 }
        });
  
        setPolylineInstance(newPolyline);
      }
  
      // Cleanup function
      return () => {
        if (newPolyline && polylineRef.current && polylineRef.current._map) {
          if (newPolyline.arrowheads) {
            newPolyline.arrowheads().remove();
          }
          polylineRef.current._map.removeLayer(newPolyline);
        }
      };
    }
  }, [actualRouteCoordinates]);
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
/*
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
*/
  const getCoordinatesFromOptimizedRoute = (route, allLocations) => {
    return route
      .map((pointCode) => {
        const location = allLocations.find((loc) => loc.pointCode === pointCode);
        return location ? [location.latitude, location.longitude] : null;
      })
      .filter((pos) => pos !== null); // Lọc bỏ các điểm không hợp lệ
  };

  const getActualRouteBetweenPoints = async (coordinates) => {
    try {
      const routePromises = [];
      for (let i = 0; i < coordinates.length - 1; i++) {
        const start = coordinates[i];
        const end = coordinates[i + 1];
        const coordinateString = `${start[1]},${start[0]};${end[1]},${end[0]}`;
        
        routePromises.push(
          fetch(`http://router.project-osrm.org/route/v1/driving/${coordinateString}?overview=full&geometries=geojson`)
            .then(response => response.json())
        );
      }
  
      const results = await Promise.all(routePromises);
      
      let allCoordinates = [];
      results.forEach(data => {
        if (data.routes && data.routes[0] && data.routes[0].geometry) {
          const segmentCoords = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
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
        {actualRouteCoordinates.length > 1 && (
  <Polyline
    ref={polylineRef}
    positions={actualRouteCoordinates}
    pathOptions={{
      color: 'blue',
      weight: 3
    }}
  />
)}
      </MapContainer>
    </div>
  );
};

export default RouteDetail;
