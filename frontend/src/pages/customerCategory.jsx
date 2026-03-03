import React from 'react';

const CustomerCategory = ({ categoryGroups, currency }) => {
    return (
        <div className="customer-home-section">
            <div className="customer-section-head">
                <h5 className="customer-section-title">Category</h5>
                <p className="customer-section-subtitle">Browse product categories available in the customer portal.</p>
            </div>
            <div className="row g-3">
                {categoryGroups.length === 0 && (
                    <div className="col-12">
                        <div className="alert alert-light border mb-0">No active categories found.</div>
                    </div>
                )}
                {categoryGroups.map((cat) => (
                    <div key={cat.name} className="col-12 col-md-6 col-lg-4">
                        <div className="card customer-card customer-home-card h-100">
                            <div className="card-body">
                                <h6 className="mb-2">{cat.name}</h6>
                                <p className="mb-2 text-muted">Products: {cat.count}</p>
                                <p className="mb-2 text-muted">
                                    Price Range: {currency(cat.minPrice)} - {currency(cat.maxPrice)}
                                </p>
                                <small className="text-muted">Examples: {cat.samples.join(', ')}</small>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CustomerCategory;
