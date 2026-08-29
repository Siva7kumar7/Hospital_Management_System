import React, { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

export default function LabManagementPage() {
  const { user } = useContext(AuthContext);
  const [labOrders, setLabOrders] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Modals
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // New Order Form
  const [newPatient, setNewPatient] = useState('');
  const [newTest, setNewTest] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Result Entry Form
  const [resultVal, setResultVal] = useState('');
  const [isAbnormal, setIsAbnormal] = useState(false);
  const [techNotes, setTechNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, testsRes, patientsRes] = await Promise.all([
        API.get('lab-orders/'),
        API.get('lab-tests/'),
        API.get('patients/')
      ]);
      setLabOrders(ordersRes.data);
      setLabTests(testsRes.data);
      setPatients(patientsRes.data);
    } catch (err) {
      console.error("Error fetching lab data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      await API.post('lab-orders/', {
        patient: newPatient,
        test: newTest,
        notes: newNotes
      });
      setMessage('✅ Diagnostic lab order created successfully!');
      setShowOrderModal(false);
      setNewPatient('');
      setNewTest('');
      setNewNotes('');
      fetchData();
    } catch (err) {
      alert('Failed to create lab order.');
    }
  };

  const handleOpenResultModal = (order) => {
    setSelectedOrder(order);
    setResultVal('');
    setIsAbnormal(false);
    setTechNotes('');
    setShowResultModal(true);
  };

  const handleSubmitResult = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      await API.post(`lab-orders/${selectedOrder.id}/submit_report/`, {
        result_value: resultVal,
        is_abnormal: isAbnormal,
        technician_notes: techNotes
      });
      setMessage(`✅ Lab report submitted for Order #${selectedOrder.id}`);
      setShowResultModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to submit lab report.');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.85rem', color: '#0f172a', fontWeight: 800 }}>🧪 Laboratory & Diagnostics Hub</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b' }}>Enterprise lab order management, technician workflows, and diagnostic visualization</p>
        </div>
        <button
          onClick={() => setShowOrderModal(true)}
          style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
          + Order Lab Test
        </button>
      </div>

      {message && (
        <div style={{ padding: '0.85rem 1.25rem', borderRadius: '8px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', marginBottom: '1.5rem', fontWeight: 600 }}>
          {message}
        </div>
      )}

      {/* Available Lab Test Catalog Header */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', color: '#334155' }}>🔬 Diagnostic Test Catalog & Normal Reference Ranges</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {labTests.map(test => (
            <div key={test.id} style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{test.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0' }}>Code: <code>{test.code}</code> | Cat: {test.category}</div>
              <div style={{ fontSize: '0.82rem', color: '#2563eb', fontWeight: 600 }}>Reference Range: {test.normal_range} {test.unit}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: '0.3rem' }}>Fee: ₹{test.cost}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Lab Orders Queue Table */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>📋 Active Lab Orders & Diagnostics Queue</h3>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Orders: <strong>{labOrders.length}</strong></span>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading laboratory orders...</div>
        ) : labOrders.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No lab orders registered yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Order ID</th>
                <th style={{ padding: '0.85rem 1rem' }}>Patient</th>
                <th style={{ padding: '0.85rem 1rem' }}>Diagnostic Test</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem' }}>Result / Visualization</th>
                <th style={{ padding: '0.85rem 1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {labOrders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>#LAB-{order.id}</td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#1e293b' }}>{order.patient_name}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{order.test_name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Ref: {order.test_normal_range} {order.test_unit}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      background: order.status === 'COMPLETED' ? '#dcfce7' : order.status === 'PROCESSING' ? '#fef9c3' : '#e0f2fe',
                      color: order.status === 'COMPLETED' ? '#15803d' : order.status === 'PROCESSING' ? '#a16207' : '#0369a1'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {order.report ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: order.report.is_abnormal ? '#dc2626' : '#16a34a' }}>
                            {order.report.result_value} {order.test_unit}
                          </span>
                          {order.report.is_abnormal && (
                            <span style={{ padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#fee2e2', color: '#b91c1c', fontSize: '0.7rem', fontWeight: 700 }}>ABNORMAL ⚠️</span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Normal Target: {order.test_normal_range}</div>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>Pending Report Entry</span>
                    )}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {order.status !== 'COMPLETED' ? (
                      <button
                        onClick={() => handleOpenResultModal(order)}
                        style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                        📝 Enter Result
                      </button>
                    ) : (
                      <span style={{ color: '#059669', fontWeight: 600, fontSize: '0.85rem' }}>✓ Verified</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Order New Diagnostic Lab Test</h3>
            <form onSubmit={handleCreateOrder}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Select Patient</label>
                <select value={newPatient} onChange={(e) => setNewPatient(e.target.value)} required style={inputStyle}>
                  <option value="">-- Select Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.user?.first_name} {p.user?.last_name} ({p.patient_id || p.user?.username})</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Select Diagnostic Test</label>
                <select value={newTest} onChange={(e) => setNewTest(e.target.value)} required style={inputStyle}>
                  <option value="">-- Select Test --</option>
                  {labTests.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (Fee: ₹{t.cost})</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Clinical Notes / Reason</label>
                <textarea rows="2" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} style={inputStyle} placeholder="e.g. Pre-op routine screening" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" onClick={() => setShowOrderModal(false)} style={cancelBtnStyle}>Cancel</button>
                <button type="submit" style={submitBtnStyle}>Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Result Entry Modal */}
      {showResultModal && selectedOrder && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Upload Diagnostic Result</h3>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#64748b' }}>
              Order #{selectedOrder.id} - <strong>{selectedOrder.test_name}</strong> for {selectedOrder.patient_name}
            </p>

            <form onSubmit={handleSubmitResult}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Measured Result Value ({selectedOrder.test_unit})</label>
                <input type="text" placeholder={`e.g. 11.8 (Normal range: ${selectedOrder.test_normal_range})`} value={resultVal} onChange={(e) => setResultVal(e.target.value)} required style={inputStyle} />
              </div>

              <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="abnormalCheck" checked={isAbnormal} onChange={(e) => setIsAbnormal(e.target.checked)} />
                <label htmlFor="abnormalCheck" style={{ fontWeight: 600, fontSize: '0.88rem', color: isAbnormal ? '#dc2626' : '#334155' }}>
                  Mark as Abnormal / Out of Reference Range ⚠️
                </label>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Technician / Pathologist Notes</label>
                <textarea rows="2" value={techNotes} onChange={(e) => setTechNotes(e.target.value)} style={inputStyle} placeholder="e.g. Sample processed cleanly via automated hematology analyzer." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" onClick={() => setShowResultModal(false)} style={cancelBtnStyle}>Cancel</button>
                <button type="submit" style={submitBtnStyle}>Submit Verified Report</button>
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
  background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '500px', padding: '1.5rem', boxSizing: 'border-box'
};

const inputStyle = {
  width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box'
};

const cancelBtnStyle = {
  padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', fontWeight: 600
};

const submitBtnStyle = {
  padding: '0.6rem 1rem', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#ffffff', cursor: 'pointer', fontWeight: 600
};
