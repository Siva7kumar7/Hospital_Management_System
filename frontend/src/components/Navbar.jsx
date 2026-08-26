import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN' || user.is_superuser) return '/admin-dashboard';
    if (user.role === 'DOCTOR') return '/doctor-dashboard';
    if (user.role === 'PATIENT') return '/patient-dashboard';
    return '/';
  };

  return (
    <>
        {/* Top Hospital Info & Emergency Banner
        <div className="bg-dark text-white py-1.5 px-3 small d-none d-md-block border-bottom border-secondary">
          <div className="container-fluid d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <span>
                <i className="bi bi-geo-alt-fill text-danger me-1"></i> No. 24, Health Street, Gandhipuram, Coimbatore - 641012, Tamil Nadu, India
              </span>
              <span className="text-secondary">|</span>
              <span>
                <i className="bi bi-telephone-fill text-primary me-1"></i> Helpline: +91 422-1234567
              </span>
            </div>
            <div className="d-flex align-items-center gap-3">
              <span className="badge bg-danger text-white px-2 py-1 d-flex align-items-center gap-1">
                <span className="pulse-dot-danger"></span> Emergency SOS: +91 422-1234567 / 108
              </span>
              <span>
                <i className="bi bi-clock-fill text-warning me-1"></i> OPD Shifts: 09:00 AM - 08:00 PM
              </span>
            </div>
          </div>
        </div> */}

      <nav className="navbar navbar-expand-lg navbar-custom">
        <div className="container-fluid">
          <Link className="navbar-brand me-4 d-flex align-items-center gap-2" to="/">
            <img 
              src="/logo.png" 
              alt="NextGen HealthCare Logo" 
              style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
              className="rounded"
            />
            <div className="d-flex flex-column">
              <div className="d-flex align-items-center gap-2">
                <span className="lh-1 fw-extrabold" style={{ fontSize: '1.25rem' }}>NextGen HealthCare</span>
                <span className="pulse-dot" title="Systems Active"></span>
              </div>
              <small className="text-muted font-normal" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                HOSPITAL & SUPER SPECIALITY CENTER
              </small>
            </div>
          </Link>

          <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
            <i className="bi bi-list fs-2 text-primary"></i>
          </button>

          <div className="collapse navbar-collapse" id="navbarContent">
            {user ? (
              <>
                <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1">
                  <li className="nav-item">
                    <Link className="nav-link" to={getDashboardLink()}>
                      <i className="bi bi-speedometer2 me-1"></i> Dashboard
                    </Link>
                  </li>

                  {(user.role === 'ADMIN' || user.is_superuser) && (
                    <>
                      <li className="nav-item">
                        <Link className="nav-link" to="/doctors">
                          <i className="bi bi-person-badge me-1"></i> Doctors & Shifts
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link" to="/patients">
                          <i className="bi bi-people me-1"></i> Patients
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link" to="/beds">
                          <i className="bi bi-door-open me-1"></i> Bed Matrix
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link" to="/billing">
                          <i className="bi bi-receipt me-1"></i> Billing & Claims
                        </Link>
                      </li>
                    </>
                  )}

                  {user.role === 'DOCTOR' && (
                    <>
                      <li className="nav-item">
                        <Link className="nav-link" to="/appointments">
                          <i className="bi bi-calendar-event me-1"></i> Patient Checking
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link" to="/tokens">
                          <i className="bi bi-card-list me-1"></i> OPD Queue Tokens
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link" to="/beds">
                          <i className="bi bi-door-open me-1"></i> Bed Occupancy
                        </Link>
                      </li>
                    </>
                  )}

                  {user.role === 'PATIENT' && (
                    <>
                      <li className="nav-item">
                        <Link className="nav-link" to="/appointments">
                          <i className="bi bi-calendar-check me-1"></i> Appointments
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link" to="/tokens">
                          <i className="bi bi-ticket-perforated me-1"></i> Walk-in Token
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link" to="/history">
                          <i className="bi bi-journal-medical me-1"></i> Medical Info & History
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link" to="/billing">
                          <i className="bi bi-receipt me-1"></i> Bills & Claims
                        </Link>
                      </li>
                    </>
                  )}
                </ul>

                {/* Global Search Bar */}
                <form className="d-flex me-3 mb-2 mb-lg-0" onSubmit={handleSearch}>
                  <div className="input-group input-group-sm">
                    <input
                      className="form-control form-control-sm"
                      type="search"
                      placeholder="Search patient, doctor, diagnosis..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="btn btn-outline-secondary" type="submit">
                      <i className="bi bi-search"></i>
                    </button>
                  </div>
                </form>

                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 fw-bold">
                    <i className="bi bi-person-fill me-1"></i> {user.role}
                  </span>
                  <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle Light/Dark Theme">
                    {theme === 'dark' ? (
                      <i className="bi bi-sun-fill text-warning"></i>
                    ) : (
                      <i className="bi bi-moon-stars-fill text-primary"></i>
                    )}
                  </button>
                  <button onClick={logout} className="btn btn-sm btn-outline-danger">
                    <i className="bi bi-box-arrow-right me-1"></i> Logout
                  </button>
                </div>
              </>
            ) : (
              <ul className="navbar-nav ms-auto gap-2 align-items-center">
                <li className="nav-item me-2">
                  <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle Light/Dark Theme">
                    {theme === 'dark' ? (
                      <i className="bi bi-sun-fill text-warning"></i>
                    ) : (
                      <i className="bi bi-moon-stars-fill text-primary"></i>
                    )}
                  </button>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-sm btn-outline-custom" to="/login">Portal Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-sm btn-primary-custom" to="/register">Register Account</Link>
                </li>
              </ul>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
