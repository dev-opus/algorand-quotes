import '../styles/NavBar.css';
import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <>
      <nav>
        <div className="title">
          <h2>Algorand Quotes</h2>
        </div>
        <ul>
          <li title="go home">
            <Link to={'/'} className="links">
              Home
            </Link>
          </li>

          <li>
            <Link to={'/quotes'} className="links">
              Quotes
            </Link>
          </li>

          <li title="visit dashboard">
            <Link to={'/dashboard'} className="links">
              Dashboard
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
