import React, { useState, useEffect } from 'react';
import API from '../api';

const InsuranceClaimsPage = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const res = await API.get('claims/');
      setClaims(res.data);
    } catch (err) {
      console.error("Failed to load claims:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClaimStatus = async (claimId, newStatus) => {
    try {
      await API.patch(`claims/${claimId}/update_status/`, { status: newStatus });
      fetchClaims();
      alert(`Claim #${claimId} status updated to ${newStatus}`);
    } catch (err) {
      alert("Failed to update claim status.");
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1"><i className="bi bi-shield-check me-2"></i> Insurance Claims Management</h2>
          <p className="text-secondary mb-0">Review & Admin Status Approval Workflow</p>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="table-responsive">
          <table className="table table-custom align-middle mb-0">
            <thead>
              <tr>
                <th>Claim ID</th>
                <th>Patient</th>
                <th>Provider & Policy</th>
                <th>Claim Amount</th>
                <th>Status</th>
                <th>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {claims.map(c => (
                <tr key={c.id}>
                  <td className="fw-bold">{c.claim_id}</td>
                  <td>{c.patient_name}</td>
                  <td>{c.insurance_provider} ({c.policy_number})</td>
                  <td className="fw-bold text-success">${c.claim_amount}</td>
                  <td>
                    <span className={`badge badge-status badge-${c.status.toLowerCase()}`}>{c.status}</span>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button onClick={() => handleUpdateClaimStatus(c.id, 'APPROVED')} className="btn btn-outline-success">Approve</button>
                      <button onClick={() => handleUpdateClaimStatus(c.id, 'REJECTED')} className="btn btn-outline-danger">Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
              {claims.length === 0 && (
                <tr><td colSpan="6" className="text-center text-muted py-4">No insurance claims submitted.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InsuranceClaimsPage;
