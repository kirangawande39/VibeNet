import { Link, useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light text-center px-3">
      <div className="text-danger mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h1 className="display-5 fw-bold text-dark mb-2">404 - Page Not Found</h1>
      <p className="text-muted mb-4">The page you're looking for doesn't exist or has been moved.</p>

      <div className="d-flex flex-column flex-sm-row gap-2">
        <Link to="/" className="btn btn-primary">Go to Home</Link>
        <button onClick={handleGoBack} className="btn btn-outline-secondary">Go Back</button>
      </div>
    </div>
  );
}

export default NotFound;
