import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { Search, User, Stethoscope, Calendar, FileText, Pill, CreditCard, X } from 'lucide-react';

export default function CommandSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else window.dispatchEvent(new CustomEvent('open-command-search'));
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await API.get(`search/?q=${encodeURIComponent(query.trim())}`);
        setResults(res.data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={searchHeaderStyle}>
          <Search size={20} color="var(--brand-primary)" />
          <input
            type="text"
            placeholder="Search patients, doctors, appointments, labs, bills... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={searchInputStyle}
            autoFocus
          />
          <button onClick={onClose} style={closeBtnStyle}>
            <X size={18} />
          </button>
        </div>

        <div style={contentStyle}>
          {loading && (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Searching NextGen platform...
            </div>
          )}

          {!loading && !results && (
            <div style={{ padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Quick Shortcuts</div>
              <div style={shortcutGridStyle}>
                <div style={shortcutChipStyle} onClick={() => handleSelect('/appointments')}>📅 Book Appointment</div>
                <div style={shortcutChipStyle} onClick={() => handleSelect('/tokens')}>🎫 OPD Tokens</div>
                <div style={shortcutChipStyle} onClick={() => handleSelect('/labs')}>🧪 Lab Diagnostics</div>
                <div style={shortcutChipStyle} onClick={() => handleSelect('/pharmacy')}>💊 Pharmacy Catalog</div>
                <div style={shortcutChipStyle} onClick={() => handleSelect('/billing')}>💳 Pay Invoice</div>
              </div>
            </div>
          )}

          {!loading && results && (
            <div style={{ padding: '0.75rem 1rem' }}>
              {/* Doctors */}
              {results.doctors?.length > 0 && (
                <div style={sectionGroupStyle}>
                  <div style={sectionHeaderStyle}><Stethoscope size={14} /> Doctors</div>
                  {results.doctors.map(doc => (
                    <div key={doc.id} style={resultRowStyle} onClick={() => handleSelect(`/doctors`)}>
                      <div style={{ fontWeight: 600 }}>Dr. {doc.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{doc.specialization} • Fee: ₹{doc.consultation_fee}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Patients */}
              {results.patients?.length > 0 && (
                <div style={sectionGroupStyle}>
                  <div style={sectionHeaderStyle}><User size={14} /> Patients</div>
                  {results.patients.map(pat => (
                    <div key={pat.id} style={resultRowStyle} onClick={() => handleSelect(`/patients`)}>
                      <div style={{ fontWeight: 600 }}>{pat.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{pat.patient_id || 'PAT-ID'} • Blood Group: {pat.blood_group}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Appointments */}
              {results.appointments?.length > 0 && (
                <div style={sectionGroupStyle}>
                  <div style={sectionHeaderStyle}><Calendar size={14} /> Appointments</div>
                  {results.appointments.map(app => (
                    <div key={app.id} style={resultRowStyle} onClick={() => handleSelect(`/appointments`)}>
                      <div style={{ fontWeight: 600 }}>Appt #{app.id} - {app.patient_name} with {app.doctor_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.appointment_date} at {app.time_slot} [{app.status}]</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Prescriptions */}
              {results.prescriptions?.length > 0 && (
                <div style={sectionGroupStyle}>
                  <div style={sectionHeaderStyle}><FileText size={14} /> Prescriptions</div>
                  {results.prescriptions.map(rx => (
                    <div key={rx.id} style={resultRowStyle} onClick={() => handleSelect(`/history`)}>
                      <div style={{ fontWeight: 600 }}>{rx.patient_name} - Diagnosis: {rx.diagnosis}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Medicines: {rx.medicines}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Bills */}
              {results.bills?.length > 0 && (
                <div style={sectionGroupStyle}>
                  <div style={sectionHeaderStyle}><CreditCard size={14} /> Invoices & Bills</div>
                  {results.bills.map(bill => (
                    <div key={bill.id} style={resultRowStyle} onClick={() => handleSelect(`/billing`)}>
                      <div style={{ fontWeight: 600 }}>Bill #{bill.id} - {bill.patient_name} (₹{bill.total_amount})</div>
                      <div style={{ fontSize: '0.8rem', color: bill.payment_status === 'PAID' ? 'var(--brand-success)' : 'var(--brand-warning)' }}>
                        Status: {bill.payment_status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)',
  display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '10vh',
  zIndex: 99999, padding: '1rem'
};

const modalStyle = {
  background: 'var(--bg-secondary)', borderRadius: '16px', width: '100%', maxWidth: '640px',
  boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)', overflow: 'hidden'
};

const searchHeaderStyle = {
  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem',
  borderBottom: '1px solid var(--border-color)', background: 'var(--bg-subtle)'
};

const searchInputStyle = {
  flex: 1, border: 'none', background: 'transparent', outline: 'none',
  fontSize: '1rem', color: 'var(--text-primary)', fontFamily: 'inherit'
};

const closeBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center'
};

const contentStyle = {
  maxHeight: '60vh', overflowY: 'auto'
};

const shortcutGridStyle = {
  display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem'
};

const shortcutChipStyle = {
  padding: '0.4rem 0.85rem', borderRadius: '8px', background: 'var(--bg-card)',
  border: '1px solid var(--border-color)', fontSize: '0.82rem', fontWeight: 600,
  color: 'var(--text-primary)', cursor: 'pointer', transition: 'var(--transition-fast)'
};

const sectionGroupStyle = {
  marginBottom: '1rem'
};

const sectionHeaderStyle = {
  fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
  color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem'
};

const resultRowStyle = {
  padding: '0.6rem 0.85rem', borderRadius: '8px', cursor: 'pointer',
  transition: 'var(--transition-fast)', borderBottom: '1px solid var(--border-color)'
};
