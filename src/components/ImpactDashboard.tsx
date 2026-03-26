import React, { useState, useEffect } from 'react';
import { db, doc, onSnapshot, handleFirestoreError, OperationType } from '../firebase';
import { GlobalStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion, useSpring, useTransform, animate } from 'motion/react';
import { Heart, Users, Leaf, TrendingUp, ChevronRight, RefreshCw } from 'lucide-react';

const COLORS = ['#22c55e', '#f97316', '#facc15', '#3b82f6'];

const Counter = ({ value, suffix = "" }: { value: number, suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 1.5,
      onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
    });
    return () => controls.stop();
  }, [value]);

  return <span>{displayValue.toLocaleString()}{suffix}</span>;
};

interface ImpactDashboardProps {
  onViewFullReport: () => void;
}

export const ImpactDashboard: React.FC<ImpactDashboardProps> = ({ onViewFullReport }) => {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'stats', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setStats(docSnap.data() as GlobalStats);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'stats/global');
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Meals Saved', value: stats?.mealsSaved || 0, icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'People Fed', value: stats?.peopleFed || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'CO2 Reduced', value: stats?.co2Reduced || 0, icon: Leaf, color: 'text-green-500', bg: 'bg-green-50', suffix: 'kg' },
    { label: 'Active Volunteers', value: stats?.activeVolunteers || 0, icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-full animate-pulse">
          <RefreshCw size={12} className="animate-spin-slow" />
          Updated in real-time
        </div>
        <button 
          onClick={onViewFullReport}
          className="text-sm font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-1 group"
        >
          View Full Report
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-3xl font-bold text-gray-800">
              <Counter value={stat.value} suffix={stat.suffix} />
            </h3>
            <div className={`absolute bottom-0 left-0 h-1 ${stat.bg.replace('bg-', 'bg-').replace('-50', '-500')} w-0 group-hover:w-full transition-all duration-500`} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6 text-gray-800">Impact Overview</h3>
          <p className="text-gray-500 mb-8">Every donation counts. Our community is growing stronger and more sustainable every day through shared efforts.</p>
          <div className="space-y-4">
            {statCards.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${stat.bg} ${stat.color} rounded-lg`}>
                    <stat.icon size={16} />
                  </div>
                  <span className="font-medium text-gray-700">{stat.label}</span>
                </div>
                <span className="font-bold text-gray-900">
                  {stat.value.toLocaleString()}{stat.suffix}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center space-y-6">
          <div className="p-6 bg-secondary/10 rounded-full text-secondary">
            <Leaf size={48} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Environmental Hero</h3>
          <p className="text-gray-600 max-w-xs">
            By saving <span className="text-primary font-bold">{stats?.mealsSaved || 0} meals</span>, we've prevented <span className="text-secondary font-bold">{stats?.co2Reduced.toFixed(1) || 0}kg of CO2</span> from entering the atmosphere.
          </p>
          <button 
            onClick={onViewFullReport}
            className="bg-secondary text-white px-8 py-3 rounded-xl font-bold hover:bg-secondary-dark transition-all shadow-lg"
          >
            See Detailed Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
