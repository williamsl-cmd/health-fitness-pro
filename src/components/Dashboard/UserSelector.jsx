import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

function UserSelector({ currentUser, onSwitchUser, onAddUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(storedUsers);
  }, [isOpen]); // Refresh list when opened

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:text-white"
      >
        <Users className="w-4 h-4 mr-2" />
        Trocar Usuário
      </Button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Selecionar Usuário</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto mb-6 pr-2">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      if (user.id !== currentUser.id) {
                        onSwitchUser(user);
                        setIsOpen(false);
                      }
                    }}
                    className={`w-full flex items-center p-3 rounded-xl transition-all ${
                      user.id === currentUser.id
                        ? 'bg-cyan-500/20 border border-cyan-500/50'
                        : 'bg-slate-800/50 border border-transparent hover:bg-slate-800'
                    }`}
                  >
                    <div className="relative w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden mr-3 shrink-0">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-slate-300">
                          {getInitials(user.name)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 text-left overflow-hidden">
                      <p className={`font-medium truncate ${user.id === currentUser.id ? 'text-white' : 'text-slate-300'}`}>
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    {user.id === currentUser.id && (
                      <div className="p-1 bg-cyan-500 rounded-full ml-2">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <Button
                onClick={() => {
                  setIsOpen(false);
                  onAddUser();
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 border-dashed"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Adicionar Novo Usuário
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default UserSelector;