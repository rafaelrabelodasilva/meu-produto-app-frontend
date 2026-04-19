import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const TOAST_HEIGHT = 80;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');
  const translateY = useRef(new Animated.Value(-200)).current;
  const insets = useSafeAreaInsets();

  const showToast = useCallback((msg: string, toastType: ToastType = 'info') => {
    setMessage(msg);
    setType(toastType);
    setVisible(true);

    // Slide in
    Animated.spring(translateY, {
      toValue: insets.top + 10,
      useNativeDriver: true,
      bounciness: 8,
    }).start();

    // Hide after 3 seconds
    setTimeout(() => {
      Animated.timing(translateY, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }, 3000);
  }, [insets.top, translateY]);

  const getIcon = () => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'alert-circle';
      default: return 'information-circle';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success': return { bg: '#ECFDF5', border: '#10B981', text: '#065F46', icon: '#10B981' };
      case 'error': return { bg: '#FEF2F2', border: '#EF4444', text: '#991B1B', icon: '#EF4444' };
      default: return { bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF', icon: '#3B82F6' };
    }
  };

  const colors = getColors();

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visible && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              transform: [{ translateY }],
              backgroundColor: colors.bg,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.content}>
            <Ionicons name={getIcon() as any} size={24} color={colors.icon} style={styles.icon} />
            <Text style={[styles.text, { color: colors.text }]}>{message}</Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9999,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  text: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
});
