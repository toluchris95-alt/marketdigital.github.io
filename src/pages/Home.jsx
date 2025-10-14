import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(1000);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const featuredQuery = query(collection(db, 'products'), where('isFeatured', '==', true), limit(4));
        const featuredSnapshot = await getDocs(featuredQuery);
        setFeaturedProducts(featuredSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        const allProductsSnapshot = await getDocs(collection(db, 'products'));
        setProducts(allProductsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      } catch (error) {
        console.error("Error fetching products: ", error);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = products
    .filter(p => !p.isFeatured) // Exclude featured products from the main list
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(p => category === 'All' || p.category === category)
    .filter(p => Number(p.price) <= priceRange);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  return (
    <div>
      {loading ? ( <Spinner /> ) : (
        <>
            {featuredProducts.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Featured Items</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {featuredProducts.map(product => <ProductCard key={product.id} product={product} />)}
                    </div>
                </div>
            )}

          <h1 className="text-3xl font-bold mb-6">Explore Digital Assets</h1>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <input type="text" placeholder="Search..." className="w-full px-4 py-2 border rounded-lg col-span-1 dark:bg-gray-700 dark:border-gray-600" onChange={(e) => setSearchTerm(e.target.value)} />
              <div className="flex items-center space-x-4 col-span-1">
                <label htmlFor="category" className="text-gray-600 dark:text-gray-300">Category:</label>
                <select id="category" className="form-select rounded-lg dark:bg-gray-700 dark:border-gray-600" onChange={(e) => setCategory(e.target.value)}>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
               <div className="flex flex-col col-span-1">
                 <label htmlFor="price" className="text-gray-600 dark:text-gray-300 mb-1">Max Price: ${priceRange}</label>
                 <input type="range" id="price" min="0" max="1000" value={priceRange} className="w-full" onChange={(e) => setPriceRange(e.target.value)} />
               </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => <ProductCard key={product.id} product={product} />)
              ) : (
                <p>No products found matching your criteria.</p>
              )}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
