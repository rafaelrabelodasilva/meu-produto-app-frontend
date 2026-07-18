import React from 'react';
import { View, Text, TextInput, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/theme-context';
import { formatDate, formatCurrency, parseDateToBR } from '../../services/utils';
import { styles } from './ProductInfoSection.styles';
import { CategoryPicker } from './CategoryPicker';

interface ProductInfoSectionProps {
  product: any;
  isEditing: boolean;
  editData: any;
  categoryId: string | null;
  categoryName: string;
  purchaseDate: string;
  measures: any;
  setEditData: (data: any) => void;
  setCategoryId: (id: string | null) => void;
  setCategoryName: (name: string) => void;
  setPurchaseDate: (date: string) => void;
  setMeasures: (m: any) => void;
}

export const ProductInfoSection = ({
  product,
  isEditing,
  editData,
  categoryId,
  categoryName,
  purchaseDate,
  measures,
  setEditData,
  setCategoryId,
  setCategoryName,
  setPurchaseDate,
  setMeasures,
}: ProductInfoSectionProps) => {
  const { colors, isDark } = useTheme();

  const renderField = (label: string, value: string, icon: any, key?: string, isDate = false, isPrice = false, multiline = false, keyboardType: any = "default") => {
    // No modo de edição, usamos o valor passado (estado de edição)
    // No modo de visualização, usamos o valor do objeto product diretamente
    let displayValue = value || '---';

    if (!isEditing) {
      if (isPrice && product.price) {
        displayValue = `R$ ${parseFloat(product.price).toFixed(2).replace('.', ',')}`;
      } else if (isDate && product.purchaseDate) {
        displayValue = parseDateToBR(product.purchaseDate);
      } else if (key) {
        displayValue = product[key] || '---';
      }
    }

    return (
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.subtitle }]}>{label}</Text>
        {isEditing ? (
          <View style={[
            styles.inputWrapper, 
            { backgroundColor: isDark ? colors.inputBg : '#F1F5F9', borderColor: isDark ? colors.border : '#E2E8F0' },
            multiline && { height: 100, alignItems: 'flex-start', paddingTop: 12 }
          ]}>
            <Ionicons name={icon} size={20} color={colors.subtitle} style={styles.inputIcon} />
            <TextInput
              style={[
                styles.input, 
                { color: colors.text }, 
                multiline && { height: '100%' },
                Platform.OS === 'web' && { outlineStyle: 'none' }
              ]}
              value={value}
              onChangeText={(t) => {
                if (isDate) setPurchaseDate(formatDate(t));
                else if (isPrice) setEditData({ ...editData, price: formatCurrency(t) });
                else if (key) setEditData({ ...editData, [key]: t });
              }}
              placeholder={isDate ? "DD/MM/AAAA" : ""}
              placeholderTextColor={colors.subtitle}
              maxLength={isDate ? 10 : undefined}
              keyboardType={isDate || isPrice ? "numeric" : keyboardType}
              multiline={multiline}
            />
          </View>
        ) : (
          <View style={styles.valueRow}>
             <Ionicons name={icon} size={20} color={colors.secondary} style={styles.inputIcon} />
             <Text style={[styles.valueText, { color: colors.text }]}>
                {displayValue}
             </Text>
          </View>
        )}
      </View>
    );
  };

  const renderMeasureField = (label: string, value: string, key: string) => (
    <View style={{ flex: 1 }}>
      <Text style={[styles.label, { fontSize: 10, color: colors.subtitle, marginBottom: 4 }]}>{label} (CM)</Text>
      {isEditing ? (
        <TextInput
          style={[
            styles.measureInput, 
            { color: colors.text, backgroundColor: isDark ? colors.inputBg : '#F1F5F9', borderColor: isDark ? colors.border : '#E2E8F0' },
            Platform.OS === 'web' && { outlineStyle: 'none' }
          ]}
          value={value}
          onChangeText={(t) => setMeasures({ ...measures, [key]: t })}
          keyboardType="decimal-pad"
          placeholder="0.0"
          placeholderTextColor={colors.subtitle}
        />
      ) : (
        <Text style={[styles.measureValue, { color: colors.text, backgroundColor: isDark ? colors.inputBg : '#F8FAFC' }]}>
          {value || '0'} cm
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Dados do Produto</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.subtitle }]}>Tipo do Item</Text>
          {isEditing ? (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => setEditData({ ...editData, type: 'MAIN' })}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 10,
                  borderWidth: editData?.type === 'MAIN' ? 2 : 1,
                  borderColor: editData?.type === 'MAIN' ? colors.secondary : (isDark ? colors.border : '#E2E8F0'),
                  backgroundColor: editData?.type === 'MAIN' ? (isDark ? colors.inputBg : '#EEF2FF') : 'transparent',
                }}
              >
                <Text style={{ textAlign: 'center', color: colors.text, fontWeight: editData?.type === 'MAIN' ? '700' : '600' }}>PRINCIPAL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setEditData({ ...editData, type: 'ACCESSORY' })}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 10,
                  borderWidth: editData?.type === 'ACCESSORY' ? 2 : 1,
                  borderColor: editData?.type === 'ACCESSORY' ? '#D97706' : (isDark ? colors.border : '#E2E8F0'),
                  backgroundColor: editData?.type === 'ACCESSORY' ? (isDark ? colors.inputBg : '#FEF3C7') : 'transparent',
                }}
              >
                <Text style={{ textAlign: 'center', color: colors.text, fontWeight: editData?.type === 'ACCESSORY' ? '700' : '600' }}>ACESSÓRIO</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.badge, { backgroundColor: isDark ? colors.inputBg : '#F1F5F9' }]}>
              <Text style={[styles.badgeText, { color: colors.secondary }]}>{product.type === 'ACCESSORY' ? 'ACESSÓRIO' : 'PRINCIPAL'}</Text>
            </View>
          )}
        </View>
        
        {renderField('Nome do Item', isEditing ? editData.name : '', 'pricetag-outline', 'name')}
        
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
            <View style={[styles.badge, { backgroundColor: isDark ? colors.inputBg : '#EEF2FF' }]}>
              <Ionicons name="apps-outline" size={16} color={colors.secondary} />
              <Text style={[styles.badgeText, { color: colors.secondary }]}>
                {product.category?.name || 'Sem Categoria'}
              </Text>
            </View>
          )}
        </View>

        {renderField('Marca', isEditing ? editData.brand : '', 'business-outline', 'brand')}
        {renderField('Modelo', isEditing ? editData.model : '', 'barcode-outline', 'model')}
        
        {/* Usamos flags explícitas para Data e Preço */}
        {renderField('Data de Compra', purchaseDate, 'calendar-outline', undefined, true, false)}
        {renderField('Valor Estimado', editData.price?.toString(), 'cash-outline', undefined, false, true)}

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.subtitle }]}>Dimensões do Item</Text>
          <View style={styles.row}>
            {renderMeasureField('ALTURA', measures.height, 'height')}
            {renderMeasureField('LARGURA', measures.width, 'width')}
            {renderMeasureField('PROFUND.', measures.depth, 'depth')}
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Notas e Observações</Text>
        {renderField('Comentários', isEditing ? editData.notes : '', 'document-text-outline', 'notes', false, false, true)}
      </View>
    </View>
  );
};
