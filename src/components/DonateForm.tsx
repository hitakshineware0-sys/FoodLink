import React, { useState, useEffect } from 'react';
import { db, collection, addDoc, Timestamp, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { Utensils, Clock, MapPin, ShieldCheck, Send, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { StatsService } from '../services/StatsService';

interface DonateFormProps {
  user: UserProfile;
  onSuccess: () => void;
}

export const DonateForm: React.FC<DonateFormProps> = ({ user, onSuccess }) => {
  const [foodType, setFoodType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryHours, setExpiryHours] = useState(4);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [safetyTips, setSafetyTips] = useState('');
  const [isGeneratingTips, setIsGeneratingTips] = useState(false);
  const [tipsError, setTipsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSafetyTips = async () => {
      if (foodType.length < 3) {
        setSafetyTips('');
        return;
      }

      setIsGeneratingTips(true);
      setTipsError(null);
      try {
        const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `Provide 1-2 concise, practical food safety tips for donating ${foodType}. Focus on storage and reheating.`,
            systemInstruction: "You are a food safety expert. Provide brief, actionable advice for community food sharing. Keep it under 150 characters."
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch safety tips');
        }

        const data = await response.json();
        setSafetyTips(data.text);
      } catch (error: any) {
        console.error('Error fetching safety tips:', error);
        setTipsError('Could not generate safety tips. Please follow standard food safety guidelines.');
      } finally {
        setIsGeneratingTips(false);
      }
    };

    const debounceTimer = setTimeout(fetchSafetyTips, 1000);
    return () => clearTimeout(debounceTimer);
  }, [foodType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + expiryHours);

      const donationData = {
        donorId: user.uid,
        donorName: user.name,
        foodType,
        quantity,
        location: {
          lat: 0, // Mock lat/lng for now
          lng: 0,
          address,
        },
        expiryTime: Timestamp.fromDate(expiryDate),
        status: 'available',
        safetyTips: safetyTips || 'Ensure food is stored in clean containers and kept at safe temperatures.',
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'donations'), donationData);
      onSuccess();
      setFoodType('');
      setQuantity('');
      setAddress('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'donations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <Utensils size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Donate Leftover Food</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              Food Type (e.g., Rice, Curry)
            </label>
            <input
              required
              type="text"
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="What are you donating?"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">Quantity</label>
            <input
              required
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="e.g., 5-6 servings"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            <MapPin size={16} /> Pickup Address
          </label>
          <input
            required
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            placeholder="Where can it be picked up?"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            <Clock size={16} /> Safe Consumption Time (Hours)
          </label>
          <div className="flex gap-4">
            {[2, 4, 6, 12].map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setExpiryHours(h)}
                className={cn(
                  "flex-1 py-2 rounded-xl border-2 transition-all font-medium",
                  expiryHours === h 
                    ? "border-primary bg-primary/5 text-primary" 
                    : "border-gray-100 text-gray-500 hover:border-gray-200"
                )}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>

        {foodType && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 bg-accent/10 rounded-xl border border-accent/20 flex gap-3"
          >
            <ShieldCheck className="text-secondary shrink-0" size={20} />
            <div className="flex-grow">
              <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">AI Safety Suggestion</p>
              {isGeneratingTips ? (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Loader2 size={14} className="animate-spin" />
                  Generating tips...
                </div>
              ) : tipsError ? (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle size={14} />
                  {tipsError}
                </div>
              ) : (
                <p className="text-sm text-gray-700">{safetyTips || 'Enter food type to see safety tips.'}</p>
              )}
            </div>
          </motion.div>
        )}

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-dark transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Posting...' : (
            <>
              <Send size={20} />
              Post Donation
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};
