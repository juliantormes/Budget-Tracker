import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const login = (username, password) => {
    setCredentials({ username, password });
  };

  const logout = () => {
    setCredentials({ username: '', password: '' });
  };

  return (
    <AuthContext.Provider value={{ credentials, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
