import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser } from '../types';

const AUTH_KEY = 'yomi_auth_user';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(AUTH_KEY).then(raw => {
      if (raw) {
        try { setUser(JSON.parse(raw)); } catch {}
      }
      setLoading(false);
    });
  }, []);

  const saveUser = async (u: AuthUser) => {
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(u));
    setUser(u);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    setUser(null);
  };

  return { user, loading, saveUser, logout };
}
