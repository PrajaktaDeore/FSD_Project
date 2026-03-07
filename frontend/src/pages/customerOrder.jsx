import React from 'react';

const CustomerOrder = ({ RECENT_ORDER_DAYS, recentOrders, currency, getOrderTrack }) => {
    return (
        <div className="customer-home-section">
            <div className="customer-section-head">
                <h5 className="customer-section-title">Orders</h5>
                <p className="customer-section-subtitle">Track recent and previous orders in one streamlined view.</p>
            </div>
            <div className="card customer-card customer-home-card">
                <div className="card-body">
                    <h6>
                        <i className="fa-solid fa-truck-fast me-2" aria-hidden="true" />
                        Recent Orders (Last {RECENT_ORDER_DAYS} Days)
                    </h6>
                    <div className="table-responsive">
                        <table className="table table-sm customer-soft-table">
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
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CustomerOrder;
