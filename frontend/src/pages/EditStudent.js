import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getStudent, updateStudent } from '../utils/api';
import StudentForm from '../components/StudentForm';

export default function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getStudent(id)
      .then(({ data }) => setStudent(data.student))
      .catch(() => { toast.error('Student not found'); navigate('/'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await updateStudent(id, formData);
      toast.success('Student updated successfully');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to update';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /> Loading student...</div>;

  const initialData = {
    name: student.name,
    course: student.course,
    year: String(student.year),
    date_of_birth: student.date_of_birth?.split('T')[0],
    email: student.email,
    mobile: student.mobile,
    gender: student.gender,
    address: student.address,
    photo_path: student.photo_path,
  };

  return (
    <div className="page">
      <div className="form-container">
        <h2 className="form-title">Edit Student</h2>
        <p className="form-subtitle">
          Admission No: <span style={{ color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{student.admission_number}</span>
        </p>
        <StudentForm
          initialData={initialData}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Update Student"
        />
      </div>
    </div>
  );
}
