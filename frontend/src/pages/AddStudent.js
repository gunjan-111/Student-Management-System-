import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createStudent } from '../utils/api';
import StudentForm from '../components/StudentForm';

export default function AddStudent() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const { data } = await createStudent(formData);
      toast.success(`Student added! Admission No: ${data.student.admission_number}`);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to add student';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="form-container">
        <h2 className="form-title">Add New Student</h2>
        <p className="form-subtitle">Fill in the details below. An admission number will be auto-generated.</p>
        <StudentForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Add Student" />
      </div>
    </div>
  );
}
