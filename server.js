const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/attendance', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('Database connection error:', err));

// Mongoose Schemas and Models
const classSchema = new mongoose.Schema({
  name: String,
  students: [{ name: String, rollNumber: String }],
});

const attendanceSchema = new mongoose.Schema({
  className: String,
  date: String,
  records: [{ student: String, status: String }],
});

const Class = mongoose.model('Class', classSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);

// Routes
app.get('/classes', async (req, res) => {
  const classes = await Class.find();
  res.json(classes);
});

app.post('/classes', async (req, res) => {
  const newClass = new Class(req.body);
  await newClass.save();
  res.status(201).json(newClass);
});

app.post('/students/:className', async (req, res) => {
  const { className } = req.params;
  const classData = await Class.findOne({ name: className });

  if (!classData) return res.status(404).json({ message: 'Class not found' });

  classData.students.push(req.body);
  await classData.save();
  res.json(classData);
});

app.post('/attendance', async (req, res) => {
  const newAttendance = new Attendance(req.body);
  await newAttendance.save();
  res.status(201).json(newAttendance);
});

app.get('/attendance/:className/:date', async (req, res) => {
  const { className, date } = req.params;
  const attendance = await Attendance.findOne({ className, date });

  if (!attendance) return res.status(404).json({ message: 'Attendance not found' });

  res.json(attendance);
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
