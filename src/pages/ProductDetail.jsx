import React, { useState, useEffect } from 'react';
// Add 'Link' to this import line
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
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
        setError('Failed to fetch product data.');
      }
      setLoading(false);
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!currentUser) {
        navigate('/login');
        return;
    }
    addToCart(product);
    setFeedback(`${product.name} has been added to your cart!`);
    setTimeout(() => setFeedback(''), 3000);
  };

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!product) return null;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      <div className="md:flex">
        <div className="md:w-1/2">
          <img className="h-full w-full object-cover" src={product.imageUrl} alt={product.name} />
        </div>
        <div className="p-8 md:w-1/2">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{product.category}</div>
            <h1 className="block mt-1 text-3xl leading-tight font-extrabold">{product.name}</h1>
            <p className="mt-4 text-gray-600 dark:text-gray-300">{product.description}</p>
            <p className="mt-4 text-4xl font-bold">${Number(product.price).toFixed(2)}</p>
            
            <div className="mt-6">
                {feedback && <div className="p-3 mb-4 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{feedback}</div>}
                
                { currentUser && userData?.role === 'Buyer' && userData.uid !== product.sellerId && (
                    <button onClick={handleAddToCart} className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition duration-300">Add to Cart</button>
                )}
                { currentUser && userData?.uid === product.sellerId && (
                    <p className="text-center text-gray-500">This is one of your listings. <Link to="/dashboard" className="text-indigo-500 hover:underline">Manage it here.</Link></p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
