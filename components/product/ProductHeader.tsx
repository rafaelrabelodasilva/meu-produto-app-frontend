import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../context/theme-context';

interface ProductHeaderProps {
  title: string;
}

export const ProductHeader = ({ title }: ProductHeaderProps) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: colors.card }]}>
      <TouchableOpacity 
        onPress={() => router.back()} 
        style={[styles.backButton, { backgroundColor: isDark ? colors.inputBg : '#F1F5F9' }]}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      
      <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
      
      <View style={{ width: 40 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 12,
  },
});
