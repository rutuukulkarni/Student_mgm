const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // GET all subjects
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM subjects ORDER BY subject_name');
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // GET a single subject by ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM subjects WHERE id = $1', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching subject:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // POST create a new subject
  router.post('/', async (req, res) => {
    try {
      const { subject_name, subject_code } = req.body;

      if (!subject_name || !subject_code) {
        return res.status(400).json({ message: 'Subject name and code are required' });
      }

      const result = await pool.query(
        'INSERT INTO subjects (subject_name, subject_code) VALUES ($1, $2) RETURNING *',
        [subject_name, subject_code]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating subject:', error);
      
      // Check for duplicate code
      if (error.code === '23505' && error.constraint === 'subjects_subject_code_key') {
        return res.status(400).json({ message: 'Subject code already exists' });
      }
      
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // PUT update a subject
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { subject_name, subject_code } = req.body;

      if (!subject_name || !subject_code) {
        return res.status(400).json({ message: 'Subject name and code are required' });
      }

      const result = await pool.query(
        'UPDATE subjects SET subject_name = $1, subject_code = $2 WHERE id = $3 RETURNING *',
        [subject_name, subject_code, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating subject:', error);
      
      // Check for duplicate code
      if (error.code === '23505' && error.constraint === 'subjects_subject_code_key') {
        return res.status(400).json({ message: 'Subject code already exists' });
      }
      
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // DELETE a subject
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      // Check if subject is being used in marks
      const usageCheck = await pool.query('SELECT COUNT(*) FROM marks WHERE subject_id = $1', [id]);
      if (parseInt(usageCheck.rows[0].count) > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete subject as it is being used in student marks' 
        });
      }

      const result = await pool.query('DELETE FROM subjects WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      res.json({ message: 'Subject deleted successfully', subject: result.rows[0] });
    } catch (error) {
      console.error('Error deleting subject:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  return router;
};
