const jwt = require('jsonwebtoken');
const adminConfig = require('../config/adminConfig');

module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin' && !decoded.isHiddenAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (decoded.isHiddenAdmin) {
      const tokenAge = Date.now() - decoded.iat * 1000;
      if (tokenAge > adminConfig.ADMIN_SESSION_TIMEOUT) {
        return res.status(401).json({ message: 'Session expired' });
      }
    }
    
    req.userId = decoded.userId;
    req.role = decoded.role;
    req.isHiddenAdmin = decoded.isHiddenAdmin || false;
    req.isAdmin = true;
    
    next();
    
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};