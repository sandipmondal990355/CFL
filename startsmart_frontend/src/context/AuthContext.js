import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [role, setRoleState] = useState(() => {
    const savedRole = sessionStorage.getItem('startsmart_role');
    if (!savedRole) {
      sessionStorage.setItem('startsmart_role', 'HR');
      return 'HR';
    }
    return savedRole;
  });

  const setRole = (newRole) => {
    sessionStorage.setItem('startsmart_role', newRole);
    setRoleState(newRole);
  };

  return (
    <AuthContext.Provider value={{ role, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
