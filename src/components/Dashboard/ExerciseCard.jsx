
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Plus } from 'lucide-react';
import ExerciseModal from '@/components/Modals/ExerciseModal';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { dispatchUpdate } from '@/lib/syncManager';

function ExerciseCard({ userId, dataVersion }) {
  const [burned, setBurned] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    loadData();
  }, [userId, dataVersion]);

  const loadData = () => {
    const today = new Date().toDateString();
    const logs = JSON.parse(localStorage.getItem(`exercise_logs_${userId}`) || '[]');
    
    // Calculate today's total
    const todayLogs = logs.filter(log => new Date(log.date).toDateString() === today);
    const total = todayLogs.reduce((sum, log) => sum + log.calories_burned, 0);
    setBurned(total);

    // Prepare chart data 
    const data = logs.slice(-10).map((log, i) => ({
      i,
      val: log.calories_burned
    }));
    setChartData(data);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => setShowModal(true)}
        className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 cursor-pointer hover:border-red-500/50 transition-all shadow-xl flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/20 rounded-xl">
              <Activity className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-white font-semibold">Exercícios</h3>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">{burned}</span>
            <span className="text-sm text-slate-400">kcal queimadas hoje</span>
          </div>

          <div className="h-16 w-full opacity-50">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line type="monotone" dataKey="val" stroke="#f87171" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-xl transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Registrar Atividade
          </button>
        </div>
      </motion.div>

      {showModal && (
        <ExerciseModal
          userId={userId}
          onClose={() => {
            setShowModal(false);
            loadData();
            dispatchUpdate();
          }}
        />
      )}
    </>
  );
}

export default ExerciseCard;
