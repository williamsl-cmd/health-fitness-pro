import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler, Save, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSyncManager } from '@/lib/syncManager';

const MEASUREMENTS = [
  { label: 'Pescoço', key: 'neck' },
  { label: 'Ombro', key: 'shoulder' },
  { label: 'Peito', key: 'chest' },
  { label: 'Cintura', key: 'waist' },
  { label: 'Abdômen Superior', key: 'upper_abdomen' },
  { label: 'Abdômen Inferior', key: 'lower_abdomen' },
  { label: 'Quadril', key: 'hip' },
  { label: 'Coxa Direita', key: 'thigh_right' },
  { label: 'Coxa Esquerda', key: 'thigh_left' },
  { label: 'Braço Direito', key: 'arm_right_detail' },
  { label: 'Braço Esquerdo', key: 'arm_left_detail' },
  { label: 'Panturrilha Direita', key: 'calf_right' },
  { label: 'Panturrilha Esquerda', key: 'calf_left' },
];

function MeasurementsModal({ userId, onClose }) {
  const [measurements, setMeasurements] = useState({});
  const [history, setHistory] = useState([]);
  const { toast } = useToast();
  const { isOnline, addToSyncQueue } = useSyncManager();

  useEffect(() => {
    loadMeasurements();
    loadHistory();
  }, [userId]);

  const loadMeasurements = () => {
    const logs = JSON.parse(localStorage.getItem(`body_measurements_${userId}`) || '[]');
    if (logs.length > 0) {
      setMeasurements(logs[logs.length - 1]);
    }
  };

  const loadHistory = () => {
    const logs = JSON.parse(localStorage.getItem(`body_measurements_${userId}`) || '[]');
    setHistory(logs.reverse().slice(0, 5));
  };

  const handleChange = (key, value) => {
    setMeasurements(prev => ({
      ...prev,
      [key]: value ? parseFloat(value) : ''
    }));
  };

  const handleSave = () => {
    const logs = JSON.parse(localStorage.getItem(`body_measurements_${userId}`) || '[]');
    
    const newLog = {
      id: Date.now().toString(),
      user_id: userId,
      ...measurements,
      created_at: new Date().toISOString(),
    };

    logs.push(newLog);
    localStorage.setItem(`body_measurements_${userId}`, JSON.stringify(logs));

    if (!isOnline) {
      addToSyncQueue('measurements', newLog);
      toast({
        title: "Salvo offline",
        description: "Medidas salvas localmente. Serão sincronizadas quando online.",
        variant: "warning"
      });
    } else {
      toast({
        title: "Medidas salvas!",
        description: "Suas medidas corporais foram registradas com sucesso.",
      });
    }

    onClose();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Ruler className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Medidas Corporais</h2>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-slate-800 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <Tabs defaultValue="register" className="mb-6">
            <TabsList className="w-full bg-slate-800 h-auto p-1">
              <TabsTrigger value="register" className="flex-1 data-[state=active]:bg-purple-600 py-3">
                <Save className="w-4 h-4 mr-2" />
                Registrar
              </TabsTrigger>
              <TabsTrigger value="graph" className="flex-1 data-[state=active]:bg-slate-700 py-3">
                <BarChart3 className="w-4 h-4 mr-2" />
                Gráfico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="register" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {MEASUREMENTS.map((measurement) => (
                  <div key={measurement.key}>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {measurement.label}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={measurements[measurement.key] || ''}
                        onChange={(e) => handleChange(measurement.key, e.target.value)}
                        placeholder="0"
                        step="0.1"
                        min="0"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[48px]"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                        cm
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleSave}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 text-lg min-h-[56px]"
              >
                <Save className="w-5 h-5 mr-2" />
                Salvar Medidas
              </Button>
            </TabsContent>

            <TabsContent value="graph" className="mt-6">
              {/* Chart Visualization */}
              <div className="bg-slate-800/50 rounded-xl p-6 mb-6 overflow-x-auto">
                <div className="min-w-[500px]">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {MEASUREMENTS.slice(0, 8).map((measurement) => {
                      const value = measurements[measurement.key] || 0;
                      const maxValue = 150;
                      const percentage = (value / maxValue) * 100;
                      
                      return (
                        <div key={measurement.key} className="text-center">
                          <div className="mb-2">
                            <div className="h-32 bg-slate-700 rounded-lg overflow-hidden flex items-end">
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${percentage}%` }}
                                transition={{ duration: 0.5 }}
                                className="w-full bg-gradient-to-t from-purple-500 to-pink-500"
                              />
                            </div>
                          </div>
                          <p className="text-slate-400 text-xs mb-1">{measurement.label}</p>
                          <p className="text-white font-bold">{value || '—'} cm</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* History */}
              <div>
                <h3 className="text-white font-semibold mb-3">Histórico</h3>
                <div className="space-y-2">
                  {history.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">Nenhum registro encontrado</p>
                  ) : (
                    history.map((log) => (
                      <div
                        key={log.id}
                        className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Ruler className="w-4 h-4 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">Registro de medidas</p>
                            <p className="text-slate-400 text-sm">{formatDate(log.created_at)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-purple-400 text-sm">
                            {Object.values(log).filter(v => typeof v === 'number').length} medidas
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button
            onClick={onClose}
            variant="outline"
            className="w-full bg-slate-800 border-slate-700 text-white hover:bg-slate-700 min-h-[48px]"
          >
            Fechar
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default MeasurementsModal;