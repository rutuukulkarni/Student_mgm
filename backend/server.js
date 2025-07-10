require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, Student, Subject, Mark, initDatabase } = require('./models');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes for students
app.get('/api/students', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Student.findAndCountAll({
      limit,
      offset,
      order: [['id', 'ASC']]
    });

    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        totalCount: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findByPk(id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const marks = await Mark.findAll({
      where: { student_id: id },
      include: [Subject]
    });
    
    res.json({
      ...student.toJSON(),
      marks: marks.map(mark => ({
        id: mark.id,
        score: mark.score,
        exam_date: mark.exam_date,
        subject_name: mark.Subject.subject_name,
        subject_code: mark.Subject.subject_code,
        subject_id: mark.Subject.id
      }))
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const { first_name, last_name, email, date_of_birth, address, phone } = req.body;
    
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ message: 'First name, last name, and email are required' });
    }
    
    const student = await Student.create({
      first_name,
      last_name,
      email,
      date_of_birth,
      address,
      phone
    });
    
    res.status(201).json(student);
  } catch (error) {
    console.error('Error creating student:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, date_of_birth, address, phone } = req.body;
    
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ message: 'First name, last name, and email are required' });
    }
    
    const student = await Student.findByPk(id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    await student.update({
      first_name,
      last_name,
      email,
      date_of_birth,
      address,
      phone
    });
    
    res.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findByPk(id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    await student.destroy();
    
    res.json({ message: 'Student deleted successfully', student });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Routes for subjects
app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await Subject.findAll({
      order: [['subject_name', 'ASC']]
    });
    
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/subjects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const subject = await Subject.findByPk(id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    res.json(subject);
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Routes for marks
app.get('/api/marks', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Mark.findAndCountAll({
      include: [Student, Subject],
      limit,
      offset,
      order: [['id', 'ASC']]
    });

    const formattedRows = rows.map(mark => ({
      id: mark.id,
      score: mark.score,
      exam_date: mark.exam_date,
      student_id: mark.Student.id,
      first_name: mark.Student.first_name,
      last_name: mark.Student.last_name,
      subject_id: mark.Subject.id,
      subject_name: mark.Subject.subject_name,
      subject_code: mark.Subject.subject_code
    }));

    res.json({
      data: formattedRows,
      pagination: {
        page,
        limit,
        totalCount: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching marks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/marks/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const student = await Student.findByPk(studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const { count, rows } = await Mark.findAndCountAll({
      where: { student_id: studentId },
      include: [Subject],
      limit,
      offset,
      order: [['exam_date', 'DESC']]
    });
    
    res.json({
      student,
      marks: rows.map(mark => ({
        id: mark.id,
        score: mark.score,
        exam_date: mark.exam_date,
        subject_name: mark.Subject.subject_name,
        subject_code: mark.Subject.subject_code,
        subject_id: mark.Subject.id
      })),
      pagination: {
        page,
        limit,
        totalCount: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching student marks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/marks', async (req, res) => {
  try {
    const { student_id, subject_id, score, exam_date } = req.body;
    
    if (!student_id || !subject_id || score === undefined || !exam_date) {
      return res.status(400).json({
        message: 'Student ID, subject ID, score, and exam date are required'
      });
    }
    
    if (score < 0 || score > 100) {
      return res.status(400).json({ message: 'Score must be between 0 and 100' });
    }
    
    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const subject = await Subject.findByPk(subject_id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    const mark = await Mark.create({
      student_id,
      subject_id,
      score,
      exam_date
    });
    
    res.status(201).json({
      ...mark.toJSON(),
      subject_name: subject.subject_name,
      subject_code: subject.subject_code
    });
  } catch (error) {
    console.error('Error creating mark:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: 'A mark for this student, subject, and exam date already exists'
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/marks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { score, exam_date } = req.body;
    
    if (score === undefined || !exam_date) {
      return res.status(400).json({ message: 'Score and exam date are required' });
    }
    
    if (score < 0 || score > 100) {
      return res.status(400).json({ message: 'Score must be between 0 and 100' });
    }
    
    const mark = await Mark.findByPk(id, {
      include: [Subject]
    });
    
    if (!mark) {
      return res.status(404).json({ message: 'Mark not found' });
    }
    
    await mark.update({
      score,
      exam_date
    });
    
    res.json({
      ...mark.toJSON(),
      subject_name: mark.Subject.subject_name,
      subject_code: mark.Subject.subject_code
    });
  } catch (error) {
    console.error('Error updating mark:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: 'A mark for this student, subject, and exam date already exists'
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/marks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const mark = await Mark.findByPk(id);
    
    if (!mark) {
      return res.status(404).json({ message: 'Mark not found' });
    }
    
    await mark.destroy();
    
    res.json({ message: 'Mark deleted successfully', mark });
  } catch (error) {
    console.error('Error deleting mark:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ message: 'Database connection successful' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
