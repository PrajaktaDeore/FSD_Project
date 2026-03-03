import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import customerApi from '../services/customerApi';
import milkImage from '../assets/images/milk.jpeg';
import cowMilkImage from '../assets/images/milk.jpeg';
import buffalloMilkImage from '../assets/images/milk.jpeg';
import curdImage from '../assets/images/cu.jpeg';
import butterMilkImage from '../assets/images/butrmilk.jpeg';
import gheeImage from '../assets/products/ghee.jpg';
import paneerImage from '../assets/images/pn.jpeg';
import butterImage from '../assets/images/butter.jpeg';
import yogurtImage from '../assets/products/yogurt.svg';
import creamImage from '../assets/products/cream.svg';
import commonProductImage from '../assets/products/common-product.svg';
import CustomerProducts from './customerProducts';
import CustomerSubscription from './customerSubscription';
import CustomerOrder from './customerOrder';
import CustomerCategory from './customerCategory';
import './customer-panel.css';

const ORDER_STORAGE_KEY = 'gheeOrders';
const CART_STORAGE_KEY = 'customerCart';
const WISHLIST_STORAGE_KEY = 'customerWishlist';
const RECENT_ORDER_DAYS = 7;
const TAB_TO_SEGMENT = {
    products: 'products',
    milk: 'subscription',
    ghee: 'orders',
    manage: 'category',
    wishlist: 'wishlist',
    cart: 'cart',
    billing: 'billing',
};
const SEGMENT_TO_TAB = {
    products: 'products',
    subscription: 'milk',
    orders: 'ghee',
    category: 'manage',
    wishlist: 'wishlist',
    cart: 'cart',
    billing: 'billing',
};

const currency = (value) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(value || 0));

const getProductImage = (name) => {
    const normalized = (name || '').toLowerCase().trim();
    if (normalized.includes('buttermilk') || (normalized.includes('butter') && normalized.includes('milk'))) return butterMilkImage;
    if (normalized.includes('buffalo') && normalized.includes('milk')) return buffalloMilkImage;
    if (normalized.includes('buffallo') && normalized.includes('milk')) return buffalloMilkImage;
    if (normalized.includes('cow') && normalized.includes('milk')) return cowMilkImage;
    if (normalized.includes('butter')) return butterImage;
    if (normalized.includes('ghee')) return gheeImage;
    if (normalized.includes('paneer')) return paneerImage;
    if (normalized.includes('yogurt') || normalized.includes('yoghurt')) return yogurtImage;
    if (normalized.includes('cream') || normalized.includes('malai')) return creamImage;
    if (normalized.includes('curd')) return curdImage;
    if (normalized.includes('milk')) return milkImage;
    return commonProductImage;
};

const CustomerPanel = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const session = JSON.parse(localStorage.getItem('customerSession') || '{}');
    const customerId = session.customer_id;

    const [products, setProducts] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [gheeOrders, setGheeOrders] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [activeTab, setActiveTab] = useState('products');
    const [searchQuery, setSearchQuery] = useState('');
    const [cartStep, setCartStep] = useState('cart');
    const [checkoutAddress, setCheckoutAddress] = useState({
        fullName: '',
        phone: '',
        line1: '',
        city: '',
        pincode: '',
    });
    const [paymentDetails, setPaymentDetails] = useState({
        method: 'upi',
        upiId: '',
        cardNumber: '',
        cardName: '',
        expiry: '',
        cvv: '',
        bank: '',
    });

    const [milkForm, setMilkForm] = useState({ product: '', quantity: 1 });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isBusy, setIsBusy] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNavOpen, setIsNavOpen] = useState(false);

    const activateTab = (tab, options = {}) => {
        const { resetCart = false, replace = false } = options;
        if (resetCart) {
            setCartStep('cart');
        }
        setActiveTab(tab);
        const segment = TAB_TO_SEGMENT[tab] || 'products';
        const target = `/customer-panel/${segment}`;
        if (location.pathname !== target) {
            navigate(target, { replace });
        }
    };

    const productById = useMemo(() => {
        const map = {};
        products.forEach((p) => { map[p.id] = p; });
        return map;
    }, [products]);

    const milkProducts = useMemo(
        () => products.filter((p) => p.name?.toLowerCase().includes('milk') && p.is_active),
        [products]
    );

    const activeSubscriptions = useMemo(
        () => subscriptions.filter((s) => s.is_active),
        [subscriptions]
    );
    const filteredProducts = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return products.filter((p) => p.is_active);
        return products.filter(
            (p) =>
                p.is_active &&
                (
                    (p.name || '').toLowerCase().includes(q) ||
                    (p.description || '').toLowerCase().includes(q)
                )
        );
    }, [products, searchQuery]);

    const monthlyMilkEstimate = useMemo(
        () => activeSubscriptions.reduce((sum, sub) => {
            const product = productById[sub.product];
            return sum + (Number(sub.quantity) * Number(product?.price || 0) * 30);
        }, 0),
        [activeSubscriptions, productById]
    );
    const categoryGroups = useMemo(() => {
        const groups = {};
        products
            .filter((p) => p.is_active)
            .forEach((p) => {
                const key = (p.category_name || '').trim() || `Category ${p.category}`;
                if (!groups[key]) {
                    groups[key] = {
                        name: key,
                        count: 0,
                        minPrice: Number(p.price || 0),
                        maxPrice: Number(p.price || 0),
                        samples: [],
                    };
                }
                groups[key].count += 1;
                const price = Number(p.price || 0);
                groups[key].minPrice = Math.min(groups[key].minPrice, price);
                groups[key].maxPrice = Math.max(groups[key].maxPrice, price);
                if (groups[key].samples.length < 3) {
                    groups[key].samples.push(p.name);
                }
            });

        return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
    }, [products]);

    const gheeOrderTotal = useMemo(
        () => gheeOrders.reduce((sum, order) => sum + Number(order.total || 0), 0),
        [gheeOrders]
    );
    const sortedOrders = useMemo(
        () => [...gheeOrders].sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt)),
        [gheeOrders]
    );
    const recentOrders = useMemo(() => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - RECENT_ORDER_DAYS);
        return sortedOrders.filter((order) => new Date(order.orderedAt) >= cutoff);
    }, [sortedOrders]);
    const previousOrders = useMemo(() => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - RECENT_ORDER_DAYS);
        return sortedOrders.filter((order) => new Date(order.orderedAt) < cutoff);
    }, [sortedOrders]);
    const cartTotal = useMemo(
        () => cartItems.reduce((sum, item) => sum + Number(item.total || 0), 0),
        [cartItems]
    );
    const cartCount = useMemo(
        () => cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
        [cartItems]
    );
    const wishlistCount = useMemo(() => wishlistItems.length, [wishlistItems]);
    const loadData = async () => {
        try {
            const [productsRes, subscriptionsRes] = await Promise.all([
                customerApi.get('/product/product/'),
                customerApi.get('/subscription/subscription/'),
            ]);
            setProducts(productsRes.data);
            setSubscriptions(
                subscriptionsRes.data.filter((sub) => Number(sub.customer) === Number(customerId))
            );
        } catch (err) {
            setError(err.response?.data?.detail || 'Unable to load customer portal data.');
        }
    };

    useEffect(() => {
        if (!customerId) {
            navigate('/login');
            return;
        }
        loadData();

        const store = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY) || '{}');
        setGheeOrders(store[customerId] || []);
        const cartStore = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '{}');
        setCartItems(cartStore[customerId] || []);
        const wishlistStore = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '{}');
        setWishlistItems(wishlistStore[customerId] || []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customerId, navigate]);

    useEffect(() => {
        const segment = location.pathname.split('/')[2] || '';
        const mappedTab = SEGMENT_TO_TAB[segment];

        if (!mappedTab) {
            activateTab('products', { replace: true });
            return;
        }

        setActiveTab(mappedTab);
        if (mappedTab !== 'cart' && cartStep !== 'cart') {
            setCartStep('cart');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    const persistOrders = (orders) => {
        const store = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY) || '{}');
        store[customerId] = orders;
        localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(store));
        setGheeOrders(orders);
    };

    const persistCart = (items) => {
        const store = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '{}');
        store[customerId] = items;
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(store));
        setCartItems(items);
    };

    const persistWishlist = (items) => {
        const store = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '{}');
        store[customerId] = items;
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(store));
        setWishlistItems(items);
    };

    const addToCart = (product) => {
        const existing = cartItems.find((item) => item.productId === product.id);
        let nextItems = [];

        if (existing) {
            nextItems = cartItems.map((item) =>
                item.productId === product.id
                    ? {
                        ...item,
                        quantity: item.quantity + 1,
                        total: (item.quantity + 1) * item.unitPrice,
                    }
                    : item
            );
        } else {
            nextItems = [
                ...cartItems,
                {
                    productId: product.id,
                    productName: product.name,
                    quantity: 1,
                    unitPrice: Number(product.price || 0),
                    total: Number(product.price || 0),
                },
            ];
        }

        persistCart(nextItems);
        setMessage(`${product.name} added to cart.`);
        activateTab('cart', { resetCart: true });
    };

    const addToWishlist = (product) => {
        const exists = wishlistItems.some((item) => item.productId === product.id);
        if (exists) {
            setMessage(`${product.name} is already in wishlist.`);
            return;
        }
        persistWishlist([
            ...wishlistItems,
            {
                productId: product.id,
                productName: product.name,
                unitPrice: Number(product.price || 0),
            },
        ]);
        setMessage(`${product.name} moved to wishlist.`);
        activateTab('wishlist');
    };

    const updateCartQuantity = (productId, quantity) => {
        const qty = Math.max(1, Number(quantity) || 1);
        const updated = cartItems.map((item) =>
            item.productId === productId
                ? { ...item, quantity: qty, total: qty * item.unitPrice }
                : item
        );
        persistCart(updated);
    };

    const removeCartItem = (productId) => {
        const updated = cartItems.filter((item) => item.productId !== productId);
        persistCart(updated);
    };

    const removeWishlistItem = (productId) => {
        const updated = wishlistItems.filter((item) => item.productId !== productId);
        persistWishlist(updated);
    };

    const moveWishlistToCart = (productId) => {
        const item = wishlistItems.find((w) => w.productId === productId);
        if (!item) return;

        const existing = cartItems.find((c) => c.productId === productId);
        let nextCart = [];
        if (existing) {
            nextCart = cartItems.map((c) =>
                c.productId === productId
                    ? { ...c, quantity: c.quantity + 1, total: (c.quantity + 1) * c.unitPrice }
                    : c
            );
        } else {
            nextCart = [
                ...cartItems,
                {
                    productId: item.productId,
                    productName: item.productName,
                    quantity: 1,
                    unitPrice: Number(item.unitPrice || 0),
                    total: Number(item.unitPrice || 0),
                },
            ];
        }
        persistCart(nextCart);
        removeWishlistItem(productId);
        setMessage(`${item.productName} moved to cart.`);
        activateTab('cart', { resetCart: true });
    };

    const openCheckout = () => {
        if (cartItems.length === 0) {
            setError('Cart is empty.');
            return;
        }
        setError('');
        setMessage('');
        setCartStep('address');
    };

    const continueToPayment = () => {
        if (
            !checkoutAddress.fullName.trim() ||
            !checkoutAddress.phone.trim() ||
            !checkoutAddress.line1.trim() ||
            !checkoutAddress.city.trim() ||
            !checkoutAddress.pincode.trim()
        ) {
            setError('Please fill delivery address details.');
            return;
        }
        setError('');
        setCartStep('payment');
    };

    const confirmPlaceOrder = () => {
        if (
            !checkoutAddress.fullName.trim() ||
            !checkoutAddress.phone.trim() ||
            !checkoutAddress.line1.trim() ||
            !checkoutAddress.city.trim() ||
            !checkoutAddress.pincode.trim()
        ) {
            setError('Please fill delivery address details.');
            return;
        }

        if (paymentDetails.method === 'upi' && !paymentDetails.upiId.trim()) {
            setError('Please enter UPI ID.');
            return;
        }
        if (paymentDetails.method === 'card') {
            if (
                !paymentDetails.cardNumber.trim() ||
                !paymentDetails.cardName.trim() ||
                !paymentDetails.expiry.trim() ||
                !paymentDetails.cvv.trim()
            ) {
                setError('Please fill all card details.');
                return;
            }
        }
        if (paymentDetails.method === 'netbanking' && !paymentDetails.bank.trim()) {
            setError('Please select a bank.');
            return;
        }

        const newOrders = cartItems.map((item) => ({
            id: Date.now() + item.productId,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            orderedAt: new Date().toISOString(),
            address: { ...checkoutAddress },
            payment: {
                method: paymentDetails.method,
                status: paymentDetails.method === 'cod' ? 'Pending (Cash on Delivery)' : 'Paid',
            },
        }));

        persistOrders([...newOrders, ...gheeOrders]);
        persistCart([]);
        setCheckoutAddress({ fullName: '', phone: '', line1: '', city: '', pincode: '' });
        setPaymentDetails({
            method: 'upi',
            upiId: '',
            cardNumber: '',
            cardName: '',
            expiry: '',
            cvv: '',
            bank: '',
        });
        setCartStep('cart');
        setMessage('Order placed successfully.');
        activateTab('ghee', { resetCart: true });
    };

    const getOrderTrack = (orderedAt) => {
        const diffHours = (Date.now() - new Date(orderedAt).getTime()) / (1000 * 60 * 60);
        if (diffHours < 2) return { label: 'Order Placed', badge: 'bg-info' };
        if (diffHours < 24) return { label: 'Out for Delivery', badge: 'bg-warning text-dark' };
        return { label: 'Delivered', badge: 'bg-success' };
    };

    const subscribeMilk = async (e) => {
        e.preventDefault();
        if (isBusy) return;
        setMessage('');
        setError('');
        setIsBusy(true);

        try {
            await customerApi.post('/subscription/subscription/', {
                customer: Number(customerId),
                product: Number(milkForm.product),
                quantity: Number(milkForm.quantity),
            });
            setMilkForm({ product: '', quantity: 1 });
            setMessage('Milk subscription added.');
            await loadData();
        } catch (err) {
            setError(err.response?.data?.detail || 'Unable to subscribe milk.');
        } finally {
            setIsBusy(false);
        }
    };

    const logout = () => {
        setIsNavOpen(false);
        setIsUserMenuOpen(false);
        localStorage.removeItem('customerSession');
        navigate('/login');
    };

    return (
        <div className="customer-shell">
            <nav className="customer-top-navbar">
                <div className="container customer-top-navbar-inner">
                    <div className="customer-nav-title">Milkman</div>
                    <button
                        type="button"
                        className="customer-nav-toggle"
                        onClick={() => setIsNavOpen((prev) => !prev)}
                        aria-label="Toggle customer navigation"
                        aria-expanded={isNavOpen}
                    >
                        <i className="fa-solid fa-bars" aria-hidden="true" />
                    </button>
                    <div className={`customer-nav-collapse ${isNavOpen ? 'open' : ''}`}>
                        <ul className="customer-top-nav-links">
                            <li><button type="button" onClick={() => { setIsNavOpen(false); navigate('/'); }}>Home</button></li>
                            <li><button type="button" className={activeTab === 'products' ? 'active' : ''} onClick={() => { setIsNavOpen(false); activateTab('products'); }}>Products</button></li>
                            <li><button type="button" className={activeTab === 'milk' ? 'active' : ''} onClick={() => { setIsNavOpen(false); activateTab('milk'); }}>Subscribe</button></li>
                            <li><button type="button" className={activeTab === 'ghee' ? 'active' : ''} onClick={() => { setIsNavOpen(false); activateTab('ghee'); }}>Orders</button></li>
                            <li><button type="button" className={activeTab === 'manage' ? 'active' : ''} onClick={() => { setIsNavOpen(false); activateTab('manage'); }}>Category</button></li>
                        </ul>
                        <div className="customer-top-nav-actions">
                            <button type="button" className="btn btn-outline-light btn-sm" onClick={() => { setIsNavOpen(false); activateTab('wishlist'); }}>
                                Wishlist ({wishlistCount})
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-light btn-sm"
                                onClick={() => { setIsNavOpen(false); activateTab('cart', { resetCart: true }); }}
                            >
                                Cart ({cartCount})
                            </button>
                            <button type="button" className="btn btn-light btn-sm" onClick={logout}>Logout</button>
                            <div className="customer-user-menu">
                                <button
                                    type="button"
                                    className="customer-user-btn"
                                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                                    aria-label="Open user details"
                                >
                                    <i className="fa-solid fa-user" aria-hidden="true" />
                                </button>
                                {isUserMenuOpen && (
                                    <div className="customer-user-panel">
                                        <h6>User Details</h6>
                                        <div><strong>Name:</strong> {session.name || '-'}</div>
                                        <div><strong>Email:</strong> {session.email || '-'}</div>
                                        <div><strong>Address:</strong> {session.address || 'Not available'}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            <div className="container py-4 customer-main-content">
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 gap-2">
                    <div>
                        <h4 className="mb-0 customer-welcome-name">Welcome, {session.name || 'Customer'}</h4>
                        <small className="customer-welcome-email">{session.email}</small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <div className="input-group search-top-input">
                            <span className="input-group-text search-icon-addon"><i className="fa-solid fa-magnifying-glass" aria-hidden="true" /></span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (activeTab !== 'products') {
                                        activateTab('products');
                                    }
                                }}
                            />
                        </div>
                        {/* <button
                            type="button"
                            className="btn btn-outline-danger wishlist-icon-btn"
                            onClick={() => setActiveTab('wishlist')}
                            title="Wishlist"
                        >
                            ❤ ({wishlistCount})
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-success cart-icon-btn"
                            onClick={() => {
                                setActiveTab('cart');
                                setCartStep('cart');
                            }}
                            title="Cart"
                        >
                            Cart ({cartCount})
                        </button> */}
                    </div>
                </div>

                {message && <div className="alert alert-success py-2">{message}</div>}
                {error && <div className="alert alert-danger py-2">{error}</div>}
                {activeTab === 'products' && (
                    <CustomerProducts
                        filteredProducts={filteredProducts}
                        getProductImage={getProductImage}
                        currency={currency}
                        addToWishlist={addToWishlist}
                        addToCart={addToCart}
                    />
                )}

                {activeTab === 'wishlist' && (
                    <div className="card customer-card">
                        <div className="card-body">
                            <h5 className="card-title">Your Wishlist</h5>
                            <div className="table-responsive">
                                <table className="table align-middle">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Price</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {wishlistItems.length === 0 && (
                                            <tr><td colSpan="3" className="text-muted">Wishlist is empty.</td></tr>
                                        )}
                                        {wishlistItems.map((item) => (
                                            <tr key={item.productId}>
                                                <td>{item.productName}</td>
                                                <td>{currency(item.unitPrice)}</td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <button
                                                            type="button"
                                                            className="btn btn-success btn-sm"
                                                            onClick={() => moveWishlistToCart(item.productId)}
                                                        >
                                                            Move to Cart
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => removeWishlistItem(item.productId)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'cart' && (
                    <div className="card customer-card">
                        <div className="card-body">
                            {cartStep === 'cart' && (
                                <>
                                    <h5 className="card-title">Your Cart</h5>
                                    <div className="table-responsive">
                                        <table className="table align-middle">
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th>Price</th>
                                                    <th>Quantity</th>
                                                    <th>Total</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cartItems.length === 0 && (
                                                    <tr><td colSpan="5" className="text-muted">Cart is empty.</td></tr>
                                                )}
                                                {cartItems.map((item) => (
                                                    <tr key={item.productId}>
                                                        <td>{item.productName}</td>
                                                        <td>{currency(item.unitPrice)}</td>
                                                        <td style={{ maxWidth: '120px' }}>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                className="form-control form-control-sm"
                                                                value={item.quantity}
                                                                onChange={(e) => updateCartQuantity(item.productId, e.target.value)}
                                                            />
                                                        </td>
                                                        <td>{currency(item.total)}</td>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger btn-sm"
                                                                onClick={() => removeCartItem(item.productId)}
                                                            >
                                                                Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mt-3 gap-2 flex-wrap">
                                        <div className="fw-semibold">Grand Total: {currency(cartTotal)}</div>
                                        <button
                                            type="button"
                                            className="btn btn-success"
                                            onClick={openCheckout}
                                            disabled={cartItems.length === 0}
                                        >
                                            Place Order
                                        </button>
                                    </div>
                                </>
                            )}

                            {cartStep === 'address' && (
                                <>
                                    <h5 className="card-title">Delivery Address & Confirmation</h5>
                                    <div className="row g-3">
                                        <div className="col-12 col-md-6">
                                            <label className="form-label">Full Name</label>
                                            <input
                                                className="form-control"
                                                value={checkoutAddress.fullName}
                                                onChange={(e) => setCheckoutAddress((prev) => ({ ...prev, fullName: e.target.value }))}
                                            />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label">Phone</label>
                                            <input
                                                className="form-control"
                                                value={checkoutAddress.phone}
                                                onChange={(e) => setCheckoutAddress((prev) => ({ ...prev, phone: e.target.value }))}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Address Line</label>
                                            <input
                                                className="form-control"
                                                value={checkoutAddress.line1}
                                                onChange={(e) => setCheckoutAddress((prev) => ({ ...prev, line1: e.target.value }))}
                                            />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label">City</label>
                                            <input
                                                className="form-control"
                                                value={checkoutAddress.city}
                                                onChange={(e) => setCheckoutAddress((prev) => ({ ...prev, city: e.target.value }))}
                                            />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label">Pincode</label>
                                            <input
                                                className="form-control"
                                                value={checkoutAddress.pincode}
                                                onChange={(e) => setCheckoutAddress((prev) => ({ ...prev, pincode: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <hr />
                                    <h6>Confirm Items</h6>
                                    <ul className="list-group mb-3">
                                        {cartItems.map((item) => (
                                            <li key={`confirm-${item.productId}`} className="list-group-item d-flex justify-content-between">
                                                <span>{item.productName} x {item.quantity}</span>
                                                <span>{currency(item.total)}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
                                        <button type="button" className="btn btn-outline-secondary" onClick={() => setCartStep('cart')}>
                                            Back to Cart
                                        </button>
                                        <div className="d-flex align-items-center gap-3">
                                            <span className="fw-semibold">Grand Total: {currency(cartTotal)}</span>
                                            <button type="button" className="btn btn-primary" onClick={continueToPayment}>
                                                Continue to Payment
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {cartStep === 'payment' && (
                                <>
                                    <h5 className="card-title">Payment</h5>
                                    <p className="text-muted mb-3">Choose payment option and complete order.</p>

                                    <div className="row g-2 mb-3">
                                        <div className="col-12 col-md-3">
                                            <button
                                                type="button"
                                                className={`btn w-100 ${paymentDetails.method === 'upi' ? 'btn-success' : 'btn-outline-success'}`}
                                                onClick={() => setPaymentDetails((prev) => ({ ...prev, method: 'upi' }))}
                                            >
                                                UPI
                                            </button>
                                        </div>
                                        <div className="col-12 col-md-3">
                                            <button
                                                type="button"
                                                className={`btn w-100 ${paymentDetails.method === 'card' ? 'btn-success' : 'btn-outline-success'}`}
                                                onClick={() => setPaymentDetails((prev) => ({ ...prev, method: 'card' }))}
                                            >
                                                Card
                                            </button>
                                        </div>
                                        <div className="col-12 col-md-3">
                                            <button
                                                type="button"
                                                className={`btn w-100 ${paymentDetails.method === 'netbanking' ? 'btn-success' : 'btn-outline-success'}`}
                                                onClick={() => setPaymentDetails((prev) => ({ ...prev, method: 'netbanking' }))}
                                            >
                                                Net Banking
                                            </button>
                                        </div>
                                        <div className="col-12 col-md-3">
                                            <button
                                                type="button"
                                                className={`btn w-100 ${paymentDetails.method === 'cod' ? 'btn-success' : 'btn-outline-success'}`}
                                                onClick={() => setPaymentDetails((prev) => ({ ...prev, method: 'cod' }))}
                                            >
                                                Cash on Delivery
                                            </button>
                                        </div>
                                    </div>

                                    {paymentDetails.method === 'upi' && (
                                        <div className="mb-3">
                                            <label className="form-label">UPI ID</label>
                                            <input
                                                className="form-control"
                                                placeholder="example@upi"
                                                value={paymentDetails.upiId}
                                                onChange={(e) => setPaymentDetails((prev) => ({ ...prev, upiId: e.target.value }))}
                                            />
                                        </div>
                                    )}

                                    {paymentDetails.method === 'card' && (
                                        <div className="row g-3 mb-2">
                                            <div className="col-12">
                                                <label className="form-label">Card Number</label>
                                                <input
                                                    className="form-control"
                                                    placeholder="1234 5678 9012 3456"
                                                    value={paymentDetails.cardNumber}
                                                    onChange={(e) => setPaymentDetails((prev) => ({ ...prev, cardNumber: e.target.value }))}
                                                />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label">Card Holder Name</label>
                                                <input
                                                    className="form-control"
                                                    value={paymentDetails.cardName}
                                                    onChange={(e) => setPaymentDetails((prev) => ({ ...prev, cardName: e.target.value }))}
                                                />
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <label className="form-label">Expiry</label>
                                                <input
                                                    className="form-control"
                                                    placeholder="MM/YY"
                                                    value={paymentDetails.expiry}
                                                    onChange={(e) => setPaymentDetails((prev) => ({ ...prev, expiry: e.target.value }))}
                                                />
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <label className="form-label">CVV</label>
                                                <input
                                                    className="form-control"
                                                    placeholder="123"
                                                    value={paymentDetails.cvv}
                                                    onChange={(e) => setPaymentDetails((prev) => ({ ...prev, cvv: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {paymentDetails.method === 'netbanking' && (
                                        <div className="mb-3">
                                            <label className="form-label">Select Bank</label>
                                            <select
                                                className="form-select"
                                                value={paymentDetails.bank}
                                                onChange={(e) => setPaymentDetails((prev) => ({ ...prev, bank: e.target.value }))}
                                            >
                                                <option value="">Choose bank</option>
                                                <option value="SBI">SBI</option>
                                                <option value="HDFC">HDFC</option>
                                                <option value="ICICI">ICICI</option>
                                                <option value="Axis">Axis</option>
                                            </select>
                                        </div>
                                    )}

                                    {paymentDetails.method === 'cod' && (
                                        <div className="alert alert-info py-2">
                                            Cash will be collected at delivery time.
                                        </div>
                                    )}

                                    <h6>Order Summary</h6>
                                    <ul className="list-group mb-3">
                                        {cartItems.map((item) => (
                                            <li key={`pay-${item.productId}`} className="list-group-item d-flex justify-content-between">
                                                <span>{item.productName} x {item.quantity}</span>
                                                <span>{currency(item.total)}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
                                        <button type="button" className="btn btn-outline-secondary" onClick={() => setCartStep('address')}>
                                            Back to Address
                                        </button>
                                        <div className="d-flex align-items-center gap-3">
                                            <span className="fw-semibold">Grand Total: {currency(cartTotal)}</span>
                                            <button type="button" className="btn btn-primary" onClick={confirmPlaceOrder}>
                                                Pay & Place Order
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'milk' && (
                    <CustomerSubscription
                        milkForm={milkForm}
                        setMilkForm={setMilkForm}
                        milkProducts={milkProducts}
                        currency={currency}
                        subscribeMilk={subscribeMilk}
                        isBusy={isBusy}
                    />
                )}

                {activeTab === 'ghee' && (
                    <CustomerOrder
                        RECENT_ORDER_DAYS={RECENT_ORDER_DAYS}
                        recentOrders={recentOrders}
                        previousOrders={previousOrders}
                        currency={currency}
                        getOrderTrack={getOrderTrack}
                    />
                )}

                {activeTab === 'billing' && (
                    <div className="row g-3">
                        <div className="col-12 col-md-4">
                            <div className="card customer-card h-100">
                                <div className="card-body">
                                    <p className="text-muted mb-1">Monthly Milk Estimate</p>
                                    <h4>{currency(monthlyMilkEstimate)}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="card customer-card h-100">
                                <div className="card-body">
                                    <p className="text-muted mb-1">Ghee Orders Total</p>
                                    <h4>{currency(gheeOrderTotal)}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="card customer-card h-100">
                                <div className="card-body">
                                    <p className="text-muted mb-1">Total Due (Estimate)</p>
                                    <h4>{currency(monthlyMilkEstimate + gheeOrderTotal)}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'manage' && (
                    <CustomerCategory
                        categoryGroups={categoryGroups}
                        currency={currency}
                    />
                )}
            </div>
        </div>
    );
};

export default CustomerPanel;




