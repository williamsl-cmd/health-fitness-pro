
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplet, Plus, Settings, Bell } from 'lucide-react';
import HydrationModal from '@/components/Modals/HydrationModal';
import HydrationReminderModal from '@/components/Modals/HydrationReminderModal';
import { useToast } from '@/components/ui/use-toast';
import { FOOD_DATABASE } from '@/data/foodDatabase';
import { dispatchUpdate } from '@/lib/syncManager';

function HydrationCard({ userId, dataVersion }) {
  const [waterIntake, setWaterIntake] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [nextReminder, setNextReminder] = useState(null);
  const { toast } = useToast();
  const goal = 2000;

  useEffect(() => {
    loadWaterIntake();
    loadReminders();
  }, [userId, dataVersion]);

  // Check reminder interval independently of data version
  useEffect(() => {
     const interval = setInterval(loadReminders, 60000);
     return () => clearInterval(interval);
  }, []);

  const loadWaterIntake = () => {
    const today = new Date().toDateString();
    
    // 1. Water Logs
    const logs = JSON.parse(localStorage.getItem(`water_logs_${userId}`) || '[]');
    const todayLogs = logs.filter(log => new Date(log.date).toDateString() === today);
    const waterTotal = todayLogs.reduce((sum, log) => sum + log.amount_ml, 0);

    // 2. Liquid from Food Logs
    const foodLogs = JSON.parse(localStorage.getItem(`food_logs_${userId}`) || '[]');
    const todayFood = foodLogs.filter(log => new Date(log.date).toDateString() === today);
    const allFoods = Object.values(FOOD_DATABASE).flat();
    
    const liquidFromFood = todayFood.reduce((sum, log) => {
      const foodItem = allFoods.find(f => f.name === log.food_name);
      if (foodItem && foodItem.isLiquid) {
        let vol = 200;
        if (foodItem.unit.includes('ml')) {
          const match = foodItem.unit.match(/(\d+)ml/);
          if (match) vol = parseInt(match[1]);
        } else if (foodItem.unit === 'lata') vol = 350;
        else if (foodItem.unit === 'copo') vol = 250;
        return sum + (vol * log.quantity);
      }
      return sum;
    }, 0);

    setWaterIntake(waterTotal + liquidFromFood);
  };

  const loadReminders = () => {
    const settings = JSON.parse(localStorage.getItem('hydration_reminders_settings') || '{}');
    if (settings.enabled && settings.times?.length > 0) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const next = settings.times.find(time => {
        const [h, m] = time.split(':').map(Number);
        return (h * 60 + m) > currentMinutes;
      });
      setNextReminder(next || settings.times[0]);
    } else {
      setNextReminder(null);
    }
  };

  const addWater = (amount) => {
    const logs = JSON.parse(localStorage.getItem(`water_logs_${userId}`) || '[]');
    const newLog = {
      id: Date.now().toString(),
      user_id: userId,
      amount_ml: amount,
      date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    logs.push(newLog);
    localStorage.setItem(`water_logs_${userId}`, JSON.stringify(logs));
    
    setWaterIntake(prev => prev + amount);
    toast({
      title: "Água adicionada!",
      description: `+${amount}ml registrados`,
    });
    dispatchUpdate();
  };

  const percentage = Math.min((waterIntake / goal) * 100, 100);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/50 transition-all shadow-xl flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/20 rounded-xl">
              <Droplet className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-white font-semibold">Hidratação</h3>
          </div>
          <button
            onClick={() => setShowReminderModal(true)}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors relative"
          >
            <Bell className="w-5 h-5 text-slate-400" />
            {nextReminder && <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />}
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">
              {waterIntake}
            </span>
            <span className="text-lg text-slate-400">ml</span>
          </div>

          <div>
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Meta: {goal} ml</span>
              <span>{percentage.toFixed(0)}%</span>
            </div>
            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
              />
            </div>
          </div>
          
          {nextReminder && (
             <div className="text-xs text-blue-300 bg-blue-500/10 p-2 rounded-lg text-center">
               Próximo lembrete: {nextReminder}
             </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => addWater(250)}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              250ml
            </button>
            <button 
              onClick={() => setShowModal(true)}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-white"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {showModal && (
        <HydrationModal
          userId={userId}
          onClose={() => {
            setShowModal(false);
            loadWaterIntake();
            dispatchUpdate();
          }}
        />
      )}

      {showReminderModal && (
        <HydrationReminderModal 
          onClose={() => {
            setShowReminderModal(false);
            loadReminders();
          }} 
        />
      )}
    </>
  );
}

export default HydrationCard;
