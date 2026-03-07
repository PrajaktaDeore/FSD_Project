import React, { useMemo, useState } from 'react';

const CustomerProducts = ({ filteredProducts, getProductImage, currency, addToWishlist, addToCart }) => {
    const [sizeByProduct, setSizeByProduct] = useState({});
    const litreOptions = useMemo(() => ([
        { label: '0.5 Litre', value: 0.5 },
        { label: '1 Litre', value: 1 },
        { label: '2 Litre', value: 2 },
    ]), []);

    const isMilkProduct = (name) => {
        const normalized = String(name || '').toLowerCase();
        return normalized.includes('milk') || normalized.includes('buttermilk');
    };

    const getSelectedLitreValue = (productId) => Number(sizeByProduct[productId] || 1);

    return (
        <div className="customer-home-section">
            <div className="customer-section-head">
                <h5 className="customer-section-title">Products</h5>
                <p className="customer-section-subtitle">Explore fresh dairy products curated for your daily needs.</p>
            </div>
            <div className="row g-3">
                {filteredProducts.map((product) => {
                    const isMilk = isMilkProduct(product.name);
                    const selectedLitreValue = getSelectedLitreValue(product.id);
                    const displayPrice = Number(product.price || 0) * selectedLitreValue;

                    return (
                        <div key={product.id} className="col-12 col-sm-6 col-lg-4">
                            <div className="card customer-card customer-product-card">
                                <img
                                    src={getProductImage(product.name)}
                                    alt={product.name}
                                    className="product-image"
                                />
                                <div className="card-body">
                                    <h5 className="card-title">{product.name}</h5>
                                    <p className="text-muted mb-2">{product.description || 'No description'}</p>
                                    {isMilk && (
                                        <div className="mb-2">
                                            <label className="form-label mb-1">Choose quantity</label>
                                            <select
                                                className="form-select form-select-sm"
                                                value={selectedLitreValue}
                                                onChange={(e) =>
                                                    setSizeByProduct((prev) => ({ ...prev, [product.id]: Number(e.target.value) }))
                                                }
                                            >
                                                {litreOptions.map((option) => (
                                                    <option key={`${product.id}-${option.value}`} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <div className="d-flex align-items-center justify-content-between gap-2 mt-2">
                                        <div className="fw-semibold">{currency(displayPrice)}</div>
                                        <div className="d-flex align-items-center gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm wishlist-mini-btn"
                                                onClick={() => addToWishlist(product)}
                                                title="Move to Wishlist"
                                                aria-label="Move to Wishlist"
                                            >
                                                <i className="fa-regular fa-heart" aria-hidden="true" />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-success btn-sm"
                                                onClick={() => addToCart(product, selectedLitreValue)}
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filteredProducts.length === 0 && (
                    <div className="col-12">
                        <div className="alert alert-light border mb-0">No products found.</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerProducts;
