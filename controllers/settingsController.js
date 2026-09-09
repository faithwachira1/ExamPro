const Settings = require('../models/Settings');

const defaultAFGrades = [
  { name: 'A', minScore: 70, maxScore: 100, remark: 'Excellent' },
  { name: 'B', minScore: 60, maxScore: 69.99, remark: 'Good' },
  { name: 'C', minScore: 50, maxScore: 59.99, remark: 'Average' },
  { name: 'D', minScore: 40, maxScore: 49.99, remark: 'Below Average' },
  { name: 'F', minScore: 0, maxScore: 39.99, remark: 'Fail' }
];

const defaultCBCGrades = [
  { name: 'Exceeding Expectation', minScore: 80, maxScore: 100, remark: 'EE' },
  { name: 'Meeting Expectation', minScore: 60, maxScore: 79.99, remark: 'ME' },
  { name: 'Approaching Expectation', minScore: 40, maxScore: 59.99, remark: 'AE' },
  { name: 'Below Expectation', minScore: 0, maxScore: 39.99, remark: 'BE' }
];

const getDefaultSettings = (adminId) => {
  return {
    adminId,
    schoolName: 'My School',
    schoolCode: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    motto: 'Excellence in Education',
    logo: '',
    academicYear: new Date().getFullYear().toString(),
    term: 'Term 1',
    passMark: 40,
    reportFooter: '',
    gradingSystem: 'af',
    grades: defaultAFGrades
  };
};

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ adminId: req.userId });
    
    if (!settings) {
      const defaultData = getDefaultSettings(req.userId);
      settings = new Settings(defaultData);
      await settings.save();
    }
    
    res.json(settings);
    
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const {
      schoolName,
      schoolCode,
      address,
      city,
      state,
      postalCode,
      country,
      phone,
      email,
      website,
      motto,
      logo,
      academicYear,
      term,
      passMark,
      reportFooter
    } = req.body;
    
    let settings = await Settings.findOne({ adminId: req.userId });
    
    if (!settings) {
      settings = new Settings(getDefaultSettings(req.userId));
    }
    
    settings.schoolName = schoolName || settings.schoolName;
    settings.schoolCode = schoolCode || settings.schoolCode;
    settings.address = address || settings.address;
    settings.city = city || settings.city;
    settings.state = state || settings.state;
    settings.postalCode = postalCode || settings.postalCode;
    settings.country = country || settings.country;
    settings.phone = phone || settings.phone;
    settings.email = email || settings.email;
    settings.website = website || settings.website;
    settings.motto = motto || settings.motto;
    settings.logo = logo || settings.logo;
    settings.academicYear = academicYear || settings.academicYear;
    settings.term = term || settings.term;
    settings.passMark = passMark || settings.passMark;
    settings.reportFooter = reportFooter || settings.reportFooter;
    
    await settings.save();
    
    res.json(settings);
    
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateGradingSystem = async (req, res) => {
  try {
    const { gradingSystem, passMark } = req.body;
    
    let settings = await Settings.findOne({ adminId: req.userId });
    
    if (!settings) {
      settings = new Settings(getDefaultSettings(req.userId));
    }
    
    settings.gradingSystem = gradingSystem || settings.gradingSystem;
    
    if (passMark !== undefined) {
      settings.passMark = passMark;
    }
    
    if (gradingSystem === 'af') {
      settings.grades = defaultAFGrades;
    } else if (gradingSystem === 'cbc') {
      settings.grades = defaultCBCGrades;
    }
    
    await settings.save();
    
    res.json(settings);
    
  } catch (error) {
    console.error('Update grading system error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateGrades = async (req, res) => {
  try {
    const { grades } = req.body;
    
    if (!grades || !Array.isArray(grades)) {
      return res.status(400).json({ message: 'Grades array is required' });
    }
    
    let settings = await Settings.findOne({ adminId: req.userId });
    
    if (!settings) {
      settings = new Settings(getDefaultSettings(req.userId));
    }
    
    settings.grades = grades;
    settings.gradingSystem = 'custom';
    
    await settings.save();
    
    res.json(settings);
    
  } catch (error) {
    console.error('Update grades error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addGrade = async (req, res) => {
  try {
    const { name, minScore, maxScore, remark } = req.body;
    
    if (!name || minScore === undefined || maxScore === undefined) {
      return res.status(400).json({ message: 'Name, minScore, and maxScore are required' });
    }
    
    let settings = await Settings.findOne({ adminId: req.userId });
    
    if (!settings) {
      settings = new Settings(getDefaultSettings(req.userId));
    }
    
    settings.grades.push({
      name,
      minScore,
      maxScore,
      remark: remark || ''
    });
    
    settings.gradingSystem = 'custom';
    
    await settings.save();
    
    res.status(201).json(settings);
    
  } catch (error) {
    console.error('Add grade error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteGrade = async (req, res) => {
  try {
    const gradeId = req.params.gradeId;
    
    let settings = await Settings.findOne({ adminId: req.userId });
    
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    
    settings.grades = settings.grades.filter(g => g._id.toString() !== gradeId);
    
    await settings.save();
    
    res.json(settings);
    
  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const uploadLogo = async (req, res) => {
  try {
    const { logo } = req.body;
    
    if (!logo) {
      return res.status(400).json({ message: 'Logo data is required' });
    }
    
    let settings = await Settings.findOne({ adminId: req.userId });
    
    if (!settings) {
      settings = new Settings(getDefaultSettings(req.userId));
    }
    
    settings.logo = logo;
    await settings.save();
    
    res.json(settings);
    
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  updateGradingSystem,
  updateGrades,
  addGrade,
  deleteGrade,
  uploadLogo
};