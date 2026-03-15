import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Staff from './pages/Staff';
import Customer from './pages/Customer';
import CustomerPanel from './pages/CustomerPanel';
import Category from './pages/Category';
import Product from './pages/Product';
import Subscription from './pages/Subscription';

const PrivateRoute = ({ children }) => {
    const isLoggedIn = !!localStorage.getItem('staffToken');
    return isLoggedIn ? children : <Navigate to="/login" />;
};

function App() {
    useEffect(() => {
        const { pathname, hash } = window.location;
        if (hash) return;

        // If someone loads a non-hash URL (e.g. /login) in production, move it to the HashRouter form
        // without breaking deployments served from a sub-path (Vite `BASE_URL`).
        if (pathname.includes('.')) return;

        const base = import.meta.env?.BASE_URL || '/';
        const basePath = base.endsWith('/') ? base.slice(0, -1) : base;
        const withinBase = basePath ? pathname.startsWith(basePath) : true;
        if (!withinBase) return;

        const remainder = basePath ? pathname.slice(basePath.length) : pathname;
        if (!remainder || remainder === '/') return;

        window.location.replace(`${base}#${remainder}`);
    }, []);

    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/customer-login" element={<Navigate to="/login" replace />} />
                    <Route path="/customer-panel/*" element={<CustomerPanel />} />
                    <Route path="/staff" element={<PrivateRoute><Staff /></PrivateRoute>} />
                    <Route path="/customer" element={<PrivateRoute><Customer /></PrivateRoute>} />
                    <Route path="/category" element={<PrivateRoute><Category /></PrivateRoute>} />
                    <Route path="/product" element={<PrivateRoute><Product /></PrivateRoute>} />
                    <Route path="/subscription" element={<PrivateRoute><Subscription /></PrivateRoute>} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
