import React, { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

const BedGridPage = () => {
  const { user } = useContext(AuthContext);
  const [beds, setBeds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedBed, setSelectedBed] = useState(null);
  const [patientToAssign, setPatientToAssign] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAddBedModal, setShowAddBedModal] = useState(false);
  
  const [newBedData, setNewBedData] = useState({
    ward_name: 'ICU Ward',
    bed_number: '103'
  });

  useEffect(() => {
    fetchBeds();
  }, []);

  const fetchBeds = async () => {
    try {
      const [bedRes, patRes] = await Promise.all([
        API.get('beds/'),
        API.get('patients/')
      ]);
      setBeds(bedRes.data);
      setPatients(patRes.data);
    } catch (err) {
      console.error("Failed to load beds:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPatient = async (e) => {
    e.preventDefault();
    if (!selectedBed || !patientToAssign) return;
    try {
      await API.post(`beds/${selectedBed.id}/assign_patient/`, { patient_id: patientToAssign });
      setShowAssignModal(false);
      setSelectedBed(null);
      setPatientToAssign('');
      fetchBeds();
      alert("Patient admitted & assigned to bed successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to assign patient to bed.");
    }
  };

  const handleReleasePatient = async (bedId) => {
    if (!window.confirm("Discharge patient and release this bed?")) return;
    try {
      await API.post(`beds/${bedId}/release_patient/`);
      fetchBeds();
      alert("Patient discharged. Bed is now FREE.");
    } catch (err) {
      alert("Failed to release bed.");
    }
  };

  const handleAddBed = async (e) => {
    e.preventDefault();
    try {
      await API.post('beds/', newBedData);
      setShowAddBedModal(false);
      fetchBeds();
      alert("New Ward Bed added!");
    } catch (err) {
      alert("Failed to create bed.");
    }
  };

  // Group beds by ward
  const wards = {};
  beds.forEach(b => {
    if (!wards[b.ward_name]) wards[b.ward_name] = [];
    wards[b.ward_name].push(b);
  });

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1"><i className="bi bi-door-open me-2"></i> Ward Bed Matrix</h2>
          <p className="text-secondary mb-0">Admissions & Real-Time Bed Occupancy</p>
        </div>
        {(user?.role === 'ADMIN' || user?.is_superuser) && (
          <button onClick={() => setShowAddBedModal(true)} className="btn btn-primary-custom">
            <i className="bi bi-plus-lg me-1"></i> Add Ward Bed
          </button>
        )}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="glass-card p-3 text-center border-success">
            <h3 className="fw-bold text-success mb-1">{beds.filter(b => b.status === 'FREE').length}</h3>
            <span className="small text-secondary font-semibold">FREE BEDS</span>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-card p-3 text-center border-danger">
            <h3 className="fw-bold text-danger mb-1">{beds.filter(b => b.status === 'OCCUPIED').length}</h3>
            <span className="small text-secondary font-semibold">OCCUPIED BEDS</span>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-card p-3 text-center border-primary">
            <h3 className="fw-bold text-primary mb-1">{beds.length}</h3>
            <span className="small text-secondary font-semibold">TOTAL BEDS</span>
          </div>
        </div>
      </div>

      {/* Ward Groups Grid */}
      {Object.keys(wards).map(wardName => (
        <div key={wardName} className="glass-card p-4 mb-4">
          <h4 className="fw-bold text-primary mb-3 border-bottom pb-2">
            <i className="bi bi-hospital me-2"></i> {wardName}
          </h4>
          <div className="row g-3">
            {wards[wardName].map(bed => (
              <div key={bed.id} className="col-6 col-md-4 col-lg-3">
                <div className={`glass-card p-3 text-center border-${bed.status === 'FREE' ? 'success' : 'danger'}`}>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="fw-bold fs-5 text-primary">Bed #{bed.bed_number}</span>
                    <span className={`badge badge-status badge-${bed.status.toLowerCase()}`}>{bed.status}</span>
                  </div>

                  {bed.status === 'OCCUPIED' ? (
                    <div className="my-2">
                      <small className="d-block text-secondary">Patient:</small>
                      <strong className="text-danger small">{bed.assigned_patient_name}</strong>
                      {(user?.role === 'ADMIN' || user?.is_superuser) && (
                        <button onClick={() => handleReleasePatient(bed.id)} className="btn btn-xs btn-outline-danger w-100 mt-2">
                          Discharge
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="my-2 py-1">
                      <small className="text-muted d-block mb-2">Ready for Admission</small>
                      {(user?.role === 'ADMIN' || user?.is_superuser) && (
                        <button onClick={() => { setSelectedBed(bed); setShowAssignModal(true); }} className="btn btn-xs btn-outline-success w-100">
                          Admit Patient
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Admit Patient Modal */}
      {showAssignModal && selectedBed && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-md">
            <div className="modal-content glass-card border-primary p-3">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold text-primary">Admit Patient to Bed #{selectedBed.bed_number}</h5>
                <button type="button" className="btn-close" onClick={() => setShowAssignModal(false)}></button>
              </div>
              <form onSubmit={handleAssignPatient}>
                <div className="modal-body">
                  <p className="small text-secondary mb-3">Ward: <strong>{selectedBed.ward_name}</strong></p>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Select Patient *</label>
                    <select className="form-select" required value={patientToAssign} onChange={e => setPatientToAssign(e.target.value)}>
                      <option value="">-- Choose Patient to Admit --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.user?.first_name} {p.user?.last_name} ({p.blood_group})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-outline-custom" onClick={() => setShowAssignModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary-custom">Admit Patient</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Bed Modal */}
      {showAddBedModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-md">
            <div className="modal-content glass-card border-primary p-3">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold text-primary">Add New Ward Bed</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddBedModal(false)}></button>
              </div>
              <form onSubmit={handleAddBed}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Ward Name *</label>
                    <input type="text" className="form-control" required placeholder="e.g. ICU Ward, General Ward A" value={newBedData.ward_name} onChange={e => setNewBedData({ ...newBedData, ward_name: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Bed Number *</label>
                    <input type="text" className="form-control" required placeholder="e.g. 104" value={newBedData.bed_number} onChange={e => setNewBedData({ ...newBedData, bed_number: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-outline-custom" onClick={() => setShowAddBedModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary-custom">Add Bed</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BedGridPage;
