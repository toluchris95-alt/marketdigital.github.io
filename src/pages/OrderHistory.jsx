import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  addDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { StarIcon } from '@heroicons/react/24/solid';

/* -------------------- ⭐ Review Modal Component -------------------- */
const ReviewModal = ({ order, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const { currentUser } = useAuth();

  const handleSubmitReview = async () => {
    if (rating === 0 || comment.trim() === '') {
      alert('Please provide both a rating and a comment before submitting.');
      return;
    }

    try {
      const reviewData = {
        productId: order.productId,
        sellerId: order.sellerId,
        buyerId: currentUser.uid,
        buyerEmail: currentUser.email,
        rating: rating,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      };

      // Add to Firestore
      await addDoc(collection(db, 'reviews'), reviewData);

      // Update order as reviewed
      await updateDoc(doc(db, 'orders', order.id), { hasBeenReviewed: true });

      console.log('✅ Review submitted! Product rating can be updated via Cloud Function.');
      onClose(true);
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">
          Leave a Review for {order.productName}
        </h2>

        {/* Star Rating */}
        <div className="mb-4">
          <p className="font-semibold mb-2 dark:text-gray-200">Your Rating:</p>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`h-8 w-8 cursor-pointer ${
                  star <= (hoverRating || rating)
                    ? 'text-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              />
            ))}
          </div>
        </div>

        {/* Comment Box */}
        <div className="mb-4">
          <label
            htmlFor="comment"
            className="block font-semibold mb-2 dark:text-gray-200"
          >
            Your Comment:
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows="4"
            placeholder="Tell others what you thought about this product..."
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => onClose(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitReview}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------- 🛍️ Order History Page -------------------- */
const OrderHistory = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'orders'),
        where('buyerId', '==', currentUser.uid),
        orderBy('purchaseDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      setOrders(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser]);

  const handleModalClose = (didSubmit) => {
    setSelectedOrder(null);
    if (didSubmit) fetchOrders(); // refresh list after review
  };

  if (loading) return <Spinner />;

  return (
    <div>
      {selectedOrder && <ReviewModal order={selectedOrder} onClose={handleModalClose} />}

      <h1 className="text-3xl font-bold mb-6 dark:text-white">My Order History</h1>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider dark:text-gray-200">
                Product
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider dark:text-gray-200">
                Price
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider dark:text-gray-200">
                Date
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider dark:text-gray-200">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <td className="px-5 py-5 text-sm text-gray-800 dark:text-gray-200">
                    {order.productName}
                  </td>
                  <td className="px-5 py-5 text-sm text-gray-800 dark:text-gray-200">
                    ${order.price.toFixed(2)}
                  </td>
                  <td className="px-5 py-5 text-sm text-gray-600 dark:text-gray-300">
                    {new Date(order.purchaseDate.seconds * 1000).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-5 text-sm">
                    {order.hasBeenReviewed ? (
                      <span className="text-gray-400 italic">Reviewed</span>
                    ) : (
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        Leave Review
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-10 text-gray-500 dark:text-gray-400"
                >
                  You have no past orders.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderHistory;
