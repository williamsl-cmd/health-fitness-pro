
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Utensils, Search, Plus, Minus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSyncManager, dispatchUpdate } from '@/lib/syncManager';
import { FOOD_DATABASE } from '@/data/foodDatabase';
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

const FOOD_CATEGORIES = FOOD_DATABASE;
const ALL_FOODS = Object.values(FOOD_CATEGORIES).flat();
const MEAL_TYPES = ['Café da Manhã', 'Almoço', 'Lanche', 'Jantar'];

function FoodModal({ userId, onClose }) {
  const [selectedMeal, setSelectedMeal] = useState('Café da Manhã');
  const [activeTab, setActiveTab] = useState('adicionar');
  const [selectedCategory, setSelectedCategory] = useState('Frutas');
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState({});
  const [todayLogs, setTodayLogs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  
  const { toast } = useToast();
  const { isOnline, addToSyncQueue } = useSyncManager();

  useEffect(() => {
    loadTodayLogs();
  }, [userId]);

  const loadTodayLogs = () => {
    const today = new Date().toDateString();
    const logs = JSON.parse(localStorage.getItem(`food_logs_${userId}`) || '[]');
    const todayEntries = logs.filter(log => new Date(log.date).toDateString() === today);
    setTodayLogs(todayEntries.reverse());
  };

  const updateQuantity = (foodName, delta) => {
    setQuantities(prev => ({
      ...prev,
      [foodName]: Math.max(1, (prev[foodName] || 1) + delta)
    }));
  };

  const syncHydration = (foodLog, action) => {
    // Check if food is liquid
    const foodItem = ALL_FOODS.find(f => f.name === foodLog.food_name);
    if (!foodItem || !foodItem.isLiquid) return;

    // Estimate volume
    let vol = 200;
    if (foodItem.unit.includes('ml')) {
      const match = foodItem.unit.match(/(\d+)ml/);
      if (match) vol = parseInt(match[1]);
    } else if (foodItem.unit === 'lata') vol = 350;
    else if (foodItem.unit === 'copo') vol = 250;
    
    const totalVolume = vol * foodLog.quantity;
    const waterLogs = JSON.parse(localStorage.getItem(`water_logs_${userId}`) || '[]');

    if (action === 'add') {
      const newWaterLog = {
        id: Date.now().toString(),
        user_id: userId,
        amount_ml: totalVolume,
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        source: 'food',
        food_log_id: foodLog.id
      };
      waterLogs.push(newWaterLog);
      toast({ title: "Hidratação sincronizada", description: `+${totalVolume}ml registrados automaticamente.` });
    } else if (action === 'delete') {
      const index = waterLogs.findIndex(w => w.food_log_id === foodLog.id);
      if (index !== -1) {
        waterLogs.splice(index, 1);
        toast({ title: "Hidratação atualizada", description: "Registro de bebida removido." });
      }
    } else if (action === 'update') {
      const index = waterLogs.findIndex(w => w.food_log_id === foodLog.id);
      if (index !== -1) {
        waterLogs[index].amount_ml = totalVolume;
      }
    }

    localStorage.setItem(`water_logs_${userId}`, JSON.stringify(waterLogs));
  };

  const addFood = (food) => {
    const quantity = quantities[food.name] || 1;
    const logs = JSON.parse(localStorage.getItem(`food_logs_${userId}`) || '[]');
    
    let newLog;
    
    if (editingId) {
      const index = logs.findIndex(l => l.id === editingId);
      if (index !== -1) {
        const oldLog = logs[index];
        logs[index] = {
          ...logs[index],
          food_name: food.name,
          calories: food.calories,
          meal_type: selectedMeal,
          quantity: quantity,
          updated_at: new Date().toISOString()
        };
        newLog = logs[index];
        
        // Sync Hydration (Delete old, Add new logic, or Update)
        syncHydration(newLog, 'update');
      }
      setEditingId(null);
      toast({ title: "Refeição atualizada!" });
    } else {
      newLog = {
        id: Date.now().toString(),
        user_id: userId,
        food_name: food.name,
        calories: food.calories,
        meal_type: selectedMeal,
        quantity: quantity,
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      logs.push(newLog);
      syncHydration(newLog, 'add');
      toast({ title: "Alimento adicionado!", description: `${food.name} (${food.calories * quantity}kcal)` });
    }

    localStorage.setItem(`food_logs_${userId}`, JSON.stringify(logs));

    if (!isOnline) addToSyncQueue('food', newLog);
    
    setQuantities(prev => ({ ...prev, [food.name]: 1 }));
    loadTodayLogs();
    dispatchUpdate();
  };

  const handleDelete = () => {
    if (!deleteId) return;

    const logs = JSON.parse(localStorage.getItem(`food_logs_${userId}`) || '[]');
    const logToDelete = logs.find(l => l.id === deleteId);
    
    if (logToDelete) {
      const newLogs = logs.filter(l => l.id !== deleteId);
      localStorage.setItem(`food_logs_${userId}`, JSON.stringify(newLogs));
      
      // Sync Hydration Delete
      syncHydration(logToDelete, 'delete');

      if (!isOnline) addToSyncQueue('food_delete', { id: deleteId });
      toast({ title: "Alimento removido" });
    }

    setDeleteId(null);
    loadTodayLogs();
    dispatchUpdate();
  };

  const startEdit = (log) => {
    setEditingId(log.id);
    setSelectedMeal(log.meal_type);
    
    // Switch tab to add
    setActiveTab('adicionar');
    
    // Set quantity
    setQuantities({ [log.food_name]: log.quantity });
    
    // Find category
    let foundCat = 'Frutas';
    Object.entries(FOOD_CATEGORIES).forEach(([cat, foods]) => {
      if (foods.find(f => f.name === log.food_name)) {
        foundCat = cat;
      }
    });
    setSelectedCategory(foundCat);
  };

  const getFilteredFoods = () => {
    if (searchTerm) {
      return ALL_FOODS.filter(food =>
        food.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return FOOD_CATEGORIES[selectedCategory] || [];
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
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Utensils className="w-5 h-5 text-orange-400" />
              </div>
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'Editar Refeição' : 'Alimentação'}
              </h2>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="w-full bg-slate-800 grid grid-cols-2 gap-2 h-auto p-1">
              <TabsTrigger value="adicionar" className="data-[state=active]:bg-orange-600 py-3">
                {editingId ? 'Editar' : 'Adicionar'}
              </TabsTrigger>
              <TabsTrigger value="hoje" className="data-[state=active]:bg-slate-700 py-3">
                Hoje
              </TabsTrigger>
            </TabsList>

            <TabsContent value="adicionar" className="mt-6 space-y-4">
               {editingId && (
                  <div className="bg-orange-500/10 border border-orange-500/50 rounded-lg p-3 text-orange-200 text-sm mb-4">
                    Editando o item selecionado. Ajuste a quantidade ou escolha outro alimento para substituir.
                  </div>
               )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Refeição</label>
                  <select
                    value={selectedMeal}
                    onChange={(e) => setSelectedMeal(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[48px]"
                  >
                    {MEAL_TYPES.map(meal => <option key={meal} value={meal}>{meal}</option>)}
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">Buscar</label>
                   <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar alimento..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[48px]"
                    />
                  </div>
                </div>
              </div>

              {!searchTerm && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                  {Object.keys(FOOD_CATEGORIES).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors min-h-[40px] ${
                        selectedCategory === cat
                          ? 'bg-orange-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {getFilteredFoods().map((food) => {
                  const quantity = quantities[food.name] || 1;
                  return (
                    <div key={food.name} className="bg-slate-800/50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-white font-medium">{food.name}</p>
                        <div className="flex gap-2 text-sm">
                          <span className="text-orange-400">{food.calories} kcal</span>
                          <span className="text-slate-500">/ {food.unit}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex items-center bg-slate-700 rounded-lg">
                          <button
                            onClick={() => updateQuantity(food.name, -1)}
                            className="p-3 hover:bg-slate-600 rounded-l-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4 text-white" />
                          </button>
                          <span className="px-4 text-white font-semibold">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(food.name, 1)}
                            className="p-3 hover:bg-slate-600 rounded-r-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4 text-white" />
                          </button>
                        </div>
                        <button
                          onClick={() => addFood(food)}
                          className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        >
                          {editingId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="hoje" className="mt-6">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {todayLogs.map((log) => (
                  <div key={log.id} className="bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-medium">{log.food_name}</p>
                      <div className="flex items-center gap-2">
                         <span className="text-orange-400 font-semibold mr-2">
                          {log.calories * log.quantity} kcal
                        </span>
                        <button onClick={() => startEdit(log)} className="text-slate-500 hover:text-blue-400"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(log.id)} className="text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>{log.meal_type}</span>
                      <span>Qtd: {log.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <Button onClick={onClose} className="w-full bg-slate-800 hover:bg-slate-700 text-white min-h-[48px]">
            Fechar
          </Button>
        </motion.div>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir alimento?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                Isso irá remover o registro. Se for uma bebida, o registro de hidratação também será removido.
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

export default FoodModal;
