import React, { useState } from 'react';
import axios from 'axios';
import { customMarkerIcon } from './MapUtils'; // Import custom icon
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';




function LocationSearch() {
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [message, setMessage] = useState('');

  const handleSearch = async () => {
    setMessage('');
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: location,
          format: 'json',
          limit: 1,
        },
      });

      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setCoordinates({ lat: parseFloat(lat), lon: parseFloat(lon) });
      } else {
        setMessage('Không tìm thấy địa điểm');
      }
    } catch (error) {
      setMessage('Có lỗi xảy ra khi tìm kiếm tọa độ');
    }
  };

  const handleSave = async () => {
    if (!coordinates) {
      setMessage('Bạn cần tìm tọa độ trước khi lưu');
      return;
    }
    try {
      const response = await axios.post('http://localhost:8080/api/locations', {
        name: location,
        longitude: coordinates.lon,
        latitude: coordinates.lat
      });

      if (response.status === 201) {
        setMessage('Đã lưu địa điểm thành công');
      } else {
        setMessage('Không thể lưu địa điểm');
      }
    } catch (error) {
      setMessage('Có lỗi xảy ra khi lưu địa điểm');
    }
  };

  return (
    <div >
      <h2>Tìm kiếm, đánh dấu và lưu tọa độ địa điểm</h2>
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Nhập địa điểm..."
      />
      <button onClick={handleSearch}>Tìm tọa độ</button>

      {coordinates && (
        <div>
          <h3>Tọa độ</h3>
          <p>Longitude: {coordinates.lon}</p>
          <p>Latitude: {coordinates.lat}</p>
          <button onClick={handleSave}>Lưu vào MySQL</button>
        </div>
      )}

      {message && <p>{message}</p>}

      {coordinates && (
        <MapContainer center={[coordinates.lat, coordinates.lon]} zoom={13} style={{ height: '400px', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[coordinates.lat,coordinates.lon]} icon={customMarkerIcon}>
            <Popup>{location}</Popup>
          </Marker>
        </MapContainer>
      )}
    </div>
  );
}

export default LocationSearch;
