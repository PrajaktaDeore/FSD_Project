import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Subscription = () => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({
        customer: '',
        product: '',
        quantity: ''
    });
    const [editItem, setEditItem] = useState(null);
    const [showModal, setShowModal] = useState(false)

    const loadItems = async () => {
        try {
            const response = await api.get('/subscription/subscription/');
            console.log(response.data)
            setItems(response.data);
        } catch (err) {
            console.error('Error loading subscriptions:', err);
        }
    };

    useEffect(() => {
        loadItems();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewItem(prev => ({ ...prev, [name]: value }));
    };

    const addItem = async (e) => {
    e.preventDefault();

    try {
        const payload = {
            customer: Number(newItem.customer),
            product: Number(newItem.product),
            quantity: Number(newItem.quantity),
        };

        await api.post('/subscription/subscription/', payload);

        setNewItem({ customer: '', product: '', quantity: '' });
        loadItems();

    } catch (err) {
        console.log("STATUS:", err.response?.status);
        console.log("ERROR DATA:", err.response?.data);
    }
};

    const deleteItem = async (id) => {
        try {
            await api.delete(`/subscription/subscription/${id}/`);
            loadItems();
        } catch (err) {
            console.error('Error deleting subscription:', err);
        }
    };

    const updateItem = async (e) => {
    e.preventDefault();

    try {
        const payload = {
            customer: Number(editItem.customer),
            product: Number(editItem.product),
            quantity: Number(editItem.quantity),
            is_active: editItem.is_active
        };

        const response = await api.put(
            `/subscription/subscription/${editItem.id}/`,
            payload
        );

        console.log("Updated:", response.data);

        setShowModal(false);
        setEditItem(null);
        loadItems();

    } catch (err) {
        console.log("UPDATE ERROR:", err.response?.data);
    }
};

    const handleEditClick = (item) => {
    setEditItem(item);
    setShowModal(true);
    };


    return (
        <div className="mt-4">
            <h2>Subscription Management</h2>
            <div className="card mb-4 mt-3">
                <div className="card-body">
                    <h5 className="card-title">Add New Subscription</h5>
                    <form onSubmit={addItem} className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label">CUSTOMER ID</label>
                            <input
                                type="number"
                                className="form-control"
                                name="customer"
                                value={newItem.customer}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">PRODUCT ID</label>
                            <input
                                type="number"
                                className="form-control"
                                name="product"
                                value={newItem.product}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">QUANTITY</label>
                            <input
                                type="number"
                                className="form-control"
                                name="quantity"
                                value={newItem.quantity}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-12">
                            <button type="submit" className="btn btn-success">Add Subscription</button>
                        </div>
                    </form>
                </div>
            </div>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>CUSTOMER ID</th>
                        <th>PRODUCT ID</th>
                        <th>QUANTITY</th>
                        <th>START DATE</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id}>
                            <td>{item.customer}</td>
                            <td>{item.product}</td>
                            <td>{item.quantity}</td>
                            <td>{new Date(item.start_date).toLocaleDateString()}</td>
                            <td>
                                                   <button 
        className="btn btn-primary btn-sm me-2"
        onClick={() => handleEditClick(item)}
    >
        Update
    </button>
                                <button className="btn btn-danger btn-sm" onClick={() => deleteItem(item.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

{editItem && (
  <div
    className="modal d-block"
    tabIndex="-1"
  >
    <div className="modal-dialog">
      <div className="modal-content">

        <div className="modal-header">
          <h5 className="modal-title">Update Subscription</h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => {
              setShowModal(false);
              setEditItem(null);
            }}
          ></button>
        </div>

        <form onSubmit={updateItem}>
          <div className="modal-body">

            <div className="mb-3">
              <label>Customer ID</label>
              <input
                type="number"
                className="form-control"
                value={editItem.customer}
                onChange={(e) =>
                  setEditItem({ ...editItem, customer: e.target.value })
                }
              />
            </div>

            <div className="mb-3">
              <label>Product ID</label>
              <input
                type="number"
                className="form-control"
                value={editItem.product}
                onChange={(e) =>
                  setEditItem({ ...editItem, product: e.target.value })
                }
              />
            </div>

            <div className="mb-3">
              <label>Quantity</label>
              <input
                type="number"
                className="form-control"
                value={editItem.quantity}
                onChange={(e) =>
                  setEditItem({ ...editItem, quantity: e.target.value })
                }
              />
            </div>

            <div className="mb-3">
              <label>Status</label>
              <select
                className="form-control"
                value={editItem.is_active ? "true" : "false"}
                onChange={(e) =>
                  setEditItem({
                    ...editItem,
                    is_active: e.target.value === "true",
                  })
                }
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

          </div>

             <button type="submit" className="btn btn-success">
                            Save Changes
                        </button>
        </form>

      </div>
    </div>
  </div>
)}
        </div>
    );
};

export default Subscription;
