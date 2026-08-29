import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Ticket, FileText, CreditCard, ShieldCheck, ArrowRight, Activity, Clock, CheckCircle } from 'lucide-react';

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

  const nextAppt = appointments.find(a => a.status === 'SCHEDULED') || appointments[0];
  const activeToken = tokens.find(t => t.status === 'WAITING' || t.status === 'IN_CONSULTATION') || tokens[0];
  const pendingBillSum = bills.reduce((acc, b) => acc + parseFloat(b.total_amount || 0), 0);

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '3rem auto', padding: '0 1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Loading NextGen Healthcare Ecosystem...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '2rem auto', padding: '0 1.25rem' }}>
      
      {/* Modern Healthcare Overview Hero */}
      <div style={{
        background: 'var(--hero-gradient)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.25rem 2.5rem',
        color: '#FFFFFF',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '750px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>
              ● HEALTH SYSTEMS CONNECTED
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Good morning, {user?.first_name || user?.username || 'Sivakumar'} 👋
          </h1>
          <p style={{ fontSize: '1.05rem', opacity: 0.9, margin: '0 0 1.5rem 0', lineHeight: '1.5' }}>
            Your health, organized in one place. NextGen HealthCare gives you instant real-time access to appointments, OPD tokens, lab diagnostics, prescriptions, and emergency dispatch.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
            <Link to="/appointments" className="btn-nextgen-primary" style={{ background: '#FFFFFF', color: '#2563EB' }}>
              📅 Book Appointment
            </Link>
            <Link to="/tokens" className="btn-nextgen-secondary" style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', borderColor: 'rgba(255, 255, 255, 0.3)' }}>
              🎫 Walk-in OPD Token
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Intelligent Summary Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        
        {/* Card 1: Upcoming Appointment */}
        <div className="nextgen-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Upcoming Appointment
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--status-info-bg)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={18} />
            </div>
          </div>
          {nextAppt ? (
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: 700 }}>{nextAppt.doctor_name}</h4>
              <div style={{ fontSize: '0.85rem', color: 'var(--brand-primary)', fontWeight: 600, marginBottom: '0.75rem' }}>{nextAppt.doctor_specialization || 'Cardiology'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                <Clock size={15} /> Today • {nextAppt.time_slot} (Room 204)
              </div>
              <Link to="/appointments" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--brand-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                View Appointment <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', py: '1rem' }}>
              No upcoming appointments. <br />
              <Link to="/appointments" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>Book now</Link>
            </div>
          )}
        </div>

        {/* Card 2: OPD Token */}
        <div className="nextgen-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Live OPD Token
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--status-success-bg)', color: 'var(--brand-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ticket size={18} />
            </div>
          </div>
          {activeToken ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--brand-primary)' }}>#{activeToken.token_number || '08'}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Position: <strong>03 ahead</strong></span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.5rem 0 1.25rem 0' }}>
                Est. wait: <strong style={{ color: 'var(--brand-warning)' }}>12 mins</strong> • {activeToken.doctor_name}
              </div>
              <Link to="/tokens" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--brand-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                Track Live Queue <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-muted)' }}>No Token</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem 0 1.25rem 0' }}>Get walk-in token for today's OPD</div>
              <Link to="/tokens" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--brand-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                Get Token <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* Card 3: Health Records Summary */}
        <div className="nextgen-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Health Records
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--status-info-bg)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{history.length || 12} Consultations</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 1.25rem 0' }}>
              8 Lab Reports • 4 Active Prescriptions
            </div>
            <Link to="/history" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--brand-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              View Complete EHR <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Card 4: Outstanding Bill */}
        <div className="nextgen-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Outstanding Bill
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--status-warning-bg)', color: 'var(--brand-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={18} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: pendingBillSum > 0 ? 'var(--brand-danger)' : 'var(--brand-success)' }}>
              ₹{pendingBillSum > 0 ? pendingBillSum.toLocaleString() : '0.00'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 1.25rem 0' }}>
              {pendingBillSum > 0 ? 'Payment pending • Digital claim available' : 'All invoices cleared'}
            </div>
            <Link to="/billing" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--brand-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              Pay / Claim Now <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Patient Healthcare Care Pathway Tracker */}
      <div className="nextgen-card" style={{ marginBottom: '2.5rem' }}>
        <h3 className="section-title" style={{ marginBottom: '1.25rem' }}>🧭 Patient Healthcare Care Pathway</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          {[
            { step: 'BOOKED', done: true },
            { step: 'CHECK-IN', done: true },
            { step: 'OPD TOKEN #08', done: true },
            { step: 'CONSULTATION', current: true },
            { step: 'LAB TEST', pending: true },
            { step: 'PRESCRIPTION', pending: true },
            { step: 'BILLING', pending: true }
          ].map((s, idx) => (
            <React.Fragment key={idx}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto 0.4rem auto',
                  background: s.done ? 'var(--brand-success)' : s.current ? 'var(--brand-primary)' : 'var(--bg-subtle)',
                  color: s.done || s.current ? '#FFFFFF' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem'
                }}>
                  {s.done ? <CheckCircle size={16} /> : idx + 1}
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: s.current ? 700 : 600, color: s.current ? 'var(--brand-primary)' : 'var(--text-secondary)' }}>
                  {s.step}
                </div>
              </div>
              {idx < 6 && <div style={{ flex: 1, height: '2px', background: s.done ? 'var(--brand-success)' : 'var(--border-color)', minWidth: '20px' }}></div>}
            </React.Fragment>
          ))}
        </div>
      </div>

    </div>
  );
};

export default PatientDashboard;

