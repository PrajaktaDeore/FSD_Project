import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import customerApi from '../services/customerApi';
import './auth.css';

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('staffToken')) {
            navigate('/staff');
            return;
        }
        if (localStorage.getItem('customerSession')) {
            navigate('/customer-panel');
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (isLoading) return;
        setError(null);
        setIsLoading(true);

        try {
            const response = await api.post('/staff/login/', { identifier, password });
            const { token, staff_id } = response.data;
            localStorage.removeItem('customerSession');
            localStorage.setItem('staffToken', token);
            localStorage.setItem('staffUser', JSON.stringify({ email: response.data.email, id: staff_id }));
            navigate('/staff');
            return;
        } catch (staffErr) {
            const status = staffErr.response?.status;
            if (status !== 401) {
                setError(staffErr.response?.data?.detail || 'Login failed');
                setIsLoading(false);
                return;
            }
        }

        try {
            const response = await customerApi.post('/customer/login/', { identifier, password });
            localStorage.removeItem('staffToken');
            localStorage.removeItem('staffUser');
            localStorage.setItem('customerSession', JSON.stringify(response.data));
            navigate('/customer-panel');
        } catch (customerErr) {
            setError(customerErr.response?.data?.detail || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-shell">
            <div className="card auth-card">
               <div className="auth-close-wrapper">
                    <i className="fa-solid fa-xmark auth-close-icon" aria-hidden="true" onClick={() => navigate('/')} />
                </div>
                <div className="card-body">
                    <p className="auth-kicker mb-0">Milky Basket Portal</p>
                    <h3 className="auth-title">Login</h3>
                    <p className="auth-subtitle">Sign in with your email or username.</p>
                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label className="form-label">Email or Username</label>
                            <input
                                type="text"
                                className="form-control"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="Enter email or username"
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <div className="alert alert-danger auth-alert">{error}</div>}
                        <div className="d-flex gap-2">
                            <button type="submit" className="btn auth-btn-primary w-100" disabled={isLoading}>
                                {isLoading ? 'Signing in...' : 'Login'}
                            </button>
                            <button
                                type="button"
                                className="btn auth-btn-secondary w-100"
                                onClick={() => navigate('/register')}
                                disabled={isLoading}
                            >
                                Sign Up
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
