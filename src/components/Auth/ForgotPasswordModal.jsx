import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User, Calendar, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import PasswordResetForm from './PasswordResetForm';

function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState(1); // 1: Email, 2: Verification, 3: Reset
  const [email, setEmail] = useState('');
  const [verificationData, setVerificationData] = useState({ name: '', dateOfBirth: '' });
  const [foundUser, setFoundUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === email);

      if (user) {
        setFoundUser(user);
        setStep(2);
      } else {
        toast({
          title: "Erro",
          description: "Email não encontrado no sistema.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 600);
  };

  const handleVerificationSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      // Basic fuzzy match for name (case insensitive, trim)
      const inputName = verificationData.name.trim().toLowerCase();
      const storedName = foundUser.name.trim().toLowerCase();
      
      const isNameMatch = inputName === storedName;
      const isDobMatch = verificationData.dateOfBirth === foundUser.dateOfBirth;

      if (isNameMatch && isDobMatch) {
        setStep(3);
      } else {
        toast({
          title: "Verificação falhou",
          description: "As informações fornecidas não correspondem aos nossos registros.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 800);
  };

  const handlePasswordReset = (newPassword) => {
    setIsLoading(true);
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map(u => 
        u.id === foundUser.id ? { ...u, password: newPassword } : u
      );
      
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      toast({
        title: "Sucesso!",
        description: "Sua senha foi redefinida com sucesso. Faça login para continuar.",
      });
      
      onClose();
    }, 1000);
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-700 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
        >
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="absolute top-4 left-4 p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors z-10"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="mt-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-cyan-500/20 rounded-full mb-4">
                      <Mail className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Recuperar Senha</h2>
                    <p className="text-slate-400 text-sm mt-2">
                      Digite seu email para iniciarmos o processo de recuperação.
                    </p>
                  </div>

                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                          placeholder="seu@email.com"
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-xl"
                    >
                      {isLoading ? 'Verificando...' : 'Continuar'}
                    </Button>
                  </form>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full mb-4">
                      <ShieldCheck className="w-6 h-6 text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Verificação de Segurança</h2>
                    <p className="text-slate-400 text-sm mt-2">
                      Para sua segurança, confirme seus dados pessoais.
                    </p>
                  </div>

                  <form onSubmit={handleVerificationSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Nome Completo</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={verificationData.name}
                          onChange={(e) => setVerificationData({ ...verificationData, name: e.target.value })}
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                          placeholder="Como cadastrado"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Data de Nascimento</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="date"
                          required
                          value={verificationData.dateOfBirth}
                          onChange={(e) => setVerificationData({ ...verificationData, dateOfBirth: e.target.value })}
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl"
                    >
                      {isLoading ? 'Verificando...' : 'Verificar'}
                    </Button>
                  </form>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Redefinir Senha</h2>
                    <p className="text-slate-400 text-sm mt-2">
                      Crie uma nova senha segura para sua conta.
                    </p>
                  </div>
                  <PasswordResetForm onSubmit={handlePasswordReset} isLoading={isLoading} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default ForgotPasswordModal;