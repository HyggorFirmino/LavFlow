import { useState, useEffect } from 'react';
import { User } from '../types';
import { getAccessToken, refreshToken, login as apiLogin } from '../services/apiService';

// This is a simplified example. In a real app, you'd fetch the user from the API.
const fetchUser = async (): Promise<User | null> => {
  const token = getAccessToken();
  if (!token) return null;

  // Here you would typically make an API call to get user data
  // For now, we'll return a mock user if the token is valid
  // You might need to adjust this based on your API
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return await response.json();
    }

    // If the access token is expired, try to refresh it
    const refreshed = await refreshToken();
    if (refreshed) {
      const newResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
        },
      });
      if (newResponse.ok) {
        return await newResponse.json();
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch user', error);
    return null;
  }
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
