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
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (err) {
          console.error("Failed to parse stored user", err);
        }
      }
      
      if (token && isAuthenticated()) {
        try {
          const userData = await authAPI.getProfile();
          if (userData.success) {
            const userInfo = {
              id: userData.data?.id || userData.data?.userid,
              firstName: userData.data?.firstName || userData.data?.firstname || 'User',
              lastName: userData.data?.lastName || userData.data?.lastname || '',
              email: userData.data?.email
            };
            localStorage.setItem('user', JSON.stringify(userInfo));
            setUser(userInfo);
          } else {
            removeToken();
            localStorage.removeItem('user');
          }
        } catch (err) {
          console.error("Failed to get user profile", err);
          removeToken();
          localStorage.removeItem('user');
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
      // Store user info in localStorage for later use
      const userInfo = {
        id: result.data.user?.id || result.data.user?.userid,
        firstName: result.data.user?.firstName || result.data.user?.firstname || 'User',
        lastName: result.data.user?.lastName || result.data.user?.lastname || '',
        email: result.data.user?.email || email
      };
      localStorage.setItem('user', JSON.stringify(userInfo));
      setUser(userInfo);
    }

    return result;
  };

  const register = async (userData) => {
    const result = await authAPI.register(userData);

    if (result.success && result.data.token) {
      setToken(result.data.token);
      // Store user info in localStorage for later use
      const userInfo = {
        id: result.data.user?.id || result.data.user?.userid,
        firstName: result.data.user?.firstName || result.data.user?.firstname || userData.firstName || 'User',
        lastName: result.data.user?.lastName || result.data.user?.lastname || userData.lastName || '',
        email: result.data.user?.email || userData.email
      };
      localStorage.setItem('user', JSON.stringify(userInfo));
      setUser(userInfo);
    }

    return result;
  };

  const logout = () => {
    removeToken();
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const updatedUser = {
      ...user,
      firstName: updatedData.firstname || updatedData.firstName || user.firstName,
      lastName: updatedData.lastname || updatedData.lastName || user.lastName,
      email: updatedData.email || user.email,
      phoneNumber: updatedData.phonenumber || updatedData.phoneNumber || user.phoneNumber
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
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
