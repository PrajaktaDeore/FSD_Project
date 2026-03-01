import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import customerApi from '../services/customerApi';
import milkImage from '../assets/products/milk.jpg';
import cowMilkImage from '../assets/products/c_milk.jpg';
import buffalloMilkImage from '../assets/products/b1.jpeg';
import curdImage from '../assets/products/c.jpeg';
import butterMilkImage from '../assets/products/bu.jpeg';
import gheeImage from '../assets/products/ghee.jpg';
import paneerImage from '../assets/products/p.jpg';
import butterImage from '../assets/products/butr.jpeg';
import yogurtImage from '../assets/products/yogurt.svg';
import creamImage from '../assets/products/cream.svg';
import commonProductImage from '../assets/products/common-product.svg';
import './customer-panel.css';

const ORDER_STORAGE_KEY = 'gheeOrders';
const CART_STORAGE_KEY = 'customerCart';
const WISHLIST_STORAGE_KEY = 'customerWishlist';
const RECENT_ORDER_DAYS = 7;

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
    const [gheeForm, setGheeForm] = useState({ product: '', quantity: 1 });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isBusy, setIsBusy] = useState(false);

    const productById = useMemo(() => {
        const map = {};
        products.forEach((p) => { map[p.id] = p; });
        return map;
    }, [products]);

    const milkProducts = useMemo(
        () => products.filter((p) => p.name?.toLowerCase().includes('milk') && p.is_active),
        [products]
    );
    const gheeProducts = useMemo(
        () => products.filter((p) => p.name?.toLowerCase().includes('ghee') && p.is_active),
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
            navigate('/customer-login');
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
        setActiveTab('cart');
        setCartStep('cart');
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
        setActiveTab('wishlist');
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
        setActiveTab('cart');
        setCartStep('cart');
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
        setActiveTab('ghee');
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

    const orderGhee = (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        const product = productById[Number(gheeForm.product)];
        if (!product) {
            setError('Select a ghee product.');
            return;
        }

        const quantity = Number(gheeForm.quantity);
        const total = quantity * Number(product.price || 0);
        const next = [
            ...gheeOrders,
            {
                id: Date.now(),
                productId: product.id,
                productName: product.name,
                quantity,
                unitPrice: Number(product.price),
                total,
                orderedAt: new Date().toISOString(),
            },
        ];
        persistOrders(next);
        setGheeForm({ product: '', quantity: 1 });
        setMessage('Ghee order added.');
    };

    const updateSubscription = async (subId, changes) => {
        if (isBusy) return;
        const current = subscriptions.find((s) => s.id === subId);
        if (!current) return;

        setIsBusy(true);
        setError('');
        setMessage('');
        try {
            await customerApi.put(`/subscription/subscription/${subId}/`, {
                customer: Number(current.customer),
                product: Number(current.product),
                quantity: Number(changes.quantity ?? current.quantity),
                is_active: Boolean(changes.is_active ?? current.is_active),
            });
            setMessage('Subscription updated.');
            await loadData();
        } catch (err) {
            setError(err.response?.data?.detail || 'Unable to update subscription.');
        } finally {
            setIsBusy(false);
        }
    };

    const deleteSubscription = async (subId) => {
        if (isBusy) return;
        setIsBusy(true);
        setError('');
        setMessage('');
        try {
            await customerApi.delete(`/subscription/subscription/${subId}/`);
            setMessage('Subscription removed.');
            await loadData();
        } catch (err) {
            setError(err.response?.data?.detail || 'Unable to delete subscription.');
        } finally {
            setIsBusy(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('customerSession');
        navigate('/customer-login');
    };

    return (
        <div className="customer-shell">
            <div className="container py-4">
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 gap-2">
                    <div>
                        <h2 className="mb-0">Welcome, {session.name || 'Customer'}</h2>
                        <small className="text-muted">{session.email}</small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <div className="input-group search-top-input">
                            <span className="input-group-text search-icon-addon">🔍</span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setActiveTab('products');
                                }}
                            />
                        </div>
                        <button
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
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-dark profile-icon-btn"
                            onClick={() => setActiveTab('profile')}
                            title="Profile"
                        >
                            👤
                        </button>
                        <button className="btn btn-outline-secondary" onClick={logout}>Logout</button>
                    </div>
                </div>

                <div className="customer-nav-panel mb-3">
                    <ul className="nav nav-pills flex-wrap gap-2 customer-tabs">
                        <li className="nav-item"><button className={`nav-link ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Products</button></li>
                        <li className="nav-item"><button className={`nav-link ${activeTab === 'milk' ? 'active' : ''}`} onClick={() => setActiveTab('milk')}>Subscribe</button></li>
                        <li className="nav-item"><button className={`nav-link ${activeTab === 'ghee' ? 'active' : ''}`} onClick={() => setActiveTab('ghee')}>Orders</button></li>
                        <li className="nav-item"><button className={`nav-link ${activeTab === 'billing' ? 'active' : ''}`} onClick={() => setActiveTab('billing')}>View Billing</button></li>
                        <li className="nav-item"><button className={`nav-link ${activeTab === 'manage' ? 'active' : ''}`} onClick={() => setActiveTab('manage')}>Manage Subscription</button></li>
                    </ul>
                </div>

                {message && <div className="alert alert-success py-2">{message}</div>}
                {error && <div className="alert alert-danger py-2">{error}</div>}

                {activeTab === 'profile' && (
                    <div className="card customer-card">
                        <div className="card-body">
                            <h5 className="card-title">User Information</h5>
                            <div className="mb-2"><strong>Customer Name:</strong> {session.name || '-'}</div>
                            <div className="mb-2"><strong>Email:</strong> {session.email || '-'}</div>
                            <div><strong>Address:</strong> {session.address || 'Not available. Please login again to refresh profile details.'}</div>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="row g-3">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="col-12 col-sm-6 col-lg-4">
                                <div className="card customer-card">
                                    <img
                                        src={getProductImage(product.name)}
                                        alt={product.name}
                                        className="product-image"
                                    />
                                    <div className="card-body">
                                        <h5 className="card-title">{product.name}</h5>
                                        <p className="text-muted mb-2">{product.description || 'No description'}</p>
                                        <div className="d-flex align-items-center justify-content-between gap-2 mt-2">
                                            <div className="fw-semibold">{currency(product.price)}</div>
                                            <div className="d-flex align-items-center gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm wishlist-mini-btn"
                                                    onClick={() => addToWishlist(product)}
                                                    title="Move to Wishlist"
                                                >
                                                    ❤
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => addToCart(product)}
                                                >
                                                    Add to Cart
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredProducts.length === 0 && (
                            <div className="col-12">
                                <div className="alert alert-light border mb-0">No products found.</div>
                            </div>
                        )}
                    </div>
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
                    <div className="card customer-card">
                        <div className="card-body">
                            <h5 className="card-title">Subscribe </h5>
                            <form className="row g-3" onSubmit={subscribeMilk}>
                                <div className="col-12 col-md-6">
                                    <label className="form-label">Milk Product</label>
                                    <select
                                        className="form-select"
                                        value={milkForm.product}
                                        onChange={(e) => setMilkForm((prev) => ({ ...prev, product: e.target.value }))}
                                        required
                                    >
                                        <option value="">Select milk product</option>
                                        {milkProducts.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name} - {currency(p.price)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12 col-md-3">
                                    <label className="form-label">Quantity / day</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="form-control"
                                        value={milkForm.quantity}
                                        onChange={(e) => setMilkForm((prev) => ({ ...prev, quantity: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-3 d-grid align-items-end">
                                    <button className="btn btn-success" type="submit" disabled={isBusy}>Subscribe</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'ghee' && (
                    <div className="card customer-card">
                        <div className="card-body">
                            {/* <h5 className="card-title">Order Ghee</h5>
                            <form className="row g-3" onSubmit={orderGhee}>
                                <div className="col-12 col-md-6">
                                    <label className="form-label">Ghee Product</label>
                                    <select
                                        className="form-select"
                                        value={gheeForm.product}
                                        onChange={(e) => setGheeForm((prev) => ({ ...prev, product: e.target.value }))}
                                        required
                                    >
                                        <option value="">Select ghee product</option>
                                        {gheeProducts.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name} - {currency(p.price)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12 col-md-3">
                                    <label className="form-label">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="form-control"
                                        value={gheeForm.quantity}
                                        onChange={(e) => setGheeForm((prev) => ({ ...prev, quantity: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-3 d-grid align-items-end">
                                    <button className="btn btn-warning" type="submit">Order</button>
                                </div>
                            </form>

                            <hr /> */}
                            <h6>Recent Orders (Last {RECENT_ORDER_DAYS} Days)</h6>
                            <div className="table-responsive">
                                <table className="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Qty</th>
                                            <th>Amount</th>
                                            <th>Date</th>
                                            <th>Track</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentOrders.length === 0 && (
                                            <tr><td colSpan="5" className="text-muted">No recent orders.</td></tr>
                                        )}
                                        {recentOrders.map((order) => {
                                            const track = getOrderTrack(order.orderedAt);
                                            return (
                                            <tr key={`recent-${order.id}`}>
                                                <td>{order.productName}</td>
                                                <td>{order.quantity}</td>
                                                <td>{currency(order.total)}</td>
                                                <td>{new Date(order.orderedAt).toLocaleString()}</td>
                                                <td><span className={`badge ${track.badge}`}>{track.label}</span></td>
                                            </tr>
                                        );})}
                                    </tbody>
                                </table>
                            </div>

                            <h6 className="mt-4">Previous Orders</h6>
                            <div className="table-responsive">
                                <table className="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Qty</th>
                                            <th>Amount</th>
                                            <th>Date</th>
                                            <th>Track</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previousOrders.length === 0 && (
                                            <tr><td colSpan="5" className="text-muted">No previous orders.</td></tr>
                                        )}
                                        {previousOrders.map((order) => {
                                            const track = getOrderTrack(order.orderedAt);
                                            return (
                                            <tr key={`previous-${order.id}`}>
                                                <td>{order.productName}</td>
                                                <td>{order.quantity}</td>
                                                <td>{currency(order.total)}</td>
                                                <td>{new Date(order.orderedAt).toLocaleString()}</td>
                                                <td><span className={`badge ${track.badge}`}>{track.label}</span></td>
                                            </tr>
                                        );})}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
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
                    <div className="card customer-card">
                        <div className="card-body">
                            <h5 className="card-title">Manage Subscription</h5>
                            <div className="table-responsive">
                                <table className="table align-middle">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Quantity</th>
                                            <th>Status</th>
                                            <th>Start Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subscriptions.length === 0 && (
                                            <tr><td colSpan="5" className="text-muted">No subscriptions found.</td></tr>
                                        )}
                                        {subscriptions.map((sub) => (
                                            <tr key={sub.id}>
                                                <td>{productById[sub.product]?.name || `Product #${sub.product}`}</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className="form-control form-control-sm"
                                                        defaultValue={sub.quantity}
                                                        onBlur={(e) => updateSubscription(sub.id, { quantity: Number(e.target.value) })}
                                                    />
                                                </td>
                                                <td>
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={sub.is_active ? 'true' : 'false'}
                                                        onChange={(e) => updateSubscription(sub.id, { is_active: e.target.value === 'true' })}
                                                    >
                                                        <option value="true">Active</option>
                                                        <option value="false">Paused</option>
                                                    </select>
                                                </td>
                                                <td>{new Date(sub.start_date).toLocaleDateString()}</td>
                                                <td>
                                                    <button className="btn btn-outline-danger btn-sm" onClick={() => deleteSubscription(sub.id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerPanel;
