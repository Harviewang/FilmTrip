import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const FilmStockManagement = () => {
  const [filmStocks, setFilmStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterFormat, setFilterFormat] = useState('');
  const [filterType, setFilterType] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const [formData, setFormData] = useState({
    brand: '',
    series: '',
    iso: '',
    format: '',
    type: '',
    description: '',
    package_image: null,
    cartridge_image: null
  });

  // 获取胶卷品类列表
  const fetchFilmStocks = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });
      
      if (searchTerm) params.append('brand', searchTerm);
      if (filterBrand) params.append('brand', filterBrand);
      if (filterFormat) params.append('format', filterFormat);
      if (filterType) params.append('type', filterType);

      const response = await fetch(`http://localhost:3001/api/filmStocks?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setFilmStocks(data.filmStocks);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('获取胶卷品类失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 创建或更新胶卷品类
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = editingStock 
        ? `http://localhost:3001/api/filmStocks/${editingStock.id}`
        : 'http://localhost:3001/api/filmStocks';
      
      const method = editingStock ? 'PUT' : 'POST';
      
      // 使用 FormData 处理图片上传
      const formDataToSend = new FormData();
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('series', formData.series);
      formDataToSend.append('iso', formData.iso);
      formDataToSend.append('format', formData.format);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('description', formData.description || '');
      
      if (formData.package_image) {
        formDataToSend.append('package_image', formData.package_image);
      }
      if (formData.cartridge_image) {
        formDataToSend.append('cartridge_image', formData.cartridge_image);
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowModal(false);
        setEditingStock(null);
        resetForm();
        fetchFilmStocks(pagination.page);
      } else {
        alert(data.message || '操作失败');
      }
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败');
    }
  };

  // 删除胶卷品类
  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个胶卷品类吗？')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/filmStocks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchFilmStocks(pagination.page);
      } else {
        alert(data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    }
  };

  // 编辑胶卷品类
  const handleEdit = (stock) => {
    setEditingStock(stock);
    setFormData({
      brand: stock.brand,
      series: stock.series,
      iso: stock.iso.toString(),
      format: stock.format,
      type: stock.type,
      description: stock.description || '',
      package_image: null,
      cartridge_image: null
    });
    setShowModal(true);
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      brand: '',
      series: '',
      iso: '',
      format: '',
      type: '',
      description: '',
      package_image: null,
      cartridge_image: null
    });
  };

  // 打开创建模态框
  const openCreateModal = () => {
    setEditingStock(null);
    resetForm();
    setShowModal(true);
  };

  // 关闭模态框
  const closeModal = () => {
    setShowModal(false);
    setEditingStock(null);
    resetForm();
  };

  // 搜索和筛选
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchFilmStocks(1);
  };

  // 分页
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
    fetchFilmStocks(page);
  };

  useEffect(() => {
    fetchFilmStocks();
  }, []);

  return (
    <div className="p-6">
      {/* 页面标题和操作按钮 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">胶卷品类管理</h1>
          <p className="text-gray-600">管理您的胶卷品类</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          新增胶卷品类
        </button>
      </div>

      {/* 搜索和过滤 */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索品牌或系列名称"
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <select
              value={filterFormat}
              onChange={(e) => setFilterFormat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">全部规格</option>
              <option value="135mm">135mm</option>
              <option value="120mm">120mm</option>
              <option value="4x5">4x5</option>
              <option value="8x10">8x10</option>
            </select>
          </div>
          
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">全部类型</option>
              <option value="彩色负片">彩色负片</option>
              <option value="彩色正片">彩色正片</option>
              <option value="黑白负片">黑白负片</option>
              <option value="黑白正片">黑白正片</option>
            </select>
          </div>
          
          <div>
            <button
              onClick={handleSearch}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              搜索
            </button>
          </div>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">胶卷品类列表</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  品牌
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  系列
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ISO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  规格
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  描述
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    加载中...
                  </td>
                </tr>
              ) : filmStocks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    暂无数据
                  </td>
                </tr>
              ) : (
                filmStocks.map((stock) => (
                  <tr key={stock.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center space-x-3">
                        {stock.package_image ? (
                          <img 
                            src={`http://localhost:3001${stock.package_image}`}
                            alt={`${stock.brand} ${stock.series}`}
                            className="h-8 w-8 object-cover rounded"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : null}
                        <span>{stock.brand}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stock.series}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stock.iso}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stock.format}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stock.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {stock.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(stock)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(stock.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                显示第 {((pagination.page - 1) * pagination.limit) + 1} 到{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} 条，
                共 {pagination.total} 条记录
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  {pagination.page} / {pagination.pages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 创建/编辑模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingStock ? '编辑胶卷品类' : '新增胶卷品类'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    品牌 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="如：Kodak"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    系列 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.series}
                    onChange={(e) => setFormData({...formData, series: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="如：Gold"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ISO *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.iso}
                    onChange={(e) => setFormData({...formData, iso: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="如：200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    规格 *
                  </label>
                  <select
                    required
                    value={formData.format}
                    onChange={(e) => setFormData({...formData, format: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">选择规格</option>
                    <option value="135mm">135mm</option>
                    <option value="120mm">120mm</option>
                    <option value="4x5">4x5</option>
                    <option value="8x10">8x10</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    类型 *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">选择类型</option>
                    <option value="彩色负片">彩色负片</option>
                    <option value="彩色正片">彩色正片</option>
                    <option value="黑白负片">黑白负片</option>
                    <option value="黑白正片">黑白正片</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    外包装图片
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({...formData, package_image: e.target.files[0]})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">支持 JPG, PNG, GIF 格式</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    胶卷暗盒图片
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({...formData, cartridge_image: e.target.files[0]})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">支持 JPG, PNG, GIF 格式</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="胶卷描述信息"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {editingStock ? '更新' : '创建'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilmStockManagement;
