import React from 'react';
import { useNavigate } from 'react-router-dom';
import landingImage from '../assets/images/landing.jpg';
import cowMilkImage from '../assets/images/cow_milk.png';
import buffalloMilkImage from '../assets/images/buffallo_milk.png';
import butterMilkImage from '../assets/images/butter_milk.png';
import './home.css';

const Home = () => {
    const navigate = useNavigate();
    const scrollToSection = (id) => {
        const section = document.getElementById(id);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="home-page">
            <nav className="home-navbar">
                <div className="home-brand">Milkman</div>
                <div className="home-nav-links">
                    <button type="button" onClick={() => scrollToSection('home')}>Home</button>
                    <button type="button" onClick={() => scrollToSection('products')}>Products</button>
                    <button type="button" onClick={() => scrollToSection('category')}>Category</button>
                    <button type="button" onClick={() => scrollToSection('orders')}>Orders</button>
                    <button type="button" onClick={() => scrollToSection('subscription')}>Subscription</button>
                    <button type="button" onClick={() => scrollToSection('contact')}>Contact</button>
                </div>
            </nav>

            <section id="home" className="home-hero">
                <img src={landingImage} alt="Milk delivery" className="home-hero-image" />
                <div className="home-hero-overlay">
                    <div className="home-hero-content">
                        <h1>Fresh Dairy, Delivered Daily</h1>
                        <p>Manage milk, ghee, subscriptions, and orders from one place.</p>
                        <div className="home-actions">
                            <button
                                className="btn btn-primary btn-lg"
                                style={{ background: '#0f8b5f', borderColor: '#0f8b5f' }}
                                onClick={() => navigate('/login')}
                            >
                                Login
                            </button>
                            <button className="btn btn-outline-light btn-lg" onClick={() => navigate('/register')}>
                                Register
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section id="products" className="home-section">
                <div className="container py-5">
                    <h2 className="mb-4">Products</h2>
                    <p className="text-muted mb-4">Explore fresh milk, ghee, paneer, curd, and daily essentials.</p>
                    <div className="row g-3">
                        <div className="col-12 col-md-4">
                            <div className="home-card product-card">
                                <img src={cowMilkImage} alt="Cow Milk" className="home-product-image" />
                                <div className="home-product-copy">
                                    <div className="home-product-title">Fresh Cow Milk</div>
                                    <p>Light and easy to digest, ideal for daily tea, coffee, and family nutrition.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="home-card product-card">
                                <img src={buffalloMilkImage} alt="Buffalo Milk" className="home-product-image" />
                                <div className="home-product-copy">
                                    <div className="home-product-title">Fresh Buffalo Milk</div>
                                    <p>Rich and creamy texture with higher fat content, perfect for curd and sweets.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="home-card product-card">
                                <img src={butterMilkImage} alt="Butter Milk" className="home-product-image" />
                                <div className="home-product-copy">
                                    <div className="home-product-title">Butter Milk</div>
                                    <p>Refreshing probiotic drink that cools the body and supports healthy digestion.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="category" className="home-section home-section-alt">
                <div className="container py-5">
                    <h2 className="mb-4">Category</h2>
                    <p className="text-muted mb-4">Milk, fermented products, and value-added dairy categories.</p>
                    <div className="row g-3">
                        <div className="col-12 col-md-4">
                            <div className="home-card">
                                <div className="home-product-copy">
                                    <div className="home-product-title">Daily Delivery</div>
                                    <p>Receive fresh dairy every day with reliable morning delivery to your doorstep.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="home-card">
                                <div className="home-product-copy">
                                    <div className="home-product-title">Subscription Packs</div>
                                    <p>Choose value packs for regular needs with flexible frequency and quantity options.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="home-card">
                                <div className="home-product-copy">
                                    <div className="home-product-title">One-time Orders</div>
                                    <p>Place instant single orders whenever you need extra milk, ghee, or dairy products.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="orders" className="home-section">
                <div className="container py-5">
                    <h2 className="mb-4">Orders</h2>
                    <p className="text-muted mb-4">Track current orders and view your previous deliveries.</p>
                    <div className="row g-3">
                        <div className="col-12 col-md-6">
                            <div className="home-card">
                                <div className="home-product-copy">
                                    <div className="home-product-title">Live Order Tracking</div>
                                    <p>See real-time updates from order placed to out-for-delivery and final delivery status.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-6">
                            <div className="home-card">
                                <div className="home-product-copy">
                                    <div className="home-product-title">Order History</div>
                                    <p>Review past purchases, quantities, and payment details whenever you need quick reference.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="subscription" className="home-section home-section-alt">
                <div className="container py-5">
                    <h2 className="mb-4">Subscription</h2>
                    <p className="text-muted mb-4">Set up recurring deliveries and manage plans anytime.</p>
                    <div className="row g-3">
                        <div className="col-12 col-md-4">
                            <div className="home-card">
                                <div className="home-product-copy">
                                    <div className="home-product-title">Daily Plan</div>
                                    <p>Get fresh milk delivered every day at your preferred quantity and timing.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="home-card">
                                <div className="home-product-copy">
                                    <div className="home-product-title">Weekly Plan</div>
                                    <p>Choose scheduled weekly deliveries for convenient, planned household supply.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="home-card">
                                <div className="home-product-copy">
                                    <div className="home-product-title">Flexible Pause/Resume</div>
                                    <p>Pause deliveries during travel and resume instantly without losing your plan setup.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="contact" className="home-section">
                <div className="container py-5">
                    <h2 className="mb-3">Contact</h2>
                    <p className="mb-1">Phone: +91 98765 43210</p>
                    <p className="mb-1">Email: support@milkman.com</p>
                    <p className="mb-0">Address: Dairy Road, Pune, Maharashtra</p>
                </div>
            </section>

        </div>
    );
};

export default Home;
