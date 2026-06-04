import React, { useState } from 'react';

const COURSES = ['B.Tech', 'B.Sc', 'BCA', 'MCA', 'M.Tech', 'MBA', 'BBA', 'B.Com', 'M.Sc'];

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const INITIAL = {
  name: '', course: '', year: '', date_of_birth: '',
  email: '', mobile: '', gender: '', address: '',
};

const validate = (fields) => {
  const errs = {};
  if (!fields.name.trim()) errs.name = 'Name is required';
  else if (fields.name.length > 100) errs.name = 'Max 100 characters';
  if (!fields.course) errs.course = 'Course is required';
  if (!fields.year) errs.year = 'Year is required';
  if (!fields.date_of_birth) errs.date_of_birth = 'Date of birth is required';
  if (!fields.email.trim()) errs.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errs.email = 'Valid email required';
  if (!fields.mobile.trim()) errs.mobile = 'Mobile is required';
  else if (!/^[6-9]\d{9}$/.test(fields.mobile)) errs.mobile = 'Valid 10-digit Indian mobile required';
  if (!fields.gender) errs.gender = 'Gender is required';
  if (!fields.address.trim()) errs.address = 'Address is required';
  return errs;
};

const parseDOB = (dob) => {
  if (!dob) return { day: '', month: '', year: '' };
  const d = new Date(dob);
  if (isNaN(d)) return { day: '', month: '', year: '' };
  return {
    day: String(d.getUTCDate()),
    month: String(d.getUTCMonth() + 1),
    year: String(d.getUTCFullYear()),
  };
};

export default function StudentForm({ initialData = {}, onSubmit, submitting, submitLabel }) {
  const [fields, setFields] = useState({ ...INITIAL, ...initialData });
  const [dob, setDob] = useState(parseDOB(initialData.date_of_birth));
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(initialData.photo_path || null);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setFields(f => ({ ...f, [k]: v }));

  const handleDOB = (part, value) => {
    const updated = { ...dob, [part]: value };
    setDob(updated);
    if (updated.day && updated.month && updated.year && updated.year.length === 4) {
      const mm = String(updated.month).padStart(2, '0');
      const dd = String(updated.day).padStart(2, '0');
      set('date_of_birth', `${updated.year}-${mm}-${dd}`);
    } else {
      set('date_of_birth', '');
    }
  };

  const handleMobile = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    set('mobile', val);
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, photo: 'Only image files allowed' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, photo: 'File must be under 5MB' }));
      return;
    }
    setPhoto(file);
    setErrors(prev => ({ ...prev, photo: undefined }));
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(fields);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
    if (photo) fd.append('photo', photo);
    onSubmit(fd);
  };

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const previewSrc = photoPreview?.startsWith('data:')
    ? photoPreview
    : photoPreview
    ? `${API_URL}${photoPreview}`
    : null;

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1979 }, (_, i) => currentYear - i);

  return (
    <form onSubmit={handleSubmit} noValidate>

      {/* ── Photo ── */}
      <div className="form-section">
        <div className="form-section-title">📸 Student Photo</div>
        <div className="photo-upload">
          <input type="file" accept="image/*" onChange={handlePhoto} />
          {previewSrc
            ? <img src={previewSrc} alt="Preview" className="photo-preview" />
            : <div className="upload-icon">📷</div>
          }
          <p>
            {previewSrc
              ? 'Click to change photo'
              : <><span>Click to upload</span> a photo (max 5MB)</>
            }
          </p>
          {errors.photo && (
            <span className="error-msg" style={{ display: 'block', marginTop: 8 }}>
              {errors.photo}
            </span>
          )}
        </div>
      </div>

      {/* ── Personal Information ── */}
      <div className="form-section">
        <div className="form-section-title">👤 Personal Information</div>
        <div className="form-grid">

          {/* Name */}
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              placeholder="Enter full name"
              value={fields.name}
              onChange={e => set('name', e.target.value)}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-msg">{errors.name}</span>}
          </div>

          {/* Date of Birth */}
          <div className="form-group">
            <label>Date of Birth *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.5fr', gap: 8 }}>
              <select
                value={dob.day}
                onChange={e => handleDOB('day', e.target.value)}
                className={errors.date_of_birth ? 'error' : ''}
              >
                <option value="">Day</option>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select
                value={dob.month}
                onChange={e => handleDOB('month', e.target.value)}
                className={errors.date_of_birth ? 'error' : ''}
              >
                <option value="">Month</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
              <select
                value={dob.year}
                onChange={e => handleDOB('year', e.target.value)}
                className={errors.date_of_birth ? 'error' : ''}
              >
                <option value="">Year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            {errors.date_of_birth && (
              <span className="error-msg">{errors.date_of_birth}</span>
            )}
          </div>

          {/* Gender */}
          <div className="form-group">
            <label>Gender *</label>
            <select
              value={fields.gender}
              onChange={e => set('gender', e.target.value)}
              className={errors.gender ? 'error' : ''}
            >
              <option value="">Select gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
            {errors.gender && <span className="error-msg">{errors.gender}</span>}
          </div>

          {/* Mobile */}
          <div className="form-group">
            <label>Mobile Number *</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="10-digit mobile number"
              value={fields.mobile}
              onChange={handleMobile}
              maxLength={10}
              className={errors.mobile ? 'error' : ''}
            />
            {fields.mobile && (
              <span style={{
                fontSize: '0.75rem',
                color: fields.mobile.length === 10 ? 'var(--success)' : 'var(--text-muted)'
              }}>
                {fields.mobile.length}/10 digits
              </span>
            )}
            {errors.mobile && <span className="error-msg">{errors.mobile}</span>}
          </div>

          {/* Email */}
          <div className="form-group form-full">
            <label>Email Address *</label>
            <input
              type="email"
              placeholder="student@email.com"
              value={fields.email}
              onChange={e => set('email', e.target.value)}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>

        </div>
      </div>

      {/* ── Academic Information ── */}
      <div className="form-section">
        <div className="form-section-title">🎓 Academic Information</div>
        <div className="form-grid">

          {/* Course */}
          <div className="form-group">
            <label>Course *</label>
            <select
              value={fields.course}
              onChange={e => set('course', e.target.value)}
              className={errors.course ? 'error' : ''}
            >
              <option value="">Select course</option>
              {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.course && <span className="error-msg">{errors.course}</span>}
          </div>

          {/* Year */}
          <div className="form-group">
            <label>Year *</label>
            <select
              value={fields.year}
              onChange={e => set('year', e.target.value)}
              className={errors.year ? 'error' : ''}
            >
              <option value="">Select year</option>
              {[1,2,3,4,5,6].map(y => (
                <option key={y} value={y}>
                  {y}{['st','nd','rd'][y-1] || 'th'} Year
                </option>
              ))}
            </select>
            {errors.year && <span className="error-msg">{errors.year}</span>}
          </div>

        </div>
      </div>

      {/* ── Address ── */}
      <div className="form-section">
        <div className="form-section-title">📍 Address</div>
        <div className="form-group">
          <label>Full Address *</label>
          <textarea
            value={fields.address}
            onChange={e => set('address', e.target.value)}
            placeholder="Enter complete address..."
            className={errors.address ? 'error' : ''}
            rows={3}
          />
          {errors.address && <span className="error-msg">{errors.address}</span>}
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => window.history.back()}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel || 'Save Student'}
        </button>
      </div>

    </form>
  );
}
