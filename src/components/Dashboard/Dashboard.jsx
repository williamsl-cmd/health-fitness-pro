
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Wifi, WifiOff, RefreshCw, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WeightCard from './WeightCard';
import WeightEvolutionCard from './WeightEvolutionCard';
import GoalCard from './GoalCard';
import HydrationCard from './HydrationCard';
import FoodCard from './FoodCard';
import CalorieGoalCard from './CalorieGoalCard';
import ExerciseCard from './ExerciseCard';
import MeasurementsCard from './MeasurementsCard';
import ProfilePictureUpload from './ProfilePictureUpload';
import UserSelector from './UserSelector';
import { useSyncManager, forceRefresh } from '@/lib/syncManager';

function Dashboard({ user, onLogout, onAddUser, onUpdateUser }) {
  const [isLoading, setIsLoading] = useState(true);
  const { isOnline, isSyncing, pendingSyncs, syncData } = useSyncManager();
  const [dataVersion, setDataVersion] = useState(0);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setIsLoading(false), 500);

    // Listen for local updates to refresh all cards
    const handleLocalUpdate = () => {
      setDataVersion(prev => prev + 1);
    };

    window.addEventListener('localDataUpdated', handleLocalUpdate);
    return () => window.removeEventListener('localDataUpdated', handleLocalUpdate);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6 lg:p-8 pt-safe-top pb-safe-bottom">
      {/* Network Status Banner */}
      {!isOnline && (
        <div className="bg-orange-600/20 border border-orange-500/50 text-orange-200 px-4 py-2 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">Você está offline. Alterações serão salvas localmente.</span>
          </div>
        </div>
      )}
      
      {isOnline && pendingSyncs > 0 && (
        <div className="bg-blue-600/20 border border-blue-500/50 text-blue-200 px-4 py-2 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">
              {isSyncing ? 'Sincronizando dados...' : `${pendingSyncs} alterações pendentes para sincronização`}
            </span>
          </div>
          {!isSyncing && (
            <button 
              onClick={syncData}
              className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white transition-colors"
            >
              Sincronizar
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-8"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <ProfilePictureUpload user={user} onUpdate={onUpdateUser} />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                Olá, {user.name}
              </h1>
              <p className="text-slate-400 text-sm">Bem-vindo ao Health & Fitness PRO!</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
             <Button
              onClick={forceRefresh}
              variant="outline"
              title="Forçar Recarregamento"
              className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700 min-w-[44px] min-h-[44px]"
            >
              <RefreshCcw className="w-4 h-4" />
            </Button>
            <div className="flex-1 sm:flex-none">
              <UserSelector 
                currentUser={user} 
                onSwitchUser={onUpdateUser} 
                onAddUser={onAddUser} 
              />
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              className="bg-slate-800/50 border-slate-700 text-white hover:bg-red-500/20 hover:border-red-500 min-w-[44px] min-h-[44px]"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
          {/* Weight Section */}
          <WeightEvolutionCard userId={user.id} dataVersion={dataVersion} />
          <WeightCard userId={user.id} dataVersion={dataVersion} />
          <GoalCard userId={user.id} dataVersion={dataVersion} />
          
          {/* Daily Tracking */}
          <CalorieGoalCard userId={user.id} dataVersion={dataVersion} />
          <FoodCard userId={user.id} dataVersion={dataVersion} />
          <ExerciseCard userId={user.id} dataVersion={dataVersion} />
          <HydrationCard userId={user.id} dataVersion={dataVersion} />
        </div>

        {/* Measurements Card - Full Width */}
        <MeasurementsCard userId={user.id} dataVersion={dataVersion} />
      </motion.div>
    </div>
  );
}

export default Dashboard;
