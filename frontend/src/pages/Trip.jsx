import React from 'react';

const Trip = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">旅途功能</h1>
          <p className="text-lg text-gray-600">精彩的旅途记录功能正在开发中</p>
          <p className="text-sm text-gray-500">敬请期待...</p>
        </div>
        <div className="pt-4">
          <a
            href="/gallery"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            返回相册
          </a>
        </div>
      </div>
    </div>
  );
};

export default Trip;
