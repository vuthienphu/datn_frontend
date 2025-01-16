import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { defaultCustomMarkerIcon, startIcon } from './MapUtils';
import 'leaflet/dist/leaflet.css';
import 'leaflet-arrowheads';
import '../assets/styles/Route.css';
import L from 'leaflet';

const RouteDetail = () => {
  const { routeCode } = useParams();
  const [optimizedRoutes, setOptimizedRoutes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [actualRoutes, setActualRoutes] = useState([]);
  const colorPalette = ['blue', 'green', 'red', 'orange', 'purple', 'cyan']; // Các màu để hiển thị tuyến

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    const fetchRouteData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/optimizeroute/${routeCode}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setOptimizedRoutes(data.optimizeRouteCoordinates);

        // Lấy tất cả tọa độ thực tế của các tuyến đường
        const allActualRoutes = await Promise.all(
          data.optimizeRouteCoordinates.map(async (route) => {
            const coordinates = getCoordinatesFromOptimizedRoute(route, locations);
            return await getActualRouteBetweenPoints(coordinates);
          })
        );

        setActualRoutes(allActualRoutes);
      } catch (error) {
        console.error('Error fetching route details:', error);
      }
    };

    if (routeCode && locations.length > 0) {
      fetchRouteData();
    }
  }, [routeCode, locations]);

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

  const getCoordinatesFromOptimizedRoute = (route, allLocations) => {
    return route
      .map((pointCode) => {
        const location = allLocations.find((loc) => loc.pointCode === pointCode);
        return location ? [location.latitude, location.longitude] : null;
      })
      .filter((pos) => pos !== null);
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

  const ArrowPolyline = ({ positions, color }) => {
    const map = useMap();

    useEffect(() => {
      const polyline = L.polyline(positions, { color, weight: 3, opacity: 0.8 });
      polyline.addTo(map);

      polyline.arrowheads({
        size: '10px',
        frequency: '100px',
        color,
      });

      return () => {
        map.removeLayer(polyline);
      };
    }, [map, positions, color]);

    return null;
  };

  return (
    <div className="map-container">
      <MapContainer center={[21.0285, 105.8542]} zoom={13} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {optimizedRoutes.map((route, index) => {
          const color = colorPalette[index % colorPalette.length]; // Chọn màu từ bảng màu
          return (
            <React.Fragment key={index}>
              {route.map((pointCode, idx) => {
                const location = locations.find((loc) => loc.pointCode === pointCode);
                if (location) {
                  return (
                    <Marker
                      key={`${index}-${idx}`}
                      position={[location.latitude, location.longitude]}
                      icon={idx === 0 ? startIcon : defaultCustomMarkerIcon} // Biểu tượng khác nhau cho điểm đầu
                    >
                      <Popup>
                        <strong>Tên điểm:</strong> {location.pointName} <br />
                        <strong>Mã điểm:</strong> {location.pointCode} <br />
                        <strong>Địa chỉ:</strong> {location.address}
                      </Popup>
                    </Marker>
                  );
                }
                return null;
              })}

              {actualRoutes[index] && actualRoutes[index].length > 1 && (
                <ArrowPolyline positions={actualRoutes[index]} color={color} />
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default RouteDetail;
