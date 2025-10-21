import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon, MapPinIcon, CameraIcon, TagIcon, CalendarIcon } from '@heroicons/react/24/outline';

const PhotoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchPhotoDetail();
  }, [id]);

  const fetchPhotoDetail = async () => {
    try {
      const response = await fetch(`/api/photos/${id}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setPhoto(result.data);
          setFormData(result.data);
        }
      }
    } catch (error) {
      console.error('获取照片详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/photos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setPhoto(result.data);
          setEditing(false);
          alert('保存成功！');
        }
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoriesChange = (category) => {
    const currentCategories = formData.categories ? JSON.parse(formData.categories) : [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];

    setFormData(prev => ({
      ...prev,
      categories: JSON.stringify(newCategories)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!photo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">照片不存在</div>
      </div>
    );
  }

  const categories = photo.categories ? JSON.parse(photo.categories) : [];
  const availableCategories = ['风景', '人文', '建筑', '自然', '城市', '山水', '纪实', '旅行', '生活'];

  return (
    <div className="photo-detail-page bg-gray-50 min-h-screen">
      {/* 导航栏 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                返回
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                {editing ? '取消编辑' : '编辑'}
              </button>
              {editing && (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  保存
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 照片显示区域 */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-lg">
              {photo.original && (
                <img
                  src={photo.original}
                  alt={photo.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* 缩略图导航 */}
            <div className="grid grid-cols-3 gap-2">
              {photo.thumbnail && (
                <img src={photo.thumbnail} alt="缩略图" className="w-full aspect-square object-cover rounded shadow-sm" />
              )}
              {photo.size1024 && (
                <img src={photo.size1024} alt="中等尺寸" className="w-full aspect-square object-cover rounded shadow-sm" />
              )}
              {photo.size2048 && (
                <img src={photo.size2048} alt="大尺寸" className="w-full aspect-square object-cover rounded shadow-sm" />
              )}
            </div>
          </div>

          {/* 元数据编辑区域 */}
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">基本信息</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">标题</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{photo.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">描述</label>
                  {editing ? (
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{photo.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 地理信息 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2" />
                地理信息
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">国家</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.country || ''}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{photo.country || '未设置'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">省份</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.province || ''}
                      onChange={(e) => handleInputChange('province', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{photo.province || '未设置'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">城市</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{photo.city || '未设置'}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">具体地点</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.location_name || ''}
                    onChange={(e) => handleInputChange('location_name', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{photo.location_name || '未设置'}</p>
                )}
              </div>

              {(photo.latitude && photo.longitude) && (
                <div className="mt-4 text-sm text-gray-500">
                  坐标: {photo.latitude.toFixed(6)}, {photo.longitude.toFixed(6)}
                </div>
              )}
            </div>

            {/* 拍摄信息 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CameraIcon className="h-5 w-5 mr-2" />
                拍摄信息
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">光圈</label>
                  <p className="mt-1 text-gray-900">{photo.aperture || '未知'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">快门</label>
                  <p className="mt-1 text-gray-900">{photo.shutter_speed || '未知'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">焦距</label>
                  <p className="mt-1 text-gray-900">{photo.focal_length || '未知'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">ISO</label>
                  <p className="mt-1 text-gray-900">{photo.iso || '未知'}</p>
                </div>
              </div>

              {photo.camera_model && (
                <div className="mt-4 pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-700">相机型号</label>
                  <p className="mt-1 text-gray-900">{photo.camera_model}</p>
                </div>
              )}

              {photo.lens_model && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">镜头型号</label>
                  <p className="mt-1 text-gray-900">{photo.lens_model}</p>
                </div>
              )}
            </div>

            {/* 分类标签 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <TagIcon className="h-5 w-5 mr-2" />
                分类标签
              </h3>
              {editing ? (
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map(category => (
                    <button
                      key={category}
                      onClick={() => handleCategoriesChange(category)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        (formData.categories ? JSON.parse(formData.categories) : categories).includes(category)
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
                      } border`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <span
                      key={category}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {category}
                    </span>
                  ))}
                  {categories.length === 0 && (
                    <span className="text-gray-500">暂无标签</span>
                  )}
                </div>
              )}
            </div>

            {/* 行程信息 */}
            {photo.trip_name && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  行程信息
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">行程名称</label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.trip_name || ''}
                        onChange={(e) => handleInputChange('trip_name', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{photo.trip_name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">开始日期</label>
                      {editing ? (
                        <input
                          type="date"
                          value={formData.trip_start_date || ''}
                          onChange={(e) => handleInputChange('trip_start_date', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{photo.trip_start_date || '未设置'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">结束日期</label>
                      {editing ? (
                        <input
                          type="date"
                          value={formData.trip_end_date || ''}
                          onChange={(e) => handleInputChange('trip_end_date', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{photo.trip_end_date || '未设置'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 其他信息 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">其他信息</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">拍摄日期:</span>
                  <span className="ml-2 text-gray-900">{photo.taken_date || '未知'}</span>
                </div>
                <div>
                  <span className="text-gray-500">评分:</span>
                  <span className="ml-2 text-gray-900">{photo.rating || 0}/5</span>
                </div>
                <div>
                  <span className="text-gray-500">胶卷:</span>
                  <span className="ml-2 text-gray-900">{photo.film_roll_name || '未知'}</span>
                </div>
                <div>
                  <span className="text-gray-500">照片序号:</span>
                  <span className="ml-2 text-gray-900">{photo.photo_serial_number || photo.photo_number}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetail;
