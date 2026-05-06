import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/theme-context';

interface ProductLinkModalProps {
  visible: boolean;
  onClose: () => void;
  availableProducts: any[];
  linkedProductIds: string[];
  onToggleLink: (productId: string) => void;
}

export const ProductLinkModal: React.FC<ProductLinkModalProps> = ({
  visible,
  onClose,
  availableProducts,
  linkedProductIds,
  onToggleLink,
}) => {
  const { colors, isDark } = useTheme();
  const [search, setSearch] = useState('');

  const filteredProducts = availableProducts.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.brand || '').toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: any }) => {
    const isLinked = linkedProductIds.includes(item.id);
    const productImage = item.images?.find((img: any) => img.type === 'PRODUCT') || item.images?.[0];
    const isAccessory = item.type === 'ACCESSORY';

    return (
      <TouchableOpacity
        style={[
          styles.itemRow,
          { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }
        ]}
        onPress={() => onToggleLink(item.id)}
      >
        <View style={styles.imageContainer}>
          {productImage ? (
            <Image source={{ uri: productImage.url }} style={styles.image} />
          ) : (
            <View style={[styles.placeholder, { backgroundColor: isDark ? colors.inputBg : '#E2E8F0' }]}>
              <Ionicons name={isAccessory ? "build-outline" : "cube-outline"} size={20} color={colors.subtitle} />
            </View>
          )}
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
            <View style={[
              styles.typeBadge, 
              { backgroundColor: isAccessory ? '#FFD16420' : colors.secondary + '15' }
            ]}>
              <Text style={[
                styles.typeBadgeText, 
                { color: isAccessory ? '#D97706' : colors.secondary }
              ]}>
                {isAccessory ? 'ACESSÓRIO' : 'PRINCIPAL'}
              </Text>
            </View>
          </View>
          <Text style={[styles.brand, { color: colors.subtitle }]} numberOfLines={1}>{item.brand || 'Sem marca'}</Text>
        </View>
        <View style={[
          styles.checkbox,
          { borderColor: isLinked ? colors.secondary : colors.subtitle },
          isLinked && { backgroundColor: colors.secondary }
        ]}>
          {isLinked && <Ionicons name="checkmark" size={16} color={colors.white} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Vincular Itens</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchBar, { backgroundColor: colors.inputBg }]}>
            <Ionicons name="search-outline" size={20} color={colors.subtitle} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Buscar itens para vincular..."
              placeholderTextColor={colors.subtitle}
              value={search}
              onChangeText={setSearch}
            />
            {search !== '' && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={20} color={colors.subtitle} />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.subtitle }]}>
                  {search ? 'Nenhum item encontrado.' : 'Nenhum outro item cadastrado.'}
                </Text>
              </View>
            )}
          />

          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: colors.secondary }]}
            onPress={onClose}
          >
            <Text style={[styles.doneButtonText, { color: colors.white }]}>Concluir</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 32,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 16,
    marginBottom: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  imageContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
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
    fontSize: 14,
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
    fontSize: 12,
    fontWeight: '500',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  doneButton: {
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
});
