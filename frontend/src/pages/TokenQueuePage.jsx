import React, { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

const TokenQueuePage = () => {
  const { user } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [tokens, setTokens] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [lastIssuedToken, setLastIssuedToken] = useState(null);

  const [generateData, setGenerateData] = useState({
    doctor: '',
    patient: '',
    date: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    fetchDoctorsAndQueue();
  }, [selectedDoctorId]);

  const fetchDoctorsAndQueue = async () => {
    try {
      const docRes = await API.get('doctors/');
      setDoctors(docRes.data);

      let docId = selectedDoctorId;
      if (!docId && docRes.data.length > 0) {
        docId = docRes.data[0].id;
        setSelectedDoctorId(docId);
      }

      if (docId) {
        const tokenRes = await API.get(`tokens/?doctor_id=${docId}`);
        setTokens(tokenRes.data);
      }

      if (user?.role !== 'PATIENT') {
        const patRes = await API.get('patients/');
        setPatients(patRes.data);
      }
    } catch (err) {
      console.error("Failed to load token queue:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStatus = async (tokenId, newStatus) => {
    try {
      await API.patch(`tokens/${tokenId}/update_status/`, { status: newStatus });
      fetchDoctorsAndQueue();
    } catch (err) {
      alert("Failed to advance token status.");
    }
  };

  const handleGenerateToken = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...generateData };
      if (user?.role === 'PATIENT' && user?.patient_id) {
        payload.patient = user.patient_id;
      }
      const res = await API.post('tokens/', payload);
      setLastIssuedToken(res.data);
      fetchDoctorsAndQueue();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to generate token.");
    }
  };

  const selectedDoctorObj = doctors.find(d => String(d.id) === String(selectedDoctorId));
  const currentToken = tokens.find(t => t.status === 'IN_CONSULTATION');
  const nextWaitingToken = tokens.find(t => t.status === 'WAITING');

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container py-4">
      {/* Header Bar */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-primary mb-1">
            <i className="bi bi-ticket-perforated-fill me-2"></i> NextGen Live OPD Token Queue
          </h2>
          <p className="text-secondary mb-0">Real-time Outpatient Doctor Consultation Tracking</p>
        </div>

        <div className="d-flex gap-2">
          <select className="form-select w-auto fw-bold text-primary" value={selectedDoctorId} onChange={e => setSelectedDoctorId(e.target.value)}>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>Dr. {d.full_name} ({d.specialization})</option>
            ))}
          </select>
          <button onClick={() => { setGenerateData({ ...generateData, doctor: selectedDoctorId }); setShowGenerateModal(true); setLastIssuedToken(null); }} className="btn btn-primary-custom">
            <i className="bi bi-ticket-perforated me-1"></i> Get OPD Token
          </button>
        </div>
      </div>

      {/* Selected Doctor Shift Info Header */}
      {selectedDoctorObj && (
        <div className="glass-card p-3 mb-4 border-primary bg-primary-subtle text-primary d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <span className="badge bg-primary text-white mb-1"><i className="bi bi-person-badge me-1"></i> DOCTOR IN OPD</span>
            <h5 className="fw-bold mb-0">Dr. {selectedDoctorObj.full_name} — {selectedDoctorObj.specialization}</h5>
            <small className="text-secondary">Fee: <strong>${selectedDoctorObj.consultation_fee}</strong> | Timings: {selectedDoctorObj.time_slot_start} to {selectedDoctorObj.time_slot_end}</small>
          </div>
          <div className="text-end">
            <span className="badge bg-info text-dark fs-6 px-3 py-2">
              <i className="bi bi-people-fill me-1"></i> Total Today: {tokens.length} Patients
            </span>
          </div>
        </div>
      )}

      {/* Spotlight Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="glass-card p-4 border-success h-100 position-relative">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1 fw-bold">
                <span className="pulse-dot me-1"></span> IN CONSULTATION ROOM
              </span>
              <i className="bi bi-hospital-fill text-success fs-2"></i>
            </div>
            {currentToken ? (
              <>
                <div className="display-2 fw-extrabold text-success mb-1">#{currentToken.token_number}</div>
                <h4 className="fw-bold text-primary mb-1">{currentToken.patient_name}</h4>
                <p className="text-muted small mb-3">Patient currently consulting with doctor</p>
                {(user?.role === 'DOCTOR' || user?.role === 'ADMIN' || user?.is_superuser) && (
                  <button onClick={() => handleAdvanceStatus(currentToken.id, 'COMPLETED')} className="btn btn-success">
                    <i className="bi bi-check-circle-fill me-1"></i> Complete Consultation
                  </button>
                )}
              </>
            ) : (
              <div className="py-4 text-center text-muted">
                <i className="bi bi-person-slash fs-1 d-block mb-2 text-secondary"></i>
                No active patient in consultation room right now.
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="glass-card p-4 border-warning h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-3 py-1 fw-bold">
                NEXT IN LINE
              </span>
              <i className="bi bi-person-walking text-warning fs-2"></i>
            </div>
            {nextWaitingToken ? (
              <>
                <div className="display-2 fw-extrabold text-warning mb-1">#{nextWaitingToken.token_number}</div>
                <h4 className="fw-bold text-primary mb-1">{nextWaitingToken.patient_name}</h4>
                <p className="text-muted small mb-3">Waiting in lounge (Please proceed near OPD Door)</p>
                {(user?.role === 'DOCTOR' || user?.role === 'ADMIN' || user?.is_superuser) && (
                  <button onClick={() => handleAdvanceStatus(nextWaitingToken.id, 'IN_CONSULTATION')} className="btn btn-warning">
                    <i className="bi bi-megaphone-fill me-1"></i> Call Patient In
                  </button>
                )}
              </>
            ) : (
              <div className="py-4 text-center text-muted">
                <i className="bi bi-emoji-smile fs-1 d-block mb-2 text-secondary"></i>
                All waiting patients served. No tokens in queue.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Queue Table */}
      <div className="glass-card p-4">
        <h5 className="fw-bold text-primary mb-3"><i className="bi bi-list-ol me-2"></i> Full OPD Token Queue List</h5>
        <div className="table-responsive">
          <table className="table table-custom align-middle mb-0">
            <thead>
              <tr>
                <th>Token #</th>
                <th>Patient Name</th>
                <th>Status</th>
                <th>Issued Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map(tok => (
                <tr key={tok.id} className={tok.status === 'IN_CONSULTATION' ? 'table-success' : ''}>
                  <td className="fw-bold fs-5 text-primary">#{tok.token_number}</td>
                  <td className="fw-semibold">{tok.patient_name}</td>
                  <td>
                    <span className={`badge badge-status badge-${tok.status.toLowerCase()}`}>{tok.status}</span>
                  </td>
                  <td className="small text-muted">{tok.created_at?.slice(11, 16) || 'Today'}</td>
                  <td>
                    {(user?.role === 'DOCTOR' || user?.role === 'ADMIN' || user?.is_superuser) ? (
                      <div className="btn-group btn-group-sm">
                        <button onClick={() => handleAdvanceStatus(tok.id, 'IN_CONSULTATION')} className="btn btn-outline-primary">Call In</button>
                        <button onClick={() => handleAdvanceStatus(tok.id, 'COMPLETED')} className="btn btn-outline-success">Complete</button>
                        <button onClick={() => handleAdvanceStatus(tok.id, 'CANCELLED')} className="btn btn-outline-danger">Cancel</button>
                      </div>
                    ) : (
                      <span className="small text-muted">View Only</span>
                    )}
                  </td>
                </tr>
              ))}
              {tokens.length === 0 && (
                <tr><td colSpan="5" className="text-center text-muted py-4">No walk-in tokens issued for selected doctor today.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Walk-in Token Modal */}
      {showGenerateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-md">
            <div className="modal-content glass-card border-primary p-3">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold text-primary"><i className="bi bi-ticket-perforated-fill me-2"></i> Issue NextGen OPD Token</h5>
                <button type="button" className="btn-close" onClick={() => setShowGenerateModal(false)}></button>
              </div>
              <div className="modal-body">
                {lastIssuedToken ? (
                  <div className="token-slip-card text-center my-2">
                    <span className="badge bg-success mb-2 px-3 py-1">TOKEN CONFIRMED</span>
                    <div className="display-2 fw-extrabold text-primary mb-1">#{lastIssuedToken.token_number}</div>
                    <h5 className="fw-bold text-secondary">{lastIssuedToken.doctor_name}</h5>
                    <p className="small text-muted mb-2">Patient: <strong>{lastIssuedToken.patient_name}</strong></p>
                    <div className="small border-top border-bottom py-2 my-2 text-dark">
                      <strong>Status:</strong> {lastIssuedToken.status} | <strong>Date:</strong> {lastIssuedToken.date}
                    </div>
                    <div className="d-flex justify-content-center gap-2 mt-3">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => window.print()}>
                        <i className="bi bi-printer me-1"></i> Print Digital Slip
                      </button>
                      <button className="btn btn-sm btn-primary-custom" onClick={() => setShowGenerateModal(false)}>
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleGenerateToken}>
                    {user?.role !== 'PATIENT' && (
                      <div className="mb-3">
                        <label className="form-label small fw-semibold">Select Patient *</label>
                        <select className="form-select" required value={generateData.patient} onChange={e => setGenerateData({ ...generateData, patient: e.target.value })}>
                          <option value="">-- Choose Patient --</option>
                          {patients.map(p => (
                            <option key={p.id} value={p.id}>{p.user?.first_name} {p.user?.last_name} ({p.user?.username})</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Specialist Doctor *</label>
                      <select className="form-select" required value={generateData.doctor} onChange={e => setGenerateData({ ...generateData, doctor: e.target.value })}>
                        <option value="">-- Choose Doctor --</option>
                        {doctors.map(d => (
                          <option key={d.id} value={d.id}>Dr. {d.full_name} ({d.specialization}) — ${d.consultation_fee}</option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Consultation Date</label>
                      <input type="date" className="form-control" required value={generateData.date} onChange={e => setGenerateData({ ...generateData, date: e.target.value })} />
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                      <button type="button" className="btn btn-outline-custom" onClick={() => setShowGenerateModal(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary-custom">Generate Token Slip</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenQueuePage;
