import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const QuickAccessHub = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAmbulanceModal, setShowAmbulanceModal] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showSymptomModal, setShowSymptomModal] = useState(false);

  // Data states
  const [ambulances, setAmbulances] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedAmbulance, setSelectedAmbulance] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dispatchMsg, setDispatchMsg] = useState('');
  const [dispatchEta, setDispatchEta] = useState(null);

  // Token Modal states
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [tokenGenerated, setTokenGenerated] = useState(null);
  const [tokenLoading, setTokenLoading] = useState(false);

  // Symptom Assistant state
  const [symptomCategory, setSymptomCategory] = useState('');
  const [suggestedSpecialty, setSuggestedSpecialty] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchQuickHubData();
  }, []);

  const fetchQuickHubData = async () => {
    try {
      const [ambRes, docRes] = await Promise.all([
        API.get('ambulances/'),
        API.get('doctors/')
      ]);
      setAmbulances(ambRes.data);
      setDoctors(docRes.data);
      const availAmb = ambRes.data.find(a => a.status === 'AVAILABLE');
      if (availAmb) setSelectedAmbulance(availAmb.id);
      if (docRes.data.length > 0) setSelectedDoctor(docRes.data[0].id);
    } catch (err) {
      console.error("Failed to load Quick Hub data", err);
    }
  };

  const handleDispatchAmbulance = async (e) => {
    e.preventDefault();
    if (!selectedAmbulance) {
      alert("No available ambulances right now. Please call hotline +1 (800) 999-NEXT directly.");
      return;
    }
    try {
      const res = await API.post(`ambulances/${selectedAmbulance}/request_dispatch/`, {
        pickup_location: pickupLocation || 'Emergency Patient Location'
      });
      setDispatchMsg(res.data.message);
      setDispatchEta(Math.floor(Math.random() * 8) + 5); // 5 to 12 mins ETA
      fetchQuickHubData();
    } catch (err) {
      alert("Dispatch request failed. Please call hotline.");
    }
  };

  const handleGenerateToken = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    setTokenLoading(true);
    try {
      const res = await API.post('tokens/', {
        doctor: selectedDoctor,
        date: new Date().toISOString().split('T')[0]
      });
      setTokenGenerated(res.data);
    } catch (err) {
      alert("Failed to generate walk-in token. Please make sure you are logged in.");
      navigate('/login');
    } finally {
      setTokenLoading(false);
    }
  };

  const handleSymptomSelect = (cat) => {
    setSymptomCategory(cat);
    let match = {
      title: 'General Medicine',
      dept: 'General OPD',
      advice: 'Recommended for routine fever, checkups, or general health issues.',
      doc: doctors.find(d => d.specialization.includes('Medicine')) || doctors[0]
    };

    if (cat === 'chest_pain' || cat === 'bp') {
      match = {
        title: 'Cardiology',
        dept: 'Heart & Vascular Care',
        advice: 'Urgent: Please seek immediate cardiac checking or call Ambulance if pain persists.',
        doc: doctors.find(d => d.specialization.includes('Cardiology')) || doctors[0]
      };
    } else if (cat === 'headache' || cat === 'dizziness') {
      match = {
        title: 'Neurology',
        dept: 'Brain & Nervous System',
        advice: 'Recommended for migraine, severe headaches, or neurological checking.',
        doc: doctors.find(d => d.specialization.includes('Neurology')) || doctors[0]
      };
    } else if (cat === 'child_fever' || cat === 'growth') {
      match = {
        title: 'Pediatrics',
        dept: 'Child Healthcare',
        advice: 'Recommended for infants and children health consultation.',
        doc: doctors.find(d => d.specialization.includes('Pediatrics')) || doctors[0]
      };
    }
    setSuggestedSpecialty(match);
  };

  return (
    <>
      <div className="quick-hub-floating">
        {isOpen && (
          <div className="quick-hub-menu">
            <button 
              className="quick-hub-item quick-hub-item-emergency" 
              onClick={() => { setShowAmbulanceModal(true); setIsOpen(false); }}
            >
              <i className="bi bi-truck fs-5"></i>
              <span>🚑 Emergency Ambulance (1-Click)</span>
            </button>

            <button 
              className="quick-hub-item" 
              onClick={() => { setShowTokenModal(true); setIsOpen(false); }}
            >
              <i className="bi bi-ticket-perforated-fill text-primary fs-5"></i>
              <span>🎫 Instant OPD Token Book</span>
            </button>

            <button 
              className="quick-hub-item" 
              onClick={() => { setShowSymptomModal(true); setIsOpen(false); }}
            >
              <i className="bi bi-robot text-success fs-5"></i>
              <span>🩺 AI Symptom Assistant</span>
            </button>

            <a href="tel:+18009996398" className="quick-hub-item text-danger">
              <i className="bi bi-telephone-fill text-danger fs-5"></i>
              <span>📞 Helpline: +1 (800) 999-NEXT</span>
            </a>
          </div>
        )}

        <button 
          className="quick-hub-trigger" 
          onClick={() => setIsOpen(!isOpen)}
          title="NextGen Health Quick Access Hub"
        >
          {isOpen ? <i className="bi bi-x-lg"></i> : <i className="bi bi-grid-3x3-gap-fill"></i>}
        </button>
      </div>

      {/* EMERGENCY AMBULANCE MODAL */}
      {showAmbulanceModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content glass-card border-danger p-3">
              <div className="modal-header border-0 pb-0">
                <h4 className="modal-title fw-bold text-danger d-flex align-items-center gap-2">
                  <i className="bi bi-truck fs-3"></i> Emergency Ambulance Dispatch Station
                </h4>
                <button type="button" className="btn-close" onClick={() => setShowAmbulanceModal(false)}></button>
              </div>
              <div className="modal-body">
                {dispatchMsg ? (
                  <div className="text-center py-4">
                    <div className="pulse-dot-danger mb-3" style={{ width: '20px', height: '20px' }}></div>
                    <h3 className="fw-bold text-success mb-2"><i className="bi bi-check-circle-fill me-2"></i>Ambulance Dispatched!</h3>
                    <p className="lead text-secondary">{dispatchMsg}</p>
                    {dispatchEta && (
                      <div className="glass-card p-3 my-3 border-success bg-success-subtle text-success d-inline-block">
                        <i className="bi bi-clock-history fs-4 me-2"></i> Estimated Arrival Time: <strong>{dispatchEta} Minutes</strong>
                      </div>
                    )}
                    <p className="small text-muted mb-4">The ambulance driver is en-route. Keep your mobile phone accessible.</p>
                    <button className="btn btn-outline-custom" onClick={() => { setDispatchMsg(''); setShowAmbulanceModal(false); }}>Done</button>
                  </div>
                ) : (
                  <form onSubmit={handleDispatchAmbulance}>
                    <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small mb-3">
                      <i className="bi bi-exclamation-triangle-fill fs-4"></i>
                      <div><strong>24/7 Life Support Dispatch:</strong> Instant alert sends the nearest ICU vehicle with paramedical crew to your location.</div>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Select Available NextGen Ambulance *</label>
                        <select className="form-select" required value={selectedAmbulance} onChange={e => setSelectedAmbulance(e.target.value)}>
                          {ambulances.filter(a => a.status === 'AVAILABLE').map(a => (
                            <option key={a.id} value={a.id}>
                              {a.vehicle_number} — Driver: {a.driver_name} ({a.driver_phone})
                            </option>
                          ))}
                          {ambulances.filter(a => a.status === 'AVAILABLE').length === 0 && (
                            <option value="">No Available Ambulances (Call Emergency Hotline)</option>
                          )}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Emergency Pickup Address / GPS Landmark *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          required 
                          placeholder="e.g. 742 Evergreen Terrace, Sector 4, Door #12" 
                          value={pickupLocation} 
                          onChange={e => setPickupLocation(e.target.value)} 
                        />
                      </div>
                    </div>

                    <div className="glass-card p-3 my-3 border-warning bg-warning-subtle text-dark small">
                      <i className="bi bi-telephone-outbound-fill text-danger me-2 fs-5"></i>
                      Direct Emergency Hotline: <strong>+1 (800) 999-NEXT / 911</strong> (Toll Free 24/7)
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-3">
                      <button type="button" className="btn btn-outline-custom" onClick={() => setShowAmbulanceModal(false)}>Cancel</button>
                      <button type="submit" className="btn btn-emergency btn-lg px-4">
                        <i className="bi bi-send-fill me-2"></i> Dispatch Ambulance Now
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OPD TOKEN BOOKING MODAL */}
      {showTokenModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-card border-primary p-3">
              <div className="modal-header border-0 pb-0">
                <h4 className="modal-title fw-bold text-primary d-flex align-items-center gap-2">
                  <i className="bi bi-ticket-perforated-fill text-primary"></i> Instant OPD Walk-in Token
                </h4>
                <button type="button" className="btn-close" onClick={() => { setShowTokenModal(false); setTokenGenerated(null); }}></button>
              </div>
              <div className="modal-body">
                {tokenGenerated ? (
                  <div className="token-slip-card text-center my-2">
                    <span className="badge bg-success mb-2 px-3 py-1">TOKEN CONFIRMED</span>
                    <div className="display-3 fw-extrabold text-primary mb-1">#{tokenGenerated.token_number}</div>
                    <h5 className="fw-bold text-secondary">{tokenGenerated.doctor_name}</h5>
                    <p className="small text-muted mb-2">Speciality: {tokenGenerated.doctor_specialization}</p>
                    <div className="small border-top border-bottom py-2 my-2 text-dark">
                      <strong>Status:</strong> {tokenGenerated.status} | <strong>Date:</strong> {tokenGenerated.date}
                    </div>
                    <button className="btn btn-sm btn-outline-primary mt-2" onClick={() => window.print()}>
                      <i className="bi bi-printer me-1"></i> Print OPD Slip
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleGenerateToken}>
                    <p className="text-secondary small mb-3">
                      Generate a real-time consultation token for today's walk-in OPD checking at NextGen HealthCare Hospital.
                    </p>

                    <div className="mb-3">
                      <label className="form-label small fw-bold">Select Specialist Doctor *</label>
                      <select className="form-select" required value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}>
                        {doctors.map(doc => (
                          <option key={doc.id} value={doc.id}>
                            Dr. {doc.first_name} {doc.last_name} ({doc.specialization}) — Fee: ${doc.consultation_fee}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="glass-card p-3 mb-3 border-info small text-secondary">
                      <i className="bi bi-info-circle-fill text-info me-2"></i>
                      Tokens are issued chronologically on a first-come, first-served basis for morning (9am-1pm) & evening (4pm-8pm) shifts.
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                      <button type="button" className="btn btn-outline-custom" onClick={() => setShowTokenModal(false)}>Close</button>
                      <button type="submit" className="btn btn-primary-custom" disabled={tokenLoading}>
                        {tokenLoading ? 'Generating...' : 'Get OPD Token Now'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI SYMPTOM ASSISTANT MODAL */}
      {showSymptomModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content glass-card border-success p-3">
              <div className="modal-header border-0 pb-0">
                <h4 className="modal-title fw-bold text-success d-flex align-items-center gap-2">
                  <i className="bi bi-robot text-success"></i> AI Health Triage & Doctor Recommender
                </h4>
                <button type="button" className="btn-close" onClick={() => setShowSymptomModal(false)}></button>
              </div>
              <div className="modal-body">
                <p className="text-secondary small mb-3">
                  Select your primary health symptom or concern to receive instant guidance on the best medical department and specialist doctor.
                </p>

                <div className="row g-2 mb-4">
                  {[
                    { id: 'fever', label: '🌡️ High Fever / Cough / Cold' },
                    { id: 'chest_pain', label: '🫀 Chest Pain / Palpitations' },
                    { id: 'headache', label: '🧠 Migraine / Headaches' },
                    { id: 'child_fever', label: '👶 Infant Health / Pediatric Care' },
                    { id: 'bp', label: '🩸 Blood Pressure Check' },
                    { id: 'dizziness', label: '💫 Dizziness / Numbness' }
                  ].map(item => (
                    <div className="col-6 col-md-4" key={item.id}>
                      <button 
                        type="button"
                        className={`btn w-100 text-start py-2 px-3 btn-sm ${symptomCategory === item.id ? 'btn-success text-white' : 'btn-outline-custom'}`}
                        onClick={() => handleSymptomSelect(item.id)}
                      >
                        {item.label}
                      </button>
                    </div>
                  ))}
                </div>

                {suggestedSpecialty && (
                  <div className="glass-card p-4 border-success bg-success-subtle text-dark">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="badge bg-success text-white">RECOMMENDED DEPARTMENT</span>
                      <small className="fw-bold text-success"><i className="bi bi-shield-check me-1"></i> NextGen Smart AI Match</small>
                    </div>
                    <h4 className="fw-bold text-success mb-1">{suggestedSpecialty.title} Department</h4>
                    <p className="mb-2 text-secondary">{suggestedSpecialty.advice}</p>
                    
                    {suggestedSpecialty.doc && (
                      <div className="p-3 bg-white rounded border border-success-subtle d-flex align-items-center justify-content-between mt-3">
                        <div>
                          <strong>Dr. {suggestedSpecialty.doc.first_name} {suggestedSpecialty.doc.last_name}</strong>
                          <div className="small text-muted">{suggestedSpecialty.doc.qualification} | Fee: ${suggestedSpecialty.doc.consultation_fee}</div>
                        </div>
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={() => {
                            setShowSymptomModal(false);
                            setShowTokenModal(true);
                            setSelectedDoctor(suggestedSpecialty.doc.id);
                          }}
                        >
                          Book OPD Token
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickAccessHub;
