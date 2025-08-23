const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '访问被拒绝，没有提供token'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: '无效的token'
    });
  }
};

const adminAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '访问被拒绝，没有提供token'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 检查是否是admin用户
    if (decoded.username !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '访问被拒绝，需要管理员权限'
      });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: '无效的token'
    });
  }
};

module.exports = { auth, adminAuth };
