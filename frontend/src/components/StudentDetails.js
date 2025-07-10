import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, Table, Row, Col, Tab, Tabs, Pagination } from 'react-bootstrap';
import Swal from 'sweetalert2';
import api from '../services/api';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState(null);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state for marks
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchStudentData();
  }, [id, currentPage, limit]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/students/${id}`);
      setStudent(response.data);
      
      // Fetch paginated marks
      const marksResponse = await api.get(
        `/api/marks/student/${id}?page=${currentPage}&limit=${limit}`
      );
      
      setMarks(marksResponse.data.marks);
      setTotalPages(marksResponse.data.pagination.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching student data:', error);
      setError('Failed to fetch student data. Please try again later.');
      setLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await api.delete(`/api/students/${id}`);
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Student has been deleted.',
          timer: 1500
        });
        
        navigate('/');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete student. Please try again later.',
      });
    }
  };

  const handleDeleteMark = async (markId) => {
    try {
      const result = await Swal.fire({
        title: 'Delete Mark?',
        text: "This action cannot be undone!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await api.delete(`/api/marks/${markId}`);
        
        // Update marks state to remove the deleted mark
        setMarks(marks.filter(mark => mark.id !== markId));
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Mark has been deleted.',
          timer: 1500
        });
      }
    } catch (error) {
      console.error('Error deleting mark:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete mark. Please try again later.',
      });
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Generate pagination items
  let items = [];
  for (let number = 1; number <= totalPages; number++) {
    items.push(
      <Pagination.Item 
        key={number} 
        active={number === currentPage}
        onClick={() => handlePageChange(number)}
      >
        {number}
      </Pagination.Item>
    );
  }

  // Pagination component
  const paginationBasic = (
    <Pagination className="mt-3 justify-content-center">
      <Pagination.First 
        onClick={() => handlePageChange(1)} 
        disabled={currentPage === 1} 
      />
      <Pagination.Prev 
        onClick={() => handlePageChange(currentPage - 1)} 
        disabled={currentPage === 1} 
      />
      {items}
      <Pagination.Next 
        onClick={() => handlePageChange(currentPage + 1)} 
        disabled={currentPage === totalPages} 
      />
      <Pagination.Last 
        onClick={() => handlePageChange(totalPages)} 
        disabled={currentPage === totalPages} 
      />
    </Pagination>
  );

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
        <div className="mt-3">
          <Link to="/" className="btn btn-primary">Back to Student List</Link>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="alert alert-warning" role="alert">
        Student not found.
        <div className="mt-3">
          <Link to="/" className="btn btn-primary">Back to Student List</Link>
        </div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div>
      <div className="mb-3">
        <Link to="/" className="btn btn-secondary back-button">
          &larr; Back to Student List
        </Link>
      </div>
      
      <div className="student-details">
        <Card className="mb-4">
          <Card.Header>
            <h3>{student.first_name} {student.last_name}</h3>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <p><strong>ID:</strong> {student.id}</p>
                <p><strong>Email:</strong> {student.email}</p>
                <p><strong>Date of Birth:</strong> {formatDate(student.date_of_birth)}</p>
              </Col>
              <Col md={6}>
                <p><strong>Phone:</strong> {student.phone || 'N/A'}</p>
                <p><strong>Address:</strong> {student.address || 'N/A'}</p>
                <p><strong>Created:</strong> {formatDate(student.created_at)}</p>
              </Col>
            </Row>
            
            <div className="mt-3 d-flex gap-2">
              <Link to={`/students/edit/${student.id}`}>
                <Button variant="warning">Edit Student</Button>
              </Link>
              <Button variant="danger" onClick={handleDeleteStudent}>
                Delete Student
              </Button>
            </div>
          </Card.Body>
        </Card>
        
        <Tabs defaultActiveKey="marks" className="mb-3">
          <Tab eventKey="marks" title="Student Marks">
            <Card>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="mb-0">Marks</h4>
                  <Link to={`/students/${student.id}/marks/add`}>
                    <Button variant="success">Add Mark</Button>
                  </Link>
                </div>
                
                {marks.length > 0 ? (
                  <>
                    <Table striped hover responsive className="marks-table">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Score</th>
                          <th>Exam Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marks.map((mark) => (
                          <tr key={mark.id}>
                            <td>{mark.subject_name} ({mark.subject_code})</td>
                            <td>{mark.score}</td>
                            <td>{formatDate(mark.exam_date)}</td>
                            <td>
                              <Link to={`/students/${student.id}/marks/${mark.id}/edit`}>
                                <Button variant="warning" size="sm" className="me-2">
                                  Edit
                                </Button>
                              </Link>
                              <Button 
                                variant="danger" 
                                size="sm" 
                                onClick={() => handleDeleteMark(mark.id)}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    
                    {totalPages > 1 && paginationBasic}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p>No marks found for this student.</p>
                    <Link to={`/students/${student.id}/marks/add`}>
                      <Button variant="success">Add Mark</Button>
                    </Link>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDetails;
