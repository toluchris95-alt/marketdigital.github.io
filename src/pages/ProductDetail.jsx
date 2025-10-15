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
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Spinner from '../components/Spinner';

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const { currentUser, userData } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // ✅ Fetch product data
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
        console.error(err);
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

  // ✅ Start / open message with seller
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
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setFeedback('Unable to start chat. Try again later.');
    }
  };

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!product) return null;

  return (
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

          {/* --- Actions --- */}
          <div className="mt-6 space-y-3">
            {feedback && (
              <div className="p-3 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {feedback}
              </div>
            )}

            {/* 🟢 Buyer (not seller) */}
            {currentUser && userData?.role === 'Buyer' && userData.uid !== product.sellerId && (
              <>
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition duration-300"
                >
                  Add to Cart
                </button>

                <button
                  onClick={handleMessageSeller}
                  className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300"
                >
                  Message Seller
                </button>
              </>
            )}

            {/* 🟣 Seller’s own product */}
            {currentUser && userData?.uid === product.sellerId && (
              <p className="text-center text-gray-500 dark:text-gray-400">
                This is one of your listings.{' '}
                <Link
                  to="/dashboard"
                  className="text-indigo-500 hover:underline dark:text-indigo-400"
                >
                  Manage it here.
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
