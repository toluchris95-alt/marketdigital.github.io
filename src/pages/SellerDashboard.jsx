import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { PlusIcon, PencilIcon, TrashIcon, StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';

const ProductFormModal = ({ product, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ name: '', description: '', price: '', category: 'Software', imageUrl: '' });

    useEffect(() => {
        if (product) {
            setFormData(product);
        } else {
             setFormData({ name: '', description: '', price: '', category: 'Software', imageUrl: '' });
        }
    }, [product]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">{product ? 'Edit Product' : 'Add New Product'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Product Name" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required/>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required/>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Price" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required/>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                        <option>VPN</option><option>Social Media Account</option><option>Software</option><option>Gaming Account</option>
                    </select>
                    <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="Image URL" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required/>
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
                        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SellerDashboard = () => {
    const { currentUser } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        if (!currentUser) return;
        setLoading(true);
        const q = query(collection(db, 'products'), where('sellerId', '==', currentUser.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, [currentUser]);

    const handleSaveProduct = async (productData) => {
        const dataToSave = { ...productData, price: Number(productData.price) };
        if (editingProduct) {
            const productRef = doc(db, 'products', editingProduct.id);
            await updateDoc(productRef, dataToSave);
        } else {
            await addDoc(collection(db, 'products'), { ...dataToSave, sellerId: currentUser.uid, createdAt: new Date(), isFeatured: false });
        }
        setShowForm(false);
        setEditingProduct(null);
    };
    
    const handleDeleteProduct = async (productId) => {
        if (window.confirm("Are you sure?")) { await deleteDoc(doc(db, 'products', productId)); }
    }
    
    const handleBoostProduct = async (productId, currentStatus) => {
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, { isFeatured: !currentStatus });
    }

    if (loading) return <Spinner />;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Products</h1>
                <button onClick={() => { setEditingProduct(null); setShowForm(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700"><PlusIcon className="h-5 w-5 mr-2" /> Add Product</button>
            </div>
            {showForm && <ProductFormModal product={editingProduct} onSave={handleSaveProduct} onCancel={() => { setShowForm(false); setEditingProduct(null); }} />}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
                <table className="w-full table-auto">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Boost</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Product</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Price</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {products.length > 0 ? products.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4"><button onClick={() => handleBoostProduct(p.id, p.isFeatured)}>{p.isFeatured ? <StarSolid className="h-6 w-6 text-yellow-500"/> : <StarOutline className="h-6 w-6 text-gray-400"/>}</button></td>
                                <td className="px-6 py-4 whitespace-nowrap">{p.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">${Number(p.price).toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><button onClick={() => { setEditingProduct(p); setShowForm(true); }} className="text-indigo-600 hover:text-indigo-900 mr-4"><PencilIcon className="h-5 w-5"/></button><button onClick={() => handleDeleteProduct(p.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5"/></button></td>
                            </tr>
                        )) : ( <tr><td colSpan="4" className="text-center py-6">You have not listed any products yet.</td></tr> )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SellerDashboard;
