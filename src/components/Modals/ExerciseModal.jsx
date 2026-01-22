
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Flame, Calendar, Trash2, Edit2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSyncManager, dispatchUpdate } from '@/lib/syncManager';
import { EXERCISE_CATEGORIES } from '@/data/exerciseDatabase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function ExerciseModal({ userId, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState('Cardio');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [duration, setDuration] = useState('');
  const [userWeight, setUserWeight] = useState(70);
  const [history, setHistory] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  
  const { toast } = useToast();
  const { isOnline, addToSyncQueue } = useSyncManager();

  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem(`weight_logs_${userId}`) || '[]');
    if (logs.length > 0) {
      setUserWeight(logs[logs.length - 1].weight_kg);
    }
    loadHistory();
  }, [userId]);

  const loadHistory = () => {
    const logs = JSON.parse(localStorage.getItem(`exercise_logs_${userId}`) || '[]');
    setHistory(logs.reverse().slice(0, 10)); // Show more history for editing
  };

  const calculateCalories = (met, dur) => {
    if (!met || !dur) return 0;
    const hours = parseInt(dur) / 60;
    return Math.round(met * userWeight * hours);
  };

  const handleSave = () => {
    if (!selectedExercise || !duration) return;

    const logs = JSON.parse(localStorage.getItem(`exercise_logs_${userId}`) || '[]');
    const calories = calculateCalories(selectedExercise.met, duration);
    
    let newLog;

    if (editingId) {
      // Update existing
      const index = logs.findIndex(l => l.id === editingId);
      if (index !== -1) {
        logs[index] = {
          ...logs[index],
          exercise_name: selectedExercise.name,
          met: selectedExercise.met,
          duration_minutes: parseInt(duration),
          calories_burned: calories,
          updated_at: new Date().toISOString()
        };
        newLog = logs[index];
      }
    } else {
      // Create new
      newLog = {
        id: Date.now().toString(),
        user_id: userId,
        exercise_name: selectedExercise.name,
        met: selectedExercise.met,
        duration_minutes: parseInt(duration),
        calories_burned: calories,
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      logs.push(newLog);
    }

    localStorage.setItem(`exercise_logs_${userId}`, JSON.stringify(logs));

    if (!isOnline) {
      addToSyncQueue('exercise', newLog);
    }
    
    toast({
      title: editingId ? "Exercício atualizado!" : "Exercício registrado!",
      description: `Gasto calórico: ${calories} kcal`,
    });

    dispatchUpdate();
    resetForm();
    loadHistory();
  };

  const startEdit = (log) => {
    setEditingId(log.id);
    setDuration(log.duration_minutes.toString());
    
    // Find exercise object to recreate selection state
    let found = false;
    Object.values(EXERCISE_CATEGORIES).forEach(list => {
      const match = list.find(ex => ex.name === log.exercise_name);
      if (match) {
        setSelectedExercise(match);
        found = true;
      }
    });

    if (!found) {
      // Fallback if db changed
      setSelectedExercise({ name: log.exercise_name, met: log.met });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;

    const logs = JSON.parse(localStorage.getItem(`exercise_logs_${userId}`) || '[]');
    const newLogs = logs.filter(l => l.id !== deleteId);
    
    localStorage.setItem(`exercise_logs_${userId}`, JSON.stringify(newLogs));
    
    if (!isOnline) addToSyncQueue('exercise_delete', { id: deleteId });
    
    toast({ title: "Exercício removido" });
    dispatchUpdate();
    setDeleteId(null);
    loadHistory();
  };

  const resetForm = () => {
    setEditingId(null);
    setDuration('');
    setSelectedExercise(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Activity className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'Editar Atividade' : 'Registrar Atividade'}
              </h2>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {Object.keys(EXERCISE_CATEGORIES).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {EXERCISE_CATEGORIES[selectedCategory].map(ex => (
                  <button
                    key={ex.name}
                    onClick={() => setSelectedExercise(ex)}
                    className={`p-3 rounded-xl text-left transition-all ${
                      selectedExercise?.name === ex.name 
                        ? 'bg-red-600/20 border border-red-500 text-white' 
                        : 'bg-slate-800 border border-transparent text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div className="font-medium text-sm">{ex.name}</div>
                    <div className="text-xs opacity-70">MET: {ex.met}</div>
                  </button>
                ))}
              </div>

              {selectedExercise && (
                <div className="bg-slate-800/50 rounded-xl p-4 space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Duração (minutos)</label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      placeholder="ex: 45"
                    />
                  </div>
                  
                  {duration && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                      <span className="text-slate-300">Gasto estimado:</span>
                      <span className="text-2xl font-bold text-red-400 flex items-center gap-1">
                        <Flame className="w-5 h-5" />
                        {calculateCalories(selectedExercise.met, duration)} kcal
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {editingId && (
                      <Button onClick={resetForm} variant="outline" className="bg-slate-800 border-slate-700 text-white">
                        Cancelar
                      </Button>
                    )}
                    <Button 
                      onClick={handleSave}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      {editingId ? 'Salvar Alterações' : 'Registrar Exercício'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-800/30 rounded-xl p-4">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Histórico
              </h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">Nenhum exercício recente</p>
                ) : (
                  history.map((log) => (
                    <div key={log.id} className={`bg-slate-800 rounded-lg p-3 border ${editingId === log.id ? 'border-red-500' : 'border-slate-700/50'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-white font-medium">{log.exercise_name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-red-400 text-sm font-semibold">+{log.calories_burned} kcal</span>
                          <button onClick={() => startEdit(log)} className="text-slate-500 hover:text-blue-400"><Edit2 className="w-3 h-3" /></button>
                          <button onClick={() => setDeleteId(log.id)} className="text-slate-500 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-400">
                        <span>{log.duration_minutes} min</span>
                        <span>{formatDate(log.date)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {deleteId && (
          <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
            <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir exercício?</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                  Isso irá remover o registro e recalcular seu gasto calórico do dia.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </AnimatePresence>
  );
}

export default ExerciseModal;
