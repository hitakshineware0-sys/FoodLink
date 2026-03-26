import React, { useState, useEffect } from 'react';
import { db, collection, query, where, onSnapshot, updateDoc, doc, addDoc, Timestamp, handleFirestoreError, OperationType } from '../firebase';
import { Donation, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Clock, User, CheckCircle, AlertTriangle, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ReportIssueForm } from './ReportIssueForm';
import { StatsService } from '../services/StatsService';

interface NearbyListingsProps {
  user: UserProfile;
}

export const NearbyListings: React.FC<NearbyListingsProps> = ({ user }) => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [reportingItem, setReportingItem] = useState<{ id: string, type: 'donation' | 'user' | 'task' } | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'donations'),
      where('status', '==', 'available')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donation));
      // Filter out expired food locally for real-time feel
      const validDocs = docs.filter(d => d.expiryTime.toDate() > new Date());
      setDonations(validDocs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'donations');
    });

    return unsubscribe;
  }, []);

  const handleClaim = async (donation: Donation) => {
    try {
      // Update donation status
      await updateDoc(doc(db, 'donations', donation.id), {
        status: 'claimed'
      });

      // Create a task for volunteers if needed, or just mark as claimed
      if (user.role === 'volunteer') {
        await addDoc(collection(db, 'tasks'), {
          donationId: donation.id,
          volunteerId: user.uid,
          status: 'in_progress',
          createdAt: Timestamp.now()
        });
        await StatsService.incrementVolunteers();
      } else {
        // If receiver claims directly, it's considered saved/completed
        await StatsService.incrementStats(1);
      }
      
      setSuccessMessage('Food claimed successfully! Please proceed for pickup.');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `donations/${donation.id}`);
    }
  };

  if (loading) return <div className="text-center p-8 text-gray-500 font-bold">Finding nearby food...</div>;

  return (
    <div className="space-y-6 relative">
      <AnimatePresence>
        {reportingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <ReportIssueForm 
              user={user}
              relatedId={reportingItem.id}
              relatedType={reportingItem.type}
              onClose={() => setReportingItem(null)}
              onSuccess={() => {
                setReportingItem(null);
                setSuccessMessage('Issue reported successfully. Thank you for helping us stay safe!');
                setTimeout(() => setSuccessMessage(null), 5000);
              }}
            />
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-500 text-white p-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
          >
            <CheckCircle size={20} />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Nearby Food Listings</h2>
        <span className="text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
          {donations.length} Available
        </span>
      </div>

      {donations.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl text-center border-2 border-dashed border-gray-200">
          <p className="text-gray-500">No active donations nearby. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((donation) => (
            <motion.div
              key={donation.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{donation.foodType}</h3>
                  <span className="bg-secondary/10 text-secondary text-xs font-bold px-2 py-1 rounded uppercase">
                    {donation.quantity}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-gray-600 text-sm">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-primary" />
                      <span>Donor: {donation.donorName}</span>
                    </div>
                    <button 
                      onClick={() => setReportingItem({ id: donation.donorId, type: 'user' })}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Report User"
                    >
                      <Flag size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <MapPin size={16} className="text-primary" />
                    <span className="truncate">{donation.location.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Clock size={16} className="text-primary" />
                    <span className={donation.expiryTime.toDate() < new Date(Date.now() + 3600000) ? "text-red-500 font-bold" : ""}>
                      Expires in {formatDistanceToNow(donation.expiryTime.toDate())}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl mb-6 relative group/safety">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
                    <AlertTriangle size={12} /> Safety Tip
                  </p>
                  <p className="text-xs text-gray-600 italic">{donation.safetyTips}</p>
                  <button 
                    onClick={() => setReportingItem({ id: donation.id, type: 'donation' })}
                    className="absolute top-2 right-2 opacity-0 group-hover/safety:opacity-100 text-gray-300 hover:text-red-500 transition-all"
                    title="Report Donation Issue"
                  >
                    <Flag size={12} />
                  </button>
                </div>

                <button
                  onClick={() => handleClaim(donation)}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  Claim Food
                </button>
              </div>
              <div className="bg-primary/5 px-6 py-2 border-t border-gray-50 flex justify-between items-center">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">2.4 km away</span>
                <span className="text-[10px] text-gray-400">Posted {formatDistanceToNow(donation.createdAt.toDate())} ago</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
