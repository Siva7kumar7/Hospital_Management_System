import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';

const LandingPage = () => {
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [ambulances, setAmbulances] = useState([]);
  const [showAmbulanceModal, setShowAmbulanceModal] = useState(false);
  const [pickupLocation, setPickupLocation] = useState('');
  const [selectedAmbulance, setSelectedAmbulance] = useState('');
  const [dispatchSuccess, setDispatchSuccess] = useState('');

  const partnerInsurersList = [
    'SecureLife Insurance Company',
    'CoverWise Insurance',
    'PolicyPro',
    'InsureMax',
    'RiskFree Insurance',
    'PrimeShield Insurance',
    'UnitedHealthcare',
    'Medicare'
  ];

  useEffect(() => {
    fetchHospitalData();
  }, []);

  const fetchHospitalData = async () => {
    try {
      const [infoRes, ambRes] = await Promise.all([
        API.get('hospital/info/'),
        API.get('ambulances/')
      ]);
      setHospitalInfo(infoRes.data);
      setAmbulances(ambRes.data);
      const available = ambRes.data.find(a => a.status === 'AVAILABLE');
      if (available) setSelectedAmbulance(available.id);
    } catch (err) {
      console.error("Failed to load hospital info:", err);
    }
  };

  const handleRequestDispatch = async (e) => {
    e.preventDefault();
    if (!selectedAmbulance) {
      alert("No available ambulances right now.");
      return;
    }
    try {
      const res = await API.post(`ambulances/${selectedAmbulance}/request_dispatch/`, {
        pickup_location: pickupLocation || 'Emergency Patient Location'
      });
      setDispatchSuccess(res.data.message);
      fetchHospitalData();
    } catch (err) {
      alert("Dispatch request failed.");
    }
  };

  return (
    <div className="container py-4">
      {/* Hero Section Banner */}
      <div className="glass-card p-4 p-md-5 mb-5 border-primary position-relative overflow-hidden">
        <div className="row align-items-center">
          <div className="col-lg-7 z-1">
            <div className="d-inline-flex align-items-center gap-2 badge bg-danger text-white px-3 py-2 rounded-pill fw-bold mb-3 shadow-sm">
              <span className="pulse-dot-danger"></span> 24/7 Emergency Line: +91 422-1234567 / 108
            </div>
            
            <div className="d-flex align-items-center gap-3 mb-2">
              <img src="/logo.png" alt="NextGen Logo" style={{ height: '65px' }} className="rounded shadow-sm" />
              <h1 className="display-4 fw-extrabold mb-0" style={{ background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                NextGen HealthCare Hospital
              </h1>
            </div>
            
            <p className="lead text-secondary fw-semibold mb-3 ms-1">
              Next-Generation Smart Healthcare, Doctor OPD Token Booking & Emergency Care
            </p>
            
            <p className="small text-muted mb-4 ms-1">
              <i className="bi bi-geo-alt-fill text-danger me-1"></i> <strong>Address:</strong> No. 24, Health Street, Gandhipuram, Coimbatore - 641012, Tamil Nadu, India
              <span className="mx-2">•</span>
              <i className="bi bi-telephone-fill text-primary me-1"></i> <strong>Phone:</strong> +91 422-1234567
            </p>

            <div className="d-flex flex-wrap gap-3">
              <Link to="/register" className="btn btn-primary-custom btn-lg">
                <i className="bi bi-person-plus-fill me-2"></i> Register Patient Account
              </Link>
              <Link to="/login" className="btn btn-outline-custom btn-lg">
                <i className="bi bi-box-arrow-in-right me-2"></i> Patient Portal Login
              </Link>
              <button onClick={() => setShowAmbulanceModal(true)} className="btn btn-emergency btn-lg text-white">
                <i className="bi bi-truck me-2"></i> Emergency Call Ambulance
              </button>
            </div>
          </div>

          <div className="col-lg-5 text-center d-none d-lg-block z-1">
            <div className="glass-card p-4 border-primary text-center">
              <img src="/logo.png" alt="NextGen HealthCare Hospital Logo" style={{ height: '120px' }} className="mb-3 rounded shadow-sm" />
              <h5 className="fw-bold text-primary mb-1">Center of Medical Excellence</h5>
              <p className="small text-secondary mb-0">Multi-Speciality OPD, ICU Wards & Cashless Insurance Claims</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Tiles Hub Banner */}
      <div className="row g-3 mb-5">
        <div className="col-6 col-md-3">
          <div className="glass-card p-3 text-center border-primary h-100">
            <div className="bg-primary-subtle text-primary p-3 rounded-circle d-inline-flex mb-2">
              <i className="bi bi-truck fs-3"></i>
            </div>
            <h6 className="fw-bold text-primary mb-1">Ambulance SOS</h6>
            <p className="small text-secondary mb-2">1-Click Dispatch & Driver Contact</p>
            <button onClick={() => setShowAmbulanceModal(true)} className="btn btn-sm btn-outline-danger w-100">
              Call Ambulance
            </button>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="glass-card p-3 text-center border-success h-100">
            <div className="bg-success-subtle text-success p-3 rounded-circle d-inline-flex mb-2">
              <i className="bi bi-ticket-perforated fs-3"></i>
            </div>
            <h6 className="fw-bold text-success mb-1">OPD Token Book</h6>
            <p className="small text-secondary mb-2">Instant Walk-in Token Allocation</p>
            <Link to="/tokens" className="btn btn-sm btn-outline-success w-100">
              Book Token
            </Link>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="glass-card p-3 text-center border-info h-100">
            <div className="bg-info-subtle text-info p-3 rounded-circle d-inline-flex mb-2">
              <i className="bi bi-journal-medical fs-3"></i>
            </div>
            <h6 className="fw-bold text-info mb-1">Medical Info Records</h6>
            <p className="small text-secondary mb-2">Prescriptions, Diagnostics & History</p>
            <Link to="/history" className="btn btn-sm btn-outline-info w-100">
              View History
            </Link>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="glass-card p-3 text-center border-warning h-100">
            <div className="bg-warning-subtle text-warning p-3 rounded-circle d-inline-flex mb-2">
              <i className="bi bi-shield-check fs-3"></i>
            </div>
            <h6 className="fw-bold text-warning mb-1">Cashless Claims</h6>
            <p className="small text-secondary mb-2">Automated Billing & Insurance Tie-ups</p>
            <Link to="/billing" className="btn btn-sm btn-outline-warning w-100">
              Pay & Claim
            </Link>
          </div>
        </div>
      </div>

      {/* Hospital Real-Time Live Status Bar */}
      <div className="row g-3 mb-5">
        <div className="col-6 col-md-3">
          <div className="stat-card border-success">
            <div className="stat-value text-success">{hospitalInfo?.bed_counts?.available || 0}</div>
            <div className="stat-label mt-1"><i className="bi bi-door-open me-1"></i> Available Beds</div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="stat-card border-danger">
            <div className="stat-value text-danger">{hospitalInfo?.bed_counts?.allotted || 0}</div>
            <div className="stat-label mt-1"><i className="bi bi-hospital me-1"></i> Allotted Beds</div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="stat-card border-info">
            <div className="stat-value text-info">{hospitalInfo?.ambulance_counts?.available || 0} / {hospitalInfo?.ambulance_counts?.total || 0}</div>
            <div className="stat-label mt-1"><i className="bi bi-truck me-1"></i> Ambulances Ready</div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="stat-card border-warning">
            <div className="fw-extrabold text-warning" style={{ fontSize: '1.4rem' }}>09:00 AM - 08:00 PM</div>
            <div className="stat-label mt-1"><i className="bi bi-clock me-1"></i> Doctor OPD Hours</div>
          </div>
        </div>
      </div>

      {/* Doctor Consultation Shift Timings Card */}
      <div className="glass-card p-4 mb-5">
        <h4 className="fw-bold text-primary mb-3"><i className="bi bi-clock-history me-2"></i> Doctor Patient Checking & Consultation Shifts</h4>
        <div className="row g-3">
          <div className="col-md-6">
            <div className="glass-card p-3 border-primary">
              <strong className="d-block text-primary fs-5 mb-1"><i className="bi bi-sun me-2"></i> Morning OPD Shift</strong>
              <p className="mb-1 text-secondary small"><strong>09:00 AM – 01:00 PM</strong> (Monday through Saturday)</p>
              <small className="text-muted">Specialists: Dr. Arjun Mehta (Cardiologist), Dr. Priya Sharma (Neurologist), Dr. Ramesh Iyer (Orthopedic Surgeon)</small>
            </div>
          </div>
          <div className="col-md-6">
            <div className="glass-card p-3 border-info">
              <strong className="d-block text-info fs-5 mb-1"><i className="bi bi-moon-stars me-2"></i> Evening OPD Shift</strong>
              <p className="mb-1 text-secondary small"><strong>04:00 PM – 08:00 PM</strong> (Monday through Saturday)</p>
              <small className="text-muted">Specialists: Dr. Kavya Reddy (Pediatrician), Dr. Suresh Patel (General Physician), Dr. Sneha Verma (ENT Specialist)</small>
            </div>
          </div>
        </div>
      </div>

      {/* Partner Insurance Companies & Easy Claims */}
      <div className="glass-card p-4 mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h4 className="fw-bold text-primary mb-0"><i className="bi bi-shield-check me-2"></i> Cashless Insurance Availability Companies</h4>
          <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1 fw-bold">Instant Cashless Claims</span>
        </div>
        <p className="text-secondary small mb-3">
          NextGen HealthCare Hospital has direct cashless treatment tie-ups with leading health insurance providers:
        </p>

        <div className="row g-2 mb-3">
          {partnerInsurersList.map((insurer, idx) => (
            <div key={idx} className="col-6 col-md-3">
              <div className="glass-card p-2 text-center small font-semibold text-primary border-primary">
                <i className="bi bi-check-circle-fill text-success me-1"></i> {insurer}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-primary-subtle text-primary p-3 rounded-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="small">
            <strong>Easy Claim Option:</strong> Submit your insurance policy number during bill payment for automated 1-click cashless claim processing.
          </div>
          <Link to="/billing" className="btn btn-sm btn-primary-custom text-nowrap">View Bills & Claims</Link>
        </div>
      </div>

      {/* Emergency Ambulance Modal */}
      {showAmbulanceModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-md">
            <div className="modal-content glass-card border-danger p-3">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold text-danger"><i className="bi bi-truck me-2"></i> Emergency Ambulance Dispatch Request</h5>
                <button type="button" className="btn-close" onClick={() => setShowAmbulanceModal(false)}></button>
              </div>
              <form onSubmit={handleRequestDispatch}>
                <div className="modal-body">
                  {dispatchSuccess && (
                    <div className="alert alert-success py-2 small" role="alert">
                      <i className="bi bi-check-circle-fill me-2"></i>{dispatchSuccess}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Available NextGen Ambulance *</label>
                    <select className="form-select" required value={selectedAmbulance} onChange={e => setSelectedAmbulance(e.target.value)}>
                      {ambulances.filter(a => a.status === 'AVAILABLE').map(a => (
                        <option key={a.id} value={a.id}>{a.vehicle_number} - Driver: {a.driver_name} ({a.driver_phone})</option>
                      ))}
                      {ambulances.filter(a => a.status === 'AVAILABLE').length === 0 && (
                        <option value="">No Available Ambulances (Call Emergency Hotline)</option>
                      )}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Pickup Location / Patient Address *</label>
                    <textarea className="form-control" rows="2" required placeholder="Enter street name, landmark, or location in Coimbatore" value={pickupLocation} onChange={e => setPickupLocation(e.target.value)}></textarea>
                  </div>

                  <div className="alert alert-warning py-2 small">
                    <i className="bi bi-telephone-outbound-fill me-1 text-danger"></i> Emergency Hotline Direct Dial: <strong>+91 422-1234567 / 108</strong>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-outline-custom" onClick={() => setShowAmbulanceModal(false)}>Close</button>
                  <button type="submit" className="btn btn-emergency text-white">Dispatch Ambulance Now</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
