import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider, signInWithPopup, signOut, doc, getDoc, setDoc, handleFirestoreError, OperationType } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { UserProfile, UserRole } from '../types';
import { LogIn, User as UserIcon, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthProps {
  onUserLoaded: (user: UserProfile | null) => void;
}

export const Auth: React.FC<AuthProps> = ({ onUserLoaded }) => {
  const [loading, setLoading] = useState(true);
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const [tempUser, setTempUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            onUserLoaded(userDoc.data() as UserProfile);
          } else {
            setTempUser(user);
            setShowRoleSelect(true);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        }
      } else {
        onUserLoaded(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [onUserLoaded]);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Sign in error:', error);
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

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;

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
    <div className="flex items-center gap-4">
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
