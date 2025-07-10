import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import StudentList from './components/StudentList';
import StudentForm from './components/StudentForm';
import StudentDetails from './components/StudentDetails';
import MarkForm from './components/MarkForm';
import NotFound from './components/NotFound';
import './App.css';

function App() {
  return (
    <div className="App">
      <NavBar />
      <div className="container py-4">
        <Routes>
          <Route path="/" element={<StudentList />} />
          <Route path="/students/add" element={<StudentForm />} />
          <Route path="/students/edit/:id" element={<StudentForm />} />
          <Route path="/students/:id" element={<StudentDetails />} />
          <Route path="/students/:id/marks/add" element={<MarkForm />} />
          <Route path="/students/:studentId/marks/:markId/edit" element={<MarkForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
