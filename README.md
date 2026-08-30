# First Step LMS

A full-stack Learning Management System built with Next.js and Strapi.

**Live Demo:** https://first-step-lms.vercel.app

---

## Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS, Axios
- **Backend:** Strapi v5, PostgreSQL (Production), SQLite (Local)
- **Deployment:** Vercel (Frontend), Railway (Backend)

---

## Features Completed

### Student

- Register and login
- Browse and enroll in courses
- View lessons with video and notes
- Mark lessons as complete with progress tracking
- Take quizzes with auto-grading
- View quiz results and scores

### Instructor

- View assigned courses
- Add, edit and delete lessons
- Create quizzes with questions
- View enrolled students and their progress

### Content Manager

- Create, edit and delete courses
- Assign instructors to courses
- Publish or draft courses
- Write, edit and publish blog posts

### Admin

- View platform statistics (users, courses, enrollments, blog posts)
- Manage all users and change their roles
- View all courses and blog posts
- Access content manager dashboard

### Public

- Browse all published courses
- Read published blog posts
- Register and login

---

## Role-Based Access Control

4 custom roles in Strapi:

- **Student** - Enroll, learn, take quizzes
- **Instructor** - Manage own courses and lessons
- **Content Manager** - Manage all courses and blogs
- **Admin** - Full platform control

---

## How to Run Locally

### Prerequisites

- Node.js 18+
- npm

### Backend (Strapi)

```bash
cd backend
npm install
npm run develop
```

Strapi runs at: http://localhost:1337/admin

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:3000

### Environment Variables

**backend/.env**
HOST=0.0.0.0
PORT=1337
APP_KEYS=your_app_keys
API_TOKEN_SALT=your_salt
ADMIN_JWT_SECRET=your_secret
JWT_SECRET=your_jwt_secret
TRANSFER_TOKEN_SALT=your_transfer_salt
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

---

**frontend/.env.local**
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_API_URL=http://localhost:1337/api

---

## Deployment

- **Backend:** Railway (with PostgreSQL database)
- **Frontend:** Vercel (connected to GitHub repo)
- Environment variables configured in Railway and Vercel dashboards

