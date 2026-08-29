import React, { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

export default function NurseDashboard() {
  const { user } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [vitalsList, setVitalsList] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Vital Entry Form
  const [selectedPatient, setSelectedPatient] = useState('');
  const [temp, setTemp] = useState('98.6 °F');
  const [bp, setBp] = useState('120/80 mmHg');
  const [pulse, setPulse] = useState(72);
  const [spo2, setSpo2] = useState(98);
  const [rr, setRr] = useState(16);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchNurseData();
  }, []);

  const fetchNurseData = async () => {
    setLoading(true);
    try {
      const [patRes, vitRes, bedsRes] = await Promise.all([
        API.get('patients/'),
        API.get('vitals/'),
        API.get('beds/')
      ]);
      setPatients(patRes.data);
      setVitalsList(vitRes.data);
      setBeds(bedsRes.data);
    } catch (err) {
      console.error("Error loading nurse workstation:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordVitals = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    try {
      await API.post('vitals/', {
        patient: selectedPatient,
        temperature: temp,
        blood_pressure: bp,
        pulse_rate: pulse,
        oxygen_saturation: spo2,
        respiratory_rate: rr,
        notes: notes
      });
      setMessage('✅ Vital signs recorded successfully into Patient EMR!');
      setNotes('');
      fetchNurseData();
    } catch (err) {
      alert('Failed to record vital signs.');
    }
  };

  const occupiedBeds = beds.filter(b => b.status === 'OCCUPIED');

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.85rem', color: '#0f172a', fontWeight: 800 }}>👩‍⚕️ Nurse Workstation & Patient Care Station</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b' }}>Vital signs telemetry, shift handover notes, and inpatient ward bed monitoring</p>
        </div>
        <div style={{ background: '#eff6ff', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid #bfdbfe', color: '#1e40af', fontWeight: 600, fontSize: '0.9rem' }}>
          Nurse: {user?.first_name || user?.username} (Duty Shift: Morning)
        </div>
      </div>

      {message && (
        <div style={{ padding: '0.85rem 1.25rem', borderRadius: '8px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', marginBottom: '1.5rem', fontWeight: 600 }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Record Vitals Panel */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#0f172a' }}>🩺 Record Vital Signs</h3>
          <form onSubmit={handleRecordVitals}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Select Inpatient / Patient</label>
              <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)} required style={inputStyle}>
                <option value="">-- Select Patient --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.user?.first_name} {p.user?.last_name} ({p.patient_id || p.user?.username})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.2rem', fontSize: '0.82rem' }}>Temperature</label>
                <input type="text" value={temp} onChange={(e) => setTemp(e.target.value)} style={inputStyle} required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.2rem', fontSize: '0.82rem' }}>Blood Pressure</label>
                <input type="text" value={bp} onChange={(e) => setBp(e.target.value)} style={inputStyle} required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.2rem', fontSize: '0.82rem' }}>Pulse Rate (BPM)</label>
                <input type="number" value={pulse} onChange={(e) => setPulse(e.target.value)} style={inputStyle} required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.2rem', fontSize: '0.82rem' }}>SPO2 Oxygen (%)</label>
                <input type="number" value={spo2} onChange={(e) => setSpo2(e.target.value)} style={inputStyle} required />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Nursing Clinical Notes & Observations</label>
              <textarea rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} style={inputStyle} placeholder="e.g. Patient resting comfortably, IV drip running smoothly." />
            </div>

            <button type="submit" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}>
              💾 Save Vital Telemetry Entry
            </button>
          </form>
        </div>

        {/* Assigned Inpatient Ward Monitor */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#0f172a' }}>🛏️ Inpatient Bed & Ward Active Monitor</h3>
          {occupiedBeds.length === 0 ? (
            <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No patients currently admitted in wards.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem' }}>
              {occupiedBeds.map(b => (
                <div key={b.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{b.ward_name} - Bed #{b.bed_number}</div>
                    <div style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600, marginTop: '0.2rem' }}>
                      Admitted Patient: {b.assigned_patient_name || 'Assigned Patient'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.1rem' }}>
                      Admitted: {b.admitted_at ? new Date(b.admitted_at).toLocaleString() : 'Recently'}
                    </div>
                  </div>
                  <span style={{ padding: '0.3rem 0.75rem', borderRadius: '20px', background: '#fee2e2', color: '#b91c1c', fontWeight: 700, fontSize: '0.78rem' }}>
                    OCCUPIED
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Vitals History Telemetry Table */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>📊 Patient Vital Signs Telemetry History</h3>
        </div>
        {vitalsList.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No vitals recorded yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Patient</th>
                <th style={{ padding: '0.85rem 1rem' }}>Temperature</th>
                <th style={{ padding: '0.85rem 1rem' }}>Blood Pressure</th>
                <th style={{ padding: '0.85rem 1rem' }}>Pulse (BPM)</th>
                <th style={{ padding: '0.85rem 1rem' }}>SPO2 (%)</th>
                <th style={{ padding: '0.85rem 1rem' }}>Recorded By</th>
                <th style={{ padding: '0.85rem 1rem' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {vitalsList.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a' }}>{v.patient_name}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{v.temperature}</td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{v.blood_pressure}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{v.pulse_rate} BPM</td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: v.oxygen_saturation < 95 ? '#dc2626' : '#16a34a' }}>
                    {v.oxygen_saturation}% {v.oxygen_saturation < 95 && '⚠️'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>{v.recorded_by_name}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.82rem' }}>{new Date(v.recorded_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box'
};
