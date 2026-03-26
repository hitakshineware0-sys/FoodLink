import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { LogIn, LogOut, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthProps {
  onUserLoaded: (user: UserProfile | null) => void;
}

const LOCAL_STORAGE_KEY = 'foodlink_user';

export const Auth: React.FC<AuthProps> = ({ onUserLoaded }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        onUserLoaded(user);
      } catch (e) {
        console.error('Failed to parse saved user', e);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, [onUserLoaded]);

  const handleSignIn = () => {
    setError(null);
    // Create a mock user for local login
    const mockUser: UserProfile = {
      uid: 'local-user-' + Math.random().toString(36).substr(2, 9),
      name: 'Guest User',
      email: 'guest@example.com',
      role: 'donor', // Default role
      rating: 5.0,
      totalImpact: 0,
    };
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockUser));
    setCurrentUser(mockUser);
    onUserLoaded(mockUser);
  };

  const handleSignOut = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setCurrentUser(null);
    onUserLoaded(null);
  };

  if (loading) return (
    <div className="flex items-center gap-2 text-gray-400 font-medium animate-pulse">
      <div className="w-4 h-4 bg-gray-200 rounded-full" />
      <span>Loading...</span>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-medium border border-red-100 flex items-center gap-2 max-w-xs text-center">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
      {!currentUser ? (
        <button
          onClick={handleSignIn}
          className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-primary-dark transition-all shadow-md"
        >
          <LogIn size={18} />
          Sign In
        </button>
      ) : (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              {currentUser.name.charAt(0)}
            </div>
            <span className="hidden sm:inline">{currentUser.name}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-all font-medium"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};
