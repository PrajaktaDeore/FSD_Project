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
        if (pathname !== '/') {
            const targetHash = hash || '#/';
            window.history.replaceState(null, '', `/${targetHash}`);
        }
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
