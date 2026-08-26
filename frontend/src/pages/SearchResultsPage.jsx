import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../api';

const SearchResultsPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q') || '';

  const [results, setResults] = useState({ patients: [], doctors: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      fetchSearchResults();
    }
  }, [query]);

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      const res = await API.get(`search/?q=${encodeURIComponent(query)}`);
      setResults(res.data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="fw-bold text-primary mb-1">
        <i className="bi bi-search me-2"></i> Global Search Results
      </h2>
      <p className="text-secondary mb-4">Showing query matches for: <strong>"{query}"</strong></p>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="glass-card p-4 h-100">
              <h4 className="fw-bold text-primary mb-3"><i className="bi bi-people me-2"></i> Matching Patients ({results.patients.length})</h4>
              <div className="list-group list-group-flush bg-transparent">
                {results.patients.map(p => (
                  <div key={p.id} className="list-group-item bg-transparent text-secondary px-0">
                    <strong>{p.user?.first_name} {p.user?.last_name}</strong> ({p.blood_group})
                    <small className="d-block text-muted">Phone: {p.user?.phone} | Policy: {p.policy_number || 'N/A'}</small>
                  </div>
                ))}
                {results.patients.length === 0 && <p className="text-muted small">No patients found.</p>}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="glass-card p-4 h-100">
              <h4 className="fw-bold text-primary mb-3"><i className="bi bi-person-badge me-2"></i> Matching Doctors ({results.doctors.length})</h4>
              <div className="list-group list-group-flush bg-transparent">
                {results.doctors.map(d => (
                  <div key={d.id} className="list-group-item bg-transparent text-secondary px-0">
                    <strong>{d.full_name}</strong> - <span className="text-primary">{d.specialization}</span>
                    <small className="d-block text-muted">{d.qualification} | Fee: ${d.consultation_fee}</small>
                  </div>
                ))}
                {results.doctors.length === 0 && <p className="text-muted small">No doctors found.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
