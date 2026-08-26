# AegisCare - Hospital Management System (Full-Stack React + Django REST)

A full-stack, enterprise-grade Hospital Management System web application built with **React JS (Vite), Bootstrap 5, Python, Django REST Framework, and SQLite**.

---

## 🌟 Key Features & Role-Based Access Control (RBAC)
Attractive homepage/dashboard
● Patient registration system
● Doctor management section
● Appointment booking system
● Billing/payment section
● Search functionality
### 🔐 Multi-Role System & RBAC Protection
- **Server-Side Security**: Custom Django REST Framework permissions (`IsAdminRole`, `IsDoctorRole`, `IsPatientRole`) strictly enforce access at the API layer.
- **Client-Side Guard**: React Router `<ProtectedRoute>` guards pages and prevents cross-role URL navigation.
- **Roles**:
  - **Admin**: Full system analytics, Doctor CRUD, Ward Bed allocation, Itemized Billing, Insurance claim approvals.
  - **Doctor**: Appointment manager, Live Walk-in Token queue control, Electronic Prescription writer & Diagnosis logger.
  - **Patient**: Self-service portal, slot appointment booking, walk-in token issuance, medical history viewer, bill payment toggle, and bed admission tracking.

---

## 🔑 Pre-Seeded Demo Login Credentials

The database comes pre-populated with realistic demo data. Launch the app and use these credentials:

| Role | Username | Password | Key Responsibilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Dashboard analytics, doctor CRUD, bed matrix, billing & claim approvals |
| **Doctor** | `dr.smith` | `doctor123` | Cardiology queue board, write prescriptions, complete visit visits |
| **Patient** | `patient.alice` | `patient123` | Book appointment slots, walk-in tokens, view medical history & bills |
| **Patient** | `patient.bob` | `patient123` | Secondary patient demo account |

---

## 🚀 How to Run the Application Locally

### Prerequisites
- **Python** 3.10+
- **Node.js** 18+ and **npm**

---

### Step 1: Start the Backend (Django REST Framework)

1. Open a terminal in the root project directory:
   ```bash
   cd c:\Users\grsiv\OneDrive\Desktop\GITHUB\hospital-management-system
   ```

2. Run migrations (if starting fresh):
   ```bash
   python manage.py migrate
   ```

3. Seed demo data (populates Admin, Doctors, Patients, Beds, Appointments, Tokens, Bills):
   ```bash
   python manage.py seed_demo_data
   ```

4. Create a custom superuser (optional):
   ```bash
   python manage.py createsuperuser
   ```

5. Start the Django Development Server on port 8000:
   ```bash
   python manage.py runserver 8000
   ```

   The backend API will be live at `http://127.0.0.1:8000/api/`.

---

### Step 2: Start the Frontend (React JS + Vite)

1. Open a second terminal and navigate to the `frontend/` directory:
   ```bash
   cd c:\Users\grsiv\OneDrive\Desktop\GITHUB\hospital-management-system\frontend
   ```

2. Install npm dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the React Vite Development Server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```text
   http://localhost:5173/
   ```

---

## 🛠️ Project Structure

```text
hospital-management-system/
├── backend/
│   ├── hms_app/
│   │   ├── models.py           # User, Doctor, Patient, Appointment, Token, Bed, Bill, Claim
│   │   ├── serializers.py      # DRF Serializers
│   │   ├── api_views.py        # REST API ViewSets & Auth endpoints
│   │   ├── permissions.py      # Custom DRF RBAC permissions
│   │   └── management/commands/seed_demo_data.py
│   ├── hospital_system/
│   │   ├── settings.py         # App settings & CORS configuration
│   │   └── urls.py             # Master URL routing
│   └── manage.py
└── frontend/
    ├── src/
    │   ├── api.js              # Axios API client
    │   ├── context/
    │   │   ├── AuthContext.jsx # Auth & session manager
    │   │   └── ThemeContext.jsx# Dark mode switcher with localStorage persistence
    │   ├── components/
    │   │   ├── Navbar.jsx      # Dynamic role-aware navigation
    │   │   ├── ProtectedRoute.jsx
    │   │   └── Footer.jsx
    │   ├── pages/
    │   │   ├── LandingPage.jsx  # Hero page with Quick Demo login test drives
    │   │   ├── AdminDashboard.jsx
    │   │   ├── DoctorDashboard.jsx
    │   │   ├── PatientDashboard.jsx
    │   │   ├── DoctorsPage.jsx
    │   │   ├── PatientsPage.jsx
    │   │   ├── AppointmentsPage.jsx
    │   │   ├── TokenQueuePage.jsx
    │   │   ├── BedGridPage.jsx
    │   │   ├── BillingPage.jsx
    │   │   ├── InsuranceClaimsPage.jsx
    │   │   ├── SearchResultsPage.jsx
    │   │   ├── PrescriptionFormPage.jsx
    │   │   └── HistoryPage.jsx
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

---

## 🧪 Technical Verification Summary

- **Backend Validation**: Verified with `python manage.py check` (0 issues).
- **Frontend Validation**: Verified with `npm run build` (Clean build, zero compilation errors).
- **Slot Conflict Prevention**: Validated via DRF viewsets preventing double booking doctors on the same date/time.
- **Bed Double-Assignment Prevention**: Enforced in API viewsets preventing assignment of occupied beds.
- **Dark Mode**: Persisted across sessions using `localStorage`.
