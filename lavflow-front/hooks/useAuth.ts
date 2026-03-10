import { useState, useEffect } from 'react';
import { User } from '../types';
import { getAccessToken } from '../services/maxpanApiService';
import { login as apiLogin } from '../services/userService';

// This is a simplified example. In a real app, you'd fetch the user from the API.
// This is a simplified example. In a real app, you'd fetch the user from the API.
const fetchUser = async (): Promise<User | null> => {
  const token = getAccessToken();
  if (!token) return null;

  // Returning a mock user as the backend auth/profile route does not exist
  // and we are relying on MaxPan tokens.
  return {
    id: 'user-maxpan',
    name: 'Usuário MaxPan',
    email: 'usuario@maxpan.com',
    password: '',
    role: 'ADMIN',
    theme: 'claro',
    stores: []
  };
};

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await fetchUser();
      setCurrentUser(user);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const success = await apiLogin({ email, password });
    if (success) {
      const user = await fetchUser();
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setCurrentUser(null);
  };

  return { currentUser, loading, login, logout };
};
