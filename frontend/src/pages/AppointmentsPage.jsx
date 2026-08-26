import React, { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

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

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1"><i className="bi bi-calendar-event me-2"></i> Appointments</h2>
          <p className="text-secondary mb-0">Scheduled Doctor Consultations</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary-custom">
          <i className="bi bi-plus-lg me-1"></i> Book New Appointment
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="table-responsive">
          <table className="table table-custom align-middle mb-0">
            <thead>
              <tr>
                <th>Appt #</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(app => (
                <tr key={app.id}>
                  <td className="fw-bold">#{app.id}</td>
                  <td>{app.patient_name}</td>
                  <td>{app.doctor_name} ({app.doctor_specialization})</td>
                  <td>{app.appointment_date} at {app.time_slot}</td>
                  <td>
                    <span className={`badge badge-status badge-${app.status.toLowerCase()}`}>{app.status}</span>
                  </td>
                  <td>
                    {app.status === 'SCHEDULED' && (
                      <button onClick={() => handleUpdateStatus(app.id, 'CANCELLED')} className="btn btn-sm btn-outline-danger me-1">
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr><td colSpan="6" class="text-center text-muted py-4">No appointments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Appointment Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-md">
            <div className="modal-content glass-card border-primary p-3">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold text-primary"><i className="bi bi-calendar-plus-fill me-2"></i> Book Scheduled Appointment</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleBookAppointment}>
                <div className="modal-body">
                  {errorMsg && (
                    <div className="alert alert-danger py-2 small" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>{errorMsg}
                    </div>
                  )}

                  {(user?.role === 'ADMIN' || user?.is_superuser) && (
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Patient *</label>
                      <select className="form-select" required value={bookingData.patient} onChange={e => setBookingData({ ...bookingData, patient: e.target.value })}>
                        <option value="">-- Choose Patient --</option>
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>{p.user?.first_name} {p.user?.last_name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Doctor *</label>
                    <select className="form-select" required value={bookingData.doctor} onChange={e => setBookingData({ ...bookingData, doctor: e.target.value })}>
                      <option value="">-- Select Specialist --</option>
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>{d.full_name} ({d.specialization})</option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Appointment Date *</label>
                      <input type="date" className="form-control" required value={bookingData.appointment_date} onChange={e => setBookingData({ ...bookingData, appointment_date: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Time Slot *</label>
                      <input type="time" className="form-control" required value={bookingData.time_slot} onChange={e => setBookingData({ ...bookingData, time_slot: e.target.value })} />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Symptoms / Notes</label>
                    <textarea className="form-control" rows="2" placeholder="Notes for doctor" value={bookingData.notes} onChange={e => setBookingData({ ...bookingData, notes: e.target.value })}></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-outline-custom" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary-custom">Confirm Booking</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
