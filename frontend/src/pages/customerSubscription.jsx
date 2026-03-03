import React from 'react';

const CustomerSubscription = ({ milkForm, setMilkForm, milkProducts, currency, subscribeMilk, isBusy }) => {
    return (
        <div className="customer-home-section">
            <div className="customer-section-head">
                <h5 className="customer-section-title">Subscribe</h5>
                <p className="customer-section-subtitle">Set up recurring milk delivery just like a plan from the home page.</p>
            </div>
            <div className="card customer-card customer-home-card">
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
        </div>
    );
};

export default CustomerSubscription;
