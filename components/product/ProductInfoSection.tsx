import React from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/theme-context';
import { formatDate, formatCurrency } from '../../services/utils';

import { CategoryPicker } from './CategoryPicker';

interface ProductInfoSectionProps {
  product: any;
  isEditing: boolean;
  editData: any;
  categoryId: string | null;
  categoryName: string;
  purchaseDate: string;
  setEditData: (data: any) => void;
  setCategoryId: (id: string | null) => void;
  setCategoryName: (name: string) => void;
  setPurchaseDate: (date: string) => void;
}

export const ProductInfoSection = ({
  product,
  isEditing,
  editData,
  categoryId,
  categoryName,
  purchaseDate,
  setEditData,
  setCategoryId,
  setCategoryName,
  setPurchaseDate,
}: ProductInfoSectionProps) => {
  const { colors, isDark } = useTheme();

  const renderField = (label: string, value: string, icon: any, key?: string, isDate = false, isPrice = false, multiline = false) => {
    const displayValue = value || '---';

    return (
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.subtitle }]}>{label}</Text>
        {isEditing ? (
          <View style={[
            styles.inputWrapper, 
            { backgroundColor: isDark ? colors.inputBg : '#F1F5F9', borderColor: colors.secondary },
            multiline && { height: 100, alignItems: 'flex-start', paddingTop: 12 }
          ]}>
            <Ionicons name={icon} size={20} color={colors.subtitle} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }, multiline && { height: '100%' }]}
              value={value}
              onChangeText={(t) => {
                if (isDate) setPurchaseDate(formatDate(t));
                else if (isPrice) setEditData({ ...editData, price: formatCurrency(t) });
                else if (key) setEditData({ ...editData, [key]: t });
              }}
              placeholder={isDate ? "DD/MM/AAAA" : ""}
              placeholderTextColor={colors.subtitle}
              maxLength={isDate ? 10 : undefined}
              keyboardType={isDate || isPrice ? "numeric" : "default"}
              multiline={multiline}
            />
          </View>
        ) : (
          <Text style={[styles.value, { color: colors.text, backgroundColor: isDark ? colors.inputBg : '#F8FAFC' }]}>
            {isPrice && product.price ? `R$ ${parseFloat(product.price).toFixed(2).replace('.', ',')}` : displayValue}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      {renderField('Nome do Produto', isEditing ? editData.name : product.name, 'pricetag-outline', 'name')}
      
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          {renderField('Marca', isEditing ? editData.brand : product.brand, 'business-outline', 'brand')}
        </View>
        <View style={{ flex: 1 }}>
          {renderField('Modelo', isEditing ? editData.model : product.model, 'barcode-outline', 'model')}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.subtitle }]}>Categoria</Text>
        {isEditing ? (
          <CategoryPicker
            selectedId={categoryId}
            selectedName={categoryName}
            onSelect={(id, name) => {
              setCategoryId(id);
              setCategoryName(name);
            }}
          />
        ) : (
          <Text style={[styles.value, { color: colors.text, backgroundColor: isDark ? colors.inputBg : '#F8FAFC' }]}>
            {product.category?.name || '---'}
          </Text>
        )}
      </View>
      {renderField('Data de Compra', isEditing ? purchaseDate : purchaseDate, 'calendar-outline', undefined, false, true)}
      {renderField('Valor Estimado', isEditing ? editData.price?.toString() : '', 'cash-outline', undefined, false, false, true)}
      {renderField('Notas / Observações', isEditing ? editData.notes : product.notes, 'document-text-outline', 'notes', false, false, false, true)}
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
  inputIcon: {
    marginRight: 12,
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
});
