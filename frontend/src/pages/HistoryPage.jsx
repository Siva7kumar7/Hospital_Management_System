import React, { useState, useEffect } from 'react';
import API from '../api';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRx, setSelectedRx] = useState(null);

  useEffect(() => {
    fetchMedicalData();
  }, []);

  const fetchMedicalData = async () => {
    try {
      const [histRes, rxRes] = await Promise.all([
        API.get('history/'),
        API.get('prescriptions/')
      ]);
      setHistory(histRes.data);
      setPrescriptions(rxRes.data);
    } catch (err) {
      console.error("Failed to load medical records:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container py-4">
      {/* Title */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-primary mb-1">
            <i className="bi bi-journal-medical me-2"></i> NextGen Medical Information & Digital Health Records
          </h2>
          <p className="text-secondary mb-0">Electronic Medical History, Diagnostics & Doctor Prescriptions</p>
        </div>
      </div>

      {/* Patient Health Summary Quick Bar */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="glass-card p-3 border-primary text-center">
            <div className="display-6 fw-bold text-primary mb-1">{history.length}</div>
            <div className="small font-semibold text-secondary"><i className="bi bi-calendar-event me-1"></i> Total Consultations</div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="glass-card p-3 border-success text-center">
            <div className="display-6 fw-bold text-success mb-1">{prescriptions.length}</div>
            <div className="small font-semibold text-secondary"><i className="bi bi-capsule me-1"></i> Active Prescriptions</div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="glass-card p-3 border-info text-center">
            <div className="fw-bold text-info mb-1" style={{ fontSize: '1.2rem' }}>
              {history[0]?.diagnosis || 'No Record'}
            </div>
            <div className="small font-semibold text-secondary"><i className="bi bi-activity me-1"></i> Last Diagnosis</div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="glass-card p-3 border-warning text-center">
            <div className="fw-bold text-warning mb-1" style={{ fontSize: '1.2rem' }}>
              {history[0]?.visit_date || 'N/A'}
            </div>
            <div className="small font-semibold text-secondary"><i className="bi bi-clock-history me-1"></i> Last Visit Date</div>
          </div>
        </div>
      </div>

      {/* Electronic Prescriptions Section */}
      <div className="glass-card p-4 mb-4 border-success">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h4 className="fw-bold text-success mb-0">
            <i className="bi bi-file-earmark-medical-fill me-2"></i> Digital Doctor Prescriptions
          </h4>
          <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1">Verified NextGen Rx</span>
        </div>

        <div className="row g-3">
          {prescriptions.map(rx => (
            <div key={rx.id} className="col-md-6">
              <div className="glass-card p-3 border-success h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <strong className="text-primary fs-5">{rx.doctor_name}</strong>
                    <span className="small text-muted">{rx.created_at?.slice(0, 10)}</span>
                  </div>
                  <div className="badge bg-primary-subtle text-primary border border-primary-subtle mb-2">
                    Diagnosis: {rx.diagnosis}
                  </div>
                  <p className="small text-secondary mb-2 whitespace-pre-line">
                    <strong className="d-block text-dark mb-1">Medicines Prescribed:</strong>
                    {rx.medicines}
                  </p>
                  {rx.notes && <p className="small text-muted mb-0"><em>Notes: {rx.notes}</em></p>}
                </div>

                <button className="btn btn-sm btn-outline-success mt-3 w-100" onClick={() => setSelectedRx(rx)}>
                  <i className="bi bi-eye-fill me-1"></i> View & Print Prescription
                </button>
              </div>
            </div>
          ))}

          {prescriptions.length === 0 && (
            <div className="col-12 text-center text-muted py-4">
              <i className="bi bi-capsule fs-2 d-block mb-2 text-secondary"></i>
              No electronic prescriptions on record yet.
            </div>
          )}
        </div>
      </div>

      {/* Consultation & Visit Timeline */}
      <div className="glass-card p-4">
        <h4 className="fw-bold text-primary mb-3">
          <i className="bi bi-list-stars me-2"></i> Medical Consultation & History Timeline
        </h4>
        <div className="table-responsive">
          <table className="table table-custom align-middle mb-0">
            <thead>
              <tr>
                <th>Visit Date</th>
                <th>Attending Doctor</th>
                <th>Diagnosis Record</th>
                <th>Doctor Summary & Clinical Notes</th>
              </tr>
            </thead>
            <tbody>
              {history.map(rec => (
                <tr key={rec.id}>
                  <td className="fw-bold text-primary">{rec.visit_date}</td>
                  <td className="fw-semibold">{rec.doctor_name || 'General OPD'}</td>
                  <td>
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle fw-bold">
                      {rec.diagnosis}
                    </span>
                  </td>
                  <td className="small text-secondary">{rec.summary_notes}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr><td colSpan="4" className="text-center text-muted py-4">No medical history visits recorded.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prescription View Modal */}
      {selectedRx && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content glass-card border-success p-4">
              <div className="modal-header border-bottom pb-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-success text-white p-2 rounded-3">
                    <i className="bi bi-file-earmark-medical fs-3"></i>
                  </div>
                  <div>
                    <h4 className="fw-bold text-success mb-0">NextGen HealthCare Hospital</h4>
                    <small className="text-muted">Digital Medical Prescription Slip</small>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setSelectedRx(null)}></button>
              </div>
              <div className="modal-body py-4">
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <p className="mb-1 text-muted small">PATIENT NAME</p>
                    <h5 className="fw-bold text-primary mb-0">{selectedRx.patient_name}</h5>
                  </div>
                  <div className="col-md-6 text-md-end">
                    <p className="mb-1 text-muted small">ATTENDING DOCTOR</p>
                    <h5 className="fw-bold text-success mb-0">{selectedRx.doctor_name}</h5>
                    <small className="text-muted">{selectedRx.doctor_specialization}</small>
                  </div>
                </div>

                <div className="glass-card p-3 mb-3 border-primary bg-primary-subtle">
                  <strong className="text-primary d-block mb-1">DIAGNOSIS:</strong>
                  <div className="fs-5 fw-bold text-dark">{selectedRx.diagnosis}</div>
                </div>

                <div className="glass-card p-3 mb-3 border-success">
                  <strong className="text-success d-block mb-2"><i className="bi bi-capsule me-1"></i> MEDICINES & DOSAGE INSTRUCTIONS:</strong>
                  <pre className="bg-white p-3 rounded border text-dark font-mono mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedRx.medicines}
                  </pre>
                </div>

                {selectedRx.notes && (
                  <div className="small text-secondary">
                    <strong>Doctor Instructions:</strong> {selectedRx.notes}
                  </div>
                )}
              </div>
              <div className="modal-footer border-top pt-3">
                <button className="btn btn-outline-custom" onClick={() => setSelectedRx(null)}>Close</button>
                <button className="btn btn-success" onClick={() => window.print()}>
                  <i className="bi bi-printer-fill me-2"></i> Print Official Rx Slip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
