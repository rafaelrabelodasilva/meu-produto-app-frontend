import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/theme-context';
import { useResponsive } from '../../hooks/use-responsive';

interface ProductFooterActionsProps {
  isEditing: boolean;
  saving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export const ProductFooterActions = ({
  isEditing,
  saving,
  onEdit,
  onCancel,
  onSave,
}: ProductFooterActionsProps) => {
  const { colors, isDark } = useTheme();
  const { isTablet } = useResponsive();

  return (
    <View style={[styles.footer, isTablet && styles.footerTablet]}>
      {isEditing ? (
        <View style={styles.editActions}>
          <TouchableOpacity 
            style={[styles.cancelButton, { backgroundColor: isDark ? colors.inputBg : '#F1F5F9' }]} 
            onPress={onCancel}
          >
            <Text style={[styles.cancelButtonText, { color: colors.subtitle }]}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: colors.success }]} 
            onPress={onSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={[styles.editModeButton, { backgroundColor: colors.secondary, shadowColor: colors.secondary }]} 
          onPress={onEdit}
        >
          <Text style={styles.editModeButtonText}>Editar Item</Text>
          <Ionicons name="create-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  footerTablet: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  editModeButton: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  editModeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  saveButton: {
    flex: 2,
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
