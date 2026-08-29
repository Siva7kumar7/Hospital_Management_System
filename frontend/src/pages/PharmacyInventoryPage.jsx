import React, { useState, useEffect } from 'react';
import API from '../api';

export default function PharmacyInventoryPage() {
  const [medicines, setMedicines] = useState([]);
  const [dispenses, setDispenses] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Dispense Modal State
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [medsRes, dispRes, patRes] = await Promise.all([
        API.get('medicines/'),
        API.get('pharmacy-dispenses/'),
        API.get('patients/')
      ]);
      setMedicines(medsRes.data);
      setDispenses(dispRes.data);
      setPatients(patRes.data);
    } catch (err) {
      console.error("Error fetching pharmacy data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDispense = (med) => {
    setSelectedMed(med);
    setQuantity(1);
    setSelectedPatient('');
    setShowDispenseModal(true);
  };

  const handleDispense = async (e) => {
    e.preventDefault();
    if (!selectedMed || !selectedPatient) return;

    try {
      await API.post('pharmacy-dispenses/', {
        medicine: selectedMed.id,
        patient: selectedPatient,
        quantity: quantity
      });
      setMessage(`✅ Dispensed ${quantity} x ${selectedMed.name} successfully! Inventory updated.`);
      setShowDispenseModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to dispense medicine.');
    }
  };

  const lowStockCount = medicines.filter(m => m.stock_quantity <= m.reorder_level).length;

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.85rem', color: '#0f172a', fontWeight: 800 }}>💊 Software Pharmacy & Inventory Management</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b' }}>Real-time pharmaceutical stock management, dispensing workflows, and reorder triggers</p>
        </div>
      </div>

      {message && (
        <div style={{ padding: '0.85rem 1.25rem', borderRadius: '8px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', marginBottom: '1.5rem', fontWeight: 600 }}>
          {message}
        </div>
      )}

      {/* Low Stock Alert Header Banner */}
      {lowStockCount > 0 && (
        <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, color: '#c2410c' }}>Low Stock Alert ({lowStockCount} items)</div>
              <div style={{ fontSize: '0.85rem', color: '#9a3412' }}>Some pharmaceutical products have fallen below minimum reorder thresholds.</div>
            </div>
          </div>
          <span style={{ background: '#ea580c', color: '#ffffff', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
            Reorder Recommended
          </span>
        </div>
      )}

      {/* Inventory Grid */}
      <h3 style={{ fontSize: '1.15rem', color: '#1e293b', marginBottom: '1rem' }}>📦 Pharmaceutical Inventory Stock</h3>
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading medicine inventory...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
          {medicines.map(med => (
            <div key={med.id} style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: med.stock_quantity <= med.reorder_level ? '2px solid #f97316' : '1px solid #e2e8f0',
              padding: '1.25rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>{med.name}</h4>
                  <span style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: med.stock_quantity <= med.reorder_level ? '#fee2e2' : '#dcfce7',
                    color: med.stock_quantity <= med.reorder_level ? '#b91c1c' : '#15803d'
                  }}>
                    {med.stock_quantity <= med.reorder_level ? 'LOW STOCK' : 'IN STOCK'}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem' }}>Category: {med.category}</div>

                <div style={{ marginTop: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#64748b' }}>Stock Units:</span>
                    <strong style={{ color: med.stock_quantity <= med.reorder_level ? '#c2410c' : '#0f172a' }}>{med.stock_quantity} units</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#64748b' }}>Reorder Level:</span>
                    <span>{med.reorder_level} units</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Unit Price:</span>
                    <strong style={{ color: '#2563eb' }}>₹{med.unit_price}</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenDispense(med)}
                disabled={med.stock_quantity === 0}
                style={{
                  marginTop: '1.25rem',
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: med.stock_quantity === 0 ? '#cbd5e1' : '#10b981',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: med.stock_quantity === 0 ? 'not-allowed' : 'pointer'
                }}>
                💊 Dispense Medicine
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dispense History Log */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>📋 Pharmacy Dispense Records & History</h3>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Dispenses: <strong>{dispenses.length}</strong></span>
        </div>

        {dispenses.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No medicines dispensed yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Dispense ID</th>
                <th style={{ padding: '0.85rem 1rem' }}>Patient</th>
                <th style={{ padding: '0.85rem 1rem' }}>Medicine Dispensed</th>
                <th style={{ padding: '0.85rem 1rem' }}>Quantity</th>
                <th style={{ padding: '0.85rem 1rem' }}>Total Cost</th>
                <th style={{ padding: '0.85rem 1rem' }}>Dispensed At</th>
              </tr>
            </thead>
            <tbody>
              {dispenses.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>#DSP-{d.id}</td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{d.patient_name}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#0f172a', fontWeight: 600 }}>{d.medicine_name}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{d.quantity} units</td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#2563eb' }}>₹{d.total_price}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.82rem' }}>{new Date(d.dispensed_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Dispense Modal */}
      {showDispenseModal && selectedMed && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Dispense Medicine</h3>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#64748b' }}>
              Selected Product: <strong>{selectedMed.name}</strong> (Price: ₹{selectedMed.unit_price} / unit)
            </p>

            <form onSubmit={handleDispense}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Select Patient</label>
                <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)} required style={inputStyle}>
                  <option value="">-- Select Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.user?.first_name} {p.user?.last_name} ({p.patient_id || p.user?.username})</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Quantity to Dispense</label>
                <input
                  type="number"
                  min="1"
                  max={selectedMed.stock_quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  required
                  style={inputStyle}
                />
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem' }}>Max available: {selectedMed.stock_quantity} units</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid #cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span>Calculated Total Charge:</span>
                  <strong style={{ color: '#2563eb', fontSize: '1.1rem' }}>₹{(selectedMed.unit_price * quantity).toFixed(2)}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" onClick={() => setShowDispenseModal(false)} style={cancelBtnStyle}>Cancel</button>
                <button type="submit" style={submitBtnStyle}>Confirm & Dispense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
};

const modalStyle = {
  background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '480px', padding: '1.5rem', boxSizing: 'border-box'
};

const inputStyle = {
  width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box'
};

const cancelBtnStyle = {
  padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', fontWeight: 600
};

const submitBtnStyle = {
  padding: '0.6rem 1rem', borderRadius: '6px', border: 'none', background: '#10b981', color: '#ffffff', cursor: 'pointer', fontWeight: 600
};
