import React, { useState, useEffect } from 'react';
import API from '../api';

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await API.get('patients/');
      setPatients(res.data);
    } catch (err) {
      console.error("Failed to load patients:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1"><i className="bi bi-people me-2"></i> Patient Directory</h2>
          <p className="text-secondary mb-0">Roster of registered hospital patients</p>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="table-responsive">
          <table className="table table-custom align-middle mb-0">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Gender</th>
                <th>Blood Group</th>
                <th>Phone</th>
                <th>Insurance Provider</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id}>
                  <td className="fw-bold"><i className="bi bi-person-circle text-primary me-2"></i>{p.user?.first_name} {p.user?.last_name}</td>
                  <td>{p.gender}</td>
                  <td><span className="badge bg-danger-subtle text-danger font-bold">{p.blood_group}</span></td>
                  <td>{p.user?.phone || 'N/A'}</td>
                  <td>{p.insurance_provider || 'None'}</td>
                  <td>
                    <button onClick={() => setSelectedPatient(p)} className="btn btn-sm btn-outline-primary">
                      <i className="bi bi-eye me-1"></i> View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Profile Modal */}
      {selectedPatient && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-md">
            <div className="modal-content glass-card border-primary p-3">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold text-primary">Patient Profile Details</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedPatient(null)}></button>
              </div>
              <div className="modal-body">
                <h4 className="fw-bold text-primary mb-1">{selectedPatient.user?.first_name} {selectedPatient.user?.last_name}</h4>
                <p className="text-muted small mb-3">Username: {selectedPatient.user?.username}</p>

                <ul className="list-group list-group-flush bg-transparent small">
                  <li className="list-group-item bg-transparent d-flex justify-content-between px-0">
                    <span className="text-muted">Blood Group:</span><strong className="text-danger">{selectedPatient.blood_group}</strong>
                  </li>
                  <li className="list-group-item bg-transparent d-flex justify-content-between px-0">
                    <span className="text-muted">Gender:</span><strong>{selectedPatient.gender}</strong>
                  </li>
                  <li className="list-group-item bg-transparent d-flex justify-content-between px-0">
                    <span className="text-muted">Emergency Contact:</span><strong>{selectedPatient.emergency_contact || 'N/A'}</strong>
                  </li>
                  <li className="list-group-item bg-transparent d-flex justify-content-between px-0">
                    <span className="text-muted">Address:</span><strong>{selectedPatient.address || 'N/A'}</strong>
                  </li>
                  <li className="list-group-item bg-transparent d-flex justify-content-between px-0">
                    <span className="text-muted">Insurance Provider:</span><strong>{selectedPatient.insurance_provider || 'N/A'}</strong>
                  </li>
                  <li className="list-group-item bg-transparent d-flex justify-content-between px-0">
                    <span className="text-muted">Policy Number:</span><strong>{selectedPatient.policy_number || 'N/A'}</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsPage;
