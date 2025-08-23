import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const PhotoDetail = () => {
  const { id } = useParams();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      setPhoto({
        id: id,
        title: '城市夜景',
        description: '胶片摄影下的城市夜景，展现独特的色彩魅力',
        image: '/api/uploads/thumbnails/photo1_1024.jpg',
        camera: 'Leica M6',
        film: 'Kodak Portra 400',
        location: '上海外滩',
        rating: 5,
        date: '2025-01-15',
        exif: {
          aperture: 'f/2.8',
          shutter: '1/60s',
          iso: '400',
          focal: '35mm'
        }
      });
      setLoading(false);
    }, 1000);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!photo) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">照片未找到</h2>
        <Link to="/gallery" className="text-blue-600 hover:text-blue-700">
          返回作品浏览
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link to="/gallery" className="text-blue-600 hover:text-blue-700">
          ← 返回作品浏览
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* 照片展示 */}
        <div>
          <img
            src={photo.image}
            alt={photo.title}
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        {/* 照片信息 */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {photo.title}
            </h1>
            <p className="text-gray-600">{photo.description}</p>
          </div>

          {/* 基本信息 */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">基本信息</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">拍摄日期:</span>
                <span className="ml-2 text-gray-900">{photo.date}</span>
              </div>
              <div>
                <span className="text-gray-500">评分:</span>
                <span className="ml-2 text-gray-900">{photo.rating}/5</span>
              </div>
              <div>
                <span className="text-gray-500">相机:</span>
                <span className="ml-2 text-gray-900">{photo.camera}</span>
              </div>
              <div>
                <span className="text-gray-500">胶卷:</span>
                <span className="ml-2 text-gray-900">{photo.film}</span>
              </div>
              <div>
                <span className="text-gray-500">拍摄地点:</span>
                <span className="ml-2 text-gray-900">{photo.location}</span>
              </div>
            </div>
          </div>

          {/* EXIF信息 */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">EXIF信息</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">光圈:</span>
                <span className="ml-2 text-gray-900">{photo.exif.aperture}</span>
              </div>
              <div>
                <span className="text-gray-500">快门速度:</span>
                <span className="ml-2 text-gray-900">{photo.exif.shutter}</span>
              </div>
              <div>
                <span className="text-gray-500">ISO:</span>
                <span className="ml-2 text-gray-900">{photo.exif.iso}</span>
              </div>
              <div>
                <span className="text-gray-500">焦距:</span>
                <span className="ml-2 text-gray-900">{photo.exif.focal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetail;
