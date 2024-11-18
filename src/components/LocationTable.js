// src/components/LocationTable.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LocationTable = () => {
    const [locations, setLocations] = useState([]);

    useEffect(() => {
      fetch('http://localhost:8080/api/locations')
        .then(response => response.json())
        .then(data => setLocations(data))
        .catch(error => console.error('Error fetching data:', error));
    }, []);
  
    const handleDelete = (id) => {
      if (window.confirm("Bạn có chắc chắn muốn xóa không?")) {
        axios.delete(`http://localhost:8080/api/locations/${id}`)
          .then(() => {
            setLocations(locations.filter(location => location.id !== id));
          })
          .catch(error => console.error('Error deleting data:', error));
      }
    };
  
    return (
      <table border="1">
        <thead>
          <tr>
            <th>Mã Điểm</th>
            <th>Tên Điểm</th>
            <th>Địa Điểm</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {locations.map(location => (
            <tr key={location.id}>
              <td>{location.point_code}</td>
              <td>{location.point_name}</td>
            <td>{location.address}</td>
              <td>
                <button onClick={() => alert('Chỉnh sửa: ' + location.location_name)}>Chỉnh sửa</button>
                <button onClick={() => handleDelete(location.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
};

export default LocationTable;