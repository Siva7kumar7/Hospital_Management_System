import React, { useState, useEffect } from 'react';
import API from '../api';
import { FileText, Stethoscope, Pill, Eye, Printer, Calendar, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRx, setSelectedRx] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

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

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading Electronic Health Records...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.25rem' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Electronic Health Records (EHR)</h1>
        <p className="page-subtitle">Complete medical history, diagnostic timeline, and digital doctor prescriptions</p>
      </div>

      {/* Verified Digital Prescriptions Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Pill color="var(--brand-success)" size={20} /> Verified Doctor Prescriptions
          </h3>
          <span className="badge-nextgen badge-success">● Verified Rx</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {prescriptions.map(rx => (
            <div key={rx.id} className="nextgen-card" style={{ borderLeft: '4px solid var(--brand-success)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1.1rem', fontWeight: 700 }}>{rx.doctor_name}</h4>
                  <div style={{ fontSize: '0.82rem', color: 'var(--brand-primary)', fontWeight: 600 }}>{rx.doctor_specialization || 'Attending Specialist'}</div>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{rx.created_at?.slice(0, 10)}</span>
              </div>

              <div style={{ background: 'var(--status-info-bg)', color: 'var(--brand-primary)', padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Diagnosis: {rx.diagnosis}
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', whiteSpace: 'pre-line' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Medicines:</strong> <br />
                {rx.medicines}
              </div>

              <button onClick={() => setSelectedRx(rx)} className="btn-nextgen-secondary" style={{ width: '100%', justifyContent: 'center', color: 'var(--brand-success)' }}>
                <Eye size={16} /> View & Print Digital Slip
              </button>
            </div>
          ))}
          {prescriptions.length === 0 && (
            <div className="empty-state-box" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-state-icon">💊</div>
              <p>No digital prescriptions recorded yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Expandable Medical Visit Timeline */}
      <div className="nextgen-card">
        <h3 className="section-title" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText color="var(--brand-primary)" size={20} /> Complete Medical Consultation Timeline
        </h3>

        <div className="timeline-container">
          {history.map(rec => (
            <div key={rec.id} className="timeline-item">
              <div className="nextgen-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpandedId(expandedId === rec.id ? null : rec.id)}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase' }}>
                      {rec.visit_date} • {rec.doctor_name || 'General Consultation'}
                    </div>
                    <h4 style={{ margin: '0.25rem 0 0 0', fontSize: '1.1rem', fontWeight: 700 }}>Diagnosis: {rec.diagnosis}</h4>
                  </div>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {expandedId === rec.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>

                {expandedId === rec.id && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <p style={{ margin: '0 0 0.5rem 0' }}><strong>Clinical Summary Notes:</strong> {rec.summary_notes}</p>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hospital Center: NextGen HealthCare Super Speciality • Gandhipuram, Coimbatore</div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <div className="empty-state-box">
              <p>No past medical consultation history logged.</p>
            </div>
          )}
        </div>
      </div>

      {/* Digital Prescription Print Modal */}
      {selectedRx && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="nextgen-card" style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--brand-primary)', fontWeight: 800 }}>NextGen HealthCare Hospital</h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Verified Electronic Prescription Slip</div>
              </div>
              <span className="badge-nextgen badge-success">Rx Verified</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>PATIENT</div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedRx.patient_name}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>DOCTOR</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--brand-primary)' }}>{selectedRx.doctor_name}</div>
              </div>
            </div>

            <div style={{ background: 'var(--status-info-bg)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-primary)' }}>DIAGNOSIS</div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{selectedRx.diagnosis}</div>
            </div>

            <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-success)', marginBottom: '0.5rem' }}>MEDICINES & DOSAGE</div>
              <pre style={{ margin: 0, fontFamily: 'inherit', fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{selectedRx.medicines}</pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button onClick={() => setSelectedRx(null)} className="btn-nextgen-secondary">Close</button>
              <button onClick={() => window.print()} className="btn-nextgen-primary" style={{ background: 'var(--brand-success)' }}>
                <Printer size={16} /> Print Prescription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;

