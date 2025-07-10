const { newDb } = require('pg-mem');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create a new in-memory database instance
const db = newDb();

// Enable extension
db.public.registerExtension('uuid-ossp', (schema) => {
  schema.registerFunction({
    name: 'uuid_generate_v4',
    returns: 'uuid',
    implementation: () => crypto.randomUUID(),
  });
});

// Create a pool connection to our in-memory database
const pool = db.adapters.createPg().Pool();

// Override the global Pool with our in-memory version
const originalPool = require('pg').Pool;
require('pg').Pool = class MemPool extends originalPool {
  constructor(config) {
    super();
    return pool;
  }
};

async function setupDatabase() {
  try {
    // Read SQL script
    const sqlScript = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    // Execute SQL script
    await pool.query(sqlScript);
    
    console.log('In-memory database setup completed successfully!');
    
    // Insert some sample data
    await insertSampleData();
    
    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    return false;
  }
}

async function insertSampleData() {
  try {
    // Insert sample students
    const students = [
      ['John', 'Doe', 'john.doe@example.com', '1995-05-15', '123 Main St, City', '+1234567890'],
      ['Jane', 'Smith', 'jane.smith@example.com', '1997-08-21', '456 Elm St, Town', '+2345678901'],
      ['Robert', 'Johnson', 'robert.j@example.com', '1996-12-03', '789 Oak St, Village', '+3456789012'],
      ['Emily', 'Williams', 'emily.w@example.com', '1998-03-30', '101 Pine St, County', '+4567890123'],
      ['Michael', 'Brown', 'michael.b@example.com', '1999-01-12', '202 Maple St, District', '+5678901234']
    ];
    
    for (const student of students) {
      await pool.query(
        `INSERT INTO students (first_name, last_name, email, date_of_birth, address, phone) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        student
      );
    }
    
    // Insert sample marks
    const subjects = await pool.query('SELECT id FROM subjects');
    const studentsResult = await pool.query('SELECT id FROM students');
    
    const subjectIds = subjects.rows.map(s => s.id);
    const studentIds = studentsResult.rows.map(s => s.id);
    
    // Create some marks for each student
    for (const studentId of studentIds) {
      for (const subjectId of subjectIds) {
        const score = Math.floor(Math.random() * 31) + 70; // Random score between 70 and 100
        const date = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        
        await pool.query(
          `INSERT INTO marks (student_id, subject_id, score, exam_date) 
           VALUES ($1, $2, $3, $4)`,
          [studentId, subjectId, score, date.toISOString().split('T')[0]]
        );
      }
    }
    
    console.log('Sample data inserted successfully!');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}

module.exports = { setupDatabase, pool };
