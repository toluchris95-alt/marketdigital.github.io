// Updated ProductDetail with the Buy Now button added

import { purchaseProduct } from "../services/transactions";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Spinner from '../components/Spinner';
import { StarIcon } from '@heroicons/react/24/solid';

/* ----------------------- ⭐ Reviews Component ----------------------- */
const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(
          collection(db, 'reviews'),
          where('productId', '==', productId),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        setReviews(querySnapshot.docs.map((doc) => doc.data()));
      } catch (err) {
        console.error('Failed to load reviews:', err);
      }
      setLoading(false);
    };
    fetchReviews();
  }, [productId]);

  if (loading) return <Spinner />;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold dark:text-white">Customer Reviews</h2>
      {reviews.length > 0 ? (
        <div className="space-y-6 mt-4">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="border-t border-gray-200 dark:border-gray-700 pt-4"
            >
              <div className="flex items-center mb-1">
                {[...Array(review.rating)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                ))}
                {[...Array(5 - review.rating)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                ))}
                <p className="ml-2 font-semibold dark:text-gray-200">
                  {review.buyerEmail.split('@')[0]}
                </p>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          No reviews yet. Be the first to leave one!
        </p>
      )}
    </div>
  );
};

/* ----------------------- 🛒 Product Detail ----------------------- */
const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const { currentUser, userData } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [buying, setBuying] = useState(false);

  // ✅ Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Failed to fetch product data.');
      }
      setLoading(false);
    };
    fetchProduct();
  }, [productId]);

  // ✅ Add to cart
  const handleAddToCart = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    addToCart(product);
    setFeedback(`${product.name} has been added to your cart!`);
    setTimeout(() => setFeedback(''), 3000);
  };

  // ✅ Start or open chat
  const handleMessageSeller = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const sellerId = product.sellerId;
    const buyerId = currentUser.uid;

    try {
      const conversationsRef = collection(db, 'conversations');
      const q = query(conversationsRef, where('participants', 'array-contains', buyerId));
      const querySnapshot = await getDocs(q);

      let existingConvo = null;
      querySnapshot.forEach((docSnap) => {
        if (docSnap.data().participants.includes(sellerId)) {
          existingConvo = { id: docSnap.id, ...docSnap.data() };
        }
      });

      if (existingConvo) {
        navigate(`/messages/${existingConvo.id}`);
      } else {
        const newConvoRef = await addDoc(conversationsRef, {
          participants: [buyerId, sellerId],
          participantInfo: {
            [buyerId]: { email: currentUser.email },
            [sellerId]: { email: product.sellerEmail || 'Seller' },
          },
          lastMessage: '',
          updatedAt: serverTimestamp(),
        });
        navigate(`/messages/${newConvoRef.id}`);
      }
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setFeedback('Unable to start chat. Try again later.');
    }
  };

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!product) return null;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden max-w-5xl mx-auto my-10">
        <div className="md:flex">
          {/* --- Product Image --- */}
          <div className="md:w-1/2">
            <img
              className="h-full w-full object-cover"
              src={product.imageUrl}
              alt={product.name}
            />
          </div>

          {/* --- Product Info --- */}
          <div className="p-8 md:w-1/2">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
              {product.category}
            </div>
            <h1 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              {product.name}
            </h1>
            <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
              {product.description}
            </p>
            <p className="mt-4 text-4xl font-bold text-gray-900 dark:text-white">
              ${Number(product.price).toFixed(2)}
            </p>

            {/* --- Feedback / Buttons --- */}
            <div className="mt-6 space-y-3">
              {feedback && (
                <div className="p-3 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green
