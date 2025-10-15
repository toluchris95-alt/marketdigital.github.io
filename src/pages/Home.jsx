import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "../services/firebase";
import ProductCard from "../components/ProductCard";
import Spinner from "../components/Spinner";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const featuredQuery = query(
          collection(db, "products"),
          where("isFeatured", "==", true),
          limit(4)
        );
        const featuredSnapshot = await getDocs(featuredQuery);
        setFeaturedProducts(
          featuredSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );

        const allProductsSnapshot = await getDocs(collection(db, "products"));
        setProducts(
          allProductsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (err) {
        console.error("Error fetching products: ", err);
        setError("Failed to load products. Please check Firebase config.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <Spinner />;
  if (error)
    return (
      <div className="text-center text-red-400 mt-10">
        {error}
      </div>
    );

  return (
    <div className="text-white">
      <h1 className="text-3xl font-bold mb-6">Explore Digital Assets</h1>
      {featuredProducts.length === 0 && products.length === 0 && (
        <p>No products found.</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {featuredProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
};

export default Home;
