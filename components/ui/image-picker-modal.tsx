import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/theme-context';
import { useResponsive } from '../../hooks/use-responsive';

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onLibrary: () => void;
}

export function ImagePickerModal({ visible, onClose, onCamera, onLibrary }: ImagePickerModalProps) {
  const { colors, isDark } = useTheme();
  const { isTablet } = useResponsive();
  const [pendingAction, setPendingAction] = useState<'camera' | 'library' | null>(null);

  // No iOS, esperamos o modal fechar completamente antes de abrir a câmera/galeria
  const handleDismiss = () => {
    if (pendingAction === 'camera') {
      onCamera();
    } else if (pendingAction === 'library') {
      onLibrary();
    }
    setPendingAction(null);
  };

  const handleAction = (action: 'camera' | 'library') => {
    if (Platform.OS === 'ios') {
      setPendingAction(action);
      onClose();
    } else {
      // No Android funciona direto
      onClose();
      setTimeout(() => action === 'camera' ? onCamera() : onLibrary(), 100);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType={isTablet ? "fade" : "slide"}
      onRequestClose={onClose}
      onDismiss={handleDismiss}
    >
      <Pressable style={[styles.overlay, isTablet && styles.overlayTablet]} onPress={onClose}>
        <View style={[
          styles.content, 
          { backgroundColor: colors.card },
          isTablet && styles.contentTablet
        ]}>
          <View style={[styles.handle, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }, isTablet && { display: 'none' }]} />
          
          <Text style={[styles.title, { color: colors.text }]}>Selecionar Imagem</Text>
          <Text style={[styles.subtitle, { color: colors.subtitle }]}>Escolha como deseja adicionar a foto ao Gatinho Organizador.</Text>

          <View style={styles.options}>
            <TouchableOpacity 
              style={[styles.optionButton, { backgroundColor: isDark ? colors.inputBg : '#F8FAFC' }]} 
              onPress={() => handleAction('camera')}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="camera" size={28} color="#0042cf" />
              </View>
              <Text style={[styles.optionText, { color: colors.text }]}>Usar Câmera</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.optionButton, { backgroundColor: isDark ? colors.inputBg : '#F8FAFC' }]} 
              onPress={() => handleAction('library')}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="images" size={28} color="#EF4444" />
              </View>
              <Text style={[styles.optionText, { color: colors.text }]}>Abrir Galeria</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.cancelButton, { backgroundColor: isDark ? colors.inputBg : '#F1F5F9' }]} onPress={onClose}>
            <Text style={[styles.cancelButtonText, { color: colors.subtitle }]}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  overlayTablet: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  contentTablet: {
    maxWidth: 500,
    borderRadius: 32,
    paddingBottom: 24,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  options: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    marginBottom: 24,
  },
  optionButton: {
    flex: 1,
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  cancelButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
