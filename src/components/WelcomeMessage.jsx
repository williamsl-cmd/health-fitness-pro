
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trophy } from 'lucide-react';

const WelcomeMessage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="max-w-2xl mx-auto bg-gradient-to-br from-teal-600 to-blue-700 text-white p-6 rounded-xl shadow-xl text-center mt-8"
    >
      <Sparkles className="w-12 h-12 mx-auto mb-4 text-white" />
      <h2 className="text-3xl font-bold mb-3">Bem-vindo(a) ao Health & Fitness PRO!</h2>
      <p className="text-lg mb-4 opacity-90">
        Seu guia completo para uma vida mais saudável e ativa.
      </p>
      <div className="flex items-center justify-center gap-2 text-sm font-medium bg-white/20 px-4 py-2 rounded-full w-fit mx-auto">
        <Trophy className="w-4 h-4" />
        <span>Alcance seus objetivos de bem-estar</span>
      </div>
    </motion.div>
  );
};

export default WelcomeMessage;
