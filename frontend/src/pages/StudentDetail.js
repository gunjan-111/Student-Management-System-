import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getStudent, deleteStudent } from '../utils/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getStudent(id)
      .then(({ data }) => setStudent(data.student))
      .catch(() => { toast.error('Student not found'); navigate('/'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteStudent(id);
      toast.success('Student deleted');
      navigate('/');
    } catch {
      toast.error('Failed to delete');
      setDeleting(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /> Loading...</div>;
  if (!student) return null;

  const dob = new Date(student.date_of_birth);
  const age = Math.floor((new Date() - dob) / (365.25 * 24 * 60 * 60 * 1000));

  const fields = [
    { label: 'Admission Number', value: student.admission_number },
    { label: 'Course', value: student.course },
    { label: 'Year', value: `${student.year}${['st','nd','rd'][student.year-1]||'th'} Year` },
    { label: 'Date of Birth', value: dob.toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' }) },
    { label: 'Age', value: `${age} years` },
    { label: 'Gender', value: student.gender },
    { label: 'Email', value: student.email },
    { label: 'Mobile', value: student.mobile },
    { label: 'Enrolled On', value: new Date(student.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' }) },
    { label: 'Last Updated', value: new Date(student.updated_at).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' }) },
  ];

  return (
    <div className="page">
      {/* Back */}
      <button className="btn btn-secondary" style={{ marginBottom: 24 }} onClick={() => navigate('/')}>
        ← Back to List
      </button>

      {/* Header card */}
      <div className="detail-header">
        {student.photo_path
          ? <img src={`${API_URL}${student.photo_path}`} alt={student.name} className="detail-photo" />
          : <div className="detail-photo-placeholder">🎓</div>
        }
        <div className="detail-info" style={{ flex: 1 }}>
          <h2>{student.name}</h2>
          <div className="adm-badge">{student.admission_number}</div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="badge badge-blue">{student.course}</span>
            <span className="badge badge-green">{student.year}{['st','nd','rd'][student.year-1]||'th'} Year</span>
            <span className={`badge ${student.gender==='Male'?'badge-blue':student.gender==='Female'?'badge-yellow':'badge-green'}`}>{student.gender}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate(`/edit/${id}`)}>✏️ Edit</button>
          <button className="btn btn-danger" onClick={() => setDeleteModal(true)}>🗑 Delete</button>
        </div>
      </div>

      {/* Fields grid */}
      <div className="detail-grid">
        {fields.map(f => (
          <div key={f.label} className="detail-field">
            <div className="field-label">{f.label}</div>
            <div className="field-value" style={f.label === 'Admission Number' ? { fontFamily: 'var(--mono)', color: 'var(--accent)' } : {}}>{f.value}</div>
          </div>
        ))}
        <div className="detail-field" style={{ gridColumn: '1 / -1' }}>
          <div className="field-label">Address</div>
          <div className="field-value">{student.address}</div>
        </div>
      </div>

      {/* Delete modal */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => !deleting && setDeleteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>⚠️ Delete Student</h3>
            <p>Permanently delete <strong>{student.name}</strong>? This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteModal(false)} disabled={deleting}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
