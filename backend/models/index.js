const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Create Sequelize connection
const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || 'mysql',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_DATABASE || 'student_db',
  logging: false
});

// Define models
const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'students',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  subject_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subject_code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'subjects',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const Mark = sequelize.define('Mark', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  exam_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'marks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define relationships
Student.hasMany(Mark, { foreignKey: 'student_id' });
Mark.belongsTo(Student, { foreignKey: 'student_id' });

Subject.hasMany(Mark, { foreignKey: 'subject_id' });
Mark.belongsTo(Subject, { foreignKey: 'subject_id' });

// Initialize database
const initDatabase = async () => {
  try {
    // Sync database (create tables if they don't exist)
    await sequelize.sync();
    
    // Add sample subjects if none exist
    const subjectCount = await Subject.count();
    if (subjectCount === 0) {
      await Subject.bulkCreate([
        { subject_name: 'Mathematics', subject_code: 'MATH101' },
        { subject_name: 'Science', subject_code: 'SCI101' },
        { subject_name: 'History', subject_code: 'HIST101' },
        { subject_name: 'English', subject_code: 'ENG101' },
        { subject_name: 'Computer Science', subject_code: 'CS101' }
      ]);
      console.log('Sample subjects created');
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  Student,
  Subject,
  Mark,
  initDatabase
};
