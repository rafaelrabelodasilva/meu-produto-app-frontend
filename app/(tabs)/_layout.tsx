import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '../../context/auth-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { token } = useAuth();
  const router = useRouter();

  // Vigia o token: se sumir (Logout), expulsa para a tela de login
  useEffect(() => {
    if (!token) {
      router.replace('/(auth)/login');
    }
  }, [token]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Adicionar',
          tabBarIcon: ({ color }) => <Ionicons size={32} name="add-circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="settings-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}

import { Ionicons } from '@expo/vector-icons';
