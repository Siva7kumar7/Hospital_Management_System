import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

export default function AISymptomAssistantModal({ isOpen, onClose }) {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await API.post('ai/symptom-assistant/', { symptoms });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSpecialist = (dept) => {
    onClose();
    navigate('/appointments', { state: { department: dept } });
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color, #e2e8f0)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ fontSize: '1.75rem' }}>🤖</div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-color, #1e293b)' }}>AI Symptom & Clinical Assistant</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Describe your symptoms for instant intelligent triage & department guidance</p>
            </div>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <form onSubmit={handleAnalyze} style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            What symptoms are you experiencing?
          </label>
          <textarea
            rows="3"
            placeholder="e.g. Sharp chest pain radiating to left arm, shortness of breath for 1 hour..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            style={textareaStyle}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>💡 Example: "Severe headache and fever" or "Joint stiffness and knee pain"</span>
            <button type="submit" disabled={loading} style={analyzeBtnStyle}>
              {loading ? 'Analyzing Symptoms...' : '✨ Analyze & Triage'}
            </button>
          </div>
        </form>

        {error && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', marginBottom: '1rem', fontSize: '0.9rem' }}>
            ⚠️ {error}
          </div>
        )}

        {result && (
          <div style={resultCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#334155' }}>Clinical Triage Level:</span>
              <span style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                fontWeight: 700,
                fontSize: '0.85rem',
                background: result.triage_level === 'CRITICAL' ? '#fee2e2' : result.triage_level === 'HIGH' ? '#ffedd5' : '#fef9c3',
                color: result.triage_level === 'CRITICAL' ? '#b91c1c' : result.triage_level === 'HIGH' ? '#c2410c' : '#854d0e'
              }}>
                {result.badge}
              </span>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '8px', padding: '1rem', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1rem' }}>Suggested Specialty: <span style={{ color: '#2563eb' }}>{result.department}</span></h4>
              <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#475569', lineHeight: '1.5' }}>{result.clinical_guidance}</p>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', background: '#f8fafc', padding: '0.5rem', borderRadius: '6px' }}>
                {result.disclaimer}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              {result.triage_level === 'CRITICAL' && (
                <button
                  onClick={() => { onClose(); navigate('/tokens'); }}
                  style={{ ...actionBtnStyle, background: '#dc2626', color: '#ffffff' }}>
                  🚨 Emergency SOS Dispatch
                </button>
              )}
              <button
                onClick={() => handleBookSpecialist(result.department)}
                style={{ ...actionBtnStyle, background: '#2563eb', color: '#ffffff' }}>
                📅 Book {result.recommended_specialization} Appointment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.65)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '1rem'
};

const modalStyle = {
  background: '#ffffff',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '620px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  padding: '1.75rem',
  boxSizing: 'border-box'
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  fontSize: '1.25rem',
  cursor: 'pointer',
  color: '#64748b'
};

const textareaStyle = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '0.95rem',
  fontFamily: 'inherit',
  resize: 'vertical',
  boxSizing: 'border-box',
  outline: 'none'
};

const analyzeBtnStyle = {
  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
  color: '#ffffff',
  padding: '0.6rem 1.25rem',
  borderRadius: '8px',
  border: 'none',
  fontWeight: 600,
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'transform 0.1s ease'
};

const resultCardStyle = {
  background: '#f8fafc',
  border: '1px solid #cbd5e1',
  borderRadius: '12px',
  padding: '1.25rem'
};

const actionBtnStyle = {
  padding: '0.6rem 1rem',
  borderRadius: '8px',
  border: 'none',
  fontWeight: 600,
  fontSize: '0.88rem',
  cursor: 'pointer'
};
