import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/solid';

const ProductCard = ({ product }) => {
  return (
    <Link to={`/product/${product.id}`} className="block group">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform transition duration-500 hover:scale-105 relative">
            {product.isFeatured && (
                <div className="absolute top-2 right-2 bg-yellow-400 text-white p-1 rounded-full z-10">
                    <StarIcon className="h-5 w-5"/>
                </div>
            )}
            <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate">{product.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{product.category}</p>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">${Number(product.price).toFixed(2)}</p>
            </div>
        </div>
    </Link>
  );
};

export default ProductCard;
