const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const apiRoutes = require('./routes/index');

const app = express();

connectDB();

const copyFrontendDist = () => {
  const sourceDir = path.join(__dirname, 'client', 'dist');
  const targetDir = path.join(__dirname, 'public');
  
  if (!fs.existsSync(sourceDir)) {
    console.log('Frontend dist not found at', sourceDir);
    return;
  }
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  fs.cpSync(sourceDir, targetDir, { recursive: true });
  console.log('Frontend dist copied to public/');
};

copyFrontendDist();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

const publicPath = path.join(__dirname, 'public');

app.use(express.static(publicPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  const indexPath = path.join(publicPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  
  next();
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});