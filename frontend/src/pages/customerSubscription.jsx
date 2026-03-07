import React from 'react';

const CustomerSubscription = ({
    milkForm,
    setMilkForm,
    milkProducts,
    activeSubscriptions,
    getProductName,
    getProductPrice,
    currency,
    subscribeMilk,
    isBusy,
}) => {
    const getDayOnly = (dateValue) => {
        if (!dateValue) return '-';
        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('en-IN', { weekday: 'long' });
    };

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

            <div className="card customer-card customer-home-card mt-3">
                <div className="card-body">
                    <h6 className="mb-3">Your Subscriptions</h6>
                    <div className="table-responsive">
                        <table className="table table-sm customer-soft-table mb-0">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Quantity / day</th>
                                    <th>Starts On</th>
                                    <th>Price / day</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeSubscriptions.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-muted">No subscriptions added yet.</td>
                                    </tr>
                                )}
                                {activeSubscriptions.map((sub) => (
                                    <tr key={sub.id}>
                                        <td>{getProductName(sub.product)}</td>
                                        <td>{sub.quantity}</td>
                                        <td>{getDayOnly(sub.start_date)}</td>
                                        <td>{currency(Number(sub.quantity) * Number(getProductPrice(sub.product) || 0))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerSubscription;
