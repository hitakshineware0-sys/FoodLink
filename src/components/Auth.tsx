import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider, signInWithPopup, signOut, doc, getDoc, setDoc, handleFirestoreError, OperationType } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { UserProfile, UserRole } from '../types';
import { LogIn, User as UserIcon, LogOut, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthProps {
  onUserLoaded: (user: UserProfile | null) => void;
}

export const Auth: React.FC<AuthProps> = ({ onUserLoaded }) => {
  const [loading, setLoading] = useState(true);
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const [tempUser, setTempUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setError(null);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            onUserLoaded(userDoc.data() as UserProfile);
          } else {
            setTempUser(user);
            setShowRoleSelect(true);
          }
        } catch (err: any) {
          console.error('Auth check error:', err);
          // If it's a permission error, it might be because the user doc doesn't exist yet or rules are strict
          if (err.message?.includes('Missing or insufficient permissions')) {
            setTempUser(user);
            setShowRoleSelect(true);
          } else {
            setError('Failed to load user profile. Please try again.');
          }
        }
      } else {
        onUserLoaded(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [onUserLoaded]);

  const handleSignIn = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Sign in error:', err);
      if (err.code === 'auth/popup-blocked') {
        setError('Sign-in popup was blocked by your browser. Please allow popups for this site.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for Firebase Authentication. Please add it in the Firebase Console.');
      } else {
        setError('Failed to sign in. Please try again.');
      }
    }
  };

  const handleRoleSelect = async (role: UserRole) => {
    if (!tempUser) return;
    const newUser: UserProfile = {
      uid: tempUser.uid,
      name: tempUser.displayName || 'Anonymous',
      email: tempUser.email || '',
      role,
      rating: 5.0,
      totalImpact: 0,
    };
    try {
      await setDoc(doc(db, 'users', tempUser.uid), newUser);
      onUserLoaded(newUser);
      setShowRoleSelect(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${tempUser.uid}`);
    }
  };

  if (loading) return (
    <div className="flex items-center gap-2 text-gray-400 font-medium animate-pulse">
      <div className="w-4 h-4 bg-gray-200 rounded-full" />
      <span>Loading...</span>
    </div>
  );

  if (showRoleSelect) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-2xl max-w-md w-full shadow-xl"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-primary">Choose Your Role</h2>
          <div className="grid grid-cols-2 gap-4">
            {(['donor', 'receiver', 'volunteer', 'ngo'] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => handleRoleSelect(role)}
                className="p-4 border-2 border-gray-100 rounded-xl hover:border-primary hover:bg-primary/5 transition-all capitalize font-medium"
              >
                {role}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-medium border border-red-100 flex items-center gap-2 max-w-xs text-center">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
      {!auth.currentUser ? (
        <button
          onClick={handleSignIn}
          className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-primary-dark transition-all shadow-md"
        >
          <LogIn size={18} />
          Sign In
        </button>
      ) : (
        <button
          onClick={() => signOut(auth)}
          className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-all font-medium"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      )}
    </div>
  );
};
