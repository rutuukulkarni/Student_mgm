# Student Management System

A fullstack web application for student data management with CRUD operations, normalized database schema, and pagination.

## Features

- Normalized database schema with MySQL
- RESTful API endpoints with Node.js and Express
- CRUD operations for student data
- Pagination for retrieving lists of students
- React.js frontend with Bootstrap styling
- SweetAlert2 for user feedback

## Project Structure

```
rutu-assign/
├── backend/               # Node.js backend
│   ├── database/          # Database scripts
│   │   ├── schema.sql     # SQL schema definition
│   │   └── setup.js       # Database setup script
│   ├── models/            # Sequelize models
│   │   └── index.js       # Model definitions
│   ├── .env               # Environment variables
│   ├── package.json       # Backend dependencies
│   └── server.js          # Main server file
└── frontend/              # React.js frontend
    ├── public/            # Static files
    ├── src/               # Source code
    │   ├── components/    # React components
    │   ├── services/      # API services
    │   ├── App.js         # Main App component
    │   ├── App.css        # App styles
    │   ├── index.js       # Entry point
    │   └── index.css      # Global styles
    └── package.json       # Frontend dependencies
```

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)

## Setup Instructions

### Database Setup

#### macOS

1. Install MySQL using Homebrew:
   ```bash
   brew install mysql
   ```

2. Start MySQL service:
   ```bash
   brew services start mysql
   ```

3. Set up MySQL security (optional but recommended):
   ```bash
   mysql_secure_installation
   ```
   Follow the prompts to set a root password and secure your MySQL installation.

4. Create the database:
   ```bash
   mysql -u root -p -e "CREATE DATABASE student_db;"
   ```
   If you set a root password, you'll be prompted to enter it.

#### Windows

1. Download and install MySQL from the official website:
   - Go to [MySQL Downloads](https://dev.mysql.com/downloads/installer/)
   - Download the MySQL Installer for Windows
   - Run the installer and follow the installation wizard
   - Choose "Developer Default" or "Server only" setup type
   - Complete the installation steps, making sure to set a root password

2. Open Command Prompt as Administrator and create the database:
   ```bash
   mysql -u root -p -e "CREATE DATABASE student_db;"
   ```
   Enter the root password you set during installation when prompted.

### Backend Setup

1. Clone the repository (if you haven't already):
   ```bash
   git clone <repository-url>
   cd rutu-assign
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Configure environment variables:
   - Rename `.env.example` to `.env` if it exists, or create a new `.env` file
   - Update the database connection details in the `.env` file:

   ```
   PORT=5000
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_HOST=localhost
   DB_PORT=3306
   DB_DATABASE=student_db
   DB_DIALECT=mysql
   ```

4. Run the database setup script:
   ```bash
   node database/setup.js
   ```
   This will create the necessary tables and insert sample data.

5. Start the backend server:
   ```bash
   npm run dev
   ```
   The server will start on http://localhost:5000.

### Frontend Setup

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```
   The frontend will start on http://localhost:3000.

## API Endpoints

### Students

- `GET /api/students` - Get all students (with pagination)
- `GET /api/students/:id` - Get a specific student
- `POST /api/students` - Create a new student
- `PUT /api/students/:id` - Update a student
- `DELETE /api/students/:id` - Delete a student

### Subjects

- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:id` - Get a specific subject

### Marks

- `GET /api/marks` - Get all marks (with pagination)
- `GET /api/marks/student/:studentId` - Get marks for a specific student
- `POST /api/marks` - Create a new mark
- `PUT /api/marks/:id` - Update a mark
- `DELETE /api/marks/:id` - Delete a mark

## API Testing with Postman

A Postman collection is included in the project root directory (`postman_collection.json`). You can import this file into Postman to test all API endpoints.

1. Open Postman
2. Click on "Import" in the top left corner
3. Select the `postman_collection.json` file from the project directory
4. After importing, you'll have access to all the API endpoints for testing

## Running with NPM Scripts

You can use the following npm scripts from the root directory:

```bash
# Install all dependencies (backend and frontend)
npm install

# Start both backend and frontend servers
npm start

# Start only backend server
npm run start-backend

# Start only frontend server
npm run start-frontend

# Set up the database
npm run setup-db
```

## Troubleshooting

### Windows-specific Issues

1. If you encounter issues with MySQL connection:
   - Make sure MySQL service is running:
     - Press Win+R, type `services.msc` and press Enter
     - Find "MySQL" in the list and ensure it's running
   - Check that your MySQL credentials are correct in the `.env` file

2. If you have issues with npm install:
   - Try running Command Prompt or PowerShell as Administrator
   - Run `npm cache clean --force` before reinstalling

### macOS-specific Issues

1. If you encounter permission issues with MySQL:
   - Verify your MySQL user has proper permissions:
     ```bash
     mysql -u root -p -e "GRANT ALL PRIVILEGES ON student_db.* TO 'root'@'localhost';"
     ```

2. If the frontend can't connect to the backend:
   - Check if the backend is running
   - Verify that ports 3000 and 5000 are not blocked

## License

This project is licensed under the ISC License.
   createdb student_db
   ```

2. Configure the database connection in the `.env` file:
   ```
   PG_USER=postgres
   PG_PASSWORD=postgres
   PG_HOST=localhost
   PG_PORT=5432
   PG_DATABASE=student_db
   ```

3. Run the database setup script:
   ```
   cd backend
   node database/setup.js
   ```

### Backend Setup

1. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

2. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

2. Start the frontend development server:
   ```
   npm start
   ```

## API Endpoints

### Students

- `GET /api/students` - Get all students (with pagination)
- `GET /api/students/:id` - Get a single student by ID with marks
- `POST /api/students` - Create a new student
- `PUT /api/students/:id` - Update a student
- `DELETE /api/students/:id` - Delete a student

### Marks

- `GET /api/marks` - Get all marks (with pagination)
- `GET /api/marks/student/:studentId` - Get marks for a specific student
- `POST /api/marks` - Create a new mark
- `PUT /api/marks/:id` - Update a mark
- `DELETE /api/marks/:id` - Delete a mark

### Subjects

- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:id` - Get a single subject
- `POST /api/subjects` - Create a new subject
- `PUT /api/subjects/:id` - Update a subject
- `DELETE /api/subjects/:id` - Delete a subject

## Testing

You can use Postman or any other API client to test the API endpoints.

## Database Schema

The database follows a normalized structure with three main tables:

1. **students**: Contains student personal information
2. **subjects**: Contains information about academic subjects
3. **marks**: Contains marks scored by students in different subjects

### Relationships:
- A student can have multiple marks (one-to-many)
- A subject can be associated with multiple marks (one-to-many)
- The marks table connects students and subjects (many-to-many)
