import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const isAuthenticated = !!user;

  useEffect(() => {
    // Check for existing token on app start
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Verify token with server
      fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Token invalid');
      })
      .then(userData => {
        setUser(userData);
        setIsLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('auth_token');
        setUser(null);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (data: any) => {
    try {
      console.log('Making login request with:', data);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      console.log('Login response status:', response.status);
      
      const result = await response.json();
      console.log('Login response data:', result);
      
      if (response.ok) {
        // Create a demo token for authentication flow
        const demoToken = 'demo-auth-token-' + Date.now();
        localStorage.setItem('auth_token', demoToken);
        setUser(result.user);
        console.log('Login successful, user set:', result.user);
        return { success: true, message: result.message };
      } else {
        console.error('Login failed with status:', response.status, result);
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Login request error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const logout = async () => {
    console.log('Logout called');
    try {
      // Call server logout endpoint
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Logout response:', response.status);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state
      console.log('Clearing local state and redirecting');
      localStorage.removeItem('auth_token');
      setUser(null);
      // Force immediate state update
      setIsLoading(false);
      // Use location.replace to avoid navigation history issues
      window.location.replace('/');
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}