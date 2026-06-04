# 🎓 Student Management System

A full-stack Student Management System built with **React**, **Node.js (Express)**, and **PostgreSQL**.

## 📸 Screenshots

> Add screenshots to this section after setup.

---

## 🛠 Technologies Used

| Layer      | Technology                      |
|------------|---------------------------------|
| Frontend   | React 18, React Router v6, Axios |
| Backend    | Node.js, Express.js             |
| Database   | PostgreSQL                      |
| Validation | express-validator (backend), custom hooks (frontend) |
| File Upload| Multer                          |
| Styling    | Custom CSS (no UI framework)    |

---

## 📁 Project Structure

```
student-management/
├── backend/
│   ├── middleware/
│   │   └── upload.js       # Multer config for photo uploads
│   ├── routes/
│   │   └── students.js     # All student API routes
│   ├── uploads/            # Uploaded student photos (git-ignored)
│   ├── db.js               # PostgreSQL connection + DB init
│   ├── server.js           # Express app entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── StudentForm.js    # Reusable form with validation
    │   ├── pages/
    │   │   ├── StudentList.js    # List + search + filter
    │   │   ├── AddStudent.js     # Add new student
    │   │   ├── EditStudent.js    # Edit existing student
    │   │   └── StudentDetail.js  # View student profile
    │   ├── utils/
    │   │   └── api.js            # Axios API calls
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── .env
    └── package.json
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- PostgreSQL 14+
- Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/student-management.git
cd student-management
```

---

### 2. Database Setup

```sql
-- Connect to PostgreSQL and run:
CREATE DATABASE student_management;
```

The tables are auto-created on first server start.

---

### 3. Backend Setup

```bash
cd backend
npm install

# Create your .env file
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=student_management
DB_USER=postgres
DB_PASSWORD=your_postgres_password
FRONTEND_URL=http://localhost:3000
```

```bash
npm run dev     # Development (with nodemon)
# or
npm start       # Production
```

Backend runs at: `http://localhost:5000`

---

### 4. Frontend Setup

```bash
cd frontend
npm install

# Create your .env file
cp .env.example .env
```

Edit `.env`:

```env
REACT_APP_API_URL=http://localhost:5000
```

```bash
npm start
```

Frontend runs at: `http://localhost:3000`

---

## 🔌 API Endpoints

| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | `/students`           | Fetch all students (supports `?search=`, `?course=`, `?year=`, `?page=`, `?limit=`) |
| GET    | `/students/:id`       | Fetch single student     |
| POST   | `/students`           | Add new student (multipart/form-data) |
| PUT    | `/students/:id`       | Update student           |
| DELETE | `/students/:id`       | Delete student           |
| GET    | `/health`             | Health check             |

### POST /students — Request Body (form-data)

| Field          | Type     | Required | Notes                        |
|----------------|----------|----------|------------------------------|
| name           | string   | ✅       | Max 100 chars                |
| course         | string   | ✅       |                              |
| year           | number   | ✅       | 1–6                          |
| date_of_birth  | date     | ✅       | YYYY-MM-DD                   |
| email          | string   | ✅       | Must be unique               |
| mobile         | string   | ✅       | 10-digit Indian mobile       |
| gender         | string   | ✅       | Male / Female / Other        |
| address        | string   | ✅       |                              |
| photo          | file     | ❌       | jpg/png/gif/webp, max 5MB    |

---

## 🗃 Database Schema

```sql
CREATE TABLE students (
  id               SERIAL PRIMARY KEY,
  admission_number VARCHAR(20)  UNIQUE NOT NULL,  -- Auto-generated: ADM{YY}{0001}
  name             VARCHAR(100) NOT NULL,
  course           VARCHAR(100) NOT NULL,
  year             INTEGER      NOT NULL CHECK (year BETWEEN 1 AND 6),
  date_of_birth    DATE         NOT NULL,
  email            VARCHAR(150) UNIQUE NOT NULL,
  mobile           VARCHAR(15)  NOT NULL,
  gender           VARCHAR(10)  NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  address          TEXT         NOT NULL,
  photo_path       VARCHAR(255),
  created_at       TIMESTAMP    DEFAULT NOW(),
  updated_at       TIMESTAMP    DEFAULT NOW()
);
```

**Admission Number format:** `ADM{YY}{NNNN}` — e.g., `ADM250001`, `ADM250002`

---

## ✅ Features

- **Add Student** — Full form with photo upload
- **Edit Student** — Pre-filled form, photo replacement
- **View Students** — Paginated table with avatars
- **Delete Student** — Confirmation modal
- **Student Profile** — Full detail view
- **Search** — By name, email, or admission number
- **Filter** — By course and year
- **Auto Admission Number** — Sequential, unique, year-prefixed
- **Form Validation** — Both frontend and backend
- **Responsive UI** — Mobile-friendly layout
- **Environment Variables** — `.env` based config

---

## 🚀 Deployment (Optional)

### Backend → Render / Railway
1. Push to GitHub
2. Connect repo to Render/Railway
3. Set environment variables
4. Deploy

### Frontend → Vercel / Netlify
1. Set `REACT_APP_API_URL` to your deployed backend URL
2. Connect repo and deploy

---

## 👨‍💻 Author

Built as a technical assessment demonstrating full-stack development with React, Node.js, and PostgreSQL.
