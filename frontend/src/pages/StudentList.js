import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getStudents, deleteStudent } from '../utils/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const COURSES = ['B.Tech', 'B.Sc', 'BCA', 'MCA', 'M.Tech', 'MBA', 'BBA', 'B.Com', 'M.Sc'];

export default function StudentList() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const LIMIT = 10;

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      if (filterCourse) params.course = filterCourse;
      if (filterYear) params.year = filterYear;
      const { data } = await getStudents(params);
      setStudents(data.students);
      setTotal(data.total);
    } catch {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [search, filterCourse, filterYear, page]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // Debounce search
  useEffect(() => { setPage(1); }, [search, filterCourse, filterYear]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await deleteStudent(deleteModal.id);
      toast.success(`${deleteModal.name} has been removed`);
      setDeleteModal(null);
      fetchStudents();
    } catch {
      toast.error('Failed to delete student');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  const getInitials = (name) => name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?';

  const yearLabel = (y) => {
    const s = ['st','nd','rd'];
    return `${y}${s[y-1] || 'th'} Year`;
  };

  return (
    <div className="page">
      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{total}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{students.filter(s => s.gender === 'Male').length}</div>
          <div className="stat-label">Male Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{students.filter(s => s.gender === 'Female').length}</div>
          <div className="stat-label">Female Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{[...new Set(students.map(s => s.course))].length}</div>
          <div className="stat-label">Courses</div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, email, or admission no..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
          <option value="">All Courses</option>
          {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="filter-select" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
          <option value="">All Years</option>
          {[1,2,3,4,5,6].map(y => <option key={y} value={y}>{yearLabel(y)}</option>)}
        </select>
        <button className="btn btn-primary" onClick={() => navigate('/add')}>
          ＋ Add Student
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-header">
          <h3>{total} student{total !== 1 ? 's' : ''} found</h3>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner" /> Loading students...
          </div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎓</div>
            <h3>No students found</h3>
            <p>Try adjusting your search or add a new student.</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Admission No.</th>
                    <th>Course</th>
                    <th>Year</th>
                    <th>Mobile</th>
                    <th>Gender</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div className="student-name-cell">
                          <div className="student-avatar">
                            {s.photo_path
                              ? <img src={`${API_URL}${s.photo_path}`} alt={s.name} />
                              : getInitials(s.name)
                            }
                          </div>
                          <div>
                            <div className="name">{s.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-blue">{s.admission_number}</span>
                      </td>
                      <td>{s.course}</td>
                      <td>
                        <span className="badge badge-green">{yearLabel(s.year)}</span>
                      </td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>{s.mobile}</td>
                      <td>
                        <span className={`badge ${s.gender === 'Male' ? 'badge-blue' : s.gender === 'Female' ? 'badge-yellow' : 'badge-green'}`}>
                          {s.gender}
                        </span>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button className="btn btn-secondary btn-sm btn-icon" title="View" onClick={() => navigate(`/student/${s.id}`)}>👁</button>
                          <button className="btn btn-secondary btn-sm btn-icon" title="Edit" onClick={() => navigate(`/edit/${s.id}`)}>✏️</button>
                          <button className="btn btn-danger btn-sm btn-icon" title="Delete" onClick={() => setDeleteModal(s)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete modal */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => !deleting && setDeleteModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>⚠️ Delete Student</h3>
            <p>
              Are you sure you want to permanently delete <strong>{deleteModal.name}</strong> ({deleteModal.admission_number})?
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteModal(null)} disabled={deleting}>Cancel</button>
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
