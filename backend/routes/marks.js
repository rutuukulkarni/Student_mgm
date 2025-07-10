const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // GET all marks with pagination
  router.get('/', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await pool.query('SELECT COUNT(*) FROM marks');
      const totalCount = parseInt(countResult.rows[0].count);

      // Get paginated results with student and subject information
      const result = await pool.query(
        `SELECT m.id, m.score, m.exam_date, 
                s.id as student_id, s.first_name, s.last_name, 
                sub.id as subject_id, sub.subject_name, sub.subject_code
         FROM marks m
         JOIN students s ON m.student_id = s.id
         JOIN subjects sub ON m.subject_id = sub.id
         ORDER BY m.id
         LIMIT $1 OFFSET $2`,
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
      console.error('Error fetching marks:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // GET marks for a specific student
  router.get('/student/:studentId', async (req, res) => {
    try {
      const { studentId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Check if student exists
      const studentResult = await pool.query('SELECT * FROM students WHERE id = $1', [studentId]);
      
      if (studentResult.rows.length === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Get total count of marks for this student
      const countResult = await pool.query(
        'SELECT COUNT(*) FROM marks WHERE student_id = $1',
        [studentId]
      );
      const totalCount = parseInt(countResult.rows[0].count);

      // Get paginated marks with subject information
      const result = await pool.query(
        `SELECT m.id, m.score, m.exam_date, sub.subject_name, sub.subject_code, sub.id as subject_id
         FROM marks m
         JOIN subjects sub ON m.subject_id = sub.id
         WHERE m.student_id = $1
         ORDER BY m.exam_date DESC
         LIMIT $2 OFFSET $3`,
        [studentId, limit, offset]
      );

      res.json({
        student: studentResult.rows[0],
        marks: result.rows,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching student marks:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // POST create a new mark
  router.post('/', async (req, res) => {
    try {
      const { student_id, subject_id, score, exam_date } = req.body;

      if (!student_id || !subject_id || score === undefined || !exam_date) {
        return res.status(400).json({ 
          message: 'Student ID, subject ID, score, and exam date are required' 
        });
      }

      // Validate score range
      if (score < 0 || score > 100) {
        return res.status(400).json({ message: 'Score must be between 0 and 100' });
      }

      // Check if student exists
      const studentResult = await pool.query('SELECT id FROM students WHERE id = $1', [student_id]);
      if (studentResult.rows.length === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Check if subject exists
      const subjectResult = await pool.query('SELECT id FROM subjects WHERE id = $1', [subject_id]);
      if (subjectResult.rows.length === 0) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      const result = await pool.query(
        `INSERT INTO marks (student_id, subject_id, score, exam_date) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [student_id, subject_id, score, exam_date]
      );

      // Get subject details to include in response
      const subjectDetails = await pool.query(
        'SELECT subject_name, subject_code FROM subjects WHERE id = $1',
        [subject_id]
      );

      res.status(201).json({
        ...result.rows[0],
        subject_name: subjectDetails.rows[0].subject_name,
        subject_code: subjectDetails.rows[0].subject_code
      });
    } catch (error) {
      console.error('Error creating mark:', error);
      
      // Check for unique constraint violation
      if (error.code === '23505' && error.constraint === 'marks_student_id_subject_id_exam_date_key') {
        return res.status(400).json({ 
          message: 'A mark for this student, subject, and exam date already exists' 
        });
      }
      
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // PUT update a mark
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { score, exam_date } = req.body;

      if (score === undefined || !exam_date) {
        return res.status(400).json({ message: 'Score and exam date are required' });
      }

      // Validate score range
      if (score < 0 || score > 100) {
        return res.status(400).json({ message: 'Score must be between 0 and 100' });
      }

      const result = await pool.query(
        `UPDATE marks 
         SET score = $1, exam_date = $2
         WHERE id = $3
         RETURNING *`,
        [score, exam_date, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Mark not found' });
      }

      // Get subject details to include in response
      const subjectDetails = await pool.query(
        'SELECT subject_name, subject_code FROM subjects WHERE id = $1',
        [result.rows[0].subject_id]
      );

      res.json({
        ...result.rows[0],
        subject_name: subjectDetails.rows[0].subject_name,
        subject_code: subjectDetails.rows[0].subject_code
      });
    } catch (error) {
      console.error('Error updating mark:', error);
      
      // Check for unique constraint violation
      if (error.code === '23505' && error.constraint === 'marks_student_id_subject_id_exam_date_key') {
        return res.status(400).json({ 
          message: 'A mark for this student, subject, and exam date already exists' 
        });
      }
      
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // DELETE a mark
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query('DELETE FROM marks WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Mark not found' });
      }

      res.json({ message: 'Mark deleted successfully', mark: result.rows[0] });
    } catch (error) {
      console.error('Error deleting mark:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  return router;
};
