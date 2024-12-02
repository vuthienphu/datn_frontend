import React from 'react';

import MapComponent from './components/Route';
import LocationSearch from './components/LocationSearch';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import LocationTable from './components/LocationTable';
import ConfigForm from './components/ConfigForm';
import ConfigTable from './components/ConfigTable';
import './App.css'
import UpdateLocationForm from './components/UpdateLocationForm';
import RouteManager from './components/RouteManager';
import RouteDetail from './components/RouteDetails';

function App() {
  return (
    <Router>
      <div className='App'>
        <Navbar />
        <Routes>
          <Route path="/" element={<MapComponent />} />
          <Route path="/location/location-search" element={<LocationSearch />} />
          <Route path="/location" element={<LocationTable />} />
          <Route path="/location/:id" element={<UpdateLocationForm />} /> {/* Add this line */}
          <Route path="/config/config-form" element={<ConfigForm />} />
          <Route path="/config" element={<ConfigTable />} />
          <Route path="/config/:id" element={<ConfigTable />} /> {/* Add this line */}
          <Route path="/route/manager" element={<RouteManager />} />
          <Route path="/route/manager/:routeCode" element={<RouteDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
