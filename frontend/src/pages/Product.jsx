import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Product = () => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({
        name: '',
        price: '',
        category: '',
        description: ''
    });
    const [editItem, setEditItem] = useState(null);
    const [showModal, setShowModal] = useState(false)

    const loadItems = async () => {
        try {
            const response = await api.get('/product/product/');
            setItems(response.data);
        } catch (err) {
            console.error('Error loading products:', err);
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
            await api.post('/product/product/', newItem);
            setNewItem({ name: '', price: '', category: '', description: '' });
            loadItems();
        }catch (err) {
            console.log("STATUS:", err.response?.status);
            console.log("ERROR DATA:", err.response?.data);
        } 
    };

    const deleteItem = async (id) => {
        try {
            await api.delete(`/product/product/${id}/`);
            loadItems();
        } catch (err) {
            console.error('Error deleting product:', err);
        }
    };

    const updateItem = async (e) => {
    e.preventDefault();

    try {
        const response = await api.put(
            `/product/product/${editItem.id}/`,
            editItem
        );

        console.log("Update Success:", response.data);
        alert("product updated successfully ✅");

        setShowModal(false);
        setEditItem(null);

        loadItems();  // refresh list

    } catch (err) {
        console.error("REAL ERROR:", err);
    }
   };

    const handleEditClick = (item) => {
    setEditItem(item);
    setShowModal(true);
    };


    return (
        <div className="mt-4">
            <h2>Product Management</h2>
            <div className="card mb-4 mt-3">
                <div className="card-body">
                    <h5 className="card-title">Add New Product</h5>
                    <form onSubmit={addItem} className="row g-3">
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
                            <label className="form-label">PRICE</label>
                            <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                name="price"
                                value={newItem.price}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">CATEGORY ID</label>
                            <input
                                type="number"
                                className="form-control"
                                name="category"
                                value={newItem.category}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">DESCRIPTION</label>
                            <input
                                type="text"
                                className="form-control"
                                name="description"
                                value={newItem.description}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="col-12">
                            <button type="submit" className="btn btn-success">Add Product</button>
                        </div>
                    </form>
                </div>
            </div>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>NAME</th>
                        <th>PRICE</th>
                        <th>CATEGORY</th>
                        <th>DESCRIPTION</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>${parseFloat(item.price).toFixed(2)}</td>
                            <td>{item.category}</td>
                            <td>{item.description}</td>
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
                            <label>Price</label>
                            <input
                                type="number"
                                className="form-control"
                                value={editItem.price}
                                onChange={(e) =>
                                    setEditItem({ ...editItem, price: e.target.value })
                                }
                            />
                        </div>

                        <div className="mb-2">
                            <label>Category</label>
                            <input
                                type="number"
                                className="form-control"
                                value={editItem.category}
                                onChange={(e) =>
                                    setEditItem({ ...editItem, category: e.target.value })
                                }
                            />
                        </div>

                               <div className="mb-3">
    <label className="form-label">Description</label>
    <textarea
        className="form-control"
        rows="3"
        value={editItem.description || ""}
        onChange={(e) =>
            setEditItem({ ...editItem, description: e.target.value })
        }
        required
    ></textarea>
</div>

                        <button type="submit" className="btn btn-success">
                            Save Changes
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

export default Product;
