import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Buyer');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!country) {
      setError('Please select your country.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const userCredential = await signup(email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: email,
        role: role,
        country: country,
        profilePictureUrl: '',
        walletBalance: 0,
      });
      navigate('/');
    } catch (err) {
      setError('Failed to create an account. The email may already be in use.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:border-gray-600" required/>
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:border-gray-600" required/>
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Country</label>
            <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g., United States" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:border-gray-600" required/>
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">I am a:</label>
            <div className="mt-2 flex">
              <label className="inline-flex items-center mr-6"><input type="radio" className="form-radio text-indigo-600" value="Buyer" checked={role === 'Buyer'} onChange={(e) => setRole(e.target.value)} /><span className="ml-2">Buyer</span></label>
              <label className="inline-flex items-center"><input type="radio" className="form-radio text-indigo-600" value="Seller" checked={role === 'Seller'} onChange={(e) => setRole(e.target.value)} /><span className="ml-2">Seller</span></label>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-300 disabled:bg-indigo-400">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-6 text-center">Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Log In</Link></p>
      </div>
    </div>
  );
};

export default SignUp;
