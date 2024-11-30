import L from 'leaflet';
import '../assets/styles/Route.css';
// Cấu hình icon cho marker (Leaflet yêu cầu chỉ định icon)
export const customMarkerIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export const defaultCustomMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

export const startIcon = new L.divIcon({
  className: 'custom-start-icon', // Tên class để tùy chỉnh CSS
  html: '<div class="start-marker">Start</div>', // Nội dung hiển thị
  iconSize: [50, 20], // Kích thước biểu tượng
  iconAnchor: [25, 10], // Điểm neo (tùy chỉnh theo vị trí của chữ)
});

export const endIcon = new L.Icon({
  iconUrl: 'https://example.com/path-to-red-marker-icon.png',  // Update with red marker URL
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});


