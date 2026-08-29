import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import DoctorsPage from './pages/DoctorsPage';
import PatientsPage from './pages/PatientsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import TokenQueuePage from './pages/TokenQueuePage';
import BedGridPage from './pages/BedGridPage';
import BillingPage from './pages/BillingPage';
import InsuranceClaimsPage from './pages/InsuranceClaimsPage';
import SearchResultsPage from './pages/SearchResultsPage';
import PrescriptionFormPage from './pages/PrescriptionFormPage';
import HistoryPage from './pages/HistoryPage';

import LabManagementPage from './pages/LabManagementPage';
import PharmacyInventoryPage from './pages/PharmacyInventoryPage';
import NurseDashboard from './pages/NurseDashboard';
import AuditLogsPage from './pages/AuditLogsPage';

import QuickAccessHub from './components/QuickAccessHub';
import AIHealthAssistantWidget from './components/AIHealthAssistantWidget';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Role Dashboards */}
              <Route path="/admin-dashboard" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/doctor-dashboard" element={
                <ProtectedRoute allowedRoles={['DOCTOR']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/patient-dashboard" element={
                <ProtectedRoute allowedRoles={['PATIENT']}>
                  <PatientDashboard />
                </ProtectedRoute>
              } />

              {/* Functional Modules */}
              <Route path="/doctors" element={<ProtectedRoute><DoctorsPage /></ProtectedRoute>} />
              <Route path="/patients" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR']}>
                  <PatientsPage />
                </ProtectedRoute>
              } />
              <Route path="/appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
              <Route path="/tokens" element={<ProtectedRoute><TokenQueuePage /></ProtectedRoute>} />
              <Route path="/beds" element={<ProtectedRoute><BedGridPage /></ProtectedRoute>} />
              <Route path="/billing" element={<ProtectedRoute><BillingPage /></ProtectedRoute>} />
              <Route path="/claims" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <InsuranceClaimsPage />
                </ProtectedRoute>
              } />
              <Route path="/search" element={<ProtectedRoute><SearchResultsPage /></ProtectedRoute>} />
              <Route path="/prescribe/:appointmentId" element={
                <ProtectedRoute allowedRoles={['DOCTOR']}>
                  <PrescriptionFormPage />
                </ProtectedRoute>
              } />
              <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
              <Route path="/labs" element={<ProtectedRoute><LabManagementPage /></ProtectedRoute>} />
              <Route path="/pharmacy" element={<ProtectedRoute><PharmacyInventoryPage /></ProtectedRoute>} />
              <Route path="/nurse" element={<ProtectedRoute><NurseDashboard /></ProtectedRoute>} />
              <Route path="/audit-logs" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AuditLogsPage />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <QuickAccessHub />
          <AIHealthAssistantWidget />
          <Footer />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;


