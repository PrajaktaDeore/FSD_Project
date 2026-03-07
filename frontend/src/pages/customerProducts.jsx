import React, { useMemo, useState } from 'react';

const CustomerProducts = ({
    filteredProducts,
    getProductImage,
    currency,
    addToWishlist,
    addToCart,
    selectedCategoryName,
    clearSelectedCategory,
}) => {
    const [sizeByProduct, setSizeByProduct] = useState({});
    const milkOptions = useMemo(() => ([
        { label: '0.5 Litre', value: 0.5, unit: 'L' },
        { label: '1 Litre', value: 1, unit: 'L' },
        { label: '2 Litre', value: 2, unit: 'L' },
    ]), []);
    const nonMilkOptions = useMemo(() => ([
        { label: '250g', value: 0.25, unit: 'kg' },
        { label: '500g', value: 0.5, unit: 'kg' },
        { label: '1kg', value: 1, unit: 'kg' },
    ]), []);

    const isMilkProduct = (name) => {
        const normalized = String(name || '').toLowerCase();
        return normalized.includes('milk') || normalized.includes('buttermilk');
    };

    const getSelectedOption = (productId, isMilk) => {
        if (sizeByProduct[productId]) return sizeByProduct[productId];
        return isMilk ? milkOptions[1] : nonMilkOptions[2];
    };

    return (
        <div className="customer-home-section">
            <div className="customer-section-head">
                <h5 className="customer-section-title">Products</h5>
                <p className="customer-section-subtitle">Explore fresh dairy products curated for your daily needs.</p>
                {selectedCategoryName && (
                    <div className="d-flex align-items-center gap-2 mt-2">
                        <span className="badge bg-success-subtle text-success-emphasis border">
                            Category: {selectedCategoryName}
                        </span>
                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={clearSelectedCategory}>
                            Clear
                        </button>
                    </div>
                )}
            </div>
            <div className="row g-3">
                {filteredProducts.map((product) => {
                    const isMilk = isMilkProduct(product.name);
                    const options = isMilk ? milkOptions : nonMilkOptions;
                    const selectedOption = getSelectedOption(product.id, isMilk);
                    const displayPrice = Number(product.price || 0) * Number(selectedOption.value || 1);

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
                                    <div className="product-option-slot mb-2">
                                        <div>
                                            <label className="form-label mb-1">Choose quantity</label>
                                            <select
                                                className="form-select form-select-sm"
                                                value={selectedOption.label}
                                                onChange={(e) => {
                                                    const next = options.find((opt) => opt.label === e.target.value) || options[0];
                                                    setSizeByProduct((prev) => ({ ...prev, [product.id]: next }));
                                                }}
                                            >
                                                {options.map((option) => (
                                                    <option key={`${product.id}-${option.label}`} value={option.label}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between gap-2 mt-2 product-action-row">
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
                                                onClick={() => addToCart(product, selectedOption)}
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
