import React, { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

const BillingPage = () => {
  const { user } = useContext(AuthContext);
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedBillForClaim, setSelectedBillForClaim] = useState(null);

  const [newBillData, setNewBillData] = useState({
    patient: '',
    consultation_fee: 120.00,
    test_charges: 80.00,
    bed_charges: 0.00,
    medicine_charges: 50.00,
    payment_status: 'UNPAID'
  });

  const [claimData, setClaimData] = useState({
    insurance_provider: 'BlueCross BlueShield',
    policy_number: 'POL-994101',
    claim_amount: 250.00,
    notes: 'NextGen HealthCare Hospital Treatment & Consultation Claim'
  });

  const partnerInsurers = [
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
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const [billRes, patRes] = await Promise.all([
        API.get('bills/'),
        API.get('patients/')
      ]);
      setBills(billRes.data);
      setPatients(patRes.data);
    } catch (err) {
      console.error("Failed to load bills:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePayment = async (billId) => {
    try {
      await API.post(`bills/${billId}/toggle_payment/`);
      fetchBills();
    } catch (err) {
      alert("Failed to update payment status.");
    }
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    try {
      await API.post('bills/', newBillData);
      setShowCreateModal(false);
      fetchBills();
      alert("Itemized Bill generated!");
    } catch (err) {
      alert("Failed to generate bill.");
    }
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!selectedBillForClaim) return;
    try {
      await API.post('claims/', {
        ...claimData,
        bill: selectedBillForClaim.id,
        patient: selectedBillForClaim.patient
      });
      setShowClaimModal(false);
      setSelectedBillForClaim(null);
      fetchBills();
      alert("Easy Cashless Insurance Claim submitted successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit insurance claim.");
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1"><i className="bi bi-receipt me-2"></i> NextGen Billing & Cashless Claims Hub</h2>
          <p className="text-secondary mb-0">Itemized Charge Breakdown & Cashless Claim Partner Processing</p>
        </div>
        {(user?.role === 'ADMIN' || user?.is_superuser) && (
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary-custom">
            <i className="bi bi-plus-lg me-1"></i> Generate Bill
          </button>
        )}
      </div>

      <div className="glass-card p-4">
        <div className="table-responsive">
          <table className="table table-custom align-middle mb-0">
            <thead>
              <tr>
                <th>Bill #</th>
                <th>Patient</th>
                <th>Fee Breakdown (Consult / Tests / Bed / Meds)</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Cashless Claim</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map(b => (
                <tr key={b.id}>
                  <td className="fw-bold">#{b.id}</td>
                  <td>{b.patient_name}</td>
                  <td className="small text-secondary">
                    ${b.consultation_fee} / ${b.test_charges} / ${b.bed_charges} / ${b.medicine_charges}
                  </td>
                  <td className="fw-bold text-success fs-6">${b.total_amount}</td>
                  <td>
                    <span className={`badge badge-status badge-${b.payment_status.toLowerCase()}`}>{b.payment_status}</span>
                  </td>
                  <td>
                    {b.insurance_claim ? (
                      <span className={`badge badge-status badge-${b.insurance_claim.status.toLowerCase()}`}>
                        Claim ({b.insurance_claim.status})
                      </span>
                    ) : (
                      <span className="text-muted small">Not Claimed</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      {(user?.role === 'ADMIN' || user?.is_superuser) && (
                        <button onClick={() => handleTogglePayment(b.id)} className="btn btn-xs btn-outline-secondary">
                          Toggle Paid
                        </button>
                      )}
                      {!b.insurance_claim && (
                        <button onClick={() => { setSelectedBillForClaim(b); setClaimData({ ...claimData, claim_amount: b.total_amount }); setShowClaimModal(true); }} className="btn btn-xs btn-outline-primary">
                          Easy Claim
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Easy Claim Modal */}
      {showClaimModal && selectedBillForClaim && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-md">
            <div className="modal-content glass-card border-primary p-3">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold text-primary"><i className="bi bi-shield-check me-2"></i> Easy 1-Click Cashless Claim (Bill #{selectedBillForClaim.id})</h5>
                <button type="button" className="btn-close" onClick={() => setShowClaimModal(false)}></button>
              </div>
              <form onSubmit={handleSubmitClaim}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Select Partner Insurance Provider *</label>
                    <select className="form-select" required value={claimData.insurance_provider} onChange={e => setClaimData({ ...claimData, insurance_provider: e.target.value })}>
                      {partnerInsurers.map(ins => (
                        <option key={ins} value={ins}>{ins}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Policy Number *</label>
                    <input type="text" className="form-control" required value={claimData.policy_number} onChange={e => setClaimData({ ...claimData, policy_number: e.target.value })} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Claim Amount ($) *</label>
                    <input type="number" className="form-control" required value={claimData.claim_amount} onChange={e => setClaimData({ ...claimData, claim_amount: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-outline-custom" onClick={() => setShowClaimModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary-custom">Submit Cashless Claim</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Generate Bill Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-md">
            <div className="modal-content glass-card border-primary p-3">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold text-primary">Generate Itemized Bill</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateBill}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Patient *</label>
                    <select className="form-select" required value={newBillData.patient} onChange={e => setNewBillData({ ...newBillData, patient: e.target.value })}>
                      <option value="">-- Choose Patient --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.user?.first_name} {p.user?.last_name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Consultation Fee ($)</label>
                      <input type="number" className="form-control" value={newBillData.consultation_fee} onChange={e => setNewBillData({ ...newBillData, consultation_fee: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Test Charges ($)</label>
                      <input type="number" className="form-control" value={newBillData.test_charges} onChange={e => setNewBillData({ ...newBillData, test_charges: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Bed Charges ($)</label>
                      <input type="number" className="form-control" value={newBillData.bed_charges} onChange={e => setNewBillData({ ...newBillData, bed_charges: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Medicine Costs ($)</label>
                      <input type="number" className="form-control" value={newBillData.medicine_charges} onChange={e => setNewBillData({ ...newBillData, medicine_charges: parseFloat(e.target.value) || 0 })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-outline-custom" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary-custom">Generate Invoice</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;
