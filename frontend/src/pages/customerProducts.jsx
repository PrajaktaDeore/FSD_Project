import React from 'react';

const CustomerProducts = ({ filteredProducts, getProductImage, currency, addToWishlist, addToCart }) => {
    return (
        <div className="customer-home-section">
            <div className="customer-section-head">
                <h5 className="customer-section-title">Products</h5>
                <p className="customer-section-subtitle">Explore fresh dairy products curated for your daily needs.</p>
            </div>
            <div className="row g-3">
                {filteredProducts.map((product) => (
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
                                <div className="d-flex align-items-center justify-content-between gap-2 mt-2">
                                    <div className="fw-semibold">{currency(product.price)}</div>
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
        </div>
    );
};

export default CustomerProducts;
