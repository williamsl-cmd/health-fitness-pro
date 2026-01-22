import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSyncManager } from '@/lib/syncManager';

function GoalModal({ userId, currentWeight, onClose }) {
  const [targetWeight, setTargetWeight] = useState('');
  const { toast } = useToast();
  const { isOnline, addToSyncQueue } = useSyncManager();

  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem(`weight_logs_${userId}`) || '[]');
    if (logs.length > 0 && logs[logs.length - 1].target_weight) {
      setTargetWeight(logs[logs.length - 1].target_weight.toString());
    } else if (currentWeight) {
      setTargetWeight(currentWeight.toString());
    }
  }, [userId, currentWeight]);

  const handleSave = () => {
    const target = parseFloat(targetWeight);
    
    if (!target || target <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um peso válido.",
        variant: "destructive",
      });
      return;
    }

    const logs = JSON.parse(localStorage.getItem(`weight_logs_${userId}`) || '[]');
    
    if (logs.length > 0) {
      logs[logs.length - 1].target_weight = target;
      localStorage.setItem(`weight_logs_${userId}`, JSON.stringify(logs));
    } else {
      const newLog = {
        id: Date.now().toString(),
        user_id: userId,
        weight_kg: currentWeight || 70,
        weight_g: 0,
        imc: null,
        target_weight: target,
        created_at: new Date().toISOString(),
      };
      logs.push(newLog);
      localStorage.setItem(`weight_logs_${userId}`, JSON.stringify(logs));
    }

    const diff = Math.abs(target - (currentWeight || 0));
    const action = target > (currentWeight || 0) ? 'ganhar' : 'perder';

    if (!isOnline) {
      addToSyncQueue('goal', { target_weight: target });
      toast({
        title: "Salvo offline",
        description: "Meta salva localmente. Sincronizará quando online.",
        variant: "warning"
      });
    } else {
      toast({
        title: "Meta definida!",
        description: `Meta de ${action} ${diff.toFixed(1)}kg estabelecida.`,
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
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Target className="w-5 h-5 text-orange-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Meta de Peso</h2>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-slate-800 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Peso alvo (kg)
              </label>
              <input
                type="number"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[60px]"
                placeholder="70"
                step="0.1"
                min="30"
                max="200"
              />
              <p className="text-slate-400 text-sm text-center mt-2">
                Meta de ganho de peso
              </p>
            </div>

            {currentWeight && targetWeight && (
              <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-xl p-4">
                <p className="text-slate-300 text-sm mb-1">Diferença</p>
                <p className="text-3xl font-bold text-white">
                  {Math.abs(parseFloat(targetWeight) - currentWeight).toFixed(1)} kg
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  {parseFloat(targetWeight) > currentWeight ? 'a ganhar' : 'a perder'}
                </p>
              </div>
            )}

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
                className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white min-h-[48px]"
              >
                Definir Meta
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default GoalModal;