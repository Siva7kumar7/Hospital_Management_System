import React, { useContext, useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import CommandSearchModal from './CommandSearchModal';
import NotificationDrawer from './NotificationDrawer';
import MobileBottomNav from './MobileBottomNav';
import { Search, Bell, Sun, Moon, LogOut, User as UserIcon, Activity, Stethoscope, Calendar, Ticket, TestTube, Pill, FileText, CreditCard, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  useEffect(() => {
    const handleOpenSearch = () => setShowSearchModal(true);
    window.addEventListener('open-command-search', handleOpenSearch);
    return () => window.removeEventListener('open-command-search', handleOpenSearch);
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN' || user.is_superuser) return '/admin-dashboard';
    if (user.role === 'DOCTOR') return '/doctor-dashboard';
    if (user.role === 'PATIENT') return '/patient-dashboard';
    if (user.role === 'NURSE') return '/nurse';
    return '/';
  };

  return (
    <>
      <header className="nextgen-navbar">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '1440px', margin: '0 auto' }}>
          
          {/* Brand Logo & Live Indicator */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#FFFFFF', fontWeight: 800, fontSize: '1.2rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              N
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  NextGen
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-primary)' }}>HealthCare</span>
                <span className="pulse-dot-live" title="Hospital Systems Live & Connected"></span>
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Connected Care • Smarter Healthcare
              </div>
            </div>
          </Link>

          {/* Navigation Items */}
          {user && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} className="d-none d-lg-flex">
              <NavLink to={getDashboardLink()} className={({ isActive }) => `nav-pill-item ${isActive ? 'active' : ''}`}>
                <Activity size={16} /> Dashboard
              </NavLink>

              <NavLink to="/appointments" className={({ isActive }) => `nav-pill-item ${isActive ? 'active' : ''}`}>
                <Calendar size={16} /> Appointments
              </NavLink>

              <NavLink to="/tokens" className={({ isActive }) => `nav-pill-item ${isActive ? 'active' : ''}`}>
                <Ticket size={16} /> OPD Queue
              </NavLink>

              <NavLink to="/labs" className={({ isActive }) => `nav-pill-item ${isActive ? 'active' : ''}`}>
                <TestTube size={16} /> Lab
              </NavLink>

              <NavLink to="/pharmacy" className={({ isActive }) => `nav-pill-item ${isActive ? 'active' : ''}`}>
                <Pill size={16} /> Pharmacy
              </NavLink>

              <NavLink to="/history" className={({ isActive }) => `nav-pill-item ${isActive ? 'active' : ''}`}>
                <FileText size={16} /> Medical Records
              </NavLink>

              <NavLink to="/billing" className={({ isActive }) => `nav-pill-item ${isActive ? 'active' : ''}`}>
                <CreditCard size={16} /> Billing
              </NavLink>
            </nav>
          )}

          {/* Right Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {user ? (
              <>
                {/* Command Search Trigger Button */}
                <button
                  onClick={() => setShowSearchModal(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.45rem 0.85rem', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)', background: 'var(--bg-subtle)',
                    color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer'
                  }}>
                  <Search size={15} color="var(--brand-primary)" />
                  <span className="d-none d-md-inline">Search platform...</span>
                  <span style={{
                    fontSize: '0.7rem', padding: '0.1rem 0.35rem', borderRadius: '4px',
                    background: 'var(--bg-card)', border: '1px solid var(--border-color)', fontWeight: 700
                  }}>Ctrl K</span>
                </button>

                {/* Notifications Bell */}
                <button
                  onClick={() => setShowNotifDrawer(true)}
                  style={{
                    width: '38px', height: '38px', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)', background: 'var(--bg-card)',
                    color: 'var(--text-primary)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', position: 'relative'
                  }}
                  title="Notification Center">
                  <Bell size={18} />
                  <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }}></span>
                </button>

                {/* Dark / Light Mode Toggle */}
                <button
                  onClick={toggleTheme}
                  style={{
                    width: '38px', height: '38px', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)', background: 'var(--bg-card)',
                    color: 'var(--text-primary)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer'
                  }}
                  title="Toggle Light/Dark Theme">
                  {theme === 'dark' ? <Sun size={18} color="#F59E0B" /> : <Moon size={18} color="#2563EB" />}
                </button>

                {/* User Profile Tag */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)',
                  background: 'var(--status-info-bg)', color: 'var(--brand-primary)',
                  fontWeight: 600, fontSize: '0.82rem'
                }}>
                  <UserIcon size={14} />
                  <span className="d-none d-sm-inline">{user.first_name || user.username} ({user.role})</span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  style={{
                    width: '38px', height: '38px', borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(239, 68, 68, 0.2)', background: 'var(--status-danger-bg)',
                    color: 'var(--brand-danger)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer'
                  }}
                  title="Logout">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={toggleTheme} style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  {theme === 'dark' ? <Sun size={18} color="#F59E0B" /> : <Moon size={18} color="#2563EB" />}
                </button>
                <Link to="/login" className="btn-nextgen-secondary">Portal Login</Link>
                <Link to="/register" className="btn-nextgen-primary">Register Account</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Modals & Drawers */}
      <CommandSearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />
      <NotificationDrawer isOpen={showNotifDrawer} onClose={() => setShowNotifDrawer(false)} />
      <MobileBottomNav />
    </>
  );
};

export default Navbar;

