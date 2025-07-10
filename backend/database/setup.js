const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const setupDatabase = async () => {
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true // Allow multiple SQL statements
    });
    
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_DATABASE}`);
    
    // Use the database
    await connection.query(`USE ${process.env.DB_DATABASE}`);
    
    // Read SQL script
    let sqlScript = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    // Remove PostgreSQL specific commands
    sqlScript = sqlScript.replace(/\\c student_db;/g, '');
    
    // Execute SQL script
    await connection.query(sqlScript);
    
    console.log('Database setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    return false;
  } finally {
    // Close connection
    if (connection) {
      await connection.end();
    }
  }
};

setupDatabase();

module.exports = { setupDatabase };
