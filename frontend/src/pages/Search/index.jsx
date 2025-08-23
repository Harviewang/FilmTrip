import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    
    // 模拟搜索
    setTimeout(() => {
      setSearchResults([
        {
          id: 1,
          title: '城市夜景',
          image: '/api/uploads/thumbnails/photo1_1024.jpg',
          camera: 'Leica M6',
          film: 'Kodak Portra 400',
          date: '2025-01-15'
        }
      ]);
      setIsSearching(false);
    }, 1000);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">搜索作品</h1>

      {/* 搜索表单 */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索照片标题、相机、胶卷、标签..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSearching ? '搜索中...' : '搜索'}
            </button>
          </div>
        </div>
      </form>

      {/* 搜索建议 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">热门搜索</h3>
        <div className="flex flex-wrap gap-2">
          {['Leica', 'Kodak', '黑白', '人像', '风景', '街拍'].map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchTerm(tag)}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 搜索结果 */}
      {searchResults.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            搜索结果 ({searchResults.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {searchResults.map((photo) => (
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
      )}

      {/* 无搜索结果 */}
      {searchTerm && searchResults.length === 0 && !isSearching && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            未找到相关作品
          </h3>
          <p className="text-gray-600 mb-4">
            尝试使用其他关键词或浏览所有作品
          </p>
          <Link
            to="/gallery"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            浏览所有作品
          </Link>
        </div>
      )}
    </div>
  );
};

export default Search;
