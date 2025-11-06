import React, { useRef, useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import { 
  PhotoIcon, 
  FilmIcon,
  MapIcon, 
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import Logo from './Logo';
import { ScrollContainerProvider } from '../contexts/ScrollContainerContext';

const UserLayout = ({ isFullscreen = false }) => {
  const location = useLocation();
  const isMapPage = location.pathname === '/map';
  const scrollContainerRef = useRef(null);
  const [authRef, setAuthRef] = useState({ isAdmin: false });

  const navigation = [
    { name: '照片', href: '/gallery', icon: PhotoIcon },
    { name: '胶卷', href: '/film-rolls', icon: FilmIcon },
    { name: '地点', href: '/map', icon: MapIcon },
    { name: '更多', href: '/more', icon: EllipsisHorizontalIcon },
  ];

  // 检查用户身份，并在 localStorage 变化时更新
  useEffect(() => {
    const checkAuth = () => {
      try {
        const stored = localStorage.getItem('user');
        if (!stored) {
          setAuthRef({ isAdmin: false });
          return;
        }
        const parsed = JSON.parse(stored);
        const token = localStorage.getItem('token');
        if (!token) {
          setAuthRef({ isAdmin: false });
          return;
        }
        const role = parsed?.role || parsed?.roles;
        const isAdmin =
          role === 'admin' ||
          (Array.isArray(role) && role.includes('admin')) ||
          parsed?.isAdmin === true ||
          parsed?.username === 'admin';
        setAuthRef({ isAdmin });
      } catch (e) {
        setAuthRef({ isAdmin: false });
      }
    };

    // 初始检查
    checkAuth();

    // 监听 storage 事件（跨标签页同步）
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        checkAuth();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 定期检查（处理同标签页内的变化，但频率降低）
    const interval = setInterval(checkAuth, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <ScrollContainerProvider scrollContainerRef={scrollContainerRef} authRef={authRef}>
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* 导航栏 - 固定在顶部，全屏时隐藏 */}
      {!isFullscreen && (
        <nav className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0 fixed top-0 left-0 right-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              {/* Logo */}
              <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-2">
                  <Logo className="h-8 w-8" />
                  <span className="text-xl font-bold text-gray-900">FilmTrip</span>
                </Link>
              </div>

              {/* 主导航 */}
              <div className="hidden md:flex items-center space-x-8">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* 移动端菜单按钮 */}
              <div className="md:hidden flex items-center">
                <button className="text-gray-600 hover:text-gray-900">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* 主要内容区域 - 考虑header高度和footer高度 */}
        <main 
          ref={scrollContainerRef}
          data-scroll-container
          className={`flex-1 w-full ${
        isFullscreen 
          ? 'h-full overflow-hidden' 
          : isMapPage 
            ? 'mt-16 h-[calc(100vh-4rem)] overflow-hidden' 
            : 'mt-16 h-[calc(100vh-7rem)] overflow-auto scrollbar-hidden'
          }`}
        >
        <Outlet />
      </main>

      {/* 页脚 - 全屏时隐藏，地图页面也隐藏，可以随页面滚动 */}
      {!isFullscreen && !isMapPage && (
        <footer className="bg-white border-t border-gray-200 flex-shrink-0 mt-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>© 2025 FilmTrip - 胶片摄影管理系统</span>
              <Link 
                to="/admin" 
                className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>管理</span>
              </Link>
            </div>
          </div>
        </footer>
      )}
    </div>
    </ScrollContainerProvider>
  );
};

export default UserLayout;
