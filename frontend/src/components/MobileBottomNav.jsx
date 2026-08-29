import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, FileText, Pill, Menu } from 'lucide-react';

export default function MobileBottomNav() {
  return (
    <div className="mobile-bottom-nav">
      <NavLink to="/" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink to="/appointments" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
        <Calendar size={20} />
        <span>Appointments</span>
      </NavLink>

      <NavLink to="/tokens" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
        <FileText size={20} />
        <span>OPD Queue</span>
      </NavLink>

      <NavLink to="/pharmacy" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
        <Pill size={20} />
        <span>Pharmacy</span>
      </NavLink>

      <NavLink to="/labs" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
        <Menu size={20} />
        <span>Labs</span>
      </NavLink>
    </div>
  );
}
