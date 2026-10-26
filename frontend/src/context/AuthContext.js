import React, { createContext, useEffect, useState, useCallback } from 'react';
import * as authApi from '../api/authApi';
import { saveToken, getToken, clearToken } from '../services/storageService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (await getToken()) setUser((await authApi.getMe()).data);
      } catch { await clearToken(); }
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (identifier, password) => {
    const res = await authApi.login({ identifier, password });
    await saveToken(res.data.token);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(async () => { await clearToken(); setUser(null); }, []);

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}
