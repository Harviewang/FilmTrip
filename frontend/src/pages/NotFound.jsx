import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  PhotoIcon, 
  FilmIcon,
  MapIcon, 
  SparklesIcon, 
  EllipsisHorizontalIcon 
} from '@heroicons/react/24/outline';
import Logo from '../components/Logo';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 主要导航页面
  const navigation = [
    { name: '照片', href: '/gallery', icon: PhotoIcon },
    { name: '胶卷', href: '/film-rolls', icon: FilmIcon },
    { name: '旅途', href: '/map', icon: MapIcon },
    { name: '随机', href: '/random', icon: SparklesIcon },
    { name: '更多', href: '/more', icon: EllipsisHorizontalIcon },
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* 导航栏 - 使用通用样式 */}
      <nav className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
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

      {/* 主要内容 */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full text-center">
          {/* 404 标题 */}
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-gray-300 mb-4">404</h1>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">页面未找到</h2>
            <p className="text-lg text-gray-600">
              抱歉，您访问的页面不存在
            </p>
          </div>

          {/* 返回首页按钮 */}
          <div>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              返回首页
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;