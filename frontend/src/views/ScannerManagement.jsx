import React from 'react';

const ScannerManagement = () => {
  return (
    <div className="p-6">
      {/* 页面标题和操作按钮 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">扫描仪管理</h1>
          <p className="text-gray-600">管理您的胶片扫描仪设备</p>
        </div>
      </div>
      
      {/* 内容区域 */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <p className="text-gray-500 text-center">扫描仪管理功能开发中...</p>
      </div>
    </div>
  );
};

export default ScannerManagement;
