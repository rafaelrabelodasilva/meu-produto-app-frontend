import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '../../context/auth-context';
import { useTheme } from '../../context/theme-context';

export default function TabLayout() {
  const { token } = useAuth();
  const { colors, isDark } = useTheme();
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
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.subtitle,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: isDark ? colors.border : '#F1F5F9',
          backgroundColor: colors.card,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="grid" color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Adicionar',
          tabBarIcon: ({ color }) => (
            <View style={{
              backgroundColor: colors.secondary,
              width: 50,
              height: 50,
              borderRadius: 25,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: -20, // Levanta o botão para destaque
              shadowColor: colors.secondary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}>
              <Ionicons size={32} name="add" color={colors.white} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="options-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}

import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
