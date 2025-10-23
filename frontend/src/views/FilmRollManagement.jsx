import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const FilmRollManagement = () => {
  const [filmRolls, setFilmRolls] = useState([]);
  const [filmStocks, setFilmStocks] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [scanners, setScanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRoll, setEditingRoll] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStock, setFilterStock] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const [formData, setFormData] = useState({
    film_stock_id: '',
    name: '',
    opened_date: '',
    location: '',
    camera_id: '',
    notes: ''
  });

  // 获取胶卷实例列表
  const fetchFilmRolls = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });
      
      if (searchTerm) params.append('roll_number', searchTerm);
      if (filterStatus) params.append('status', filterStatus);
      if (filterStock) params.append('film_stock_id', filterStock);

      const response = await fetch(`http://localhost:3001/api/filmRolls?${params}`);
      const data = await response.json();
      
      if (data.success) {
        const filmRollsData = data.data || [];
        setFilmRolls(filmRollsData);
        updatePagination(filmRollsData);
      }
    } catch (error) {
      console.error('获取胶卷实例失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取胶卷品类列表
  const fetchFilmStocks = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/filmStocks');
      const data = await response.json();
      if (data.success) {
        const stocksArray = data.data.filmStocks || [];
        setFilmStocks(stocksArray);
      }
    } catch (error) {
      console.error('获取胶卷品类失败:', error);
    }
  };

  // 获取相机列表
  const fetchCameras = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/cameras');
      const data = await response.json();
      if (data.success) {
        const camerasArray = data.data || [];
        setCameras(camerasArray);
      }
    } catch (error) {
      console.error('获取相机列表失败:', error);
    }
  };

  // 获取扫描仪列表
  const fetchScanners = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/scanners');
      const data = await response.json();
      if (data.success) {
        const scannersArray = data.data || [];
        setScanners(scannersArray);
      }
    } catch (error) {
      console.error('获取扫描仪列表失败:', error);
    }
  };

  // 创建或更新胶卷实例
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = editingRoll 
        ? `http://localhost:3001/api/filmRolls/${editingRoll.id}`
        : 'http://localhost:3001/api/filmRolls';
      
      const method = editingRoll ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowModal(false);
        setEditingRoll(null);
        resetForm();
        fetchFilmRolls(pagination.page);
      } else {
        alert(data.message || '操作失败');
      }
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败');
    }
  };

  // 删除胶卷实例
  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个胶卷实例吗？')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/filmRolls/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchFilmRolls(pagination.page);
      } else {
        alert(data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    }
  };

  // 更新状态
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/filmRolls/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchFilmRolls(pagination.page);
      } else {
        alert(data.message || '状态更新失败');
      }
    } catch (error) {
      console.error('状态更新失败:', error);
      alert('状态更新失败');
    }
  };

  // 编辑胶卷实例
  const handleEdit = (roll) => {
    setEditingRoll(roll);
    setFormData({
      film_stock_id: roll.film_stock_id,
      name: roll.name,
      opened_date: roll.opened_date || '',
      location: roll.location || '',
      camera_id: roll.camera_id || '',
      notes: roll.notes || ''
    });
    setShowModal(true);
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      film_stock_id: '',
      name: '',
      opened_date: '',
      location: '',
      camera_id: '',
      notes: ''
    });
  };

  // 打开创建模态框
  const openCreateModal = () => {
    setEditingRoll(null);
    resetForm();
    setShowModal(true);
  };

  // 关闭模态框
  const closeModal = () => {
    setShowModal(false);
    setEditingRoll(null);
    resetForm();
  };

  // 搜索和筛选
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchFilmRolls(1);
  };

  // 分页
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
    // 客户端分页，不需要重新获取数据
  };

  // 获取当前页的数据（客户端分页）
  const getCurrentPageData = () => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return (filmRolls || []).slice(startIndex, endIndex);
  };

  // 更新分页信息
  const updatePagination = (data) => {
    const total = data?.length || 0;
    const pages = Math.ceil(total / pagination.limit);
    setPagination(prev => ({
      ...prev,
      total,
      pages,
      page: Math.min(prev.page, pages) || 1
    }));
  };
  const getStatusBadge = (status) => {
    const statusConfig = {
      '未启封': 'bg-gray-100 text-gray-800',
      '拍摄中': 'bg-blue-100 text-blue-800',
      '已拍摄': 'bg-yellow-100 text-yellow-800',
      '已冲洗': 'bg-purple-100 text-purple-800',
      '已扫描': 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  useEffect(() => {
    fetchFilmRolls();
    fetchFilmStocks();
    fetchCameras();
    fetchScanners();
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">胶卷实例管理</h1>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          新增胶卷实例
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              搜索编号/名称
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="输入胶卷编号或名称"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              状态
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部状态</option>
              <option value="未启封">未启封</option>
              <option value="拍摄中">拍摄中</option>
              <option value="已拍摄">已拍摄</option>
              <option value="已冲洗">已冲洗</option>
              <option value="已扫描">已扫描</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              胶卷品类
            </label>
            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部品类</option>
              {(filmStocks || []).map(stock => (
                <option key={stock.id} value={stock.id}>
                  {stock.brand} {stock.series} {stock.iso}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
              搜索
            </button>
          </div>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">胶卷实例列表</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  编号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  胶卷品类
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  相机
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  启封日期
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
              ) : (filmRolls || []).length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    暂无数据
                  </td>
                </tr>
              ) : (
                getCurrentPageData().map((roll) => (
                  <tr key={roll.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {roll.roll_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {roll.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-3">
                        {roll.package_image ? (
                          <img 
                            src={`http://localhost:3001${roll.package_image}`}
                            alt={`${roll.brand} ${roll.series}`}
                            className="h-8 w-8 object-cover rounded"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : null}
                        <div>
                          <div className="font-medium">{roll.brand} {roll.series}</div>
                          <div className="text-gray-500">{roll.iso} • {roll.format}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(roll.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {roll.camera_name ? `${roll.camera_name} ${roll.camera_model}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {roll.opened_date || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(roll)}
                          className="text-blue-600 hover:text-blue-900"
                          title="编辑"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(roll.id)}
                          className="text-red-600 hover:text-red-900"
                          title="删除"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
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
                {editingRoll ? '编辑胶卷实例' : '新增胶卷实例'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    胶卷品类 *
                  </label>
                  <select
                    required
                    value={formData.film_stock_id}
                    onChange={(e) => setFormData({...formData, film_stock_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">选择胶卷品类</option>
                    {(filmStocks || []).map(stock => (
                      <option key={stock.id} value={stock.id}>
                        {stock.brand} {stock.series} {stock.iso} {stock.format}
                      </option>
                    ))}
                  </select>

                </div>
                

                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    名称 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="如：8月旅行第一卷"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    启封日期
                  </label>
                  <input
                    type="date"
                    value={formData.opened_date}
                    onChange={(e) => setFormData({...formData, opened_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    地点
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="如：广东省深圳市"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    相机
                  </label>
                  <select
                    value={formData.camera_id}
                    onChange={(e) => setFormData({...formData, camera_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">选择相机</option>
                    {(cameras || []).map(camera => (
                      <option key={camera.id} value={camera.id}>
                        {camera.name} {camera.model}
                      </option>
                    ))}
                  </select>

                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    备注
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="备注信息"
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
                    {editingRoll ? '更新' : '创建'}
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

export default FilmRollManagement;
