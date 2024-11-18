import React from 'react';

import MapComponent from './components/MapComponent';
import LocationSearch from './components/LocationSearch';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import LocationTable from './components/LocationTable';
import ConfigForm from './components/ConfigForm';
import ConfigTable from './components/ConfigTable';
import './App.css'

function App() {
  return (
    <Router>
      <div className='App'>
        <Navbar />
        <Routes>
          <Route path="/" element={<MapComponent />} />
          <Route path="/location-search" element={<LocationSearch />} />
          <Route path="/location-table" element={<LocationTable />} />
          <Route path="/config/config-form" element={<ConfigForm />} />
          <Route path="/config/manage" element={<ConfigTable />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
