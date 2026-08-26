import React, { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

const DoctorsPage = () => {
  const { user } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    specialization: '',
    qualification: '',
    experience_years: 5,
    phone: '',
    consultation_fee: 100.00,
    availability_days: 'Mon, Tue, Wed, Thu, Fri',
    time_slot_start: '09:00',
    time_slot_end: '13:00'
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await API.get('doctors/');
      setDoctors(res.data);
    } catch (err) {
      console.error("Failed to load doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      await API.post('doctors/', formData);
      setShowModal(false);
      fetchDoctors();
      alert("New Doctor created successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create doctor account.");
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1"><i className="bi bi-person-badge me-2"></i> NextGen Specialist Doctors & OPD Shifts</h2>
          <p className="text-secondary mb-0">Consultation Timings: Morning Shift (09:00 AM - 01:00 PM) | Evening Shift (04:00 PM - 08:00 PM)</p>
        </div>
        {(user?.role === 'ADMIN' || user?.is_superuser) && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary-custom">
            <i className="bi bi-plus-lg me-1"></i> Add New Doctor
          </button>
        )}
      </div>

      <div className="row g-4">
        {doctors.map(doc => (
          <div key={doc.id} className="col-md-6 col-lg-4">
            <div className="glass-card p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold fs-4" style={{ width: '54px', height: '54px' }}>
                    Dr
                  </div>
                  <div>
                    <h5 className="fw-bold text-primary mb-0">{doc.full_name}</h5>
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle mt-1">{doc.specialization}</span>
                  </div>
                </div>

                <ul className="list-unstyled small text-secondary mb-3">
                  <li className="mb-1"><i className="bi bi-mortarboard me-2 text-primary"></i> <strong>Qualification:</strong> {doc.qualification}</li>
                  <li className="mb-1"><i className="bi bi-briefcase me-2 text-primary"></i> <strong>Experience:</strong> {doc.experience_years} Years</li>
                  <li className="mb-1"><i className="bi bi-calendar-week me-2 text-primary"></i> <strong>Available Days:</strong> {doc.availability_days}</li>
                  <li className="mb-1"><i className="bi bi-clock me-2 text-primary"></i> <strong>OPD Shift Timings:</strong> <span className="fw-bold text-primary">{doc.time_slot_start} - {doc.time_slot_end}</span></li>
                  <li className="mb-1"><i className="bi bi-telephone me-2 text-primary"></i> <strong>Contact:</strong> {doc.contact_number}</li>
                  <li className="mb-1"><i className="bi bi-cash me-2 text-success"></i> <strong>Fee:</strong> <span className="fw-bold text-success">${doc.consultation_fee}</span></li>
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Doctor Creation Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content glass-card border-primary p-3">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold text-primary"><i className="bi bi-person-badge-fill me-2"></i> Add Doctor Profile</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateDoctor}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Username *</label>
                      <input type="text" className="form-control" required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Email *</label>
                      <input type="email" className="form-control" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">First Name *</label>
                      <input type="text" className="form-control" required value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Last Name *</label>
                      <input type="text" className="form-control" required value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Specialization *</label>
                      <input type="text" className="form-control" placeholder="e.g. Cardiology" required value={formData.specialization} onChange={e => setFormData({ ...formData, specialization: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Qualification *</label>
                      <input type="text" className="form-control" placeholder="e.g. MBBS, MD" required value={formData.qualification} onChange={e => setFormData({ ...formData, qualification: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Consultation Fee ($)</label>
                      <input type="number" className="form-control" value={formData.consultation_fee} onChange={e => setFormData({ ...formData, consultation_fee: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Shift Start</label>
                      <input type="time" className="form-control" value={formData.time_slot_start} onChange={e => setFormData({ ...formData, time_slot_start: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Shift End</label>
                      <input type="time" className="form-control" value={formData.time_slot_end} onChange={e => setFormData({ ...formData, time_slot_end: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-outline-custom" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary-custom">Create Doctor</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsPage;
