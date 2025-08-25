import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FilmIcon, 
  CameraIcon, 
  CogIcon,
  PhotoIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const More = () => {
  const sections = [
    {
      title: '胶卷管理',
      description: '管理胶卷品类和胶卷实例',
      items: [
        { name: '胶卷品类', href: '/admin/film-stocks', icon: FilmIcon, description: '管理胶卷品牌、系列、ISO等' },
        { name: '胶卷实例', href: '/admin/film-rolls', icon: PhotoIcon, description: '管理具体的胶卷实例和拍摄信息' },
      ]
    },
    {
      title: '设备管理',
      description: '管理相机和扫描仪',
      items: [
        { name: '相机管理', href: '/admin/cameras', icon: CameraIcon, description: '管理相机设备和信息' },
        { name: '扫描仪管理', href: '/admin/scanners', icon: CogIcon, description: '管理扫描仪设备' },
      ]
    },
    {
      title: '系统管理',
      description: '系统设置和统计',
      items: [
        { name: '照片管理', href: '/admin/photos', icon: PhotoIcon, description: '管理所有照片和元数据' },
        { name: '统计仪表板', href: '/admin/dashboard', icon: ChartBarIcon, description: '查看系统统计信息' },
      ]
    }
  ];

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">更多功能</h1>
          <p className="text-lg text-gray-600">探索 FilmTrip 的完整功能</p>
        </div>

        <div className="space-y-12">
          {sections.map((section) => (
            <div key={section.title} className="bg-white rounded-xl shadow-sm p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{section.title}</h2>
                <p className="text-gray-600">{section.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.items.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="group block p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <item.icon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 快速访问管理后台 */}
        <div className="mt-12 text-center">
          <Link
            to="/admin"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ChartBarIcon className="h-5 w-5 mr-2" />
            进入管理后台
          </Link>
        </div>
      </div>
    </div>
  );
};

export default More;
