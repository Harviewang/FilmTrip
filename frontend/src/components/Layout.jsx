import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  PhotoIcon, 
  FolderIcon, 
  CameraIcon, 
  DeviceTabletIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import Logo from './Logo';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: '仪表板', href: '/admin/dashboard', icon: HomeIcon },
    { name: '照片管理', href: '/admin/photos', icon: PhotoIcon },
    { name: '胶卷实例', href: '/admin/film-rolls', icon: PhotoIcon },
    { name: '胶卷品类', href: '/admin/film-stocks', icon: FolderIcon },
    { name: '相机管理', href: '/admin/cameras', icon: CameraIcon },
    { name: '扫描仪管理', href: '/admin/scanners', icon: DeviceTabletIcon },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* 顶部Header - 固定在顶部 */}
      <header className="bg-white shadow-sm border-b border-gray-200 z-50 fixed top-0 left-0 right-0 flex-shrink-0">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">打开侧边栏</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Logo className="h-8 w-8" />
              <span className="text-xl font-bold text-gray-900">FilmTrip</span>
            </Link>
            <span className="text-lg font-medium text-gray-600">管理后台</span>
          </div>

          <div className="flex items-center space-x-4">
            {/* 返回首页按钮 */}
            <Link
              to="/"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="mr-2 h-5 w-5 text-gray-400" />
              返回首页
            </Link>
            <span className="text-sm text-gray-500">
              欢迎，{JSON.parse(localStorage.getItem('user') || '{}').username || '用户'}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
            >
              <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5 text-gray-400" />
              退出登录
            </button>
          </div>
        </div>
      </header>

      {/* 侧边栏 - 考虑header高度 */}
      <div className={`fixed left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`} style={{ top: '64px', height: 'calc(100vh - 64px)' }}>
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 transition-colors ${
                      isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* 移动端遮罩层 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 主内容区 - 考虑header高度和侧边栏宽度 */}
      <div className="flex-1 lg:pl-64 mt-16">
        <main className="h-[calc(100vh-4rem)] overflow-auto scrollbar-hidden">
          <Outlet />
        </main>
      </div>

      {/* 底部Footer - 地图模式不显示 */}
      {!location.pathname.includes('/map') && (
        <footer className="bg-white border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8 lg:ml-64">
          <div className="text-center text-sm text-gray-500">
            <p>© 2025 胶片管理系统. 保留所有权利.</p>
          </div>
        </footer>
      )}

      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          style={{ top: '64px' }}
        />
      )}
    </div>
  );
};

export default Layout;

