import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Demo users for MVP
  const demoUsers = {
    'developer@demo.com': { role: 'Developer', name: 'John Developer' },
    'dpo@demo.com': { role: 'DPO', name: 'Sarah DPO' },
    'executive@demo.com': { role: 'Executive', name: 'Mike Executive' }
  };

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('ai-dashboard-user');
    const savedProfile = localStorage.getItem('ai-dashboard-profile');
    
    if (savedUser && savedProfile) {
      setUser(JSON.parse(savedUser));
      setUserProfile(JSON.parse(savedProfile));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Simple demo authentication
      if (demoUsers[email] && password === 'demo123') {
        const user = { email, uid: `demo-${Date.now()}` };
        const profile = demoUsers[email];
        
        setUser(user);
        setUserProfile(profile);
        
        // Save to localStorage
        localStorage.setItem('ai-dashboard-user', JSON.stringify(user));
        localStorage.setItem('ai-dashboard-profile', JSON.stringify(profile));
        
        return { success: true, user };
      } else {
        return { success: false, error: 'Invalid email or password' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, role, name) => {
    try {
      // Simple demo registration
      const user = { email, uid: `demo-${Date.now()}` };
      const profile = { role, name, email, createdAt: new Date().toISOString() };
      
      setUser(user);
      setUserProfile(profile);
      
      // Save to localStorage
      localStorage.setItem('ai-dashboard-user', JSON.stringify(user));
      localStorage.setItem('ai-dashboard-profile', JSON.stringify(profile));
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setUserProfile(null);
      
      // Clear localStorage
      localStorage.removeItem('ai-dashboard-user');
      localStorage.removeItem('ai-dashboard-profile');
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Demo login function for MVP
  const demoLogin = async (role) => {
    const demoCredentials = {
      'Developer': { email: 'developer@demo.com', password: 'demo123' },
      'DPO': { email: 'dpo@demo.com', password: 'demo123' },
      'Executive': { email: 'executive@demo.com', password: 'demo123' }
    };

    const credentials = demoCredentials[role];
    if (credentials) {
      return await login(credentials.email, credentials.password);
    }
    return { success: false, error: 'Invalid demo role' };
  };

  const value = {
    user,
    userProfile,
    login,
    register,
    logout,
    demoLogin,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}