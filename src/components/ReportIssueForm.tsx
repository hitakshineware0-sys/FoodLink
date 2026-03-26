import React, { useState } from 'react';
import { db, collection, addDoc, Timestamp, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { AlertTriangle, Send, X } from 'lucide-react';

interface ReportIssueFormProps {
  user: UserProfile;
  relatedId: string;
  relatedType: 'donation' | 'user' | 'task';
  onClose: () => void;
  onSuccess: () => void;
}

export const ReportIssueForm: React.FC<ReportIssueFormProps> = ({ user, relatedId, relatedType, onClose, onSuccess }) => {
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const issueTypes = [
    'Inaccurate Information',
    'Safety Concern',
    'User Misbehavior',
    'Technical Issue',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const issueData = {
        reporterId: user.uid,
        reporterName: user.name,
        relatedId,
        relatedType,
        issueType,
        description,
        status: 'pending',
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'issues'), issueData);
      onSuccess();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'issues');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 max-w-lg w-full relative"
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X size={24} />
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-red-50 rounded-xl text-red-500">
          <AlertTriangle size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Report an Issue</h2>
      </div>

      <p className="text-gray-500 mb-6 text-sm">
        Please provide details about the problem you encountered with this {relatedType}. Our team will review your report as soon as possible.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">Issue Category</label>
          <div className="grid grid-cols-2 gap-2">
            {issueTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setIssueType(type)}
                className={`text-xs p-3 rounded-xl border transition-all font-medium text-left ${
                  issueType === type 
                    ? "border-red-500 bg-red-50 text-red-600 shadow-sm" 
                    : "border-gray-100 text-gray-500 hover:border-gray-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">Detailed Description</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-4 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all min-h-[120px] text-sm"
            placeholder="Please describe the issue in detail..."
          />
        </div>

        <button
          disabled={loading || !issueType || !description}
          type="submit"
          className="w-full bg-red-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-600 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : (
            <>
              <Send size={20} />
              Submit Report
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};
