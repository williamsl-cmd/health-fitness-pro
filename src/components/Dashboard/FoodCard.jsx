
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Plus } from 'lucide-react';
import FoodModal from '@/components/Modals/FoodModal';
import { dispatchUpdate } from '@/lib/syncManager';

function FoodCard({ userId, dataVersion }) {
  const [showModal, setShowModal] = useState(false);
  const [lastMeal, setLastMeal] = useState(null);

  useEffect(() => {
    loadData();
  }, [userId, dataVersion]);

  const loadData = () => {
    const logs = JSON.parse(localStorage.getItem(`food_logs_${userId}`) || '[]');
    if (logs.length > 0) {
      setLastMeal(logs[logs.length - 1]);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => setShowModal(true)}
        className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 cursor-pointer hover:border-orange-500/50 transition-all shadow-xl flex flex-col justify-between"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-orange-500/20 rounded-xl">
            <Utensils className="w-5 h-5 text-orange-400" />
          </div>
          <h3 className="text-white font-semibold">Alimentação</h3>
        </div>

        <div className="space-y-4">
          {lastMeal ? (
            <div className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-1">Última refeição</p>
              <p className="text-white font-medium truncate">{lastMeal.food_name}</p>
              <div className="flex justify-between mt-1">
                <span className="text-orange-400 text-sm">{lastMeal.calories * lastMeal.quantity} kcal</span>
                <span className="text-slate-500 text-xs">{new Date(lastMeal.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-center py-4">Nenhuma refeição hoje</p>
          )}

          <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 rounded-xl transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Adicionar Alimento
          </button>
        </div>
      </motion.div>

      {showModal && (
        <FoodModal
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

export default FoodCard;
