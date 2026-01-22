
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSyncManager } from '@/lib/syncManager';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function CalorieGoalModal({ userId, onClose }) {
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [history, setHistory] = useState([]);
  const { toast } = useToast();
  const { isOnline, addToSyncQueue } = useSyncManager();

  useEffect(() => {
    // Load current goal
    const settings = JSON.parse(localStorage.getItem(`calorie_settings_${userId}`) || '{}');
    if (settings.daily_goal) {
      setDailyGoal(settings.daily_goal);
    }
    loadHistory();
  }, [userId]);

  const loadHistory = () => {
    // Aggregate food logs by day for chart
    const logs = JSON.parse(localStorage.getItem(`food_logs_${userId}`) || '[]');
    const dailyData = {};
    
    logs.forEach(log => {
      const date = new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const calories = log.calories * log.quantity;
      dailyData[date] = (dailyData[date] || 0) + calories;
    });

    // Convert to array and take last 7 days
    const chartData = Object.entries(dailyData)
      .map(([date, calories]) => ({ date, calories }))
      .slice(-7);
      
    setHistory(chartData);
  };

  const handleSave = () => {
    const settings = {
      daily_goal: parseInt(dailyGoal),
      updated_at: new Date().toISOString()
    };
    
    localStorage.setItem(`calorie_settings_${userId}`, JSON.stringify(settings));

    if (!isOnline) {
      addToSyncQueue('calorie_settings', settings);
      toast({
        title: "Salvo offline",
        variant: "warning"
      });
    } else {
      toast({
        title: "Meta atualizada!",
        description: `Nova meta diária: ${dailyGoal} kcal`,
      });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Target className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Meta de Calorias</h2>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-lg text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Meta Diária (kcal)
              </label>
              <input
                type="number"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 text-white text-center text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-green-500"
                step="50"
              />
            </div>

            {history.length > 0 && (
              <div className="bg-slate-800/30 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                  <BarChart2 className="w-3 h-3" />
                  Últimos 7 dias
                </p>
                <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history}>
                      <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Line type="monotone" dataKey="calories" stroke="#4ade80" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <Button
              onClick={handleSave}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-6"
            >
              Salvar Meta
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default CalorieGoalModal;
