import React from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/theme-context';

interface ProductMeasuresSectionProps {
  product: any;
  isEditing: boolean;
  measures: {
    height: string;
    width: string;
    depth: string;
  };
  setMeasures: (measures: any) => void;
}

export const ProductMeasuresSection = ({
  product,
  isEditing,
  measures,
  setMeasures,
}: ProductMeasuresSectionProps) => {
  const { colors, isDark } = useTheme();

  const renderMeasureInput = (label: string, value: string, icon: any, key: string, rotation?: string) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: colors.subtitle }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.inputBg : '#F1F5F9', borderColor: colors.secondary }]}>
        <View style={rotation ? { transform: [{ rotate: rotation }], marginRight: 12 } : { marginRight: 12 }}>
          <Ionicons name={icon} size={20} color={colors.subtitle} />
        </View>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={(t) => setMeasures({ ...measures, [key]: t })}
          keyboardType="decimal-pad"
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.card, { backgroundColor: colors.card, marginTop: 16 }]}>
      <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Dimensões Técnicas</Text>
      
      {isEditing ? (
        <View style={styles.measuresForm}>
          {renderMeasureInput('Altura (cm)', measures.height, 'resize-outline', 'height')}
          {renderMeasureInput('Largura (cm)', measures.width, 'resize-outline', 'width', '90deg')}
          {renderMeasureInput('Profundidade (cm)', measures.depth, 'resize-outline', 'depth', '45deg')}
        </View>
      ) : (
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.subtitle }]}>Tamanho / Medidas</Text>
          <Text style={[styles.value, { color: colors.text, backgroundColor: isDark ? colors.inputBg : '#F8FAFC' }]}>
            {product.size || '---'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    padding: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  measuresForm: {
    gap: 16,
  },
});
