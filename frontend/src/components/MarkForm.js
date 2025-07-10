import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Form, Button, Card } from 'react-bootstrap';
import Swal from 'sweetalert2';
import api from '../services/api';

const MarkForm = () => {
  const { studentId, markId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!markId;

  const [formData, setFormData] = useState({
    student_id: studentId,
    subject_id: '',
    score: '',
    exam_date: ''
  });

  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch student data
        const studentResponse = await api.get(`/api/students/${studentId}`);
        setStudent(studentResponse.data);
        
        // Fetch subjects
        const subjectsResponse = await api.get('/api/subjects');
        setSubjects(subjectsResponse.data || []);
        
        // If edit mode, fetch mark data
        if (isEditMode) {
          const markResponse = await api.get(`/api/marks/${markId}`);
          
          // Format date for input field (YYYY-MM-DD)
          let formattedData = { ...markResponse.data };
          if (formattedData.exam_date) {
            formattedData.exam_date = new Date(formattedData.exam_date).toISOString().split('T')[0];
          }
          
          setFormData(formattedData);
        } else {
          // Set today's date as default for new marks
          setFormData({
            ...formData,
            exam_date: new Date().toISOString().split('T')[0]
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch data. Please try again later.',
        });
        setLoading(false);
        navigate(`/students/${studentId}`);
      }
    };

    fetchInitialData();
  }, [studentId, markId, isEditMode]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.subject_id) {
      newErrors.subject_id = 'Subject is required';
    }
    
    if (!formData.score) {
      newErrors.score = 'Score is required';
    } else if (isNaN(formData.score) || parseFloat(formData.score) < 0 || parseFloat(formData.score) > 100) {
      newErrors.score = 'Score must be a number between 0 and 100';
    }
    
    if (!formData.exam_date) {
      newErrors.exam_date = 'Exam date is required';
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.exam_date)) {
        newErrors.exam_date = 'Date must be in YYYY-MM-DD format';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      if (isEditMode) {
        await api.put(`/api/marks/${markId}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Mark updated successfully!',
          timer: 1500
        });
      } else {
        await api.post('/api/marks', formData);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Mark added successfully!',
          timer: 1500
        });
      }
      
      navigate(`/students/${studentId}`);
    } catch (error) {
      console.error('Error submitting form:', error);
      
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage
      });
      
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h2 className="page-title">
        {isEditMode ? 'Edit Mark' : 'Add New Mark'} for {student?.first_name} {student?.last_name}
      </h2>
      
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="required-field">Subject</Form.Label>
              <Form.Select
                name="subject_id"
                value={formData.subject_id}
                onChange={handleChange}
                isInvalid={!!errors.subject_id}
                disabled={isEditMode} // Can't change subject in edit mode
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.subject_name} ({subject.subject_code})
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.subject_id}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="required-field">Score (0-100)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                max="100"
                step="0.01"
                name="score"
                value={formData.score}
                onChange={handleChange}
                isInvalid={!!errors.score}
              />
              <Form.Control.Feedback type="invalid">
                {errors.score}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="required-field">Exam Date</Form.Label>
              <Form.Control
                type="date"
                name="exam_date"
                value={formData.exam_date}
                onChange={handleChange}
                isInvalid={!!errors.exam_date}
              />
              <Form.Control.Feedback type="invalid">
                {errors.exam_date}
              </Form.Control.Feedback>
            </Form.Group>
            
            <div className="d-flex justify-content-between">
              <Link to={`/students/${studentId}`}>
                <Button variant="secondary">Cancel</Button>
              </Link>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {isEditMode ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  isEditMode ? 'Update Mark' : 'Add Mark'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default MarkForm;
