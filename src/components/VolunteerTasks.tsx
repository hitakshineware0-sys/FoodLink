import React, { useState, useEffect } from 'react';
import { db, collection, query, where, onSnapshot, updateDoc, doc, handleFirestoreError, OperationType } from '../firebase';
import { VolunteerTask, Donation, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Truck, Package, CheckCircle, MapPin, Phone, Flag } from 'lucide-react';
import { ReportIssueForm } from './ReportIssueForm';
import { StatsService } from '../services/StatsService';

interface VolunteerTasksProps {
  user: UserProfile;
}

export const VolunteerTasks: React.FC<VolunteerTasksProps> = ({ user }) => {
  const [tasks, setTasks] = useState<(VolunteerTask & { donation?: Donation })[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportingItem, setReportingItem] = useState<{ id: string, type: 'donation' | 'user' | 'task' } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'tasks'),
      where('volunteerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VolunteerTask));
      
      // Fetch donation details for each task
      // In a real app, we might denormalize or use a better query structure
      const tasksWithDonations = await Promise.all(taskList.map(async (task) => {
        // This is a bit inefficient but works for a demo
        // Ideally we'd listen to the donation too
        return { ...task };
      }));

      setTasks(tasksWithDonations);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tasks');
    });

    return unsubscribe;
  }, [user.uid]);

  const updateTaskStatus = async (taskId: string, donationId: string, newStatus: any, donationStatus: any) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), { status: newStatus });
      await updateDoc(doc(db, 'donations', donationId), { status: donationStatus });
      
      if (newStatus === 'completed') {
        await StatsService.incrementStats(1);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  if (loading) return <div className="text-center p-8 text-gray-500 font-bold">Loading tasks...</div>;

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
            className="bg-green-500 text-white p-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 mb-4"
          >
            <CheckCircle size={20} />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <Truck className="text-primary" /> My Delivery Tasks
      </h2>

      {tasks.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl text-center border-2 border-dashed border-gray-200">
          <p className="text-gray-500">No active tasks. Claim a donation to start helping!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-6 rounded-2xl shadow-md border border-gray-100"
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  task.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                }`}>
                  {task.status.replace('_', ' ')}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Task ID: {task.id.slice(0, 8)}</span>
                  <button 
                    onClick={() => setReportingItem({ id: task.id, type: 'task' })}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Report Task Issue"
                  >
                    <Flag size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Package className="text-primary shrink-0 mt-1" size={18} />
                  <div>
                    <p className="text-sm font-bold text-gray-800">Pickup Location</p>
                    <p className="text-xs text-gray-500">Donation ID: {task.donationId}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="text-secondary shrink-0 mt-1" size={18} />
                  <div>
                    <p className="text-sm font-bold text-gray-800">Delivery Point</p>
                    <p className="text-xs text-gray-500">Local Community Center</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                {task.status === 'in_progress' && (
                  <>
                    <button
                      onClick={() => updateTaskStatus(task.id, task.donationId, 'completed', 'delivered')}
                      className="flex-1 bg-primary text-white py-2 rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} /> Mark Delivered
                    </button>
                    <button className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">
                      <Phone size={18} />
                    </button>
                  </>
                )}
                {task.status === 'completed' && (
                  <div className="w-full text-center py-2 bg-green-50 text-green-600 rounded-xl font-bold text-sm">
                    Task Completed! Thank you for your service.
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
