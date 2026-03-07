import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './admin.css';

const Category = () => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({
        name: '',
        description: ''
    });
    const [editItem, setEditItem] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const loadItems = async () => {
        try {
            const response = await api.get('/category/category/');
            console.log(response.data)
            setItems(response.data);
        } catch (err) {
            console.error('Error loading categories:', err);
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
            await api.post('/category/category/', newItem);
            setNewItem({ name: '', description: '' });
            loadItems();
        } catch (err) {
            console.error('Error adding category:', err);
        }
    };

    const deleteItem = async (id) => {
        try {
            await api.delete(`/category/category/${id}/`);
            loadItems();
        } catch (err) {
            console.error('Error deleting category:', err);
        }
    };

   const updateItem = async (e) => {
    e.preventDefault();

    try {
        const response = await api.put(
            `/category/category/${editItem.id}/`,
            editItem
        );

        console.log("Update Success:", response.data);
        alert("category updated successfully ✅");

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
        <div className="admin-page mt-4">
            <h2 className="admin-title">Category Management</h2>
            <p className="admin-subtitle">Organize product categories with clear labels and descriptions.</p>
            <div className="card mb-4 mt-3">
                <div className="card-body">
                    <h5 className="card-title">Add New Category</h5>
                    <form onSubmit={addItem} className="row g-3">
                        <div className="col-md-6">
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
                        <div className="col-md-6">
                            <label className="form-label">DESCRIPTION</label>
                            <input
                                type="text"
                                className="form-control"
                                name="description"
                                value={newItem.description}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-12">
                            <button type="submit" className="btn btn-success">Add Category</button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="admin-table-wrap">
            <table className="table table-striped admin-table">
                <thead>
                    <tr>
                        <th>NAME</th>
                        <th>DESCRIPTION</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
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
            </div>
                 {showModal && editItem && (
    <div className="modal d-block admin-modal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content admin-modal-content">
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

export default Category;
