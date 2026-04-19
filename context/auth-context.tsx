import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter, useSegments } from 'expo-router';
import { DeviceEventEmitter } from 'react-native';
import { AUTH_EVENTS } from '../services/api';

const TOKEN_KEY = 'user_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  signIn: (accessToken: string, refreshToken: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load token from storage on mount
    const loadToken = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (savedToken) {
          setToken(savedToken);
        }
      } catch (e) {
        console.error('Failed to load token', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();

    // Listeners para eventos do api.ts
    const refreshSub = DeviceEventEmitter.addListener(AUTH_EVENTS.TOKEN_REFRESHED, (newToken) => {
      setToken(newToken);
    });

    const clearSub = DeviceEventEmitter.addListener(AUTH_EVENTS.TOKEN_CLEARED, () => {
      setToken(null);
    });

    return () => {
      refreshSub.remove();
      clearSub.remove();
    };
  }, []);

  const signIn = async (accessToken: string, refreshToken: string) => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      setToken(accessToken);
    } catch (e) {
      console.error('Failed to save tokens', e);
    }
  };

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      setToken(null);
    } catch (e) {
      console.error('Failed to delete tokens', e);
    }
  };

  return (
    <AuthContext.Provider value={{ token, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
