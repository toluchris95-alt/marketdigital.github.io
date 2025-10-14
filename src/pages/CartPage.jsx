import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { runTransaction, collection, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/24/outline';

const CartPage = () => {
    const { cartItems, removeFromCart, clearCart, cartTotal } = useCart();
    const { currentUser, userData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleCheckout = async () => {
        setLoading(true); setError(''); setSuccess('');
        if (userData.walletBalance < cartTotal) { setError('Insufficient funds.'); setLoading(false); return; }

        try {
            await runTransaction(db, async (transaction) => {
                const buyerDocRef = doc(db, "users", currentUser.uid);
                const buyerDoc = await transaction.get(buyerDocRef);
                if (!buyerDoc.exists() || buyerDoc.data().walletBalance < cartTotal) throw new Error("Insufficient funds.");
                
                const sellerRefs = {};
                for (const item of cartItems) {
                    if (!sellerRefs[item.sellerId]) { sellerRefs[item.sellerId] = doc(db, "users", item.sellerId); }
                }
                const sellerDocs = await Promise.all(Object.values(sellerRefs).map(ref => transaction.get(ref)));
                const sellerDataMap = sellerDocs.reduce((acc, docSnap) => {
                    if (docSnap.exists()) acc[docSnap.id] = docSnap.data();
                    return acc;
                }, {});

                transaction.update(buyerDocRef, { walletBalance: buyerDoc.data().walletBalance - cartTotal });

                for (const item of cartItems) {
                    const sellerRef = sellerRefs[item.sellerId];
                    const sellerData = sellerDataMap[item.sellerId];
                    if (!sellerData) throw new Error(`Seller for item ${item.name} not found.`);
                    
                    transaction.update(sellerRef, { walletBalance: sellerData.walletBalance + Number(item.price) });
                    sellerDataMap[item.sellerId].walletBalance += Number(item.price); // Update map for multiple items from same seller
                    
                    const orderRef = doc(collection(db, "orders"));
                    transaction.set(orderRef, { buyerId: currentUser.uid, sellerId: item.sellerId, productId: item.id, productName: item.name, price: Number(item.price), purchaseDate: new Date() });
                }
            });
            setSuccess('Checkout successful! Check your order history.');
            clearCart();
        } catch (e) { setError(`Checkout failed: ${e.message}`); }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
            {error && <p className="p-4 mb-4 bg-red-100 text-red-700 rounded-md">{error}</p>}
            {success && <p className="p-4 mb-4 bg-green-100 text-green-700 rounded-md">{success}</p>}
            
            {cartItems.length === 0 ? (
                <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                    <p>{success ? success : 'Your cart is empty.'}</p>
                    <Link to="/" className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700">Continue Shopping</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <div className="space-y-4">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between border-b dark:border-gray-700 pb-4">
                                    <div className="flex items-center"><img src={item.imageUrl} alt={item.name} className="h-16 w-16 object-cover rounded-md mr-4"/><div><p className="font-semibold">{item.name}</p><p className="text-sm text-gray-500 dark:text-gray-400">${Number(item.price).toFixed(2)}</p></div></div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="h-6 w-6"/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="md:col-span-1">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                            <div className="flex justify-between font-bold text-lg border-t dark:border-gray-700 pt-2 mt-2"><span>Total</span><span>${cartTotal.toFixed(2)}</span></div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Your balance: ${userData?.walletBalance.toFixed(2)}</p>
                            <button onClick={handleCheckout} disabled={loading} className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">{loading ? 'Processing...' : 'Checkout'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
