import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import customerApi from '../services/customerApi';
import './auth.css';

const initialForm = {
    role: 'customer',
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
};

const Register = () => {
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        setError('');
        setIsLoading(true);
        const payload = {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            password: form.password,
            is_active: true,
        };

        try {
            if (form.role === 'staff') {
                await api.post('/staff/register/', payload);
            } else {
                await customerApi.post('/customer/register/', payload);
            }
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-shell">
            <div className="card auth-card register">
                <div className="auth-close-wrapper">
                    <i className="fa-solid fa-xmark auth-close-icon" aria-hidden="true" onClick={() => navigate('/')} />
                </div>
                <div className="card-body">
                    <p className="auth-kicker mb-0">Milkman Portal</p>
                    <h3 className="auth-title">Register</h3>
                    <p className="auth-subtitle">Create a customer or staff account and continue to login.</p>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Register As</label>
                            <select
                                className="form-select"
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                            >
                                <option value="customer">Customer</option>
                                <option value="staff">Staff</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Name</label>
                            <input
                                type="text"
                                className="form-control"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Phone</label>
                            <input
                                type="text"
                                className="form-control"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Address</label>
                            <input
                                type="text"
                                className="form-control"
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        {error && <div className="alert alert-danger auth-alert">{error}</div>}
                        <div className="d-flex gap-2">
                            <button type="submit" className="btn auth-btn-primary w-100" disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                type="button"
                                className="btn auth-btn-secondary w-100"
                                onClick={() => navigate('/login')}
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
