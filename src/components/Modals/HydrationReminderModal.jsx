
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Clock, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

function HydrationReminderModal({ onClose }) {
  const [enabled, setEnabled] = useState(false);
  const [reminders, setReminders] = useState(['09:00', '12:00', '15:00', '18:00', '21:00']);
  const [newTime, setNewTime] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('hydration_reminders_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setEnabled(parsed.enabled);
      setReminders(parsed.times || []);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Não suportado",
        description: "Seu navegador não suporta notificações.",
        variant: "destructive"
      });
      return false;
    }
    
    if (Notification.permission === 'granted') return true;
    
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      toast({ title: "Permissão concedida!" });
      return true;
    } else {
      toast({
        title: "Permissão negada",
        description: "Habilite notificações nas configurações do navegador.",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleSave = async () => {
    if (enabled) {
      const granted = await requestPermission();
      if (!granted) {
        setEnabled(false);
        return; // Don't save if permission denied but user tried to enable
      }
    }

    const settings = {
      enabled,
      times: reminders.sort()
    };
    
    localStorage.setItem('hydration_reminders_settings', JSON.stringify(settings));
    toast({
      title: "Configurações salvas",
      description: enabled ? "Lembretes ativados com sucesso!" : "Lembretes desativados."
    });
    onClose();
  };

  const addTime = () => {
    if (newTime && !reminders.includes(newTime)) {
      setReminders([...reminders, newTime].sort());
      setNewTime('');
    }
  };

  const removeTime = (time) => {
    setReminders(reminders.filter(t => t !== time));
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
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Bell className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Lembretes de Hidratação</h2>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl">
              <span className="text-white font-medium">Ativar Notificações</span>
              <button
                onClick={() => setEnabled(!enabled)}
                className={`w-14 h-8 rounded-full transition-colors relative ${
                  enabled ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform ${
                    enabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {enabled && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white"
                  />
                  <Button onClick={addTime} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {reminders.map((time) => (
                    <div key={time} className="flex items-center justify-between bg-slate-800 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-white">{time}</span>
                      </div>
                      <button
                        onClick={() => removeTime(time)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleSave}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white min-h-[48px]"
            >
              Salvar Configurações
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default HydrationReminderModal;
