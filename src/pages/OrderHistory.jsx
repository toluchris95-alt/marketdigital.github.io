import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const OrderHistory = () => {
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!currentUser) return;
            setLoading(true);
            const q = query(collection(db, "orders"), where("buyerId", "==", currentUser.uid), orderBy("purchaseDate", "desc"));
            const querySnapshot = await getDocs(q);
            setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        };
        fetchOrders();
    }, [currentUser]);

    if (loading) return <Spinner />;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">My Order History</h1>
             <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase">Product Name</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase">Price</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length > 0 ? orders.map(order => (
                             <tr key={order.id} className="border-b border-gray-200 dark:border-gray-700">
                                <td className="px-5 py-5 text-sm">{order.productName}</td>
                                <td className="px-5 py-5 text-sm">${order.price.toFixed(2)}</td>
                                <td className="px-5 py-5 text-sm">{new Date(order.purchaseDate.seconds * 1000).toLocaleDateString()}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="3" className="text-center py-10">You have no past orders.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderHistory;
