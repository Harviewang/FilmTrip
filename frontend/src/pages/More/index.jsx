import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

const links = [
  { name: '胶卷品类', href: '/admin/film-stocks' },
  { name: '胶卷实例', href: '/admin/film-rolls' },
  { name: '相机管理', href: '/admin/cameras' },
  { name: '扫描仪管理', href: '/admin/scanners' },
  { name: '照片管理', href: '/admin/photos' },
  { name: '统计仪表板', href: '/admin/dashboard' },
  { name: '管理后台', href: '/admin' }
];

const More = () => (
  <div className="min-h-screen bg-white">
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">更多功能</h1>
      <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 shadow-sm">
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.href}
            className="flex items-center justify-between px-5 py-4 text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <span>{link.name}</span>
            <ChevronRightIcon className="h-5 w-5 text-gray-400" />
          </Link>
        ))}
      </div>
    </div>
  </div>
);

export default More;
