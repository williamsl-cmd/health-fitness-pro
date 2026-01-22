
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplet, Plus, Trash2, Edit2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { useSyncManager, dispatchUpdate } from '@/lib/syncManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

function HydrationModal({ userId, onClose }) {
  const [customAmount, setCustomAmount] = useState(250);
  const [todayLogs, setTodayLogs] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  
  const { toast } = useToast();
  const { isOnline, addToSyncQueue } = useSyncManager();

  useEffect(() => {
    loadTodayLogs();
  }, [userId]);

  const loadTodayLogs = () => {
    const today = new Date().toDateString();
    const logs = JSON.parse(localStorage.getItem(`water_logs_${userId}`) || '[]');
    const todayEntries = logs.filter(log => new Date(log.date).toDateString() === today);
    setTodayLogs(todayEntries.reverse());
  };

  const quickAmounts = [100, 200, 300, 500];

  const addWater = (amount) => {
    const logs = JSON.parse(localStorage.getItem(`water_logs_${userId}`) || '[]');
    const newLog = {
      id: Date.now().toString(),
      user_id: userId,
      amount_ml: amount,
      date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      source: 'hydration_card'
    };
    logs.push(newLog);
    localStorage.setItem(`water_logs_${userId}`, JSON.stringify(logs));
    
    if (!isOnline) addToSyncQueue('hydration', newLog);
    toast({ title: "Água adicionada!", description: `+${amount}ml` });
    
    loadTodayLogs();
    dispatchUpdate();
  };

  const handleDelete = () => {
    if (!deleteId) return;

    const logs = JSON.parse(localStorage.getItem(`water_logs_${userId}`) || '[]');
    const logToDelete = logs.find(l => l.id === deleteId);

    if (logToDelete) {
       // Check if linked to food log
       if (logToDelete.food_log_id) {
         const foodLogs = JSON.parse(localStorage.getItem(`food_logs_${userId}`) || '[]');
         const index = foodLogs.findIndex(f => f.id === logToDelete.food_log_id);
         if (index !== -1) {
           foodLogs.splice(index, 1);
           localStorage.setItem(`food_logs_${userId}`, JSON.stringify(foodLogs));
           toast({ title: "Sincronização", description: "O item de alimentação correspondente também foi removido." });
         }
       }

       const newLogs = logs.filter(l => l.id !== deleteId);
       localStorage.setItem(`water_logs_${userId}`, JSON.stringify(newLogs));
       
       if (!isOnline) addToSyncQueue('hydration_delete', { id: deleteId });
       toast({ title: "Registro removido" });
    }

    setDeleteId(null);
    loadTodayLogs();
    dispatchUpdate();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Droplet className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Hidratação</h2>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <Tabs defaultValue="add" className="w-full">
            <TabsList className="w-full bg-slate-800 mb-6">
              <TabsTrigger value="add" className="flex-1">Adicionar</TabsTrigger>
              <TabsTrigger value="history" className="flex-1">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="add" className="space-y-6">
              <div className="bg-slate-800/50 rounded-xl p-4">
                <p className="text-slate-300 text-sm mb-3">Tamanho do copo padrão</p>
                <div className="text-center">
                  <p className="text-4xl font-bold text-cyan-400">250ml</p>
                </div>
              </div>

              <div>
                <p className="text-slate-300 text-sm mb-3">Adicionar rápido</p>
                <div className="grid grid-cols-4 gap-2">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => addWater(amount)}
                      className="bg-slate-800 hover:bg-cyan-600 text-white font-medium py-3 rounded-xl transition-colors min-h-[44px]"
                    >
                      {amount}ml
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-slate-300 text-sm">Quantidade personalizada</p>
                  <span className="text-cyan-400 font-semibold">{customAmount}ml</span>
                </div>
                <div className="py-2">
                  <Slider
                    value={[customAmount]}
                    onValueChange={(value) => setCustomAmount(value[0])}
                    min={50}
                    max={1000}
                    step={10}
                    className="mb-3"
                  />
                </div>
                <button
                  onClick={() => addWater(customAmount)}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar {customAmount}ml
                </button>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="bg-slate-800/30 rounded-xl p-4 max-h-[400px] overflow-y-auto">
                {todayLogs.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">Nenhum registro hoje</p>
                ) : (
                  <div className="space-y-2">
                    {todayLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Droplet className="w-4 h-4 text-cyan-400" />
                          <div>
                            <span className="text-white font-medium block">{log.amount_ml}ml</span>
                            {log.source === 'food' && <span className="text-xs text-orange-300">via Alimentação</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="text-slate-400 text-sm">{formatTime(log.date)}</span>
                           <button onClick={() => setDeleteId(log.id)} className="text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <Button onClick={onClose} className="w-full bg-slate-800 hover:bg-slate-700 text-white mt-6">
            Fechar
          </Button>
        </motion.div>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                Se este registro veio de uma refeição, a refeição correspondente também será removida.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AnimatePresence>
  );
}

export default HydrationModal;
