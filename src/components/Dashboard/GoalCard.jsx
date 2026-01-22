
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingDown, TrendingUp, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import GoalModal from '@/components/Modals/GoalModal';
import { dispatchUpdate } from '@/lib/syncManager';

function GoalCard({ userId, dataVersion }) {
  const [currentWeight, setCurrentWeight] = useState(null);
  const [targetWeight, setTargetWeight] = useState(null);
  const [initialWeight, setInitialWeight] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId, dataVersion]);

  const loadData = () => {
    const logs = JSON.parse(localStorage.getItem(`weight_logs_${userId}`) || '[]');
    if (logs.length > 0) {
      // Find the first log
      const sortedLogs = [...logs].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      const firstLog = sortedLogs[0];
      const latest = sortedLogs[sortedLogs.length - 1];
      
      setInitialWeight(firstLog.weight_kg);
      setStartDate(firstLog.created_at);
      setCurrentWeight(latest.weight_kg);
      setTargetWeight(latest.target_weight);
    }
  };

  const getProgress = () => {
    if (!currentWeight || !targetWeight || !initialWeight) return 0;
    if (initialWeight === targetWeight && currentWeight === targetWeight) return 100;

    const totalChangeNeeded = Math.abs(targetWeight - initialWeight);
    const currentChange = Math.abs(currentWeight - initialWeight);
    const isWeightLoss = initialWeight > targetWeight;
    const isMovingCorrectly = isWeightLoss ? currentWeight < initialWeight : currentWeight > initialWeight;

    if (!isMovingCorrectly && currentChange > 0) return 0; 
    if ((isWeightLoss && currentWeight <= targetWeight) || (!isWeightLoss && currentWeight >= targetWeight)) return 100;
    if (totalChangeNeeded === 0) return 0;

    const progress = (currentChange / totalChangeNeeded) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const progress = getProgress();
  const needsToLose = targetWeight < initialWeight;
  const difference = targetWeight && currentWeight ? Math.abs(targetWeight - currentWeight) : 0;
  
  // Is user currently moving in right direction from current weight perspective?
  const directionIndicator = needsToLose ? 
      (currentWeight > targetWeight ? <ArrowDown className="w-4 h-4 text-green-400" /> : <ArrowUp className="w-4 h-4 text-red-400" />) :
      (currentWeight < targetWeight ? <ArrowUp className="w-4 h-4 text-green-400" /> : <ArrowDown className="w-4 h-4 text-red-400" />);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => setShowModal(true)}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 cursor-pointer hover:border-orange-500/50 transition-all shadow-xl flex flex-col justify-between relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>
        
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <Target className="w-5 h-5 text-orange-500" />
          </div>
          <h3 className="text-white font-medium">Meta de Peso</h3>
        </div>

        {!targetWeight ? (
          <div className="flex-1 flex flex-col justify-center items-center py-6">
            <p className="text-slate-400 mb-4 text-center">Defina sua meta</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center text-center">
               <div>
                 <p className="text-xs text-slate-400 mb-1">Inicial</p>
                 <p className="text-lg font-bold text-white">{initialWeight}kg</p>
               </div>
               <div>
                 <p className="text-xs text-slate-400 mb-1">Atual</p>
                 <p className="text-xl font-bold text-blue-400">{currentWeight}kg</p>
               </div>
               <div>
                 <p className="text-xs text-slate-400 mb-1">Meta</p>
                 <p className="text-lg font-bold text-orange-500">{targetWeight}kg</p>
               </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Progresso</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-orange-500 to-green-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm">
               {directionIndicator}
               <span className="text-slate-300">Falta: <span className="text-white font-bold">{difference.toFixed(1)}kg</span></span>
            </div>

            {startDate && (
               <div className="text-center text-xs text-slate-500">
                 Início: {new Date(startDate).toLocaleDateString('pt-BR')}
               </div>
            )}
          </div>
        )}

        <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-xl transition-colors mt-auto relative z-10 mt-4">
          {targetWeight ? 'Atualizar Meta' : 'Definir Meta'}
        </button>
      </motion.div>

      {showModal && (
        <GoalModal
          userId={userId}
          currentWeight={currentWeight}
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

export default GoalCard;
