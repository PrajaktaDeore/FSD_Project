import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Staff = () => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({
        email: '',
        password: '',
        name: '',
        phone: '',
        address: ''
    });
    const [editItem, setEditItem] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const loadItems = async () => {
        try {
            const response = await api.get('/staff/staff/');
            setItems(response.data);
        } catch (err) {
            console.error('Error loading staff:', err);
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
            await api.post('/staff/staff/', newItem);
            setNewItem({ email: '', password: '', name: '', phone: '', address: '' });
            loadItems();
        } catch (err) {
            console.error('Error adding staff:', err);
        }
    };

    const deleteItem = async (id) => {
        try {
            await api.delete(`/staff/staff/${id}/`);
            loadItems();
        } catch (err) {
            console.error('Error deleting staff:', err);
        }
    };

    const updateItem = async (e) => {
    e.preventDefault();
    try {
        await api.put(`/staff/staff/${editItem.id}/`, editItem);

        alert("Staff updated successfully ✅");   // 👈 ADD THIS

        setShowModal(false);
        setEditItem(null);
        loadItems();
    } catch (err) {
        console.error("Error updating staff:", err.response?.data);
    }
    };

    const handleEditClick = (item) => {
    setEditItem(item);
    setShowModal(true);
    };

    return (
        <div className="mt-4">
            <h2>Staff Management</h2>
            <div className="card mb-4 mt-3">
                <div className="card-body">
                    <h5 className="card-title">Add New Staff</h5>
                    <form onSubmit={addItem} className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label">EMAIL</label>
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                value={newItem.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">PASSWORD</label>
                            <input
                                type="password"
                                className="form-control"
                                name="password"
                                value={newItem.password}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">NAME</label>
                            <input
                                type="text"
                                className="form-control"
                                name="name"
                                value={newItem.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">PHONE</label>
                            <input
                                type="text"
                                className="form-control"
                                name="phone"
                                value={newItem.phone}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">ADDRESS</label>
                            <input
                                type="text"
                                className="form-control"
                                name="address"
                                value={newItem.address}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-12">
                            <button type="submit" className="btn btn-success">Add Staff</button>
                        </div>
                    </form>
                </div>
            </div>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>EMAIL</th>
                        <th>NAME</th>
                        <th>PHONE</th>
                        <th>ADDRESS</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id}>
                            <td>{item.email}</td>
                            <td>{item.name}</td>
                            <td>{item.phone}</td>
                            <td>{item.address}</td>
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
            {showModal && editItem && (
    <div className="modal d-block" tabIndex="-1">
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">Update Staff</h5>
                    <button 
                        type="button" 
                        className="btn-close"
                        onClick={() => setShowModal(false)}
                    ></button>
                </div>
                <div className="modal-body">
                    <form onSubmit={updateItem}>
                        <div className="mb-2">
                            <label>Email</label>
                            <input
                                type="email"
                                className="form-control"
                                value={editItem.email}
                                onChange={(e) =>
                                    setEditItem({ ...editItem, email: e.target.value })
                                }
                            />
                        </div>

                        <div className="mb-2">
                            <label>Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editItem.name}
                                onChange={(e) =>
                                    setEditItem({ ...editItem, name: e.target.value })
                                }
                            />
                        </div>

                        <div className="mb-2">
                            <label>Phone</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editItem.phone}
                                onChange={(e) =>
                                    setEditItem({ ...editItem, phone: e.target.value })
                                }
                            />
                        </div>

                        <div className="mb-2">
                            <label>Address</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editItem.address}
                                onChange={(e) =>
                                    setEditItem({ ...editItem, address: e.target.value })
                                }
                            />
                        </div>

                        <button type="submit" className="btn btn-success">
                            Save
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
)}
        </div>
    );
};

export default Staff;
