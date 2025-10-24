import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CameraIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { cameraApi } from '../services/api';

const CameraManagement = () => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [cameraForm, setCameraForm] = useState({
    name: '',
    model: '',
    brand: '',
    type: '',
    format: '',
    description: '',
    image: null
  });

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      console.log('=== 开始获取相机列表 ===');
      setLoading(true);
      
      const response = await cameraApi.getAllCameras();
      console.log('获取相机列表响应:', response);
      console.log('响应数据结构:', {
        data: response.data,
        success: response.data?.success,
        camerasArray: response.data?.cameras
      });
      
      // 确保cameras是数组
      const camerasData = response.data?.cameras || [];
      console.log('解析后的相机数据:', camerasData);
      console.log('是否为数组:', Array.isArray(camerasData));
      
      setCameras(Array.isArray(camerasData) ? camerasData : []);
      console.log('设置到state的相机数据:', Array.isArray(camerasData) ? camerasData : []);
      
      setError(null);
    } catch (err) {
      console.error('获取相机失败:', err);
      setError('获取相机列表失败');
      setCameras([]);
    } finally {
      setLoading(false);
      console.log('=== 获取相机列表完成 ===');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    console.log('=== 开始创建相机 ===');
    console.log('表单数据:', cameraForm);
    
    try {
      console.log('调用API创建相机...');
      
      // 创建FormData对象来处理文件上传
      const formData = new FormData();
      formData.append('name', cameraForm.name);
      formData.append('model', cameraForm.model);
      formData.append('brand', cameraForm.brand || '');
      formData.append('type', cameraForm.type || '');
      formData.append('format', cameraForm.format || '');
      formData.append('description', cameraForm.description || '');
      
      if (cameraForm.image) {
        formData.append('image', cameraForm.image);
      }
      
      const response = await cameraApi.createCamera(formData);
      console.log('创建相机成功:', response);
      
      setShowCreateModal(false);
      setCameraForm({ name: '', model: '', brand: '', type: '', format: '', description: '', image: null });
      
      console.log('刷新相机列表...');
      await fetchCameras();
      console.log('相机列表刷新完成');
    } catch (err) {
      console.error('创建相机失败:', err);
      console.error('错误详情:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError('创建相机失败');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    console.log('=== 开始编辑相机 ===');
    console.log('编辑表单数据:', cameraForm);
    console.log('选中的相机:', selectedCamera);
    
    try {
      console.log('调用API更新相机...');
      
      // 创建FormData对象来处理文件上传
      const formData = new FormData();
      console.log('=== 构建FormData ===');
      console.log('cameraForm.image:', cameraForm.image);
      console.log('cameraForm.image类型:', typeof cameraForm.image);
      console.log('cameraForm.image是否为File对象:', cameraForm.image instanceof File);
      
      formData.append('name', cameraForm.name);
      formData.append('model', cameraForm.model);
      formData.append('brand', cameraForm.brand || '');
      formData.append('type', cameraForm.type || '');
      formData.append('format', cameraForm.format || '');
      formData.append('description', cameraForm.description || '');
      
      if (cameraForm.image) {
        formData.append('image', cameraForm.image);
        console.log('已添加图片到FormData');
      } else {
        console.log('没有图片添加到FormData');
      }
      
      console.log('FormData内容:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      const response = await cameraApi.updateCamera(selectedCamera.id, formData);
      console.log('更新相机成功:', response);
      
      setShowEditModal(false);
      setSelectedCamera(null);
      
      console.log('刷新相机列表...');
      await fetchCameras();
      console.log('相机列表刷新完成');
    } catch (err) {
      console.error('更新相机失败:', err);
      console.error('错误详情:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError('更新相机失败');
    }
  };

  const handleDelete = async (cameraId) => {
    if (window.confirm('确定要删除这个相机吗？')) {
      console.log('=== 开始删除相机 ===');
      console.log('要删除的相机ID:', cameraId);
      
      try {
        console.log('调用API删除相机...');
        const response = await cameraApi.deleteCamera(cameraId);
        console.log('删除相机成功:', response);
        
        console.log('刷新相机列表...');
        await fetchCameras();
        console.log('相机列表刷新完成');
      } catch (err) {
        console.error('删除相机失败:', err);
        console.error('错误详情:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError('删除相机失败');
      }
    }
  };

  const filteredCameras = Array.isArray(cameras) ? cameras.filter(camera => {
    return camera.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           camera.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           camera.brand?.toLowerCase().includes(searchTerm.toLowerCase());
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">相机管理</h1>
          <p className="text-gray-600">管理您的胶片相机设备</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          添加相机
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="搜索相机..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {filteredCameras.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📷</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无相机</h3>
          <p className="text-gray-600">开始添加您的第一台胶片相机吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCameras.map((camera) => (
            <div key={camera.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                  {camera.image ? (
                    <img 
                      src={`http://localhost:3001${camera.image}`}
                      alt={camera.name}
                      className="h-8 w-8 object-cover rounded"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <CameraIcon className={`h-8 w-8 text-green-500 ${camera.image ? 'hidden' : 'block'}`} />
                  <div>
                    <h3 className="font-semibold text-gray-900">{camera.name}</h3>
                    <p className="text-sm text-gray-500">{camera.brand} {camera.model}</p>
                  </div>
                </div>
                </div>
                
                {camera.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{camera.description}</p>
                )}
                
                <div className="space-y-2 mb-4 text-sm text-gray-500">
                  {camera.type && (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>类型: {camera.type}</span>
                    </div>
                  )}
                  {camera.format && (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>画幅: {camera.format}</span>
                    </div>
                  )}
                  {camera.photo_count > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      <span>已拍: {camera.photo_count} 张</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedCamera(camera);
                      setCameraForm({
                        name: camera.name || '',
                        model: camera.model || '',
                        brand: camera.brand || '',
                        type: camera.type || '',
                        format: camera.format || '',
                        description: camera.description || '',
                        image: null
                      });
                      setShowEditModal(true);
                    }}
                    className="px-3 py-2 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(camera.id)}
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

      {/* 创建相机模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">添加新相机</h2>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    相机名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={cameraForm.name}
                    onChange={(e) => setCameraForm({...cameraForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入相机名称"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    型号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={cameraForm.model}
                    onChange={(e) => setCameraForm({...cameraForm, model: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入相机型号"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    品牌
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={cameraForm.brand}
                    onChange={(e) => setCameraForm({...cameraForm, brand: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入相机品牌"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    类型
                  </label>
                  <select
                    name="type"
                    value={cameraForm.type}
                    onChange={(e) => setCameraForm({...cameraForm, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">选择相机类型</option>
                    <option value="单反相机">单反相机</option>
                    <option value="旁轴相机">旁轴相机</option>
                    <option value="双反相机">双反相机</option>
                    <option value="大画幅相机">大画幅相机</option>
                    <option value="中画幅相机">中画幅相机</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    画幅
                  </label>
                  <select
                    name="format"
                    value={cameraForm.format}
                    onChange={(e) => setCameraForm({...cameraForm, format: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">选择画幅</option>
                    <option value="135">135 (35mm)</option>
                    <option value="120">120 (中画幅)</option>
                    <option value="4x5">4x5 (大画幅)</option>
                    <option value="8x10">8x10 (大画幅)</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <textarea
                    name="description"
                    value={cameraForm.description}
                    onChange={(e) => setCameraForm({...cameraForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入相机描述"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    相机图片
                  </label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={(e) => {
                      console.log('=== 创建模态框 - 文件选择器触发 ===');
                      console.log('选择的文件:', e.target.files[0]);
                      console.log('文件类型:', e.target.files[0]?.type);
                      console.log('文件大小:', e.target.files[0]?.size);
                      setCameraForm({...cameraForm, image: e.target.files[0]});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">支持 JPG, PNG, GIF 格式</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                >
                  添加
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 编辑相机模态框 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">编辑相机</h2>
            <form onSubmit={handleEdit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">相机名称 *</label>
                  <input
                    type="text"
                    value={cameraForm.name}
                    onChange={(e) => setCameraForm({...cameraForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">品牌</label>
                    <input
                      type="text"
                      value={cameraForm.brand}
                      onChange={(e) => setCameraForm({...cameraForm, brand: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">型号</label>
                    <input
                      type="text"
                      value={cameraForm.model}
                      onChange={(e) => setCameraForm({...cameraForm, model: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">相机类型</label>
                    <select
                      value={cameraForm.type}
                      onChange={(e) => setCameraForm({...cameraForm, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">选择类型</option>
                      <option value="单反相机">单反相机</option>
                      <option value="旁轴相机">旁轴相机</option>
                      <option value="双反相机">双反相机</option>
                      <option value="大画幅相机">大画幅相机</option>
                      <option value="中画幅相机">中画幅相机</option>
                      <option value="傻瓜相机">傻瓜相机</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">画幅</label>
                    <select
                      value={cameraForm.format}
                      onChange={(e) => setCameraForm({...cameraForm, format: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">选择画幅</option>
                      <option value="135">135 (35mm)</option>
                      <option value="120">120 (中画幅)</option>
                      <option value="4x5">4x5 (大画幅)</option>
                      <option value="8x10">8x10 (大画幅)</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                  <textarea
                    value={cameraForm.description}
                    onChange={(e) => setCameraForm({...cameraForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    相机图片
                  </label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={(e) => {
                      console.log('=== 编辑模态框 - 文件选择器触发 ===');
                      console.log('选择的文件:', e.target.files[0]);
                      console.log('文件类型:', e.target.files[0]?.type);
                      console.log('文件大小:', e.target.files[0]?.size);
                      setCameraForm({...cameraForm, image: e.target.files[0]});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">支持 JPG, PNG, GIF 格式</p>
                  {cameraForm.image && (
                    <p className="mt-1 text-sm text-gray-500">
                      已选择: {cameraForm.image.name}
                    </p>
                  )}
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
    </div>
  );
};

export default CameraManagement;
