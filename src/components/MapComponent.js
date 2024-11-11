import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { defaultCustomMarkerIcon } from './MapUtils'; // Import default custom icon
import 'leaflet/dist/leaflet.css';


const MapComponent = () => {
  const [locations, setLocations] = useState([]);
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/locations') 
      .then((response) => response.json())
      .then((data) => setLocations(data))
      .catch((error) => console.error('Lỗi khi lấy dữ liệu:', error));
  }, []);

  const handleSearch = () => {
    if (startLocation && endLocation) {
      setMarkers([
        { ...startLocation, label: 'Điểm đi' },
        { ...endLocation, label: 'Điểm đến' }
      ]);
    }
  };

  return (
    <div  className="MapComponent-container">
      <h3>Định tuyến xe</h3>

      <div className="select-container">
        <label>
          Điểm đi:
          <select onChange={(e) => setStartLocation(JSON.parse(e.target.value))}
             >
            <option value="">Chọn điểm đi</option>
            {locations.map((loc) => (
              <option key={loc.id} value={JSON.stringify(loc)}>
                {loc.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Điểm đến:
          <select onChange={(e) => setEndLocation(JSON.parse(e.target.value))}>
            <option value="">Chọn điểm đến</option>
            {locations.map((loc) => (
              <option key={loc.id} value={JSON.stringify(loc)}>
                {loc.name}
              </option>
            ))}
          </select>
        </label>
        <button onClick={handleSearch}>Tìm kiếm</button>
      </div>

      <MapContainer center={[21.0285, 105.8542]} zoom={10} className="MapContainer">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {markers.map((marker, index) => (
          <Marker key={index} position={[marker.latitude, marker.longitude]} icon={defaultCustomMarkerIcon}>
            <Popup>{marker.label}: {marker.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
