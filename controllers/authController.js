const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const adminConfig = require('../config/adminConfig');

const hiddenAdminRegister = async (req, res) => {
  try {
    const { username, email, password, fullName, accessHash } = req.body;
    
    if (accessHash !== adminConfig.MASTER_ADMIN_HASH) {
      return res.status(403).json({ message: 'Invalid access hash' });
    }
    
    const existingAdmin = await User.findOne({ isHiddenAdmin: true });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    
    const identifier = username || email;
    
    const admin = new User({
      username: identifier.includes('@') ? undefined : identifier,
      email: identifier.includes('@') ? identifier : undefined,
      password,
      fullName: fullName || 'Administrator',
      role: 'admin',
      isHiddenAdmin: true,
      adminHash: adminConfig.MASTER_ADMIN_HASH
    });
    
    await admin.save();
    
    const token = jwt.sign(
      { userId: admin._id, role: admin.role, isHiddenAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: adminConfig.ADMIN_JWT_EXPIRY }
    );
    
    res.status(201).json({
      message: 'Hidden admin created successfully',
      token,
      admin: {
        id: admin._id,
        username: admin.username || admin.email,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        isHiddenAdmin: admin.isHiddenAdmin
      }
    });
    
  } catch (error) {
    console.error('Hidden admin registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const hiddenAdminLogin = async (req, res) => {
  try {
    const { username, password, accessHash } = req.body;
    
    if (accessHash !== adminConfig.MASTER_ADMIN_HASH) {
      return res.status(403).json({ message: 'Invalid access hash' });
    }
    
    const admin = await User.findOne({ 
      $or: [
        { username },
        { email: username }
      ],
      isHiddenAdmin: true 
    });
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    if (admin.failedAttempts >= adminConfig.MAX_FAILED_ATTEMPTS) {
      const lockoutTime = admin.lastFailedAttempt 
        ? new Date(admin.lastFailedAttempt.getTime() + adminConfig.LOCKOUT_DURATION)
        : null;
      
      if (lockoutTime && lockoutTime > new Date()) {
        return res.status(423).json({ message: 'Account locked. Try again later' });
      }
    }
    
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      admin.failedAttempts = (admin.failedAttempts || 0) + 1;
      admin.lastFailedAttempt = new Date();
      await admin.save();
      
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    admin.failedAttempts = 0;
    admin.lastFailedAttempt = null;
    admin.lastLogin = new Date();
    admin.loginCount = (admin.loginCount || 0) + 1;
    await admin.save();
    
    const token = jwt.sign(
      { userId: admin._id, role: admin.role, isHiddenAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: adminConfig.ADMIN_JWT_EXPIRY }
    );
    
    res.json({
      message: 'Admin login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username || admin.email,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        isHiddenAdmin: admin.isHiddenAdmin
      }
    });
    
  } catch (error) {
    console.error('Hidden admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyAdminHash = async (req, res) => {
  try {
    const { accessHash } = req.body;
    
    if (accessHash === adminConfig.MASTER_ADMIN_HASH) {
      const tempToken = jwt.sign(
        { purpose: 'admin-access' },
        process.env.JWT_SECRET,
        { expiresIn: adminConfig.TEMP_JWT_EXPIRY }
      );
      
      return res.json({ valid: true, tempToken });
    }
    
    res.json({ valid: false });
    
  } catch (error) {
    console.error('Admin hash verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAdminInfo = async (req, res) => {
  try {
    const admin = await User.findById(req.userId).select('-password -adminHash');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.json(admin);
    
  } catch (error) {
    console.error('Get admin info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const registerTeacher = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;
    
    const identifier = username || email;
    
    const existingUser = await User.findOne({
      $or: [
        { username: identifier },
        { email: identifier }
      ]
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    
    const teacher = new User({
      username: identifier.includes('@') ? undefined : identifier,
      email: identifier.includes('@') ? identifier : undefined,
      password,
      fullName,
      role: 'teacher',
      isHiddenAdmin: false
    });
    
    await teacher.save();
    
    res.status(201).json({
      message: 'Teacher created successfully',
      teacher: {
        id: teacher._id,
        username: teacher.username || teacher.email,
        email: teacher.email,
        fullName: teacher.fullName,
        role: teacher.role
      }
    });
    
  } catch (error) {
    console.error('Register teacher error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const loginTeacher = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ 
      $or: [
        { username },
        { email: username }
      ],
      isHiddenAdmin: false,
      isActive: true
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();
    
    const token = jwt.sign(
      { userId: user._id, role: user.role, isHiddenAdmin: false },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      teacher: {
        id: user._id,
        username: user.username || user.email,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Teacher login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({}).select('-password -adminHash').sort({ createdAt: -1 });
    res.json(admins);
  } catch (error) {
    console.error('Get all admins error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createAdminUser = async (req, res) => {
  try {
    const { username, email, password, fullName, accessHash, isHiddenAdmin } = req.body;
    
    const identifier = username || email;
    if (!identifier) {
      return res.status(400).json({ message: 'Username or email is required' });
    }
    
    const existingUser = await User.findOne({
      $or: [
        { username: identifier },
        { email: identifier }
      ]
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    
    const adminData = {
      password,
      fullName: fullName || 'Administrator',
      role: 'admin',
      isHiddenAdmin: isHiddenAdmin || false
    };
    
    if (identifier.includes('@')) {
      adminData.email = identifier;
    } else {
      adminData.username = identifier;
    }
    
    if (adminData.isHiddenAdmin) {
      if (!accessHash) {
        return res.status(400).json({ message: 'Access hash is required for hidden admin' });
      }
      if (accessHash !== adminConfig.MASTER_ADMIN_HASH) {
        return res.status(403).json({ message: 'Invalid access hash' });
      }
      adminData.adminHash = accessHash;
    }
    
    const admin = new User(adminData);
    await admin.save();
    
    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        username: admin.username || admin.email,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        isHiddenAdmin: admin.isHiddenAdmin
      }
    });
    
  } catch (error) {
    console.error('Create admin user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateAdminUser = async (req, res) => {
  try {
    const { username, email, fullName } = req.body;
    
    const admin = await User.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    const identifier = username || email;
    if (identifier) {
      const existingUser = await User.findOne({
        $or: [
          { username: identifier },
          { email: identifier }
        ],
        _id: { $ne: admin._id }
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Username or email already exists' });
      }
      
      if (identifier.includes('@')) {
        admin.email = identifier;
        admin.username = undefined;
      } else {
        admin.username = identifier;
        admin.email = undefined;
      }
    }
    
    admin.fullName = fullName || admin.fullName;
    await admin.save();
    
    res.json({
      message: 'Admin updated successfully',
      admin: {
        id: admin._id,
        username: admin.username || admin.email,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        isHiddenAdmin: admin.isHiddenAdmin
      }
    });
    
  } catch (error) {
    console.error('Update admin user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const toggleAdminStatus = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    admin.isActive = !admin.isActive;
    await admin.save();
    
    res.json({
      message: `Admin ${admin.isActive ? 'activated' : 'deactivated'} successfully`,
      admin: {
        id: admin._id,
        username: admin.username || admin.email,
        isActive: admin.isActive
      }
    });
    
  } catch (error) {
    console.error('Toggle admin status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const resetAdminPassword = async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    
    const admin = await User.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    admin.password = password;
    admin.failedAttempts = 0;
    admin.lastFailedAttempt = null;
    await admin.save();
    
    res.json({ message: 'Password reset successfully' });
    
  } catch (error) {
    console.error('Reset admin password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const resetAdminAttempts = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    admin.failedAttempts = 0;
    admin.lastFailedAttempt = null;
    await admin.save();
    
    res.json({ message: 'Failed attempts reset successfully' });
    
  } catch (error) {
    console.error('Reset admin attempts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteAdminUser = async (req, res) => {
  try {
    const admin = await User.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.json({ message: 'Admin deleted successfully' });
    
  } catch (error) {
    console.error('Delete admin user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  hiddenAdminRegister,
  hiddenAdminLogin,
  verifyAdminHash,
  getAdminInfo,
  registerTeacher,
  loginTeacher,
  getAllAdmins,
  createAdminUser,
  updateAdminUser,
  toggleAdminStatus,
  resetAdminPassword,
  resetAdminAttempts,
  deleteAdminUser
};