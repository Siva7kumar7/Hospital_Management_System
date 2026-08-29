import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI Summary Drawer State
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [aiSummary, setAiSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    try {
      const [appRes, tokenRes, rxRes, patRes] = await Promise.all([
        API.get('appointments/'),
        API.get('tokens/'),
        API.get('prescriptions/'),
        API.get('patients/')
      ]);
      setAppointments(appRes.data);
      setTokens(tokenRes.data.filter(t => t.status === 'WAITING' || t.status === 'IN_CONSULTATION'));
      setPrescriptions(rxRes.data.slice(0, 5));
      setPatients(patRes.data);
    } catch (err) {
      console.error("Failed to load doctor dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!selectedPatientId) return;
    setSummaryLoading(true);
    setAiSummary(null);
    try {
      const res = await API.post('ai/clinical-summary/', { patient_id: selectedPatientId });
      setAiSummary(res.data.summary);
    } catch (err) {
      alert("Failed to generate AI clinical summary.");
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleAdvanceToken = async (tokenId, newStatus) => {
    try {
      await API.patch(`tokens/${tokenId}/update_status/`, { status: newStatus });
      fetchDoctorData();
    } catch (err) {
      alert("Failed to update token status.");
    }
  };

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Doctor Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1">
            <i className="bi bi-stethoscope me-2"></i> Welcome, Dr. {user?.first_name} {user?.last_name}
          </h2>
          <p className="text-secondary mb-0">Doctor Workspace & Clinical Intelligence Center</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/labs" className="btn btn-outline-primary">
            🧪 Diagnostics & Labs
          </Link>
          <Link to="/tokens" className="btn btn-primary-custom">
            <i className="bi bi-card-list me-1"></i> OPD Queue Board
          </Link>
        </div>
      </div>

      {/* AI Clinical Summarizer Bar */}
      <div className="glass-card p-3 mb-4 bg-light border border-primary-subtle">
        <div className="row align-items-center">
          <div className="col-md-5">
            <h6 className="fw-bold text-primary mb-1">🤖 AI Clinical EMR Summarizer</h6>
            <small className="text-muted">Select patient to synthesize diagnoses, labs, & vitals automatically</small>
          </div>
          <div className="col-md-4">
            <select
              className="form-select form-select-sm"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}>
              <option value="">-- Select Patient --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.user?.first_name} {p.user?.last_name} ({p.patient_id || p.user?.username})</option>
              ))}
            </select>
          </div>
          <div className="col-md-3 text-end">
            <button
              onClick={handleGenerateSummary}
              disabled={!selectedPatientId || summaryLoading}
              className="btn btn-sm btn-primary-custom w-100">
              {summaryLoading ? 'Generating...' : '✨ Generate AI Summary'}
            </button>
          </div>
        </div>

        {aiSummary && (
          <div className="mt-3 p-3 bg-white rounded border text-dark" style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
            {aiSummary}
          </div>
        )}
      </div>

      <div className="row g-4">
        {/* Today's Appointments */}
        <div className="col-lg-7">
          <div className="glass-card p-4 h-100">
            <h5 className="fw-bold text-primary mb-3"><i className="bi bi-calendar-event me-2"></i> Assigned Appointments</h5>
            <div className="table-responsive">
              <table className="table table-custom align-middle mb-0">
                <thead>
                  <tr>
                    <th>Time Slot</th>
                    <th>Patient</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(app => (
                    <tr key={app.id}>
                      <td className="fw-bold">{app.time_slot}</td>
                      <td>
                        <strong>{app.patient_name}</strong>
                      </td>
                      <td>
                        <span className={`badge badge-status badge-${app.status.toLowerCase()}`}>{app.status}</span>
                      </td>
                      <td>
                        {app.status !== 'COMPLETED' ? (
                          <Link to={`/prescribe/${app.id}`} className="btn btn-sm btn-primary-custom py-1">
                            <i className="bi bi-prescription me-1"></i> Prescribe
                          </Link>
                        ) : (
                          <span className="text-success small fw-semibold"><i className="bi bi-check-all"></i> Done</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {appointments.length === 0 && (
                    <tr><td colSpan="4" className="text-center text-muted py-3">No appointments assigned.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Active Token Queue Manager */}
        <div className="col-lg-5">
          <div className="glass-card p-4 mb-4">
            <h5 className="fw-bold text-primary mb-3"><i className="bi bi-ticket-perforated me-2"></i> Active Walk-in Queue</h5>
            <div className="d-flex flex-column gap-2">
              {tokens.map(tok => (
                <div key={tok.id} className="glass-card p-3 d-flex align-items-center justify-content-between">
                  <div>
                    <span className="badge bg-primary fs-6 mb-1">Token #{tok.token_number}</span>
                    <div className="fw-bold text-primary">{tok.patient_name}</div>
                  </div>
                  <div className="d-flex gap-1">
                    {tok.status === 'WAITING' && (
                      <button onClick={() => handleAdvanceToken(tok.id, 'IN_CONSULTATION')} className="btn btn-sm btn-success">Call In</button>
                    )}
                    {tok.status === 'IN_CONSULTATION' && (
                      <button onClick={() => handleAdvanceToken(tok.id, 'COMPLETED')} className="btn btn-sm btn-outline-success">Complete</button>
                    )}
                  </div>
                </div>
              ))}
              {tokens.length === 0 && (
                <p className="text-center text-muted py-3 mb-0">No active walk-in tokens waiting.</p>
              )}
            </div>
          </div>

          <div className="glass-card p-4">
            <h5 className="fw-bold text-primary mb-3"><i className="bi bi-journal-medical me-2"></i> Recent Prescriptions</h5>
            <div className="list-group list-group-flush bg-transparent">
              {prescriptions.map(rx => (
                <div key={rx.id} className="list-group-item bg-transparent text-secondary px-0">
                  <div className="d-flex justify-content-between">
                    <strong>{rx.patient_name}</strong>
                    <small className="text-muted">{rx.created_at?.slice(0, 10)}</small>
                  </div>
                  <small className="d-block text-muted">Diagnosis: {rx.diagnosis}</small>
                </div>
              ))}
              {prescriptions.length === 0 && (
                <p className="text-muted small text-center mb-0">No prescriptions written yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;

