import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { photoApi } from '../services/api';

const PhotoManagement = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFilmRoll, setFilterFilmRoll] = useState('');
  const [filterCamera, setFilterCamera] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [filmRolls, setFilmRolls] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    film_roll_id: '',
    camera_id: '',
    taken_date: '',
    location_name: '',
    tags: '',
    file: null
  });

  // 获取照片列表
  useEffect(() => {
    fetchPhotos();
    fetchFilmRolls();
    fetchCameras();
  }, []);

  const fetchPhotos = async () => {
    try {
      console.log('=== 开始获取照片列表 ===');
      setLoading(true);
      
      const response = await photoApi.getAllPhotos();
      console.log('获取照片列表响应:', response);
      console.log('响应数据结构:', {
        data: response.data,
        success: response.data?.success,
        photosArray: response.data?.data
      });
      
      // 确保photos是数组，即使API返回空数据
      const photosData = response.data?.data || [];
      console.log('解析后的照片数据:', photosData);
      console.log('是否为数组:', Array.isArray(photosData));
      
      setPhotos(Array.isArray(photosData) ? photosData : []);
      console.log('设置到state的照片数据:', Array.isArray(photosData) ? photosData : []);
      
      setError(null);
    } catch (err) {
      console.error('获取照片失败:', err);
      setError('获取照片列表失败');
      // 确保错误时photos是空数组
      setPhotos([]);
    } finally {
      setLoading(false);
      console.log('=== 获取照片列表完成 ===');
    }
  };

  // 获取胶卷实例列表
  const fetchFilmRolls = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/filmRolls');
      const data = await response.json();
      if (data.success) {
        // API返回的是 { data: { filmRolls: [...] } } 结构
        const filmRollsData = data.data?.filmRolls || data.data || [];
        console.log('获取到的胶卷实例数据:', filmRollsData);
        setFilmRolls(filmRollsData);
      } else {
        console.error('获取胶卷实例失败:', data.message);
        setFilmRolls([]);
      }
    } catch (err) {
      console.error('获取胶卷实例失败:', err);
      setFilmRolls([]);
    }
  };

  // 获取相机列表
  const fetchCameras = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/cameras');
      const data = await response.json();
      if (data.success) {
        // API返回的是 { data: [...] } 结构
        const camerasData = data.data || [];
        console.log('获取到的相机数据:', camerasData);
        setCameras(camerasData);
      } else {
        console.error('获取相机失败:', data.message);
        setCameras([]);
      }
    } catch (err) {
      console.error('获取相机失败:', err);
      setCameras([]);
    }
  };

  // 处理照片上传
  const handleUpload = async (e) => {
    e.preventDefault();
    console.log('=== 开始上传照片 ===');
    console.log('上传表单数据:', uploadForm);
    
    // 前端验证
    if (!uploadForm.title.trim()) {
      setError('标题为必填字段');
      return;
    }
    
    if (!uploadForm.file) {
      setError('请选择要上传的照片文件');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title.trim());
      formData.append('description', uploadForm.description || '');
      formData.append('film_roll_id', uploadForm.film_roll_id || '');
      formData.append('camera_id', uploadForm.camera_id || '');
      formData.append('taken_date', uploadForm.taken_date || '');
      formData.append('location_name', uploadForm.location_name || '');
      formData.append('tags', uploadForm.tags || '');
      formData.append('file', uploadForm.file);
      
      console.log('FormData内容:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      console.log('调用照片上传API...');
      const response = await photoApi.uploadPhoto(formData);
      console.log('照片上传成功:', response);
      
      setShowUploadModal(false);
      setUploadForm({
        title: '',
        description: '',
        film_roll_id: '',
        camera_id: '',
        taken_date: '',
        location_name: '',
        tags: '',
        file: null
      });
      
      console.log('刷新照片列表...');
      await fetchPhotos();
      console.log('照片列表刷新完成');
    } catch (err) {
      console.error('上传照片失败:', err);
      console.error('错误详情:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError('上传照片失败');
    }
  };

  // 处理照片编辑
  const handleEdit = async (e) => {
    e.preventDefault();
    console.log('=== 开始编辑照片 ===');
    console.log('编辑表单数据:', uploadForm);
    console.log('选中的照片:', selectedPhoto);
    
    try {
      console.log('调用照片更新API...');
      const response = await photoApi.updatePhoto(selectedPhoto.id, uploadForm);
      console.log('照片更新成功:', response);
      
      setShowEditModal(false);
      setSelectedPhoto(null);
      
      console.log('刷新照片列表...');
      await fetchPhotos();
      console.log('照片列表刷新完成');
    } catch (err) {
      console.error('更新照片失败:', err);
      console.error('错误详情:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError('更新照片失败');
    }
  };

  // 处理照片删除
  const handleDelete = async (photoId) => {
    if (window.confirm('确定要删除这张照片吗？')) {
      console.log('=== 开始删除照片 ===');
      console.log('要删除的照片ID:', photoId);
      
      try {
        console.log('调用API删除照片...');
        const response = await photoApi.deletePhoto(photoId);
        console.log('删除照片成功:', response);
        
        console.log('刷新照片列表...');
        await fetchPhotos();
        console.log('照片列表刷新完成');
      } catch (err) {
        console.error('删除照片失败:', err);
        console.error('错误详情:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError('删除照片失败');
      }
    }
  };

  // 过滤照片
  const filteredPhotos = Array.isArray(photos) ? photos.filter(photo => {
    const matchesSearch = photo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photo.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilmRoll = !filterFilmRoll || photo.film_roll_id === filterFilmRoll;
    const matchesCamera = !filterCamera || photo.camera_id === filterCamera;
    
    return matchesSearch && matchesFilmRoll && matchesCamera;
  }) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 页面标题和操作按钮 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">作品管理</h1>
          <p className="text-gray-600">管理您的胶片摄影作品</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          上传照片
        </button>
      </div>

      {/* 搜索和过滤 */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="搜索照片..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterFilmRoll}
            onChange={(e) => setFilterFilmRoll(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">所有胶卷实例</option>
            {Array.isArray(filmRolls) && filmRolls.map(roll => (
              <option key={roll.id} value={roll.id}>
                {roll.roll_number} - {roll.name}
              </option>
            ))}
          </select>
          <select
            value={filterCamera}
            onChange={(e) => setFilterCamera(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">所有相机</option>
            {Array.isArray(cameras) && cameras.map(camera => (
              <option key={camera.id} value={camera.id}>
                {camera.brand} {camera.model}
              </option>
            ))}
          </select>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center gap-2">
            <FunnelIcon className="h-5 w-5" />
            重置过滤
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* 照片网格 */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📷</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无照片</h3>
          <p className="text-gray-600">开始上传您的第一张胶片照片吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPhotos.map((photo) => (
            <div key={photo.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {photo.filename ? (
                  <img 
                    src={`http://localhost:3001/uploads/${photo.filename}`}
                    alt={photo.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // 如果原图加载失败，尝试加载缩略图
                      e.target.src = `http://localhost:3001/uploads/thumbnails/${photo.id}_thumb.jpg`;
                      e.target.onerror = () => {
                        // 如果缩略图也失败，显示相机图标
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      };
                    }}
                  />
                ) : null}
                <div className={`text-gray-400 text-4xl ${photo.filename ? 'hidden' : 'flex'} items-center justify-center`}>
                  📷
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-2 truncate">{photo.title || '无标题'}</h3>
                {photo.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{photo.description}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>{photo.film_roll_id ? '胶卷实例' : '未知胶片'}</span>
                  <span>{photo.taken_date ? new Date(photo.taken_date).toLocaleDateString() : '未知日期'}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedPhoto(photo);
                      setShowViewModal(true);
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg flex items-center justify-center gap-1"
                  >
                    <EyeIcon className="h-4 w-4" />
                    查看
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPhoto(photo);
                      setUploadForm({
                        title: photo.title || '',
                        description: photo.description || '',
                        film_roll_id: photo.film_roll_id || '',
                        camera_id: photo.camera_id || '',
                        taken_date: photo.taken_date ? photo.taken_date.split('T')[0] : '',
                        location_name: photo.location_name || '',
                        tags: photo.tags || '',
                        file: null // 清空文件
                      });
                      setShowEditModal(true);
                    }}
                    className="px-3 py-2 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 上传照片模态框 */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">上传照片</h2>
            <form onSubmit={handleUpload}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    标题 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入照片标题"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <textarea
                    name="description"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入照片描述"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    胶卷实例 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="film_roll_id"
                    value={uploadForm.film_roll_id}
                    onChange={(e) => {
                      const selectedRollId = e.target.value;
                      const selectedRoll = filmRolls.find(roll => roll.id === selectedRollId);
                      setUploadForm({
                        ...uploadForm, 
                        film_roll_id: selectedRollId,
                        camera_id: selectedRoll?.camera_id || '' // 自动设置相机
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">选择胶卷实例</option>
                    {Array.isArray(filmRolls) && filmRolls.map(roll => (
                      <option key={roll.id} value={roll.id}>
                        {roll.roll_number} - {roll.name} {roll.camera_id ? `(${roll.camera_name || '已选相机'})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    相机 <span className="text-gray-500 text-xs">(自动从胶卷实例获取)</span>
                  </label>
                  <input
                    type="text"
                    value={(() => {
                      if (!uploadForm.film_roll_id) return '';
                      const selectedRoll = filmRolls.find(roll => roll.id === uploadForm.film_roll_id);
                      if (selectedRoll?.camera_id) {
                        const camera = cameras.find(c => c.id === selectedRoll.camera_id);
                        return camera ? `${camera.brand} ${camera.model}` : '未知相机';
                      }
                      return '未选择相机';
                    })()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    disabled
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    拍摄日期
                  </label>
                  <input
                    type="date"
                    name="taken_date"
                    value={uploadForm.taken_date}
                    onChange={(e) => setUploadForm({...uploadForm, taken_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    拍摄地点
                  </label>
                  <input
                    type="text"
                    name="location_name"
                    value={uploadForm.location_name}
                    onChange={(e) => setUploadForm({...uploadForm, location_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入拍摄地点"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    标签
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="用逗号分隔多个标签"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    照片文件 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    name="file"
                    onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})}
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {uploadForm.file && (
                    <p className="mt-1 text-sm text-gray-500">
                      已选择: {uploadForm.file.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                >
                  上传
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 编辑照片模态框 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">编辑照片</h2>
            <form onSubmit={handleEdit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">胶卷实例</label>
                    <select
                      value={uploadForm.film_roll_id}
                      onChange={(e) => setUploadForm({...uploadForm, film_roll_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">选择胶卷实例</option>
                      {Array.isArray(filmRolls) && filmRolls.map(roll => (
                        <option key={roll.id} value={roll.id}>
                          {roll.roll_number} - {roll.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">拍摄日期</label>
                    <input
                      type="date"
                      value={uploadForm.taken_date}
                      onChange={(e) => setUploadForm({...uploadForm, taken_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">拍摄地点</label>
                  <input
                    type="text"
                    value={uploadForm.location_name}
                    onChange={(e) => setUploadForm({...uploadForm, location_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
                  <input
                    type="text"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="用逗号分隔多个标签"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 查看照片模态框 */}
      {showViewModal && selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{selectedPhoto.title || '无标题'}</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-square bg-gray-100 flex items-center justify-center rounded-lg">
                {selectedPhoto.filename ? (
                  <img 
                    src={`http://localhost:3001/uploads/${selectedPhoto.filename}`}
                    alt={selectedPhoto.title} 
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      // 如果原图加载失败，尝试加载缩略图
                      e.target.src = `http://localhost:3001/uploads/thumbnails/${selectedPhoto.id}_thumb.jpg`;
                      e.target.onerror = () => {
                        // 如果缩略图也失败，显示相机图标
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      };
                    }}
                  />
                ) : null}
                <div className={`text-gray-400 text-6xl ${selectedPhoto.filename ? 'hidden' : 'flex'} items-center justify-center`}>
                  📷
                </div>
              </div>
              <div className="space-y-4">
                {selectedPhoto.description && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">描述</h3>
                    <p className="text-gray-600">{selectedPhoto.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">胶卷实例</h3>
                    <p className="text-gray-600">{selectedPhoto.film_roll_id ? '已关联胶卷实例' : '未关联'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">拍摄日期</h3>
                    <p className="text-gray-600">
                      {selectedPhoto.taken_date ? new Date(selectedPhoto.taken_date).toLocaleDateString() : '未知'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">拍摄地点</h3>
                    <p className="text-gray-600">{selectedPhoto.location_name || '未知'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">上传时间</h3>
                    <p className="text-gray-600">
                      {selectedPhoto.uploaded_at ? new Date(selectedPhoto.uploaded_at).toLocaleDateString() : '未知'}
                    </p>
                  </div>
                </div>
                {selectedPhoto.tags && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">标签</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPhoto.tags.split(',').map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoManagement;
