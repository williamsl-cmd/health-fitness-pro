
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Apple } from 'lucide-react';

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if on iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIPad = userAgent.includes('ipad');
    const isIPhone = userAgent.includes('iphone');
    const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
    setIsIOS((isIPad || isIPhone) && isSafari);

    // PWA prompt for Android/Desktop
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    });

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
      setShowPrompt(false);
    }
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        setDeferredPrompt(null);
        setShowPrompt(false);
      });
    } else if (isIOS) {
      // For iOS, provide instructions
      setShowPrompt(false); // Close the prompt after user interaction
      alert("Para instalar o Health & Fitness PRO, toque no ícone 'Compartilhar' e selecione 'Adicionar à Tela de Início'.");
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showPrompt && !isIOS) return null; // Don't show if already installed or no prompt event for Android/Desktop
  
  // If on iOS and not standalone, show a prompt. For Android/Desktop, show if deferredPrompt exists.
  if (!isIOS && !deferredPrompt) return null;

  return (
    <AnimatePresence>
      {(showPrompt || isIOS) && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-4 right-4 bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-lg z-50 max-w-sm mx-auto"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {isIOS ? (
                 <Apple className="w-6 h-6 text-slate-300" />
              ) : (
                <Download className="w-6 h-6 text-slate-300" />
              )}
              <div>
                <p className="text-white font-semibold">Instale Health & Fitness PRO</p>
                <p className="text-slate-400 text-sm">Adicione à sua tela inicial para acesso rápido!</p>
              </div>
            </div>
            <button onClick={handleClose} className="text-slate-400 hover:text-white transition-colors p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleInstallClick}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded-lg transition-colors"
          >
            {isIOS ? "Instruções de Instalação (iOS)" : "Instalar Aplicativo"}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default InstallPrompt;
