import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/auth-context';
import { useTheme } from '../../context/theme-context';
import { useResponsive } from '../../hooks/use-responsive';

export default function TabLayout() {
  const { token } = useAuth();
  const { colors, isDark } = useTheme();
  const { isTablet, tabBarHorizontalPadding } = useResponsive();
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
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon', // Força ícone em cima e texto embaixo em tudo
        tabBarStyle: {
          height: isTablet ? 85 : (Platform.OS === 'ios' ? 90 : 70), 
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
          paddingHorizontal: isTablet ? tabBarHorizontalPadding : 0,
          paddingBottom: isTablet ? 15 : (Platform.OS === 'ios' ? 30 : 12),
          paddingTop: 8,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? "grid" : "grid-outline"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Adicionar',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? colors.secondary : 'transparent',
              width: 48,
              height: 28,
              borderRadius: 14,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: focused ? 0 : 1.5,
              borderColor: color,
              marginBottom: -2,
            }}>
              <Ionicons size={20} name="add" color={focused ? colors.white : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? "options" : "options-outline"} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
