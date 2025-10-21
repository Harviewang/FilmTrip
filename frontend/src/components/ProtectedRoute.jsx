import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (!token || !user) {
    // 没有token或用户信息，重定向到管理员登录页
    return <Navigate to="/admin/login" replace />;
  }

  try {
    // 验证token是否有效（简单检查）
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    if (tokenData.exp < currentTime) {
      // token已过期，清除本地存储并重定向
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/admin/login" replace />;
    }
  } catch (error) {
    // token格式错误，清除本地存储并重定向
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
