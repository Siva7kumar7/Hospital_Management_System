import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RegisterPage = () => {
  const { registerUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: 'PATIENT',
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    // Patient fields
    dob: '',
    gender: 'Male',
    blood_group: 'O+',
    address: '',
    emergency_contact: '',
    insurance_provider: '',
    policy_number: '',
    // Doctor fields
    specialization: 'General Medicine',
    qualification: 'MBBS',
    experience_years: 5,
    consultation_fee: 100.00,
    availability_days: 'Mon, Tue, Wed, Thu, Fri'
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await registerUser(formData);
      const userRole = data.user.role;
      if (userRole === 'ADMIN') navigate('/admin-dashboard');
      else if (userRole === 'DOCTOR') navigate('/doctor-dashboard');
      else navigate('/patient-dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Check details.');
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-7">
          <div className="glass-card p-4 p-md-5">
            <div className="text-center mb-4">
              <img src="/logo.png" alt="NextGen HealthCare Logo" style={{ height: '65px' }} className="mb-2 rounded shadow-sm" />
              <h3 className="fw-bold text-primary">NextGen User Registration</h3>
              <p className="text-secondary small">Register a new Account (Patient, Doctor, or Admin)</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Role Selection */}
              <div className="mb-4 text-center">
                <label className="form-label d-block text-secondary font-semibold mb-2">Select User Account Role *</label>
                <div className="btn-group w-100" role="group">
                  <input type="radio" className="btn-check" name="role" id="rolePatient" value="PATIENT" checked={formData.role === 'PATIENT'} onChange={handleChange} />
                  <label className="btn btn-outline-primary py-2" htmlFor="rolePatient"><i className="bi bi-person me-1"></i> Patient</label>

                  <input type="radio" className="btn-check" name="role" id="roleDoctor" value="DOCTOR" checked={formData.role === 'DOCTOR'} onChange={handleChange} />
                  <label className="btn btn-outline-primary py-2" htmlFor="roleDoctor"><i className="bi bi-stethoscope me-1"></i> Doctor</label>

                  <input type="radio" className="btn-check" name="role" id="roleAdmin" value="ADMIN" checked={formData.role === 'ADMIN'} onChange={handleChange} />
                  <label className="btn btn-outline-primary py-2" htmlFor="roleAdmin"><i className="bi bi-shield-lock me-1"></i> Admin</label>
                </div>
              </div>

              <h5 className="fw-bold text-primary mb-3 border-bottom pb-2">Account Credentials</h5>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-semibold">Username *</label>
                  <input type="text" name="username" className="form-control" required value={formData.username} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-semibold">Email *</label>
                  <input type="email" name="email" className="form-control" required value={formData.email} onChange={handleChange} />
                </div>
                <div className="col-md-12">
                  <label className="form-label text-secondary small fw-semibold">Password *</label>
                  <input type="password" name="password" className="form-control" required value={formData.password} onChange={handleChange} />
                </div>
              </div>

              <h5 className="fw-bold text-primary mb-3 border-bottom pb-2">Personal Details</h5>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-semibold">First Name *</label>
                  <input type="text" name="first_name" className="form-control" required value={formData.first_name} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-semibold">Last Name *</label>
                  <input type="text" name="last_name" className="form-control" required value={formData.last_name} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-semibold">Phone Number</label>
                  <input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleChange} />
                </div>
              </div>

              {/* Patient-Specific Fields */}
              {formData.role === 'PATIENT' && (
                <>
                  <h5 className="fw-bold text-primary mb-3 border-bottom pb-2">Patient Profile Details</h5>
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <label className="form-label text-secondary small fw-semibold">Date of Birth</label>
                      <input type="date" name="dob" className="form-control" value={formData.dob} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-secondary small fw-semibold">Gender</label>
                      <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-secondary small fw-semibold">Blood Group</label>
                      <select name="blood_group" className="form-select" value={formData.blood_group} onChange={handleChange}>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-secondary small fw-semibold">Emergency Contact</label>
                      <input type="text" name="emergency_contact" className="form-control" value={formData.emergency_contact} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-secondary small fw-semibold">Insurance Provider</label>
                      <input type="text" name="insurance_provider" className="form-control" value={formData.insurance_provider} onChange={handleChange} />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary small fw-semibold">Address</label>
                      <textarea name="address" className="form-control" rows="2" value={formData.address} onChange={handleChange}></textarea>
                    </div>
                  </div>
                </>
              )}

              {/* Doctor-Specific Fields */}
              {formData.role === 'DOCTOR' && (
                <>
                  <h5 className="fw-bold text-primary mb-3 border-bottom pb-2">Doctor Professional Details</h5>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label text-secondary small fw-semibold">Specialization *</label>
                      <input type="text" name="specialization" className="form-control" placeholder="e.g. Cardiology" required value={formData.specialization} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-secondary small fw-semibold">Qualification *</label>
                      <input type="text" name="qualification" className="form-control" placeholder="e.g. MBBS, MD" required value={formData.qualification} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-secondary small fw-semibold">Consultation Fee ($)</label>
                      <input type="number" name="consultation_fee" className="form-control" value={formData.consultation_fee} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-secondary small fw-semibold">Experience Years</label>
                      <input type="number" name="experience_years" className="form-control" value={formData.experience_years} onChange={handleChange} />
                    </div>
                  </div>
                </>
              )}

              <button type="submit" className="btn btn-primary-custom w-100 py-2 fs-6">
                <i className="bi bi-check-circle-fill me-2"></i> Register Account
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
