import React from 'react';

const Footer = () => {
  const insuranceCompanies = [
    'SecureLife Insurance Company',
    'CoverWise Insurance',
    'PolicyPro',
    'InsureMax',
    'RiskFree Insurance',
    'PrimeShield Insurance',
    'UnitedHealthcare',
    'Medicare'
  ];

  return (
    <footer className="mt-auto py-5">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-lg-5 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-2">
              <img src="/logo.png" alt="NextGen HealthCare Logo" style={{ height: '40px' }} className="rounded" />
              <h5 className="fw-extrabold text-primary mb-0">NextGen HealthCare Hospital</h5>
            </div>
            <p className="small text-secondary mb-3">
              Next-Generation Smart Healthcare & Super Speciality Center. Providing 24/7 Emergency Trauma care, ICU Wards, Smart OPD Tokens, and Cashless Insurance Processing.
            </p>
            <p className="small text-muted mb-0">
              <i className="bi bi-geo-alt-fill text-danger me-1"></i> No. 24, Health Street, Gandhipuram, Coimbatore - 641012, Tamil Nadu, India
            </p>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-primary mb-3"><i className="bi bi-telephone-fill me-1"></i> Contact & Emergency</h6>
            <ul className="list-unstyled small text-secondary mb-0">
              <li className="mb-2">
                <i className="bi bi-truck text-danger me-2"></i>
                <strong>24/7 Ambulance SOS:</strong> +91 422-1234567 / 108
              </li>
              <li className="mb-2">
                <i className="bi bi-headset text-primary me-2"></i>
                <strong>Hospital Phone:</strong> +91 422-1234567
              </li>
              <li className="mb-2">
                <i className="bi bi-envelope-fill text-info me-2"></i>
                <strong>Email:</strong> care@nextgenhealthcare.com
              </li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-12">
            <h6 className="fw-bold text-primary mb-3"><i className="bi bi-shield-check me-1"></i> Cashless Insurance Tie-ups</h6>
            <p className="small text-secondary mb-2">
              Automated 1-click cashless treatment available for:
            </p>
            <div className="d-flex flex-wrap gap-1">
              {insuranceCompanies.map((ins, i) => (
                <span key={i} className="badge bg-primary-subtle text-primary border border-primary-subtle small px-2 py-1">
                  {ins}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-3 border-top d-flex flex-column flex-md-row justify-content-between align-items-center small text-muted">
          <p className="mb-2 mb-md-0">&copy; 2026 NextGen HealthCare Hospital, Coimbatore. All rights reserved.</p>
          <div className="d-flex gap-3">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Emergency Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
