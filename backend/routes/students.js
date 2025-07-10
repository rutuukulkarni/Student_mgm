const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // GET all students with pagination
  router.get('/', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await pool.query('SELECT COUNT(*) FROM students');
      const totalCount = parseInt(countResult.rows[0].count);

      // Get paginated results
      const result = await pool.query(
        'SELECT * FROM students ORDER BY id LIMIT $1 OFFSET $2',
        [limit, offset]
      );

      res.json({
        data: result.rows,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // GET a single student by ID with marks
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      // Get student
      const studentResult = await pool.query('SELECT * FROM students WHERE id = $1', [id]);

      if (studentResult.rows.length === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Get student marks with subject details
      const marksResult = await pool.query(
        `SELECT m.id, m.score, m.exam_date, s.subject_name, s.subject_code, s.id as subject_id
         FROM marks m
         JOIN subjects s ON m.subject_id = s.id
         WHERE m.student_id = $1`,
        [id]
      );

      res.json({
        ...studentResult.rows[0],
        marks: marksResult.rows,
      });
    } catch (error) {
      console.error('Error fetching student:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // POST create a new student
  router.post('/', async (req, res) => {
    try {
      const { first_name, last_name, email, date_of_birth, address, phone } = req.body;

      if (!first_name || !last_name || !email) {
        return res.status(400).json({ message: 'First name, last name, and email are required' });
      }

      const result = await pool.query(
        `INSERT INTO students (first_name, last_name, email, date_of_birth, address, phone) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [first_name, last_name, email, date_of_birth, address, phone]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating student:', error);
      
      // Check for duplicate email
      if (error.code === '23505' && error.constraint === 'students_email_key') {
        return res.status(400).json({ message: 'Email already exists' });
      }
      
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // PUT update a student
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { first_name, last_name, email, date_of_birth, address, phone } = req.body;

      if (!first_name || !last_name || !email) {
        return res.status(400).json({ message: 'First name, last name, and email are required' });
      }

      const result = await pool.query(
        `UPDATE students 
         SET first_name = $1, last_name = $2, email = $3, date_of_birth = $4, address = $5, phone = $6
         WHERE id = $7
         RETURNING *`,
        [first_name, last_name, email, date_of_birth, address, phone, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating student:', error);
      
      // Check for duplicate email
      if (error.code === '23505' && error.constraint === 'students_email_key') {
        return res.status(400).json({ message: 'Email already exists' });
      }
      
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // DELETE a student
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }

      res.json({ message: 'Student deleted successfully', student: result.rows[0] });
    } catch (error) {
      console.error('Error deleting student:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  return router;
};
