
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const GaugeChart = ({ value }) => {
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  
  const data = [
    { name: 'Progress', value: normalizedValue },
    { name: 'Remaining', value: 100 - normalizedValue },
  ];

  // Colors based on progress
  let color = '#ea580c'; // Orange-600 default
  if (normalizedValue >= 100) color = '#22c55e'; // Green if goal reached

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            dataKey="value"
            startAngle={180}
            endAngle={0}
            data={data}
            cx="50%"
            cy="70%" 
            innerRadius="75%"
            outerRadius="100%"
            paddingAngle={0}
            stroke="none"
          >
            <Cell key="progress" fill={color} cornerRadius={10} />
            <Cell key="remaining" fill="#1e293b" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-[60%] left-0 right-0 text-center -translate-y-1/2">
        <p className="text-2xl font-bold text-orange-500">{normalizedValue.toFixed(0)}%</p>
      </div>
    </div>
  );
};

export default GaugeChart;
