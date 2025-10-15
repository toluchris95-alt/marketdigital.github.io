import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, addDoc, orderBy, serverTimestamp, doc } from 'firebase/firestore';
import { ArrowLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import Spinner from '../components/Spinner';

const MessagesPage = () => {
    const { currentUser } = useAuth();
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [activeConvo, setActiveConvo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Fetch all conversations for the current user
    useEffect(() => {
        if (!currentUser) return;
        const q = query(collection(db, "conversations"), where("participants", "array-contains", currentUser.uid), orderBy("updatedAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const convos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setConversations(convos);
            if (conversationId && !activeConvo) {
                setActiveConvo(convos.find(c => c.id === conversationId));
            } else if (!conversationId && convos.length > 0 && !activeConvo) {
                // Default to the first conversation if none is selected
                navigate(`/messages/${convos[0].id}`, { replace: true });
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [currentUser, conversationId, navigate, activeConvo]);
    
    // Fetch messages for the active conversation
    useEffect(() => {
        if (!activeConvo) {
            setMessages([]);
            return;
        };
        const messagesRef = collection(db, "conversations", activeConvo.id, "messages");
        const q = query(messagesRef, orderBy("timestamp"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => doc.data()));
        });
        return () => unsubscribe();
    }, [activeConvo]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !activeConvo) return;
        
        await addDoc(collection(db, "conversations", activeConvo.id, "messages"), {
            text: newMessage,
            senderId: currentUser.uid,
            timestamp: serverTimestamp(),
        });

        // Update the conversation's last message and timestamp for sorting
        await addDoc(doc(db, "conversations", activeConvo.id), { 
            lastMessage: newMessage,
            updatedAt: serverTimestamp() 
        });

        setNewMessage('');
    };

    if (loading) return <Spinner />;

    return (
        <div className="flex h-[calc(100vh-150px)] bg-white dark:bg-gray-800 shadow-lg rounded-lg">
            {/* Conversations List */}
            <div className={`w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col ${activeConvo ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b dark:border-gray-700 font-bold text-lg">Your Conversations</div>
                <ul className="overflow-y-auto">
                    {conversations.map(convo => {
                        const recipientId = convo.participants.find(p => p !== currentUser.uid);
                        const otherUserEmail = convo.participantInfo?.[recipientId]?.email || 'User'; // Fallback
                        return (
                            <li key={convo.id} onClick={() => { setActiveConvo(convo); navigate(`/messages/${convo.id}`); }}
                                className={`p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${activeConvo?.id === convo.id ? 'bg-indigo-100 dark:bg-indigo-900/50' : ''}`}>
                                <p className="font-semibold truncate">{otherUserEmail}</p>
                                <p className="text-sm text-gray-500 truncate">{convo.lastMessage}</p>
                            </li>
                        )
                    })}
                </ul>
            </div>

            {/* Chat Window */}
            <div className={`w-full md:w-2/3 flex flex-col ${activeConvo ? 'flex' : 'hidden md:flex'}`}>
                {activeConvo ? (
                    <>
                        <div className="p-4 border-b dark:border-gray-700 flex items-center">
                            <button onClick={() => setActiveConvo(null)} className="md:hidden mr-4"><ArrowLeftIcon className="h-6 w-6" /></button>
                            <p className="font-bold">{activeConvo.participantInfo?.[activeConvo.participants.find(p => p !== currentUser.uid)]?.email}</p>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                           {messages.map((msg, index) => (
                               <div key={index} className={`flex ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}>
                                   <div className={`p-3 rounded-lg max-w-lg ${msg.senderId === currentUser.uid ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'}`}>
                                       {msg.text}
                                   </div>
                               </div>
                           ))}
                           <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700 flex items-center space-x-3">
                            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                                   className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600" placeholder="Type a message..." />
                            <button type="submit" className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 disabled:bg-indigo-400" disabled={!newMessage.trim()}><PaperAirplaneIcon className="h-6 w-6"/></button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Select a conversation to start chatting.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesPage;
