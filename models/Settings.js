const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  schoolName: {
    type: String,
    default: 'My School'
  },
  schoolCode: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  postalCode: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  motto: {
    type: String,
    default: 'Excellence in Education'
  },
  logo: {
    type: String,
    default: ''
  },
  academicYear: {
    type: String,
    default: () => new Date().getFullYear().toString()
  },
  term: {
    type: String,
    default: 'Term 1'
  },
  passMark: {
    type: Number,
    default: 40
  },
  reportFooter: {
    type: String,
    default: ''
  },
  gradingSystem: {
    type: String,
    enum: ['af', 'cbc', 'custom'],
    default: 'af'
  },
  grades: [{
    name: {
      type: String,
      required: true
    },
    minScore: {
      type: Number,
      required: true
    },
    maxScore: {
      type: Number,
      required: true
    },
    remark: {
      type: String,
      default: ''
    }
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

settingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Settings', settingsSchema);