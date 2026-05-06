import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/theme-context';
import { router } from 'expo-router';

interface LinkedProductsSectionProps {
  product: any; // Adicionado para saber o tipo do produto atual
  linkedProducts: any[];
  linkedBy: any[];
  isEditing: boolean;
  onManageLinks: () => void;
}

export const LinkedProductsSection: React.FC<LinkedProductsSectionProps> = ({
  product,
  linkedProducts,
  linkedBy,
  isEditing,
  onManageLinks,
}) => {
  const { colors, isDark } = useTheme();
  const isAccessory = product?.type === 'ACCESSORY';

  const renderProductItem = (item: any) => {
    const productImage = item.images?.find((img: any) => img.type === 'PRODUCT') || item.images?.[0];
    const itemIsAccessory = item.type === 'ACCESSORY';
    
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.itemCard, { backgroundColor: isDark ? colors.inputBg : '#F8FAFC' }]}
        onPress={() => router.push(`/product/${item.id}`)}
      >
        <View style={styles.imageContainer}>
          {productImage ? (
            <Image source={{ uri: productImage.url }} style={styles.image} />
          ) : (
            <View style={[styles.placeholder, { backgroundColor: isDark ? colors.card : '#E2E8F0' }]}>
              <Ionicons name={itemIsAccessory ? "build-outline" : "cube-outline"} size={20} color={colors.subtitle} />
            </View>
          )}
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
            <View style={[
              styles.typeBadge, 
              { backgroundColor: itemIsAccessory ? '#FFD16420' : colors.secondary + '15' }
            ]}>
              <Text style={[
                styles.typeBadgeText, 
                { color: itemIsAccessory ? '#D97706' : colors.secondary }
              ]}>
                {itemIsAccessory ? 'ACESSÓRIO' : 'PRINCIPAL'}
              </Text>
            </View>
          </View>
          <Text style={[styles.brand, { color: colors.subtitle }]} numberOfLines={1}>{item.brand || 'Sem marca'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.subtitle} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.subtitle }]}>Vínculos e Ecossistema</Text>
      
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons 
              name={isAccessory ? "link-outline" : "construct-outline"} 
              size={20} 
              color={isAccessory ? colors.secondary : '#D97706'} 
            />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {isAccessory ? 'Pertence ao Produto' : 'Acessórios e Peças'}
            </Text>
          </View>
          {isEditing && (
            <TouchableOpacity 
              style={[styles.manageButton, { backgroundColor: colors.secondary + '15' }]} 
              onPress={onManageLinks}
            >
              <Text style={[styles.manageButtonText, { color: colors.secondary }]}>Gerenciar</Text>
            </TouchableOpacity>
          )}
        </View>

        {(linkedProducts.length === 0 && linkedBy.length === 0 && !isEditing) ? (
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyText, { color: colors.subtitle }]}>
              {isAccessory 
                ? 'Este acessório ainda não foi vinculado a nenhum produto.' 
                : 'Este produto ainda não possui acessórios vinculados.'}
            </Text>
          </View>
        ) : (
          <View style={styles.content}>
            {/* Vínculos diretos (Eu possuo esses itens) */}
            {linkedProducts.length > 0 && (
              <View style={styles.subSection}>
                <Text style={[styles.subSectionTitle, { color: colors.subtitle }]}>
                  {isAccessory ? 'Sub-vínculos / Itens' : 'Meus Acessórios'}
                </Text>
                {linkedProducts.map(p => renderProductItem(p))}
              </View>
            )}
            
            {/* Vínculos inversos (Eu pertenço a esses itens) */}
            {linkedBy.length > 0 && (
              <View style={styles.subSection}>
                <Text style={[styles.subSectionTitle, { color: colors.subtitle }]}>
                  {isAccessory ? 'Produto Principal' : 'Visto em / Parte de'}
                </Text>
                {linkedBy.map(p => renderProductItem(p))}
              </View>
            )}

            {isEditing && linkedProducts.length === 0 && (
              <TouchableOpacity 
                style={[styles.emptyAdd, { borderColor: colors.secondary + '30' }]} 
                onPress={onManageLinks}
              >
                <Ionicons name="add-circle-outline" size={24} color={colors.secondary} />
                <Text style={[styles.emptyAddText, { color: colors.secondary }]}>
                  {isAccessory ? 'Vincular a um Produto' : 'Adicionar Acessório'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 4,
    opacity: 0.8,
  },
  card: {
    borderRadius: 28,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  manageButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  manageButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    gap: 20,
  },
  subSection: {
    gap: 10,
  },
  subSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
    marginLeft: 4,
    opacity: 0.6,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    gap: 12,
  },
  imageContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  brand: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.7,
  },
  emptyBox: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 10,
  },
  emptyAddText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
