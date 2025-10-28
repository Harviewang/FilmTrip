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
import ImageRotateControl from '../components/ImageRotateControl';
import MapPicker from '../components/MapPicker';

const PhotoManagement = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFilmRoll, setFilterFilmRoll] = useState('');
  const [filterCamera, setFilterCamera] = useState('');
  const [filterEncryption, setFilterEncryption] = useState('all'); // 新增：加密状态过滤
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showBatchUploadModal, setShowBatchUploadModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [filmRolls, setFilmRolls] = useState([]);
  const [cameras, setCameras] = useState([]);
  // 完全隔离的状态管理
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    film_roll_id: '',
    camera_id: '',
    taken_date: '',
    location_name: '',
    latitude: '',
    longitude: '',
    country: '',
    province: '',
    city: '',
    district: '',
    township: '',
    tags: '',
    file: null,
    is_protected: false,
    protection_level: '',
    rotation: 0
  });
  
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    film_roll_id: '',
    camera_id: '',
    taken_date: '',
    location_name: '',
    latitude: '',
    longitude: '',
    country: '',
    province: '',
    city: '',
    district: '',
    township: '',
    tags: '',
    file: null,
    is_protected: false,
    protection_level: '',
    rotation: 0
  });
  
  const [batchUploadForm, setBatchUploadForm] = useState({
    film_roll_id: '',
    camera_id: '',
    location_name: '',
    tags: '',
    is_protected: false,
    protection_level: '',
    files: []
  });
  const [batchFileRotations, setBatchFileRotations] = useState({}); // 批量上传时每个文件的旋转角度 {fileIndex: rotation}
  const [previewUrl, setPreviewUrl] = useState(null); // 图片预览 URL

  // 重置表单的辅助函数
  const resetUploadForm = () => {
    setUploadForm({
      title: '',
      description: '',
      film_roll_id: '',
      camera_id: '',
      taken_date: '',
      location_name: '',
      latitude: '',
      longitude: '',
      country: '',
      province: '',
      city: '',
      district: '',
      township: '',
      tags: '',
      file: null,
      is_protected: false,
      protection_level: '',
      rotation: 0
    });
  };

  const resetEditForm = () => {
    setEditForm({
      title: '',
      description: '',
      film_roll_id: '',
      camera_id: '',
      taken_date: '',
      location_name: '',
      tags: '',
      file: null,
      is_protected: false,
      protection_level: '',
      rotation: 0
    });
  };

  const resetBatchUploadForm = () => {
    setBatchUploadForm({
      film_roll_id: '',
      camera_id: '',
      location_name: '',
      tags: '',
      is_protected: false,
      protection_level: '',
      files: []
    });
  };

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
        // API返回的是 { filmRolls: [...] } 结构
        const filmRollsData = data.filmRolls || [];
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
        const camerasData = data.cameras || [];
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
      // 新增：地址相关字段
      if (uploadForm.latitude) formData.append('latitude', uploadForm.latitude);
      if (uploadForm.longitude) formData.append('longitude', uploadForm.longitude);
      if (uploadForm.country) formData.append('country', uploadForm.country);
      if (uploadForm.province) formData.append('province', uploadForm.province);
      if (uploadForm.city) formData.append('city', uploadForm.city);
      if (uploadForm.district) formData.append('district', uploadForm.district);
      if (uploadForm.township) formData.append('township', uploadForm.township);
      formData.append('tags', uploadForm.tags || '');
      formData.append('photo', uploadForm.file);
      formData.append('is_protected', uploadForm.is_protected ? '1' : '0');
      formData.append('protection_level', uploadForm.protection_level || '');
      formData.append('rotation', uploadForm.rotation || '0');
      
      console.log('FormData内容:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      console.log('调用照片上传API...');
      const response = await photoApi.uploadPhoto(formData);
      console.log('照片上传成功:', response);
      
      setShowUploadModal(false);
      resetUploadForm(); // 重置上传表单
      // 清理预览URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setUploadForm({
        title: '',
        description: '',
        film_roll_id: '',
        camera_id: '',
        taken_date: '',
        location_name: '',
        latitude: '',
        longitude: '',
        country: '',
        province: '',
        city: '',
        district: '',
        township: '',
        tags: '',
        file: null,
        is_protected: false,
        protection_level: '',
        rotation: 0
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
    console.log('编辑表单数据:', editForm);
    console.log('选中的照片:', selectedPhoto);
    
    try {
      console.log('调用照片更新API...');
      const response = await photoApi.updatePhoto(selectedPhoto.id, editForm);
      console.log('照片更新成功:', response);
      
      setShowEditModal(false);
      resetEditForm(); // 重置编辑表单
      setSelectedPhoto(null);
      setPreviewUrl(null);
      
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

  // 处理删除照片
  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这张照片吗？此操作不可恢复。')) {
      return;
    }

    try {
      console.log('=== 开始删除照片 ===');
      console.log('照片ID:', id);
      
      const response = await photoApi.deletePhoto(id);
      console.log('删除响应:', response);
      
      if (response.data.success) {
        alert('照片删除成功');
        fetchPhotos(); // 刷新列表
      } else {
        throw new Error(response.data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除照片失败:', error);
      setError(error.response?.data?.message || '删除照片失败');
      alert('删除照片失败: ' + (error.response?.data?.message || error.message));
    }
  };

  // 处理批量照片上传
  const handleBatchUpload = async (e) => {
    e.preventDefault();
    console.log('=== 开始批量上传照片 ===');
    console.log('批量上传表单数据:', batchUploadForm);
    
    // 前端验证
    if (!batchUploadForm.film_roll_id.trim()) {
      setError('胶卷实例为必填字段');
      return;
    }
    
    if (!batchUploadForm.files || batchUploadForm.files.length === 0) {
      setError('请至少选择一张照片文件');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('film_roll_id', batchUploadForm.film_roll_id.trim());
      formData.append('camera_id', batchUploadForm.camera_id || '');
      formData.append('location_name', batchUploadForm.location_name || '');
      formData.append('tags', batchUploadForm.tags || '');
      console.log('批量上传 is_protected 值:', batchUploadForm.is_protected);
      formData.append('is_protected', batchUploadForm.is_protected ? '1' : '0');
      formData.append('protection_level', batchUploadForm.protection_level || '');
      
      // 添加多个文件和对应的旋转角度
      batchUploadForm.files.forEach((file, index) => {
        formData.append('photos', file);
        formData.append(`rotation_${index}`, batchFileRotations[index] || 0);
      });
      
      console.log('批量上传FormData文件数量:', batchUploadForm.files.length);
      console.log('调用批量上传API...');
      const response = await photoApi.uploadPhotosBatch(formData);
      console.log('批量上传成功:', response);
      
      setShowBatchUploadModal(false);
      resetBatchUploadForm(); // 重置批量上传表单
      setBatchFileRotations({}); // 清理旋转状态
      
      console.log('刷新照片列表...');
      await fetchPhotos();
      console.log('照片列表刷新完成');
    } catch (err) {
      console.error('批量上传照片失败:', err);
      console.error('错误详情:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError('批量上传照片失败');
    }
  };

  // 初始化：获取数据
  useEffect(() => {
    fetchPhotos();
    fetchFilmRolls();
    fetchCameras();
  }, []); // 只在组件挂载时执行一次

  // 过滤照片
  const filteredPhotos = Array.isArray(photos) ? photos.filter(photo => {
    const matchesSearch = photo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photo.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilmRoll = !filterFilmRoll || photo.film_roll_id === filterFilmRoll;
    const matchesCamera = !filterCamera || photo.camera_id === filterCamera;
    
    // 新增：加密状态过滤
    let matchesEncryption = true;
    if (filterEncryption === 'encrypted') {
      matchesEncryption = photo.is_protected || photo.effective_protection;
    } else if (filterEncryption === 'public') {
      matchesEncryption = !photo.is_protected && !photo.effective_protection;
    }
    
    return matchesSearch && matchesFilmRoll && matchesCamera && matchesEncryption;
  }) : [];

  if (loading && photos.length === 0) {
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
        <div className="flex gap-3">
          <button
            onClick={() => {
              // 重置批量上传表单状态，确保加密选项默认为 false
              setBatchUploadForm({
                film_roll_id: '',
                camera_id: '',
                location_name: '',
                tags: '',
                is_protected: false,
                protection_level: '',
                files: []
              });
              setShowBatchUploadModal(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            批量上传
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            上传照片
          </button>
        </div>
      </div>

      {/* 搜索和过滤 */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
          <select
            value={filterEncryption}
            onChange={(e) => setFilterEncryption(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">全部照片</option>
            <option value="public">仅公开照片</option>
            <option value="encrypted">仅加密照片</option>
          </select>
          <button 
            onClick={() => {
              setSearchTerm('');
              setFilterFilmRoll('');
              setFilterCamera('');
              setFilterEncryption('all');
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center gap-2"
          >
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
                {photo.thumbnail ? (
                  <img 
                    src={`http://localhost:3001${photo.thumbnail}`}
                    alt={photo.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // 如果缩略图加载失败，显示相机图标
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (photo.effective_protection === 1 || photo.effective_protection === true || photo.is_protected === 1 || photo.is_protected === true) ? (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <div className="text-4xl mb-2">🔒</div>
                    <div className="text-sm text-center font-medium">加密内容</div>
                    <div className="text-xs text-center mt-1">
                      {(() => {
                        const level = photo.protection_level;
                        if (level === 'personal') return '个人隐私';
                        if (level === 'sensitive') return '敏感内容';
                        if (level === 'restricted') return '严格限制';
                        if (level === 'portrait') return '肖像权保护';
                        if (level === 'other') return '其他原因';
                        return '需要管理员权限';
                      })()}
                    </div>
                  </div>
                ) : null}
                <div className={`text-gray-400 text-4xl ${photo.thumbnail ? 'hidden' : 'flex'} items-center justify-center`}>
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
                  <div className="flex items-center gap-2">
                    {(photo.effective_protection === 1 || photo.effective_protection === true || photo.is_protected === 1 || photo.is_protected === true) && (
                      <span className="text-red-500 text-xs" title="隐私保护已启用">🔒</span>
                    )}
                    <span>{photo.date ? new Date(photo.date).toLocaleDateString() : '未知日期'}</span>
                  </div>
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
                      setEditForm({
                        title: photo.title || '',
                        description: photo.description || '',
                        film_roll_id: photo.film_roll_id || '',
                        camera_id: photo.camera_id || '',
                        taken_date: photo.taken_date ? photo.taken_date.split('T')[0] : '',
                        location_name: photo.location_name || '',
                        tags: photo.tags || '',
                        file: null, // 清空文件
                        is_protected: photo.is_protected === 1 || photo.is_protected === true,
                        protection_level: photo.protection_level || '',
                        rotation: photo.rotation || 0
                      });
                      // 设置预览为现有照片
                      if (photo.size1024 || photo.thumbnail) {
                        setPreviewUrl(`http://localhost:3001${photo.size1024 || photo.thumbnail}`);
                      }
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* 弹窗内容区域 */}
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold mb-4">上传照片</h2>
              <form id="upload-form" onSubmit={handleUpload}>
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
                    placeholder="请输入拍摄地点（或使用地图选点）"
                  />
                </div>

                {/* 地图选点器 */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    地图选点
                  </h3>
                  <MapPicker
                    onLocationSelect={(addressData) => {
                      setUploadForm({
                        ...uploadForm,
                        latitude: addressData.latitude || '',
                        longitude: addressData.longitude || '',
                        country: addressData.country || '',
                        province: addressData.province || '',
                        city: addressData.city || '',
                        district: addressData.district || '',
                        township: addressData.township || '',
                        location_name: addressData.location_name || uploadForm.location_name
                      });
                    }}
                    initialLatitude={uploadForm.latitude || null}
                    initialLongitude={uploadForm.longitude || null}
                  />
                  
                  {/* 显示解析的地址 */}
                  {(uploadForm.country || uploadForm.province || uploadForm.city) && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">解析的地址：</div>
                      <div className="text-sm text-gray-800">
                        {[uploadForm.country, uploadForm.province, uploadForm.city, uploadForm.district, uploadForm.township]
                          .filter(Boolean)
                          .join(' / ')}
                      </div>
                    </div>
                  )}
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

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    🔒 隐私保护设置
                    <span className="text-xs text-gray-500">(可选)</span>
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="is_protected"
                          checked={uploadForm.is_protected || false}
                          onChange={(e) => {
                            console.log('加密选项变化:', e.target.checked);
                            setUploadForm({...uploadForm, is_protected: e.target.checked});
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">启用隐私保护</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1 ml-6">
                        启用后普通用户无法查看原图，管理员可正常访问
                      </p>
                    </div>

                    {uploadForm.is_protected && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          保护级别
                        </label>
                        <select
                          name="protection_level"
                          value={uploadForm.protection_level}
                          onChange={(e) => setUploadForm({...uploadForm, protection_level: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">选择保护级别</option>
                          <option value="personal">个人隐私</option>
                          <option value="sensitive">敏感内容</option>
                          <option value="restricted">严格限制</option>
                          <option value="portrait">他人肖像权</option>
                          <option value="other">其他原因</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          选择合适的保护级别，帮助管理员更好地管理内容
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    照片文件 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    name="file"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setUploadForm({...uploadForm, file});
                      // 生成预览URL
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setPreviewUrl(url);
                      } else {
                        setPreviewUrl(null);
                      }
                    }}
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {uploadForm.file && previewUrl && (
                    <div className="mt-4">
                      <ImageRotateControl
                        previewUrl={previewUrl}
                        rotation={uploadForm.rotation}
                        onRotationChange={(newRotation) => setUploadForm({...uploadForm, rotation: newRotation})}
                        fileName={uploadForm.file.name}
                      />
                    </div>
                  )}
                </div>
                </div>
              </form>
            </div>
            
            {/* 固定底部按钮 */}
            <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
              <button
                type="submit"
                form="upload-form"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
              >
                上传
              </button>
              <button
                type="button"
                onClick={() => {
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                  }
                  setShowUploadModal(false);
                  resetUploadForm(); // 重置上传表单
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg"
              >
                取消
              </button>
            </div>
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
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">胶卷实例</label>
                    <select
                      value={editForm.film_roll_id}
                      onChange={(e) => setEditForm({...editForm, film_roll_id: e.target.value})}
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
                      value={editForm.taken_date}
                      onChange={(e) => setEditForm({...editForm, taken_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">拍摄地点</label>
                  <input
                    type="text"
                    value={editForm.location_name}
                    onChange={(e) => setEditForm({...editForm, location_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
                  <input
                    type="text"
                    value={editForm.tags}
                    onChange={(e) => setEditForm({...editForm, tags: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="用逗号分隔多个标签"
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">🔄 照片旋转</h3>
                  {previewUrl && (
                    <ImageRotateControl
                      previewUrl={previewUrl}
                      rotation={editForm.rotation}
                      onRotationChange={(newRotation) => setEditForm({...editForm, rotation: newRotation})}
                    />
                  )}
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    🔒 隐私保护设置
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editForm.is_protected}
                          onChange={(e) => setEditForm({...editForm, is_protected: e.target.checked})}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">启用隐私保护</span>
                      </label>
                    </div>

                    {editForm.is_protected && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          保护级别
                        </label>
                        <select
                          value={editForm.protection_level}
                          onChange={(e) => setEditForm({...editForm, protection_level: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">选择保护级别</option>
                          <option value="personal">个人隐私</option>
                          <option value="sensitive">敏感内容</option>
                          <option value="restricted">严格限制</option>
                          <option value="portrait">他人肖像权</option>
                          <option value="other">其他原因</option>
                        </select>
                      </div>
                    )}
                  </div>
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
                  onClick={() => {
                    setPreviewUrl(null);
                    setShowEditModal(false);
                    resetEditForm(); // 重置编辑表单
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 批量上传照片模态框 */}
      {showBatchUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">批量上传照片</h2>
            <form onSubmit={handleBatchUpload}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    胶卷实例 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="film_roll_id"
                    value={batchUploadForm.film_roll_id}
                    onChange={(e) => {
                      const selectedRollId = e.target.value;
                      const selectedRoll = filmRolls.find(roll => roll.id === selectedRollId);
                      setBatchUploadForm({
                        ...batchUploadForm,
                        film_roll_id: selectedRollId,
                        camera_id: selectedRoll?.camera_id || ''
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
                      if (!batchUploadForm.film_roll_id) return '';
                      const selectedRoll = filmRolls.find(roll => roll.id === batchUploadForm.film_roll_id);
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
                    拍摄地点
                  </label>
                  <input
                    type="text"
                    name="location_name"
                    value={batchUploadForm.location_name}
                    onChange={(e) => setBatchUploadForm({...batchUploadForm, location_name: e.target.value})}
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
                    value={batchUploadForm.tags}
                    onChange={(e) => setBatchUploadForm({...batchUploadForm, tags: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="用逗号分隔多个标签"
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    🔒 隐私保护设置
                    <span className="text-xs text-gray-500">(可选)</span>
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="is_protected"
                          checked={batchUploadForm.is_protected || false}
                          onChange={(e) => {
                            console.log('批量上传加密选项变化:', e.target.checked);
                            setBatchUploadForm({...batchUploadForm, is_protected: e.target.checked});
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">启用隐私保护</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1 ml-6">
                        启用后普通用户无法查看原图，管理员可正常访问
                      </p>
                    </div>

                    {batchUploadForm.is_protected && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          保护级别
                        </label>
                        <select
                          name="protection_level"
                          value={batchUploadForm.protection_level}
                          onChange={(e) => setBatchUploadForm({...batchUploadForm, protection_level: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">选择保护级别</option>
                          <option value="personal">个人隐私</option>
                          <option value="sensitive">敏感内容</option>
                          <option value="restricted">严格限制</option>
                          <option value="portrait">他人肖像权</option>
                          <option value="other">其他原因</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          选择合适的保护级别，帮助管理员更好地管理内容
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    照片文件 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    name="files"
                    multiple
                    accept="image/*"
                    onChange={(e) => setBatchUploadForm({...batchUploadForm, files: Array.from(e.target.files)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {batchUploadForm.files && batchUploadForm.files.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        已选择 {batchUploadForm.files.length} 张照片，请逐个调整方向:
                      </p>
                      <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                        {batchUploadForm.files.map((file, index) => (
                          <ImageRotateControl
                            key={index}
                            previewUrl={URL.createObjectURL(file)}
                            rotation={batchFileRotations[index] || 0}
                            onRotationChange={(newRotation) => {
                              setBatchFileRotations({
                                ...batchFileRotations,
                                [index]: newRotation
                              });
                            }}
                            fileName={file.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
                >
                  批量上传
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBatchUploadModal(false);
                    resetBatchUploadForm(); // 重置批量上传表单
                    setBatchFileRotations({});
                  }}
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
                {selectedPhoto.original ? (
                  <img 
                    src={`http://localhost:3001${selectedPhoto.original}`}
                    alt={selectedPhoto.title} 
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      // 如果原图加载失败，尝试加载缩略图
                      if (selectedPhoto.thumbnail) {
                        e.target.src = `http://localhost:3001${selectedPhoto.thumbnail}`;
                        e.target.onerror = () => {
                          // 如果缩略图也失败，显示相机图标
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        };
                      } else {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : (selectedPhoto.effective_protection === 1 || selectedPhoto.effective_protection === true || selectedPhoto.is_protected === 1 || selectedPhoto.is_protected === true) ? (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <div className="text-6xl mb-4">🔒</div>
                    <div className="text-lg text-center font-medium">加密保护内容</div>
                    <div className="text-sm text-center mt-2">
                      {(() => {
                        const level = selectedPhoto.protection_level;
                        if (level === 'personal') return '此照片包含个人隐私内容';
                        if (level === 'sensitive') return '此照片包含敏感内容';
                        if (level === 'restricted') return '此照片严格限制访问';
                        if (level === 'portrait') return '此照片涉及他人肖像权';
                        if (level === 'other') return '此照片已被管理员加密';
                        return '需要管理员权限查看';
                      })()}
                    </div>
                  </div>
                ) : null}
                <div className={`text-gray-400 text-6xl ${selectedPhoto.original ? 'hidden' : 'flex'} items-center justify-center`}>
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
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">隐私保护</h3>
                    <div className="flex items-center gap-2">
                      {(selectedPhoto.effective_protection === 1 || selectedPhoto.effective_protection === true || selectedPhoto.is_protected === 1 || selectedPhoto.is_protected === true) ? (
                        <>
                          <span className="text-red-500">🔒</span>
                          <span className="text-red-700 font-medium">已启用</span>
                          {selectedPhoto.protection_level && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              {selectedPhoto.protection_level === 'personal' ? '个人隐私' :
                               selectedPhoto.protection_level === 'sensitive' ? '敏感内容' :
                               selectedPhoto.protection_level === 'restricted' ? '严格限制' : selectedPhoto.protection_level}
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="text-green-500">🔓</span>
                          <span className="text-green-700">公开</span>
                        </>
                      )}
                    </div>
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
