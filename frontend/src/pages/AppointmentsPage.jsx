import React, { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { Calendar as CalendarIcon, Clock, Stethoscope, MapPin, Plus, CheckCircle, XCircle } from 'lucide-react';

const AppointmentsPage = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [bookingData, setBookingData] = useState({
    patient: '',
    doctor: '',
    appointment_date: new Date().toISOString().slice(0, 10),
    time_slot: '10:00',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appRes, docRes] = await Promise.all([
        API.get('appointments/'),
        API.get('doctors/')
      ]);
      setAppointments(appRes.data);
      setDoctors(docRes.data);

      if (user?.role === 'ADMIN' || user?.is_superuser) {
        const patRes = await API.get('patients/');
        setPatients(patRes.data);
      }
    } catch (err) {
      console.error("Failed to load appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const payload = { ...bookingData };
      if (user?.role === 'PATIENT' && user?.patient_id) {
        payload.patient = user.patient_id;
      }
      await API.post('appointments/', payload);
      setShowModal(false);
      fetchData();
      alert("Appointment successfully booked!");
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Slot conflict! Doctor is already booked at this time slot.");
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await API.patch(`appointments/${appId}/update_status/`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const upcomingAppt = appointments.find(a => a.status === 'SCHEDULED');
  const otherAppts = appointments.filter(a => a.id !== upcomingAppt?.id);

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading consultations...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">Manage your upcoming doctor consultations and hospital visits</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-nextgen-primary">
          <Plus size={18} /> Book Appointment
        </button>
      </div>

      {/* Featured Upcoming Appointment Spotlight Card */}
      {upcomingAppt && (
        <div className="nextgen-card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--brand-primary)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            UPCOMING SCHEDULED VISIT
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'var(--status-info-bg)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Stethoscope size={28} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 700 }}>{upcomingAppt.doctor_name}</h3>
                <div style={{ color: 'var(--brand-primary)', fontWeight: 600, fontSize: '0.9rem' }}>{upcomingAppt.doctor_specialization}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <CalendarIcon size={16} color="var(--brand-primary)" />
                <strong>{upcomingAppt.appointment_date}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <Clock size={16} color="var(--brand-primary)" />
                <strong>{upcomingAppt.time_slot}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <MapPin size={16} color="var(--brand-primary)" />
                <span>Room 204 OPD</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="badge-nextgen badge-info">● Confirmed</span>
              <button onClick={() => handleUpdateStatus(upcomingAppt.id, 'CANCELLED')} className="btn-nextgen-secondary" style={{ color: 'var(--brand-danger)', borderColor: 'rgba(239,68,68,0.3)' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment History / List */}
      <div className="nextgen-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="card-title-text" style={{ margin: 0 }}>Consultation Logs & Schedule</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total: {appointments.length}</span>
        </div>

        {appointments.length === 0 ? (
          <div className="empty-state-box">
            <div className="empty-state-icon">📅</div>
            <h4>No Appointments Scheduled</h4>
            <p>Your upcoming and past consultation appointments will appear here.</p>
            <button onClick={() => setShowModal(true)} className="btn-nextgen-primary">Book First Appointment</button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem 1.25rem' }}>Appt ID</th>
                <th style={{ padding: '1rem 1.25rem' }}>Patient</th>
                <th style={{ padding: '1rem 1.25rem' }}>Doctor Specialist</th>
                <th style={{ padding: '1rem 1.25rem' }}>Date & Time</th>
                <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                <th style={{ padding: '1rem 1.25rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(app => (
                <tr key={app.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>#{app.id}</td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>{app.patient_name}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>{app.doctor_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.doctor_specialization}</div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>{app.appointment_date} at {app.time_slot}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span className={`badge-nextgen badge-${app.status === 'COMPLETED' ? 'success' : app.status === 'CANCELLED' ? 'danger' : 'info'}`}>
                      {app.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    {app.status === 'SCHEDULED' && (
                      <button onClick={() => handleUpdateStatus(app.id, 'CANCELLED')} style={{ background: 'none', border: 'none', color: 'var(--brand-danger)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Book Appointment Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="nextgen-card" style={{ width: '100%', maxWidth: '500px', padding: '1.75rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>Book Consultation Appointment</h3>
            <form onSubmit={handleBookAppointment}>
              {errorMsg && (
                <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--status-danger-bg)', color: 'var(--status-danger-text)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              {(user?.role === 'ADMIN' || user?.is_superuser) && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Select Patient</label>
                  <select required value={bookingData.patient} onChange={e => setBookingData({ ...bookingData, patient: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                    <option value="">-- Select Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.user?.first_name} {p.user?.last_name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Select Doctor Specialist</label>
                <select required value={bookingData.doctor} onChange={e => setBookingData({ ...bookingData, doctor: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                  <option value="">-- Select Specialist --</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.full_name} ({d.specialization}) - ₹{d.consultation_fee}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Date</label>
                  <input type="date" required value={bookingData.appointment_date} onChange={e => setBookingData({ ...bookingData, appointment_date: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Time Slot</label>
                  <input type="time" required value={bookingData.time_slot} onChange={e => setBookingData({ ...bookingData, time_slot: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Symptoms / Notes</label>
                <textarea rows="2" placeholder="Describe symptoms or reason for visit..." value={bookingData.notes} onChange={e => setBookingData({ ...bookingData, notes: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-nextgen-secondary">Cancel</button>
                <button type="submit" className="btn-nextgen-primary">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;

