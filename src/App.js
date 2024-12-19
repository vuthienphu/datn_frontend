import React from 'react';

import RouteComponent from './components/RouteComponent';
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
import EditRouteDetails from './components/EditRouteDetails';
import HomePage from './components/HomePage';
import Register from './components/Register';
import Login from './components/Login';
import UserTable from './components/UserTable';
function App() {
  return (
    <Router>
      <div className='App'>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <>
              <Navbar />
              <Routes>
                <Route path="/route" element={<RouteComponent />} />
                <Route path="/location/location-search" element={<LocationSearch />} />
                <Route path="/location" element={<LocationTable />} />
                <Route path="/location/:id" element={<UpdateLocationForm />} />
                <Route path="/config/config-form" element={<ConfigForm />} />
                <Route path="/config" element={<ConfigTable />} />
                <Route path="/config/:id" element={<ConfigTable />} />
                <Route path="/route/manager" element={<RouteManager />} />
                <Route path="/route/manager/:routeCode" element={<RouteDetail />} />
                <Route path="/route/manager/edit/:routeCodeEdit" element={<EditRouteDetails />} />
                <Route path="/users" element={<UserTable />} />
              </Routes>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
