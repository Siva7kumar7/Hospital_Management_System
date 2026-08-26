import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';

const PrescriptionFormPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    diagnosis: '',
    medicines: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('prescriptions/', {
        appointment: appointmentId,
        ...formData
      });
      alert("Prescription submitted & Patient History logged!");
      navigate('/doctor-dashboard');
    } catch (err) {
      alert("Failed to submit prescription.");
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="glass-card p-4 p-md-5">
            <h3 className="fw-bold text-primary mb-4 border-bottom pb-2">
              <i className="bi bi-prescription2 me-2"></i> Issue Electronic Prescription & Diagnosis
            </h3>
            <p className="text-secondary small mb-4">Appointment ID: #{appointmentId}</p>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Diagnosis Summary *</label>
                <textarea className="form-control" rows="2" required placeholder="e.g. Acute Viral Fever & Fatigue" value={formData.diagnosis} onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Medicines & Dosage *</label>
                <textarea className="form-control" rows="4" required placeholder="Medicine Name - Dosage - Duration - Instructions&#10;e.g., Paracetamol 500mg - 1 tablet 3x daily - 5 days" value={formData.medicines} onChange={e => setFormData({ ...formData, medicines: e.target.value })}></textarea>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Additional Advice / Notes</label>
                <textarea className="form-control" rows="2" placeholder="Dietary restrictions or follow-up notes" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-custom" onClick={() => navigate(-1)}>Cancel</button>
                <button type="submit" className="btn btn-primary-custom">Issue Prescription & Complete Visit</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionFormPage;
