import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Check, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

function PasswordResetForm({ onSubmit, isLoading }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    }
    // Basic complexity check (optional but good practice)
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      newErrors.complexity = 'Inclua letra maiúscula e número';
    }
    if (password !== confirmPassword) {
      newErrors.match = 'As senhas não coincidem';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(password);
    }
  };

  const getStrength = () => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = getStrength();
  const strengthColor = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'][strength] || 'bg-slate-700';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Nova Senha
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-11 pr-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            placeholder="Nova senha"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Strength Bar */}
        <div className="flex gap-1 mt-2 h-1">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className={`flex-1 rounded-full transition-colors duration-300 ${strength >= i ? strengthColor : 'bg-slate-800'}`} 
            />
          ))}
        </div>
        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
        {errors.complexity && <p className="text-orange-400 text-xs mt-1">{errors.complexity}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Confirmar Senha
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            placeholder="Confirme a nova senha"
          />
        </div>
        {errors.match && <p className="text-red-400 text-xs mt-1">{errors.match}</p>}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 rounded-xl transition-all"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
            Redefinindo...
          </span>
        ) : (
          'Redefinir Senha'
        )}
      </Button>
    </form>
  );
}

export default PasswordResetForm;