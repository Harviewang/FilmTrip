import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setPhotos([
        {
          id: 1,
          title: '城市夜景',
          image: '/api/uploads/thumbnails/photo1_1024.jpg',
          camera: 'Leica M6',
          film: 'Kodak Portra 400',
          date: '2025-01-15',
          rating: 5
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">作品浏览</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <Link
            key={photo.id}
            to={`/photo/${photo.id}`}
            className="group block"
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg">
              <img
                src={photo.image}
                alt={photo.title}
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform"
              />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                  {photo.title}
                </h3>
                <div className="mt-2 text-sm text-gray-500">
                  <p>相机: {photo.camera}</p>
                  <p>胶卷: {photo.film}</p>
                  <p>日期: {photo.date}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
