
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ruler } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import MeasurementsModal from '@/components/Modals/MeasurementsModal';
import { dispatchUpdate } from '@/lib/syncManager';

function MeasurementsCard({ userId, dataVersion }) {
  const [measurements, setMeasurements] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadMeasurements();
  }, [userId, dataVersion]);

  const loadMeasurements = () => {
    const logs = JSON.parse(localStorage.getItem(`body_measurements_${userId}`) || '[]');
    
    if (logs.length > 0) {
      // Sort for chart
      const sortedLogs = [...logs].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      
      const data = sortedLogs.slice(-10).map(log => ({
        date: new Date(log.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        fullDate: new Date(log.created_at).toLocaleDateString('pt-BR'),
        cintura: log.waist || 0,
        quadril: log.hip || 0,
        peito: log.chest || 0,
        abdomen: log.upper_abdomen || 0
      }));
      
      setChartData(data);
      setMeasurements(logs[logs.length - 1]);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.01 }}
        onClick={() => setShowModal(true)}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 cursor-pointer hover:border-purple-500/50 transition-all shadow-xl col-span-1 md:col-span-2 xl:col-span-3"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Ruler className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-white font-semibold">Medidas Corporais</h3>
          </div>
          
          {measurements && (
             <div className="flex gap-4 text-sm text-slate-400">
                <span>Cintura: <strong className="text-white">{measurements.waist}cm</strong></span>
                <span>Quadril: <strong className="text-white">{measurements.hip}cm</strong></span>
             </div>
          )}
        </div>

        {!measurements ? (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-4">Nenhuma medida registrada</p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2 rounded-xl transition-colors">
              Registrar Medidas
            </button>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '8px' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line name="Cintura" type="monotone" dataKey="cintura" stroke="#c084fc" strokeWidth={2} dot={false} activeDot={{r: 4}} />
                <Line name="Quadril" type="monotone" dataKey="quadril" stroke="#22d3ee" strokeWidth={2} dot={false} activeDot={{r: 4}} />
                <Line name="Peito" type="monotone" dataKey="peito" stroke="#f472b6" strokeWidth={2} dot={false} activeDot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      {showModal && (
        <MeasurementsModal
          userId={userId}
          onClose={() => {
            setShowModal(false);
            loadMeasurements();
            dispatchUpdate();
          }}
        />
      )}
    </>
  );
}

export default MeasurementsCard;
