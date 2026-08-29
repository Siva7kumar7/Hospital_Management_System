import React, { useState, useEffect } from 'react';
import API from '../api';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await API.get('audit-logs/');
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.85rem', color: '#0f172a', fontWeight: 800 }}>🛡️ Security Audit & Access Logs</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b' }}>Immutable audit trail tracking sensitive healthcare data access and clinician actions</p>
        </div>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>📋 Audit History Timeline</h3>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Logged Events: <strong>{logs.length}</strong></span>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading security audit trail...</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No audit logs recorded.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Timestamp</th>
                <th style={{ padding: '0.85rem 1rem' }}>User Account</th>
                <th style={{ padding: '0.85rem 1rem' }}>Action Code</th>
                <th style={{ padding: '0.85rem 1rem' }}>Event Details</th>
                <th style={{ padding: '0.85rem 1rem' }}>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#1e293b' }}>
                    👤 {log.user_name}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      background: '#f1f5f9',
                      color: '#0f172a',
                      border: '1px solid #cbd5e1'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#334155' }}>{log.details}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontSize: '0.82rem' }}>{log.ip_address || '127.0.0.1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
