
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import LoginForm from '@/components/Auth/LoginForm';
import SignupForm from '@/components/Auth/SignupForm';
import Dashboard from '@/components/Dashboard/Dashboard';
import { Toaster } from '@/components/ui/toaster';
import InstallPrompt from '@/components/InstallPrompt';
import { checkAppVersion } from '@/lib/syncManager';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check version and clear cache if needed
    checkAppVersion();

    const user = localStorage.getItem('currentUser');
    if (user) {
      try {
        setCurrentUser(JSON.parse(user));
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Failed to parse user data", e);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  const handleAddUser = () => {
    // Logout but direct to signup
    handleLogout();
    setShowSignup(true);
  };

  const toggleForm = () => {
    setShowSignup(!showSignup);
  };

  return (
    <>
      <Helmet>
        <title>Health & Fitness PRO</title>
        <meta name="description" content="Professional health and fitness tracking application. Track weight, nutrition, hydration, and exercises." />
        <meta name="theme-color" content="#0A0E27" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#0f172a] to-[#0A0E27] pb-safe text-white">
        {!isAuthenticated ? (
          showSignup ? (
            <SignupForm onSignup={handleLogin} onToggleForm={toggleForm} />
          ) : (
            <LoginForm onLogin={handleLogin} onToggleForm={toggleForm} />
          )
        ) : (
          <Dashboard 
            user={currentUser} 
            onLogout={handleLogout} 
            onAddUser={handleAddUser}
            onUpdateUser={handleLogin} 
          />
        )}
        <Toaster />
        <InstallPrompt />
      </div>
    </>
  );
}

export default App;
