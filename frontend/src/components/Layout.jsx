import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const user = JSON.parse(localStorage.getItem('staffUser') || '{}');
    const isLoggedIn = !!localStorage.getItem('staffToken');
    const isAuthOrCustomerRoute =
        location.pathname === '/' ||
        location.pathname === '/login' ||
        location.pathname === '/register' ||
        location.pathname === '/customer-login' ||
        location.pathname.startsWith('/customer-panel');

    const handleLogout = () => {
        localStorage.removeItem('staffToken');
        localStorage.removeItem('staffUser');
        setIsMenuOpen(false);
        navigate('/login');
    };

    if (!isLoggedIn || isAuthOrCustomerRoute) return <>{children}</>;

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
                <div className="container">
                    <Link className="navbar-brand" to="/">Milkman Admin</Link>
                    <button
                        className="navbar-toggler"
                        type="button"
                        aria-controls="adminNavbar"
                        aria-expanded={isMenuOpen}
                        aria-label="Toggle navigation"
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                    >
                        <span className="navbar-toggler-icon" />
                    </button>
                    <div id="adminNavbar" className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item"><Link className="nav-link" to="/staff" onClick={() => setIsMenuOpen(false)}>Staff</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/customer" onClick={() => setIsMenuOpen(false)}>Customers</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/category" onClick={() => setIsMenuOpen(false)}>Categories</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/product" onClick={() => setIsMenuOpen(false)}>Products</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/subscription" onClick={() => setIsMenuOpen(false)}>Subscriptions</Link></li>
                        </ul>
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <span className="nav-link text-light">Welcome, {user.email}</span>
                            </li>
                            <li className="nav-item">
                                <button className="btn btn-link nav-link" onClick={handleLogout}>Logout</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <div className="container" style={{ marginTop: '80px' }}>
                {children}
            </div>
        </div>
    );
};

export default Layout;
