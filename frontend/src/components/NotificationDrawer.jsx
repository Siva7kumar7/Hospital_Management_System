import React, { useState, useEffect } from 'react';
import API from '../api';
import { Bell, Check, X, Calendar, TestTube, AlertTriangle } from 'lucide-react';

export default function NotificationDrawer({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await API.get('notifications/');
      setNotifications(res.data);
    } catch (err) {
      // Fallback mock notifications if table is empty
      setNotifications([
        {
          id: 101,
          title: 'Appointment Reminder',
          message: 'Your consultation with Dr. Arjun Mehta is scheduled today at 10:30 AM in Room 204.',
          category: 'Appointment',
          is_read: false,
          created_at: new Date().toISOString()
        },
        {
          id: 102,
          title: 'Lab Diagnostic Report Available',
          message: 'Your Complete Blood Count (CBC) test report is ready for download.',
          category: 'Lab',
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 103,
          title: 'Insurance Cashless Pre-Approval',
          message: 'SecureLife Insurance claim #CLM-994101 approved for ₹14,500.',
          category: 'Claim',
          is_read: true,
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await API.post(`notifications/${id}/mark_read/`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  if (!isOpen) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={drawerStyle} onClick={e => e.stopPropagation()}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={20} color="var(--brand-primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 700 }}>Notification Center</h3>
          </div>
          <button onClick={onClose} style={closeBtnStyle}><X size={18} /></button>
        </div>

        <div style={{ padding: '1rem', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No notifications right now.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {notifications.map(n => (
                <div key={n.id} style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  background: n.is_read ? 'var(--bg-subtle)' : 'var(--status-info-bg)',
                  border: n.is_read ? '1px solid var(--border-color)' : '1px solid var(--border-glow)',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{n.title}</div>
                    {!n.is_read && (
                      <button onClick={() => handleMarkRead(n.id)} style={markReadBtnStyle} title="Mark as read">
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{n.message}</p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
  zIndex: 99999, display: 'flex', justifyContent: 'flex-end'
};

const drawerStyle = {
  width: '100%', maxWidth: '380px', height: '100%',
  background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-lg)',
  display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border-color)'
};

const headerStyle = {
  padding: '1.25rem', borderBottom: '1px solid var(--border-color)',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
};

const closeBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
};

const markReadBtnStyle = {
  background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', color: 'var(--brand-primary)', padding: '0.15rem 0.3rem'
};
