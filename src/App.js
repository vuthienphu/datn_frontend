import React from 'react';

import MapComponent from './components/MapComponent';
import LocationSearch from './components/LocationSearch';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import './App.css'

function App() {
  return (
    <Router>
      <div className='App'>
        <Navbar />
        <Routes>
          <Route path="/" element={<MapComponent />} />
          <Route path="/location-search" element={<LocationSearch />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
