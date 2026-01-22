
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scale, Info } from 'lucide-react';
import WeightModal from '@/components/Modals/WeightModal';
import { dispatchUpdate } from '@/lib/syncManager';

function WeightCard({ userId, dataVersion }) {
  const [weight, setWeight] = useState(null);
  const [imc, setImc] = useState(null);
  const [height, setHeight] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId, dataVersion]);

  const loadData = () => {
    const logs = JSON.parse(localStorage.getItem(`weight_logs_${userId}`) || '[]');
    if (logs.length > 0) {
      const latest = logs[logs.length - 1];
      setWeight(latest);
      setImc(latest.imc);
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);
    if (user && user.height) {
      setHeight(user.height);
    }
  };

  const getImcStatus = (imcValue) => {
    if (!imcValue) return { text: 'Sem dados', color: '#64748b' };
    if (imcValue < 18.5) return { text: 'Abaixo do peso', color: '#3b82f6' }; // Blue
    if (imcValue < 25) return { text: 'Peso normal', color: '#22c55e' }; // Green
    if (imcValue < 30) return { text: 'Sobrepeso', color: '#f97316' }; // Orange
    if (imcValue < 35) return { text: 'Obesidade I', color: '#ef4444' }; // Red
    if (imcValue < 40) return { text: 'Obesidade II', color: '#be123c' }; // Maroon
    return { text: 'Obesidade III', color: '#881337' }; // Dark Wine
  };

  const status = getImcStatus(imc);
  
  // Calculate marker position (0 to 60 BMI scale for better visibility)
  const calculatePosition = (val) => {
    if (!val) return 0;
    // Scale 10 to 50 covers most human ranges
    const min = 10;
    const max = 50;
    const pos = ((val - min) / (max - min)) * 100;
    return Math.min(Math.max(pos, 0), 100);
  };

  const markerPosition = calculatePosition(imc);
  
  const idealWeightMin = height ? (18.5 * Math.pow(height/100, 2)).toFixed(1) : '--';
  const idealWeightMax = height ? (24.9 * Math.pow(height/100, 2)).toFixed(1) : '--';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => setShowModal(true)}
        className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 cursor-pointer hover:border-cyan-500/50 transition-all shadow-xl flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/20 rounded-xl">
              <Scale className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-white font-semibold">Peso & IMC</h3>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">
              {weight ? weight.weight_kg : '—'}
            </span>
            <span className="text-lg text-slate-400">kg</span>
          </div>

          {/* IMC Visualization */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span className="font-medium" style={{ color: status.color }}>{status.text} (IMC {imc?.toFixed(1)})</span>
            </div>
            
            <div className="relative h-3 w-full rounded-full overflow-hidden bg-slate-800 flex">
               {/* 10-18.5 (8.5 units) */}
               <div className="h-full bg-blue-500 w-[21.25%]" title="Abaixo" />
               {/* 18.5-25 (6.5 units) */}
               <div className="h-full bg-green-500 w-[16.25%]" title="Normal" />
               {/* 25-30 (5 units) */}
               <div className="h-full bg-orange-500 w-[12.5%]" title="Sobrepeso" />
               {/* 30-35 (5 units) */}
               <div className="h-full bg-red-500 w-[12.5%]" title="Obesidade I" />
               {/* 35-40 (5 units) */}
               <div className="h-full bg-rose-700 w-[12.5%]" title="Obesidade II" />
               {/* 40-50 (10 units) */}
               <div className="h-full bg-rose-900 flex-1" title="Obesidade III" />

              {imc && (
                <div 
                  className="absolute top-0 bottom-0 w-1.5 h-4 -mt-0.5 bg-white border border-slate-900 shadow-lg transform -translate-x-1/2 transition-all duration-500 z-10 rounded-full"
                  style={{ left: `${markerPosition}%` }}
                />
              )}
            </div>
          </div>

          {height && (
             <div className="bg-slate-800/50 rounded-xl p-3 flex items-start gap-3">
               <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
               <div>
                 <p className="text-xs text-slate-400 mb-1">Peso Ideal Estimado</p>
                 <p className="text-sm font-semibold text-white">{idealWeightMin}kg - {idealWeightMax}kg</p>
               </div>
             </div>
          )}

          <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 rounded-xl transition-colors mt-2">
            Atualizar Peso
          </button>
        </div>
      </motion.div>

      {showModal && (
        <WeightModal
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

export default WeightCard;
