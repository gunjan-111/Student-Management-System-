const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { pool } = require('../db');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Helper: generate admission number
const generateAdmissionNumber = async () => {
  const year = new Date().getFullYear().toString().slice(-2);
  const { rows } = await pool.query(
    `SELECT admission_number FROM students 
     WHERE admission_number LIKE $1 
     ORDER BY admission_number DESC LIMIT 1`,
    [`ADM${year}%`]
  );
  let seq = 1;
  if (rows.length > 0) {
    const last = rows[0].admission_number;
    seq = parseInt(last.slice(-4)) + 1;
  }
  return `ADM${year}${String(seq).padStart(4, '0')}`;
};

// Helper: handle validation errors
const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  return null;
};

// Validation rules
const studentValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('course').trim().notEmpty().withMessage('Course is required'),
  body('year').isInt({ min: 1, max: 6 }).withMessage('Year must be between 1 and 6'),
  body('date_of_birth').isDate().withMessage('Valid date of birth is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('mobile')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Valid 10-digit Indian mobile number required'),
  body('gender')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  body('address').trim().notEmpty().withMessage('Address is required'),
];

// GET /students — fetch all with optional search
router.get('/', async (req, res) => {
  try {
    const { search, course, year, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    const conditions = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(
        `(name ILIKE $${params.length} OR admission_number ILIKE $${params.length} OR email ILIKE $${params.length})`
      );
    }
    if (course) {
      params.push(course);
      conditions.push(`course = $${params.length}`);
    }
    if (year) {
      params.push(parseInt(year));
      conditions.push(`year = $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) FROM students ${whereClause}`;
    const dataQuery = `
      SELECT id, admission_number, name, course, year, date_of_birth,
             email, mobile, gender, address, photo_path, created_at, updated_at
      FROM students ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, params),
      pool.query(dataQuery, [...params, parseInt(limit), offset]),
    ]);

    res.json({
      success: true,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      students: dataResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /students/:id — fetch single student
router.get('/:id', param('id').isInt(), async (req, res) => {
  const err = handleValidation(req, res);
  if (err) return;
  try {
    const { rows } = await pool.query('SELECT * FROM students WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, student: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /students — add new student
router.post('/', upload.single('photo'), studentValidation, async (req, res) => {
  const validErr = handleValidation(req, res);
  if (validErr) return;

  try {
    const admissionNumber = await generateAdmissionNumber();
    const { name, course, year, date_of_birth, email, mobile, gender, address } = req.body;
    const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

    const { rows } = await pool.query(
      `INSERT INTO students 
        (admission_number, name, course, year, date_of_birth, email, mobile, gender, address, photo_path)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [admissionNumber, name, course, year, date_of_birth, email, mobile, gender, address, photoPath]
    );

    res.status(201).json({ success: true, student: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      const field = err.constraint?.includes('email') ? 'Email' : 'Admission number';
      return res.status(409).json({ success: false, message: `${field} already exists` });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /students/:id — update student
router.put('/:id', upload.single('photo'), param('id').isInt(), studentValidation, async (req, res) => {
  const validErr = handleValidation(req, res);
  if (validErr) return;

  try {
    const { rows: existing } = await pool.query('SELECT * FROM students WHERE id = $1', [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Student not found' });

    const { name, course, year, date_of_birth, email, mobile, gender, address } = req.body;

    let photoPath = existing[0].photo_path;
    if (req.file) {
      // Delete old photo if exists
      if (photoPath) {
        const oldPath = path.join(__dirname, '..', photoPath);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      photoPath = `/uploads/${req.file.filename}`;
    }

    const { rows } = await pool.query(
      `UPDATE students SET
        name=$1, course=$2, year=$3, date_of_birth=$4,
        email=$5, mobile=$6, gender=$7, address=$8, photo_path=$9
       WHERE id=$10 RETURNING *`,
      [name, course, year, date_of_birth, email, mobile, gender, address, photoPath, req.params.id]
    );

    res.json({ success: true, student: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Email already in use by another student' });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /students/:id — delete student
router.delete('/:id', param('id').isInt(), async (req, res) => {
  const validErr = handleValidation(req, res);
  if (validErr) return;

  try {
    const { rows } = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Student not found' });

    // Clean up photo
    if (rows[0].photo_path) {
      const photoPath = path.join(__dirname, '..', rows[0].photo_path);
      if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
    }

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
