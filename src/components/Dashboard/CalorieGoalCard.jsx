
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Utensils, Zap } from 'lucide-react';
import CalorieGoalModal from '@/components/Modals/CalorieGoalModal';
import { dispatchUpdate } from '@/lib/syncManager';

function CalorieGoalCard({ userId, dataVersion }) {
  const [consumed, setConsumed] = useState(0);
  const [goal, setGoal] = useState(2000);
  const [burned, setBurned] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId, dataVersion]);

  const loadData = () => {
    const today = new Date().toDateString();
    
    // Food Logs
    const foodLogs = JSON.parse(localStorage.getItem(`food_logs_${userId}`) || '[]');
    const todayFood = foodLogs.filter(log => new Date(log.date).toDateString() === today);
    const totalConsumed = todayFood.reduce((sum, log) => sum + (log.calories * log.quantity), 0);
    setConsumed(totalConsumed);

    // Exercise Logs
    const exerciseLogs = JSON.parse(localStorage.getItem(`exercise_logs_${userId}`) || '[]');
    const todayExercise = exerciseLogs.filter(log => new Date(log.date).toDateString() === today);
    const totalBurned = todayExercise.reduce((sum, log) => sum + log.calories_burned, 0);
    setBurned(totalBurned);

    // Goal Settings
    const settings = JSON.parse(localStorage.getItem(`calorie_settings_${userId}`) || '{}');
    if (settings.daily_goal) setGoal(settings.daily_goal);
  };

  const percentage = Math.min((consumed / goal) * 100, 100);
  const isOver = consumed > goal;
  const netCalories = consumed - burned;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => setShowModal(true)}
        className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 cursor-pointer hover:border-green-500/50 transition-all shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <Target className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-white font-semibold">Calorias</h3>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <span className={`text-3xl font-bold ${isOver ? 'text-orange-400' : 'text-white'}`}>
                {consumed}
              </span>
              <span className="text-sm text-slate-400"> / {goal} kcal</span>
            </div>
            <div className="text-right text-xs text-slate-400">
              <p>Saldo: {netCalories} kcal</p>
            </div>
          </div>

          <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full ${isOver ? 'bg-orange-500' : 'bg-green-500'}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div className="bg-slate-800/50 p-2 rounded-lg flex items-center gap-2">
              <Utensils className="w-3 h-3 text-orange-400" />
              <span>Ingerido: {consumed}</span>
            </div>
            <div className="bg-slate-800/50 p-2 rounded-lg flex items-center gap-2">
              <Zap className="w-3 h-3 text-red-400" />
              <span>Queimado: {burned}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {showModal && (
        <CalorieGoalModal
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

export default CalorieGoalCard;
