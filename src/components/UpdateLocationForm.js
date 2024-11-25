import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { customMarkerIcon } from './MapUtils'; // Import custom icon
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import '../assets/styles/LocationSearch.css';

function UpdateLocationForm() {
  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [coordinates, setCoordinates] = useState(null);
  const [message, setMessage] = useState('');
  const [locationCode, setLocationCode] = useState('');
  const [locationName, setLocationName] = useState('');
  const [messageType, setMessageType] = useState('');
  const { id } = useParams(); // Get the location ID from the URL
  const navigate = useNavigate();
  useEffect(() => {
    // Fetch the location data based on the ID
    axios.get(`http://localhost:8080/api/locations/${id}`)
      .then(response => {
        const data = response.data;
        setLocation(data.address);
        setLocationCode(data.point_code);
        setLocationName(data.point_name);
        setCoordinates({ lat: data.latitude, lon: data.longitude });
      })
      .catch(error => console.error('Error fetching location data:', error));
  }, [id]);

  const handleInputChange = async (e) => {
    const input = e.target.value;
    setLocation(input);

    if (input.length > 2) { // Chỉ tìm kiếm khi input > 2 ký tự
      try {
        const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
          params: {
            q: input,
            key: '9f887eb1151246da8ca473b05d3c3166', // Thay bằng API key của bạn
            limit: 5,
          },
        });

        if (response.data && response.data.results) {
          setSuggestions(response.data.results);
        }
      } catch (error) {
        console.error('Lỗi khi tìm kiếm gợi ý:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const { geometry, formatted } = suggestion;
    setCoordinates({ lat: geometry.lat, lon: geometry.lng });
    setLocation(formatted); // Gán tên địa điểm đã chọn
    setSuggestions([]); // Ẩn danh sách gợi ý
  };

  const handleReset = () => {
    setLocationCode('');
    setLocationName('');
    setLocation('');
    setCoordinates(null);
    setSuggestions([]);
    setMessage('');
    navigate('/location');
  };

  const handleSave = async () => {
    if (!coordinates) {
      setMessage('Bạn cần chọn tọa độ trước khi lưu');
      setMessageType('error');
      return;
    }
    if (!locationCode || !locationName) {
      setMessage('Vui lòng nhập đầy đủ mã điểm và tên điểm');
      setMessageType('error');
      return;
    }
    try {
      const response = await axios.put(`http://localhost:8080/api/locations/${id}`, {
        point_code: locationCode,
        point_name: locationName,
        address: location,
        longitude: coordinates.lon,
        latitude: coordinates.lat,
      });

      if (response.status === 200) {
        setMessage('Đã cập nhật địa điểm thành công');
        setMessageType('success');
         // Reset form sau khi cập nhật thành công
      } else {
        setMessage('Không thể cập nhật địa điểm');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Có lỗi xảy ra khi cập nhật địa điểm');
      setMessageType('error');
    }
  };

  return (
    <>
      <div className='location-search-container'>
        <h2>Tìm kiếm, đánh dấu và lưu tọa độ địa điểm</h2>
        <input
          type="text"
          value={locationCode}
          onChange={(e) => setLocationCode(e.target.value)}
          placeholder="Nhập mã điểm..."
        />
        <input
          type="text"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="Nhập tên điểm..."
        />
        <input
          type="text"
          value={location}
          onChange={handleInputChange}
          placeholder="Nhập địa điểm..."
        />
        <input
          type="text"
          value={coordinates ? coordinates.lon : ''}
          readOnly
          placeholder="Kinh độ..."
        />
        <input
          type="text"
          value={coordinates ? coordinates.lat : ''}
          readOnly
          placeholder="Vĩ độ..."
        />
        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="suggestion-item"
              >
                {suggestion.formatted}
              </li>
            ))}
          </ul>
        )}
        
        
          <>
           
            <div className="button-group">
              <button onClick={handleSave}>Lưu vị trí</button>
              <button onClick={handleReset}>Huỷ bỏ</button>
            </div>
          </>
        

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

<div className='map-container'>
        {coordinates && (
          <MapContainer
            center={[coordinates.lat, coordinates.lon]}
            zoom={13}
            style={{ height: '400px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[coordinates.lat, coordinates.lon]} icon={customMarkerIcon}>
              <Popup>{location}</Popup>
            </Marker>
          </MapContainer>
        )}
      </div>
      </div>
      
      
    </>
  );
}

export default UpdateLocationForm;

