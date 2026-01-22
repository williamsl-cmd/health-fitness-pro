import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { useSyncManager } from '@/lib/syncManager';

function WeightModal({ userId, onClose }) {
  const [height, setHeight] = useState(170);
  const [weightKg, setWeightKg] = useState(70);
  const [weightG, setWeightG] = useState(0);
  const { toast } = useToast();
  const { isOnline, addToSyncQueue } = useSyncManager();

  useEffect(() => {
    // Load existing data
    const logs = JSON.parse(localStorage.getItem(`weight_logs_${userId}`) || '[]');
    if (logs.length > 0) {
      const latest = logs[logs.length - 1];
      setWeightKg(latest.weight_kg || 70);
      setWeightG(latest.weight_g || 0);
    }

    // Load height from user profile
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);
    if (user && user.height) {
      setHeight(user.height);
    }
  }, [userId]);

  const calculateIMC = () => {
    const totalWeight = weightKg + (weightG / 1000);
    const heightM = height / 100;
    return totalWeight / (heightM * heightM);
  };

  const handleSave = () => {
    const imc = calculateIMC();
    const logs = JSON.parse(localStorage.getItem(`weight_logs_${userId}`) || '[]');
    
    const newLog = {
      id: Date.now().toString(),
      user_id: userId,
      weight_kg: weightKg,
      weight_g: weightG,
      imc: imc,
      target_weight: logs.length > 0 ? logs[logs.length - 1].target_weight : null,
      created_at: new Date().toISOString(),
    };

    logs.push(newLog);
    localStorage.setItem(`weight_logs_${userId}`, JSON.stringify(logs));

    // Update user height
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].height = height;
      localStorage.setItem('users', JSON.stringify(users));
    }

    if (!isOnline) {
      addToSyncQueue('weight', newLog);
      toast({
        title: "Salvo offline",
        description: "Peso atualizado e salvo localmente para sincronização.",
        variant: "warning"
      });
    } else {
      toast({
        title: "Peso atualizado!",
        description: `Peso: ${weightKg}.${weightG}kg | IMC: ${imc.toFixed(1)}`,
      });
    }

    onClose();
  };

  const imc = calculateIMC();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Scale className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Peso e Altura</h2>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-slate-800 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Height */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Altura (cm)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  min="100"
                  max="250"
                />
                <div className="flex-1 py-2">
                  <Slider
                    value={[height]}
                    onValueChange={(value) => setHeight(value[0])}
                    min={100}
                    max={250}
                    step={1}
                  />
                </div>
              </div>
            </div>

            {/* Weight Display */}
            <div className="bg-slate-800/50 rounded-xl p-6 text-center">
              <p className="text-slate-400 text-sm mb-2">Peso</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-cyan-400">
                  {weightKg}.{weightG}
                </span>
                <span className="text-2xl text-slate-400">kg</span>
              </div>
            </div>

            {/* Weight Kg */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Quilos ({weightKg})
              </label>
              <div className="py-2">
                <Slider
                  value={[weightKg]}
                  onValueChange={(value) => setWeightKg(value[0])}
                  min={30}
                  max={200}
                  step={1}
                />
              </div>
            </div>

            {/* Weight G */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Gramas ({weightG})
              </label>
              <div className="py-2">
                <Slider
                  value={[weightG]}
                  onValueChange={(value) => setWeightG(value[0])}
                  min={0}
                  max={999}
                  step={1}
                />
              </div>
            </div>

            {/* IMC Display */}
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-4">
              <p className="text-slate-300 text-sm mb-1">IMC Calculado</p>
              <p className="text-3xl font-bold text-white">
                {imc.toFixed(1)}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 bg-slate-800 border-slate-700 text-white hover:bg-slate-700 min-h-[48px]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white min-h-[48px]"
              >
                Confirmar
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default WeightModal;