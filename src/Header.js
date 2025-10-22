// Import Bootstrap styles
import "bootstrap/dist/css/bootstrap.min.css";

export default function Header() {
  return (
    // Bootstrap navbar with light background and padding
    <nav className="navbar navbar-light bg-light px-3 ">
      {/* Left side: logo and organization name */}
      <div className="d-flex align-items-center ">
        {/* UNICEF logo image */}
        <img
          src="https://raw.githubusercontent.com/rahimiabdulrahmanab/Clinics-Dashboard/main/Logo.png
          "
          alt="UNICEF Logo"
          width="50"
          height="50"
          className="me-2"
        />
        {/* Organization name */}
        <span className="navbar-brand mb-0 h1 text-primary fw-bold text-uppercase letter-spacing px-2">
          UNICEF Afghanistan
        </span>
      </div>

      {/* Right side: small tab links */}
      <ul className="nav">
        <li className="nav-item">
          <a className="nav-link" href="#">
            About
          </a>
        </li>
      </ul>
    </nav>
  );
}
