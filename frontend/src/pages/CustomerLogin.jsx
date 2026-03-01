import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import customerApi from '../services/customerApi';
import './customer-panel.css';

const CustomerLogin = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        setError('');
        setIsLoading(true);
        try {
            const response = await customerApi.post('/customer/login/', form);
            localStorage.setItem('customerSession', JSON.stringify(response.data));
            navigate('/customer-panel');
        } catch (err) {
            setError(err.response?.data?.detail || 'Unable to login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="customer-shell">
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-5">
                        <div className="card shadow-sm customer-card">
                            <div className="card-body p-4">
                                <h3 className="mb-1">Customer Portal</h3>
                                <p className="text-muted mb-4">Sign in to manage your milk and ghee needs.</p>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={form.email}
                                            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={form.password}
                                            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    {error && <div className="alert alert-danger py-2">{error}</div>}
                                    <button className="btn btn-success w-100" type="submit" disabled={isLoading}>
                                        {isLoading ? 'Signing in...' : 'Login'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerLogin;
