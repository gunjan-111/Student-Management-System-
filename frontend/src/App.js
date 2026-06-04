import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import StudentList from './pages/StudentList';
import AddStudent from './pages/AddStudent';
import EditStudent from './pages/EditStudent';
import StudentDetail from './pages/StudentDetail';

const NAV = [
  { path: '/', label: 'All Students', icon: '👥' },
  { path: '/add', label: 'Add Student', icon: '➕' },
];

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">🎓</div>
          <h1>Student<br/>Management</h1>
          <span>v1.0.0</span>
        </div>
        <nav className="sidebar-nav">
          {NAV.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => { navigate(item.path); setSidebarOpen(false); }}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Built with React · Node.js · PostgreSQL
          </p>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-title">
            <h2>
              {location.pathname === '/' && 'Student Records'}
              {location.pathname === '/add' && 'Add New Student'}
              {location.pathname.startsWith('/edit') && 'Edit Student'}
              {location.pathname.startsWith('/student') && 'Student Profile'}
            </h2>
            <p>Student Management System</p>
          </div>
          <button
            className="btn btn-secondary"
            style={{ display: 'none' }}
            onClick={() => setSidebarOpen(true)}
            id="menu-btn"
          >
            ☰
          </button>
        </div>

        <Routes>
          <Route path="/" element={<StudentList />} />
          <Route path="/add" element={<AddStudent />} />
          <Route path="/edit/:id" element={<EditStudent />} />
          <Route path="/student/:id" element={<StudentDetail />} />
        </Routes>
      </main>
    </div>
  );
}
