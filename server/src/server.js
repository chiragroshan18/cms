const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminComplaintRoutes = require('./routes/adminComplaintRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminComplaintRoutes);
app.use('/api/categories', categoryRoutes);

// Root Welcome Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Complaint Management System (CMS) REST API Server',
    status: 'online',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      admin: '/api/admin',
      complaints: '/api/complaints',
      categories: '/api/categories'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
