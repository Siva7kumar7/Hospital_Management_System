import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

const PatientDashboard = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [bills, setBills] = useState([]);
  const [history, setHistory] = useState([]);
  const [myBed, setMyBed] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientPortalData();
  }, []);

  const fetchPatientPortalData = async () => {
    try {
      const [appRes, tokenRes, billRes, histRes, bedRes] = await Promise.all([
        API.get('appointments/'),
        API.get('tokens/'),
        API.get('bills/'),
        API.get('history/'),
        API.get('beds/')
      ]);
      setAppointments(appRes.data);
      setTokens(tokenRes.data);
      setBills(billRes.data.filter(b => b.payment_status === 'UNPAID'));
      setHistory(histRes.data);

      const assigned = bedRes.data.find(b => b.status === 'OCCUPIED' && b.assigned_patient_name?.includes(user?.first_name || ''));
      setMyBed(assigned);
    } catch (err) {
      console.error("Failed to load patient dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const lastVisit = history[0];

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading NextGen Patient Portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header Banner */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-extrabold text-primary mb-1">
            <i className="bi bi-person-circle me-2"></i> Patient Portal: {user?.first_name} {user?.last_name}
          </h2>
          <p className="text-secondary mb-0">NextGen HealthCare Hospital Medical & Health Summary</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/appointments" className="btn btn-primary-custom">
            <i className="bi bi-calendar-plus me-1"></i> Book Doctor Appointment
          </Link>
          <Link to="/tokens" className="btn btn-outline-custom">
            <i className="bi bi-ticket-perforated me-1"></i> Walk-in Token
          </Link>
        </div>
      </div>

      {/* Quick Vitals Summary Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="stat-card border-primary">
            <div className="stat-value text-primary">{appointments.length}</div>
            <div className="stat-label mt-1"><i className="bi bi-calendar-check me-1"></i> Appointments</div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="stat-card border-success">
            <div className="stat-value text-success">{tokens.length}</div>
            <div className="stat-label mt-1"><i className="bi bi-ticket-perforated me-1"></i> Active Tokens</div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="stat-card border-warning">
            <div className="stat-value text-warning">{bills.length}</div>
            <div className="stat-label mt-1"><i className="bi bi-receipt me-1"></i> Pending Bills</div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="stat-card border-info">
            <div className="stat-value text-info">{history.length}</div>
            <div className="stat-label mt-1"><i className="bi bi-journal-medical me-1"></i> Total Visits</div>
          </div>
        </div>
      </div>

      {/* Patient Last Visit Spotlight Banner */}
      {lastVisit && (
        <div className="glass-card p-4 mb-4 border-primary bg-primary-subtle text-primary">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="badge bg-primary text-white"><i className="bi bi-clock-history me-1"></i> LAST HOSPITAL CONSULTATION</span>
            <small className="fw-bold">{lastVisit.visit_date}</small>
          </div>
          <h4 className="fw-bold text-primary mb-1">Diagnosis: {lastVisit.diagnosis}</h4>
          <p className="mb-0 text-secondary">
            <strong>Attending Doctor:</strong> {lastVisit.doctor_name || 'General OPD Specialist'} | <strong>Clinical Notes:</strong> {lastVisit.summary_notes}
          </p>
        </div>
      )}

      {myBed && (
        <div className="alert alert-info glass-card d-flex align-items-center justify-content-between mb-4 border-info">
          <div>
            <h5 className="fw-bold mb-1 text-info"><i className="bi bi-hospital me-2"></i> Admitted Bed Status</h5>
            <p className="mb-0 small">Admitted in <strong>{myBed.ward_name}</strong> (Bed Number: <strong>{myBed.bed_number}</strong>).</p>
          </div>
          <span className="badge bg-info text-dark fs-6">Admitted</span>
        </div>
      )}

      <div className="row g-4">
        {/* Scheduled Appointments */}
        <div className="col-lg-6">
          <div className="glass-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold text-primary mb-0"><i className="bi bi-calendar-check me-2"></i> Scheduled Doctor Appointments</h5>
              <Link to="/appointments" className="btn btn-sm btn-outline-primary">Manage</Link>
            </div>
            <div className="table-responsive">
              <table className="table table-custom align-middle mb-0">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(app => (
                    <tr key={app.id}>
                      <td className="fw-semibold">{app.doctor_name}</td>
                      <td className="small">{app.appointment_date} at {app.time_slot}</td>
                      <td>
                        <span className={`badge badge-status badge-${app.status.toLowerCase()}`}>{app.status}</span>
                      </td>
                    </tr>
                  ))}
                  {appointments.length === 0 && (
                    <tr><td colSpan="3" className="text-center text-muted py-3">No scheduled appointments found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Walk-in Queue Tokens */}
        <div className="col-lg-6">
          <div className="glass-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold text-primary mb-0"><i className="bi bi-ticket-detailed me-2"></i> Walk-in OPD Queue Tokens</h5>
              <Link to="/tokens" className="btn btn-sm btn-outline-primary">Get Token</Link>
            </div>
            {tokens.map(tok => (
              <div key={tok.id} className="glass-card p-3 mb-2 d-flex align-items-center justify-content-between border-primary">
                <div>
                  <span className="badge bg-primary fs-6">Token #{tok.token_number}</span>
                  <strong className="d-block mt-1 text-primary">{tok.doctor_name}</strong>
                </div>
                <div className="text-end">
                  <span className={`badge badge-status badge-${tok.status.toLowerCase()}`}>{tok.status}</span>
                  <small className="d-block text-muted mt-1">{tok.date}</small>
                </div>
              </div>
            ))}
            {tokens.length === 0 && (
              <p className="text-center text-muted py-4 mb-0">No active walk-in tokens for today.</p>
            )}
          </div>
        </div>

        {/* Unpaid Bills */}
        <div className="col-lg-6">
          <div className="glass-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold text-primary mb-0"><i className="bi bi-receipt me-2"></i> Hospital Bills & Claims</h5>
              <Link to="/billing" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
            <div className="list-group list-group-flush bg-transparent">
              {bills.map(bill => (
                <div key={bill.id} className="list-group-item bg-transparent text-secondary d-flex align-items-center justify-content-between px-0">
                  <div>
                    <strong>Bill #{bill.id}</strong>
                    <small className="d-block text-muted">Created: {bill.created_at?.slice(0, 10)}</small>
                  </div>
                  <div>
                    <span className="fw-bold text-danger me-2">${bill.total_amount}</span>
                    <Link to="/billing" className="btn btn-sm btn-outline-danger">Claim / Pay</Link>
                  </div>
                </div>
              ))}
              {bills.length === 0 && (
                <p className="text-success text-center py-3 mb-0"><i className="bi bi-check-circle-fill me-1"></i> All bills cleared!</p>
              )}
            </div>
          </div>
        </div>

        {/* Medical History Log */}
        <div className="col-lg-6">
          <div className="glass-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold text-primary mb-0"><i className="bi bi-journal-medical me-2"></i> Medical History Log</h5>
              <Link to="/history" className="btn btn-sm btn-outline-primary">Full Records</Link>
            </div>
            <div className="list-group list-group-flush bg-transparent">
              {history.map(rec => (
                <div key={rec.id} className="list-group-item bg-transparent text-secondary px-0">
                  <div className="d-flex justify-content-between">
                    <strong>{rec.visit_date} - {rec.doctor_name || 'OPD Doctor'}</strong>
                  </div>
                  <small className="d-block text-muted">Diagnosis: {rec.diagnosis}</small>
                </div>
              ))}
              {history.length === 0 && (
                <p className="text-muted text-center py-3 mb-0">No past visit history recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
