import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import PhotoManagement from './views/PhotoManagement';
import FilmStockManagement from './views/FilmStockManagement';
import FilmRollManagement from './views/FilmRollManagement';
import CameraManagement from './views/CameraManagement';
import ScannerManagement from './views/ScannerManagement';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
// 用户端页面
import Photos from './pages/Photos';
import FilmRolls from './pages/FilmRolls';
import Map from './pages/Map';
import Random from './pages/Random';
import More from './pages/More';
import PhotoDetail from './pages/PhotoDetail';
import NotFound from './pages/NotFound';
import UserLayout from './components/UserLayout';
import Trip from './pages/Trip';

import './App.css';

function App() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 监听全屏消息
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'TOGGLE_FULLSCREEN') {
        setIsFullscreen(event.data.isFullscreen);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <div className={`App ${isFullscreen ? 'fullscreen' : ''}`}>
          <Routes>
            {/* 公开路由 - 用户端 */}
            <Route path="/" element={<UserLayout isFullscreen={isFullscreen} />}>
              <Route index element={<Navigate to="/gallery" replace />} />
              <Route path="gallery" element={<Photos />} />
              <Route path="film-rolls" element={<FilmRolls />} />
              <Route path="map" element={<Map />} />
              <Route path="random" element={<Navigate to="/gallery?mode=random" replace />} />
              <Route path="trip" element={<Trip />} />
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
            
            {/* 404 页面 - 捕获所有不匹配的路由 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
