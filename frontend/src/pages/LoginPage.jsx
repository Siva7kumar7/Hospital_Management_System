import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login(username, password);
      if (data.user.role === 'ADMIN' || data.user.is_superuser) navigate('/admin-dashboard');
      else if (data.user.role === 'DOCTOR') navigate('/doctor-dashboard');
      else if (data.user.role === 'PATIENT') navigate('/patient-dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid username or password.');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="glass-card p-4 p-md-5">
            <div className="text-center mb-4">
              <img src="/logo.png" alt="NextGen HealthCare Logo" style={{ height: '65px' }} className="mb-2 rounded shadow-sm" />
              <h3 className="fw-bold text-primary">NextGen Portal Login</h3>
              <p className="text-secondary small">Access Admin, Doctor, or Patient Dashboard</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label font-semibold text-secondary">Username</label>
                <div className="input-group">
                  <span className="input-group-text bg-body border-end-0"><i className="bi bi-person text-muted"></i></span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    required
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label font-semibold text-secondary">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-body border-end-0"><i className="bi bi-key text-muted"></i></span>
                  <input
                    type="password"
                    className="form-control border-start-0"
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary-custom w-100 py-2 fs-6">
                <i className="bi bi-box-arrow-in-right me-2"></i> Log In
              </button>
            </form>

            <div className="mt-4 pt-3 border-top text-center">
              <p className="small text-secondary mb-0">
                New patient? <Link to="/register" className="fw-bold text-primary">Register Here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
