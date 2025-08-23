import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import PhotoManagement from './views/PhotoManagement';
import FilmStockManagement from './views/FilmStockManagement';
import FilmRollManagement from './views/FilmRollManagement';
import CameraManagement from './views/CameraManagement';
import ScannerManagement from './views/ScannerManagement';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// 用户端页面
import Photos from './pages/Photos';
import FilmRolls from './pages/FilmRolls';
import Map from './pages/Map';
import Random from './pages/Random';
import More from './pages/More';
import PhotoDetail from './pages/PhotoDetail';
import UserLayout from './components/UserLayout';

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 公开路由 - 用户端 */}
          <Route path="/" element={<UserLayout />}>
            <Route index element={<Navigate to="/photos" replace />} />
            <Route path="photos" element={<Photos />} />
            <Route path="film-rolls" element={<FilmRolls />} />
            <Route path="map" element={<Map />} />
            <Route path="random" element={<Random />} />
            <Route path="more" element={<More />} />
            <Route path="photo/:id" element={<PhotoDetail />} />
          </Route>
          
          {/* 管理后台路由 */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="photos" element={<PhotoManagement />} />
            <Route path="film-stocks" element={<FilmStockManagement />} />
            <Route path="film-rolls" element={<FilmRollManagement />} />
            <Route path="cameras" element={<CameraManagement />} />
            <Route path="scanners" element={<ScannerManagement />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
