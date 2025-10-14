import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';

const ProfilePage = () => {
    const { currentUser, userData, auth } = useAuth();
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [profilePicUrl, setProfilePicUrl] = useState(userData?.profilePictureUrl || '');

    const handleUpdateProfilePic = async (e) => {
        e.preventDefault();
        setLoading(true); setMessage(''); setError('');
        try {
            await updateDoc(doc(db, 'users', currentUser.uid), { profilePictureUrl: profilePicUrl });
            setMessage('Profile picture updated!');
        } catch (err) { setError('Failed to update profile picture.'); }
        setLoading(false);
    };

    const handlePasswordReset = async () => {
        setMessage(''); setError('');
        try {
            await sendPasswordResetEmail(auth, currentUser.email);
            setMessage('Password reset email sent!');
        } catch (err) { setError('Failed to send password reset email.'); }
    };
    
    const handleTopUp = async (e) => {
        e.preventDefault();
        const amount = parseFloat(topUpAmount);
        if (isNaN(amount) || amount <= 0) { setError('Please enter a valid amount.'); return; }
        setLoading(true); setMessage(''); setError('');
        try {
            const newBalance = (userData.walletBalance || 0) + amount;
            await updateDoc(doc(db, 'users', currentUser.uid), { walletBalance: newBalance });
            setMessage(`$${amount.toFixed(2)} added to your wallet! Refresh to see new balance.`);
            setTopUpAmount('');
        } catch (error) { setError('Failed to top up wallet.'); }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">My Profile & Wallet</h1>
            {message && <div className="p-3 bg-green-100 text-green-800 rounded">{message}</div>}
            {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Profile Information</h2>
                    <p><strong>Email:</strong> {currentUser?.email}</p>
                    <p><strong>Role:</strong> {userData?.role}</p>
                    <p><strong>Country:</strong> {userData?.country}</p>
                    <form onSubmit={handleUpdateProfilePic} className="mt-4 space-y-2">
                        <label className="block text-sm font-medium">Profile Picture URL</label>
                        <input type="text" value={profilePicUrl} onChange={(e) => setProfilePicUrl(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">Update Picture</button>
                    </form>
                    <button onClick={handlePasswordReset} className="mt-4 w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded-md">Send Password Reset Email</button>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold">My Wallet</h2>
                    <p className="text-4xl font-bold text-indigo-600 my-2">${userData?.walletBalance?.toFixed(2) || '0.00'}</p>
                    <form onSubmit={handleTopUp} className="mt-4">
                        <label className="block font-medium">Top Up Wallet (Simulated)</label>
                        <div className="flex items-center mt-2">
                            <input type="number" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} placeholder="Amount" className="w-full px-3 py-2 border rounded-l-lg dark:bg-gray-700 dark:border-gray-600" />
                            <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700">Add Funds</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
