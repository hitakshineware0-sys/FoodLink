import React, { useState, useEffect } from 'react';
import { db, collection, query, orderBy, limit, onSnapshot, doc, handleFirestoreError, OperationType } from '../firebase';
import { DailyStats, GlobalStats } from '../types';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area 
} from 'recharts';
import { ArrowLeft, Download, Calendar, TrendingUp, Leaf, Users, Heart } from 'lucide-react';
import { format } from 'date-fns';

interface FullImpactReportProps {
  onBack: () => void;
}

export const FullImpactReport: React.FC<FullImpactReportProps> = ({ onBack }) => {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch global stats
    const unsubscribeGlobal = onSnapshot(doc(db, 'stats', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setGlobalStats(docSnap.data() as GlobalStats);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'stats/global');
    });

    // Fetch last 30 days of stats
    const q = query(
      collection(db, 'dailyStats'),
      orderBy('date', 'desc'),
      limit(30)
    );

    const unsubscribeDaily = onSnapshot(q, (snapshot) => {
      const stats = snapshot.docs.map(doc => doc.data() as DailyStats).reverse();
      setDailyStats(stats);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'dailyStats');
    });

    return () => {
      unsubscribeGlobal();
      unsubscribeDaily();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Community Impact Report</h1>
            <p className="text-gray-500">Detailed breakdown of our collective efforts</p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg">
          <Download size={20} />
          Export Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Meals Saved', value: globalStats?.mealsSaved || 0, icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
          { label: 'People Fed', value: globalStats?.peopleFed || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'CO2 Offset (kg)', value: globalStats?.co2Reduced.toFixed(1) || 0, icon: Leaf, color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Active Volunteers', value: globalStats?.activeVolunteers || 0, icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Meals Trend */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar size={20} className="text-primary" />
              Daily Meals Saved
            </h3>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last 30 Days</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyStats}>
                <defs>
                  <linearGradient id="colorMeals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickFormatter={(val) => format(new Date(val), 'MMM d')}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelFormatter={(val) => format(new Date(val), 'MMMM d, yyyy')}
                />
                <Area type="monotone" dataKey="mealsSaved" stroke="#22c55e" fillOpacity={1} fill="url(#colorMeals)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CO2 Reduction Trend */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Leaf size={20} className="text-secondary" />
              Environmental Impact (CO2)
            </h3>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cumulative kg</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickFormatter={(val) => format(new Date(val), 'MMM d')}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="co2Reduced" stroke="#f97316" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800">Raw Impact Data</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Meals Saved</th>
                <th className="px-6 py-4">People Fed</th>
                <th className="px-6 py-4">CO2 Reduced (kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dailyStats.slice().reverse().map((stat) => (
                <tr key={stat.date} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{format(new Date(stat.date), 'MMMM d, yyyy')}</td>
                  <td className="px-6 py-4 text-gray-600">{stat.mealsSaved}</td>
                  <td className="px-6 py-4 text-gray-600">{stat.peopleFed}</td>
                  <td className="px-6 py-4 text-gray-600">{stat.co2Reduced.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
