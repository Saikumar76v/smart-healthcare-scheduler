# 🏥 Smart Healthcare Appointment Scheduler

A full-stack, enterprise-ready healthcare management solution featuring AI-driven slot optimization, automated SMS communication, and a sleek modern interface.

![Production Ready](https://img.shields.io/badge/status-production--ready-brightgreen)
![MERN Stack](https://img.shields.io/badge/stack-MERN-blue)
![AI Enabled](https://img.shields.io/badge/AI-Enabled-indigo)

---

## 🚀 Overview
The **Smart Healthcare Appointment Scheduler** is designed to eliminate administrative friction in clinical environments. By combining **Vite/React** frontend speed with a robust **Node/Express** backend, it provides a seamless experience for Patients, Doctors, and Administrators.

### 🌐 Live Deployment
- **Frontend**: [https://smart-healthcare-scheduler.vercel.app](https://smart-healthcare-scheduler.vercel.app)
- **Backend API**: [https://smart-healthcare-scheduler.onrender.com](https://smart-healthcare-scheduler.onrender.com)

---

## 🛠️ Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS 4, Axios, React Router 7.
- **Backend**: Node.js, Express, MongoDB/Mongoose.
- **Security**: JWT Authentication, Bcrypt Password Hashing.
- **Communication**: Twilio SMS API, Node-Cron (Automated Reminders).
- **Intelligence**: Mock AI Patient Triage (offline), AI Slot Optimization Algorithm.

---

## ✨ Feature Checklist

### 👤 User Roles
- [x] **Patient**: Triage through AI, book optimal slots, own dashboard.
- [x] **Doctor**: Manage bookings, clinical calendar view, approval workflow.
- [x] **Admin**: System-wide oversight of users and appointments.

### 📅 Scheduling Engine
- [x] **Conflict Detection**: Real-time prevention of double-bookings.
- [x] **AI Smart Slot**: One-click analysis to find the earliest available gap.
- [x] **Reschedule Workflow**: Full data persistence with SMS synchronization.
- [x] **Clinical Calendar**: Grouped timeline view for medical specialists.

### 📱 Communication & Automation
- [x] **SMS System**: Twilio-powered alerts for Booking, Approval, and Changes.
- [x] **Reminder Job**: Automated cron service sending SMS 1 hour before sessions.

### 🤖 AI Intelligence
- [x] **Health Assistant**: Symptom analysis with urgency rating and specialist referral.
- [x] **Pattern Matching**: Keyword-based healthcare triage (Offline/Privacy-focused).

---

## 🏃 Setup Instructions

### 1. Backend Configuration
```bash
cd backend
npm install
cp .env.example .env # Fill in your Twilio and Mongo keys
npm run dev
```

### 2. Frontend Configuration
```bash
cd frontend
npm install
# Ensure .env is set with VITE_API_URL if needed
npm run dev
```

---

## 🔐 Credentials for Testing
- **Admin**: `admin@example.com` / `admin123`
- **Demo Doctor**: `doctor@test.com` / `doctor123`
- **Sample Patient**: `patient@test.com` / `patient123`

---

## 📄 Repository Documentation
For detailed deep-dives, refer to:
- [Walkthrough Guide](./walkthrough.md): Full system tour and internal features.
- [API Reference](./api_reference.md): Technical documentation for all REST endpoints.
- [Deployment Guide](./deployment_guide.md): Production setup for Render/Vercel/Atlas.
- [QA Report](./qa_report.md): Final system verification and test results.
- [Handover Package](./handover_package.md): Resume bullets and demo presentation script.

---

## ✅ Final Submission Checklist
- [x] **Runs Locally**: Backend and Frontend sync perfectly.
- [x] **SMS Engine**: Verified Twilio logs for all booking actions.
- [x] **AI Assistant**: Triage and Slot suggestions working.
- [x] **Security**: `.env` files gitignored; no secrets committed.
- [x] **Dependencies**: `node_modules` removed from repo structure.

---

**Built with ❤️ for Modern Healthcare.**
*Last Updated: January 31, 2026*
