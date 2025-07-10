import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Card, Row, Col, Pagination, Form, InputGroup } from 'react-bootstrap';
import Swal from 'sweetalert2';
import api from '../services/api';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, [currentPage, limit]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        student => 
          student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/students?page=${currentPage}&limit=${limit}`);
      setStudents(response.data.data);
      setFilteredStudents(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setTotalCount(response.data.pagination.totalCount);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch students. Please try again later.',
      });
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
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
        
        // Update the local state to remove the deleted student
        setStudents(students.filter(student => student.id !== id));
        setFilteredStudents(filteredStudents.filter(student => student.id !== id));
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Student has been deleted.',
          timer: 1500
        });
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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleLimitChange = (e) => {
    setLimit(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing limit
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
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
    <Pagination>
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

  return (
    <div>
      <h2 className="page-title">Student List</h2>
      
      <Row className="mb-3">
        <Col md={6}>
          <Link to="/students/add">
            <Button variant="primary">Add New Student</Button>
          </Link>
        </Col>
        <Col md={6}>
          <InputGroup>
            <Form.Control
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
              Clear
            </Button>
          </InputGroup>
        </Col>
      </Row>
      
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : filteredStudents.length > 0 ? (
        <>
          <Card>
            <Card.Body>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td>{student.id}</td>
                      <td>{student.first_name}</td>
                      <td>{student.last_name}</td>
                      <td>{student.email}</td>
                      <td className="action-buttons">
                        <Link to={`/students/${student.id}`}>
                          <Button variant="info" size="sm">View</Button>
                        </Link>{' '}
                        <Link to={`/students/edit/${student.id}`}>
                          <Button variant="warning" size="sm">Edit</Button>
                        </Link>{' '}
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => handleDelete(student.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
          
          <Row className="mt-3">
            <Col md={6}>
              <Form.Group as={Row} className="align-items-center">
                <Form.Label column sm={6}>Items per page:</Form.Label>
                <Col sm={6}>
                  <Form.Select 
                    value={limit} 
                    onChange={handleLimitChange}
                    className="form-select-sm"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </Form.Select>
                </Col>
              </Form.Group>
            </Col>
            <Col md={6} className="text-end">
              <div className="pagination-info">
                Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalCount)} of {totalCount} entries
              </div>
            </Col>
          </Row>
          
          <div className="d-flex justify-content-center">
            {paginationBasic}
          </div>
        </>
      ) : (
        <Card>
          <Card.Body className="text-center py-5">
            <h4>No students found</h4>
            <p>Try adjusting your search or add a new student.</p>
            <Link to="/students/add">
              <Button variant="primary">Add New Student</Button>
            </Link>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default StudentList;
