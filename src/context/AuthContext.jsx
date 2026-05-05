import { createContext, useContext, useState, useEffect } from "react";
import { authAPI, setToken, removeToken, isAuthenticated } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token && isAuthenticated()) {
        try {
          const userData = await authAPI.getProfile();
          if (userData.success) {
            setUser(userData.data);
          } else {
            removeToken();
          }
        } catch (err) {
          console.error("Failed to get user profile", err);
          removeToken();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const result = await authAPI.login(email, password);
    
    if (result.success && result.data.token) {
      setToken(result.data.token);
      setUser(result.data.user);
    }
    
    return result;
  };

  const register = async (userData) => {
    const result = await authAPI.register(userData);
    
    if (result.success && result.data.token) {
      setToken(result.data.token);
      setUser(result.data.user);
    }
    
    return result;
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
