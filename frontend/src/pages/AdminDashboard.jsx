import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get('dashboard/stats/');
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Admin Analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1">
            <i className="bi bi-speedometer2 me-2"></i> System Analytics & Overview
          </h2>
          <p className="text-secondary mb-0">Hospital Operations, Occupancy & Revenue Summary</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/doctors" className="btn btn-primary-custom btn-sm">
            <i className="bi bi-person-badge me-1"></i> Doctors Roster
          </Link>
          <Link to="/beds" className="btn btn-outline-custom btn-sm">
            <i className="bi bi-door-open me-1"></i> Bed Matrix
          </Link>
        </div>
      </div>

      {/* Key Metric Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4 col-xl-2">
          <div className="glass-card stat-card">
            <div className="stat-value">{stats?.total_patients || 0}</div>
            <div className="stat-label">Total Patients</div>
          </div>
        </div>

        <div className="col-6 col-md-4 col-xl-2">
          <div className="glass-card stat-card">
            <div className="stat-value">{stats?.total_doctors || 0}</div>
            <div className="stat-label">Total Doctors</div>
          </div>
        </div>

        <div className="col-6 col-md-4 col-xl-2">
          <div className="glass-card stat-card">
            <div className="stat-value">{stats?.today_appointments_count || 0}</div>
            <div className="stat-label">Today's Visits</div>
          </div>
        </div>

        <div className="col-6 col-md-4 col-xl-2">
          <div className="glass-card stat-card">
            <div className="stat-value">{stats?.bed_occupancy_pct || 0}%</div>
            <div className="stat-label">Bed Occupancy</div>
          </div>
        </div>

        <div className="col-6 col-md-4 col-xl-2">
          <div className="glass-card stat-card">
            <div className="stat-value">${stats?.total_revenue?.toFixed(2) || '0.00'}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>

        <div className="col-6 col-md-4 col-xl-2">
          <div className="glass-card stat-card">
            <div className="stat-value">{stats?.pending_claims_count || 0}</div>
            <div className="stat-label">Pending Claims</div>
          </div>
        </div>
      </div>

      {/* Recent Data Overview Tables */}
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="glass-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold text-primary mb-0"><i className="bi bi-calendar-check me-2"></i> Recent Appointments</h5>
              <Link to="/appointments" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
            <div className="table-responsive">
              <table className="table table-custom align-middle mb-0">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recent_appointments?.map(app => (
                    <tr key={app.id}>
                      <td className="fw-semibold">{app.patient_name}</td>
                      <td>{app.doctor_name}</td>
                      <td>{app.appointment_date}</td>
                      <td>
                        <span className={`badge badge-status badge-${app.status.toLowerCase()}`}>{app.status}</span>
                      </td>
                    </tr>
                  ))}
                  {(!stats?.recent_appointments || stats.recent_appointments.length === 0) && (
                    <tr><td colSpan="4" className="text-center text-muted">No appointments found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="glass-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold text-primary mb-0"><i className="bi bi-receipt me-2"></i> Recent Patient Bills</h5>
              <Link to="/billing" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
            <div className="table-responsive">
              <table className="table table-custom align-middle mb-0">
                <thead>
                  <tr>
                    <th>Bill #</th>
                    <th>Patient</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recent_bills?.map(bill => (
                    <tr key={bill.id}>
                      <td className="fw-bold">#{bill.id}</td>
                      <td>{bill.patient_name}</td>
                      <td className="fw-bold text-success">${bill.total_amount}</td>
                      <td>
                        <span className={`badge badge-status badge-${bill.payment_status.toLowerCase()}`}>{bill.payment_status}</span>
                      </td>
                    </tr>
                  ))}
                  {(!stats?.recent_bills || stats.recent_bills.length === 0) && (
                    <tr><td colSpan="4" className="text-center text-muted">No bills generated yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
