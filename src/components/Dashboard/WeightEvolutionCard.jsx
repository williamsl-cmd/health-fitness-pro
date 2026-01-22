
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function WeightEvolutionCard({ userId, dataVersion }) {
  const [data, setData] = useState([]);
  const [trend, setTrend] = useState(null);

  useEffect(() => {
    loadData();
  }, [userId, dataVersion]);

  const loadData = () => {
    const logs = JSON.parse(localStorage.getItem(`weight_logs_${userId}`) || '[]');
    
    // Sort by date ascending
    const sortedLogs = logs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    // Format for chart
    const chartData = sortedLogs.map(log => ({
      date: new Date(log.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      fullDate: new Date(log.created_at).toLocaleDateString('pt-BR'),
      weight: log.weight_kg + (log.weight_g / 1000)
    }));

    setData(chartData);

    // Calculate trend (last vs first of current view)
    if (chartData.length >= 2) {
      const first = chartData[0].weight;
      const last = chartData[chartData.length - 1].weight;
      setTrend(last - first);
    }
  };

  if (data.length < 2) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl col-span-1 md:col-span-2 xl:col-span-1"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          Evolução do Peso
        </h3>
        {trend !== null && (
          <div className={`text-sm font-medium px-3 py-1 rounded-full ${trend > 0 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
            {trend > 0 ? '+' : ''}{trend.toFixed(1)} kg
          </div>
        )}
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis 
              dataKey="date" 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              dx={-10}
              domain={['dataMin - 1', 'dataMax + 1']}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
              formatter={(value) => [`${value.toFixed(1)} kg`, 'Peso']}
              labelFormatter={(label, payload) => payload[0]?.payload.fullDate || label}
            />
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="#3b82f6" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#1e293b', stroke: '#3b82f6', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default WeightEvolutionCard;
