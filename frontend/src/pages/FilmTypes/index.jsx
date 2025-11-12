import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFilmTypeLabel } from '../../constants/filmTypes';

const FilmTypes = () => {
  const [filmTypes, setFilmTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setFilmTypes([
        {
          id: 1,
          name: 'Kodak Portra 400',
          brand: 'Kodak',
          iso: '400',
          type: 'color-negative',
          format: '135mm',
          photoCount: 12,
          coverImage: '/placeholder-photo.svg'
        },
        {
          id: 2,
          name: 'Ilford HP5 Plus',
          brand: 'Ilford',
          iso: '400',
          type: 'black-white-negative',
          format: '135mm',
          photoCount: 8,
          coverImage: '/placeholder-photo.jpg'
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">胶卷类型</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filmTypes.map((filmType) => (
          <div key={filmType.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gray-200">
              <img
                src={filmType.coverImage}
                alt={filmType.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filmType.name}
              </h3>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>品牌: {filmType.brand}</p>
                <p>ISO: {filmType.iso}</p>
                <p>类型: {getFilmTypeLabel(filmType.type)}</p>
                <p>规格: {filmType.format}</p>
                <p>照片数量: {filmType.photoCount}</p>
              </div>
              <Link
                to={`/film-type/${filmType.id}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                查看照片 →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilmTypes;
