import React, { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { Ticket, Users, Clock, Megaphone, CheckCircle, BellRing, ChevronRight, User } from 'lucide-react';

const TokenQueuePage = () => {
  const { user } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [tokens, setTokens] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [lastIssuedToken, setLastIssuedToken] = useState(null);
  const [notified, setNotified] = useState(false);

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
  const myToken = tokens.find(t => t.patient_name?.includes(user?.first_name || '')) || tokens[2] || tokens[0];

  const aheadCount = tokens.filter(t => t.status === 'WAITING' && t.id < (myToken?.id || 999)).length;
  const estimatedWait = aheadCount * 5 + 2; // ~5 mins per consultation

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading live queue board...</div>;

  return (
    <div style={{ maxWidth: '1240px', margin: '2rem auto', padding: '0 1.25rem' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Ticket size={28} color="var(--brand-primary)" /> Live OPD Token Queue
          </h1>
          <p className="page-subtitle">Track doctor consultations and your estimated wait time in real-time</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            style={{ padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--brand-primary)', fontWeight: 700, outline: 'none' }}
            value={selectedDoctorId}
            onChange={e => setSelectedDoctorId(e.target.value)}>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>Dr. {d.full_name} ({d.specialization})</option>
            ))}
          </select>
          <button
            onClick={() => { setGenerateData({ ...generateData, doctor: selectedDoctorId }); setShowGenerateModal(true); setLastIssuedToken(null); }}
            className="btn-nextgen-primary">
            + Get OPD Token
          </button>
        </div>
      </div>

      {/* Main Live Queue Spotlight Card */}
      <div className="nextgen-card" style={{ marginBottom: '2.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div>
            <span className="badge-nextgen badge-info" style={{ marginBottom: '0.35rem' }}>
              <span className="pulse-dot-live"></span> OPD ROOM 204 • ACTIVE SHIFT
            </span>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Dr. {selectedDoctorObj?.full_name} ({selectedDoctorObj?.specialization})</h2>
          </div>

          <button
            onClick={() => setNotified(!notified)}
            className="btn-nextgen-secondary"
            style={{ color: notified ? 'var(--brand-success)' : 'var(--brand-primary)' }}>
            <BellRing size={16} /> {notified ? '✓ Notification Set' : 'Notify me when I am next'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* Your Token Card */}
          <div style={{ background: 'var(--status-info-bg)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
              YOUR TOKEN NUMBER
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--brand-primary)', lineHeight: '1' }}>
              #{myToken ? myToken.token_number : '08'}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              <strong>{aheadCount} patients</strong> ahead of you
            </div>
            <div style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#FFFFFF', padding: '0.4rem 0.85rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-warning)', boxShadow: 'var(--shadow-sm)' }}>
              <Clock size={15} /> Estimated Wait: {estimatedWait} mins
            </div>
          </div>

          {/* Now Serving Card */}
          <div style={{ background: 'var(--status-success-bg)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--status-success-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
              NOW SERVING IN ROOM
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--status-success-text)', lineHeight: '1' }}>
              #{currentToken ? currentToken.token_number : '05'}
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
              {currentToken ? currentToken.patient_name : 'Patient Consulting'}
            </div>
            {(user?.role === 'DOCTOR' || user?.role === 'ADMIN' || user?.is_superuser) && currentToken && (
              <button onClick={() => handleAdvanceStatus(currentToken.id, 'COMPLETED')} className="btn-nextgen-primary" style={{ background: 'var(--brand-success)', marginTop: '0.75rem' }}>
                Complete Consultation
              </button>
            )}
          </div>

          {/* Next in Line Card */}
          <div style={{ background: 'var(--status-warning-bg)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--status-warning-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
              NEXT IN LINE
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--status-warning-text)', lineHeight: '1' }}>
              #{nextWaitingToken ? nextWaitingToken.token_number : '06'}
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
              {nextWaitingToken ? nextWaitingToken.patient_name : 'Waiting in Lounge'}
            </div>
            {(user?.role === 'DOCTOR' || user?.role === 'ADMIN' || user?.is_superuser) && nextWaitingToken && (
              <button onClick={() => handleAdvanceStatus(nextWaitingToken.id, 'IN_CONSULTATION')} className="btn-nextgen-primary" style={{ background: 'var(--brand-warning)', marginTop: '0.75rem' }}>
                Call Patient In
              </button>
            )}
          </div>
        </div>

        {/* Animated Live Queue Progression Bar */}
        <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
            LIVE QUEUE PROGRESS TRACKER
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
            {tokens.slice(0, 7).map((tok, idx) => (
              <React.Fragment key={tok.id || idx}>
                <div style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  background: tok.status === 'IN_CONSULTATION' ? 'var(--brand-success)' : tok.id === myToken?.id ? 'var(--brand-primary)' : 'var(--bg-card)',
                  color: tok.status === 'IN_CONSULTATION' || tok.id === myToken?.id ? '#FFFFFF' : 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  #{tok.token_number} {tok.id === myToken?.id ? '(YOU)' : ''}
                </div>
                {idx < Math.min(tokens.length, 7) - 1 && <ChevronRight size={16} color="var(--text-muted)" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Full Queue List */}
      <div className="nextgen-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="card-title-text" style={{ margin: 0 }}>Full OPD Consultation Queue</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Tokens Today: {tokens.length}</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '1rem 1.25rem' }}>Token #</th>
              <th style={{ padding: '1rem 1.25rem' }}>Patient Name</th>
              <th style={{ padding: '1rem 1.25rem' }}>Status</th>
              <th style={{ padding: '1rem 1.25rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map(tok => (
              <tr key={tok.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem 1.25rem', fontWeight: 800, fontSize: '1.1rem', color: 'var(--brand-primary)' }}>#{tok.token_number}</td>
                <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>{tok.patient_name}</td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <span className={`badge-nextgen badge-${tok.status === 'COMPLETED' ? 'success' : tok.status === 'IN_CONSULTATION' ? 'info' : 'warning'}`}>
                    {tok.status}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  {(user?.role === 'DOCTOR' || user?.role === 'ADMIN' || user?.is_superuser) && tok.status === 'WAITING' && (
                    <button onClick={() => handleAdvanceStatus(tok.id, 'IN_CONSULTATION')} className="btn-nextgen-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                      Call In
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Generate Walk-in Token Modal */}
      {showGenerateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="nextgen-card" style={{ width: '100%', maxWidth: '480px', padding: '1.75rem' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Issue Walk-in OPD Token</h3>
            {lastIssuedToken ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--bg-subtle)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-success)' }}>✓ TOKEN CONFIRMED</div>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--brand-primary)' }}>#{lastIssuedToken.token_number}</div>
                <h4 style={{ margin: '0.5rem 0 0.25rem 0' }}>{lastIssuedToken.doctor_name}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Patient: {lastIssuedToken.patient_name}</p>
                <button onClick={() => setShowGenerateModal(false)} className="btn-nextgen-primary" style={{ marginTop: '1.25rem', width: '100%' }}>Done</button>
              </div>
            ) : (
              <form onSubmit={handleGenerateToken}>
                {user?.role !== 'PATIENT' && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Select Patient</label>
                    <select required value={generateData.patient} onChange={e => setGenerateData({ ...generateData, patient: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                      <option value="">-- Choose Patient --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.user?.first_name} {p.user?.last_name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Specialist Doctor</label>
                  <select required value={generateData.doctor} onChange={e => setGenerateData({ ...generateData, doctor: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>Dr. {d.full_name} ({d.specialization}) - ₹{d.consultation_fee}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button type="button" onClick={() => setShowGenerateModal(false)} className="btn-nextgen-secondary">Cancel</button>
                  <button type="submit" className="btn-nextgen-primary">Issue Token</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenQueuePage;

