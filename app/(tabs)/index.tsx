import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  TextInput,
} from 'react-native';
import { useAuth } from '../../context/auth-context';
import { useTheme } from '../../context/theme-context';
import { productsApi } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, router } from 'expo-router';

const { width } = Dimensions.get('window');
const numColumns = width > 1000 ? 5 : width > 600 ? 4 : 2;
const cardWidth = (width - 48 - (numColumns - 1) * 12) / numColumns;

// Importar Constants para pegar o IP dinâmico
import Constants from 'expo-constants';
const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(':').shift() || '192.168.0.15';
const BASE_URL = `http://${localhost}:3000`;

export default function DashboardScreen() {
  const { token, signOut } = useAuth();
  const { colors, isDark } = useTheme();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState('ALL'); // NEW: Search scope state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const SEARCH_SCOPES = [
    { id: 'ALL', label: 'TODOS', icon: 'apps-outline' },
    { id: 'NAME', label: 'NOME', icon: 'pricetag-outline' },
    { id: 'BRAND', label: 'MARCA', icon: 'business-outline' },
    { id: 'MODEL', label: 'MODELO', icon: 'barcode-outline' },
  ];

  const fetchProducts = async () => {
    if (!token) return; // 👈 Evita chamadas após o logout
    try {
      const data = await productsApi.list();
      setProducts(Array.isArray(data) ? data : data.data || []);
    } catch (error: any) {
      console.error('Erro ao buscar produtos:', error);
      // O signOut será tratado automaticamente pelo listener de TOKEN_CLEARED no AuthContext
      // se o refresh falhar dentro do apiFetch.
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [token])
  );

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const filteredProducts = products.filter(product => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;

    switch (searchScope) {
      case 'NAME':
        return product.name.toLowerCase().includes(query);
      case 'BRAND':
        return (product.brand || '').toLowerCase().includes(query);
      case 'MODEL':
        return (product.model || '').toLowerCase().includes(query);
      case 'ALL':
      default:
        return (
          product.name.toLowerCase().includes(query) ||
          (product.brand || '').toLowerCase().includes(query) ||
          (product.model || '').toLowerCase().includes(query)
        );
    }
  });

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.card }]} 
      activeOpacity={0.7}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <View style={[styles.imageContainer, { backgroundColor: isDark ? colors.inputBg : '#F1F5F9' }]}>
        {item.images && item.images.length > 0 ? (
          <Image 
            source={{ uri: `${BASE_URL}/uploads/${item.images[0].url}?t=${new Date().getTime()}` }} 
            style={styles.productImage} 
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="cube-outline" size={40} color={isDark ? colors.subtitle : '#CBD5E1'} />
          </View>
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.productBrand, { color: colors.subtitle }]} numberOfLines={1}>{item.brand || 'Sem marca'}</Text>
        <View style={styles.measurementsContainer}>
          <Ionicons name="resize-outline" size={14} color={colors.secondary} />
          <Text style={[styles.measurementsText, { color: colors.secondary }]}>
            {item.size || 'Dimensões não cadastradas'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Image 
        source={require('../../assets/kitty_on_computer.png')} 
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <Text style={[styles.emptyTitle, { color: colors.secondary }]}>
        {searchQuery ? 'Nenhum item encontrado' : 'Sua casa está vazia!'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.subtitle }]}>
        {searchQuery 
          ? `O gatinho não achou nada parecido com "${searchQuery}" neste filtro.`
          : 'O Gatinho Organizador está ansioso para catalogar seu primeiro item.'}
      </Text>
      {!searchQuery && (
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.secondary, shadowColor: colors.secondary }]} 
          onPress={() => router.push('/create')}
        >
          <Text style={[styles.addButtonText, { color: colors.white }]}>Cadastrar Item</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: isDark ? colors.inputBg : '#F1F5F9' }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Meu Inventário</Text>
            <Text style={[styles.headerSubtitle, { color: colors.subtitle }]}>{products.length} itens catalogados</Text>
          </View>
        </View>

        <View style={[styles.searchWrapper, { backgroundColor: colors.inputBg }]}>
          <Ionicons name="search-outline" size={20} color={colors.subtitle} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={`Buscar por ${SEARCH_SCOPES.find(s => s.id === searchScope)?.label.toLowerCase()}...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.subtitle}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.subtitle} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.scopeContainer}>
          <FlatList
            horizontal
            data={SEARCH_SCOPES}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSearchScope(item.id)}
                style={[
                  styles.scopeChip,
                  { backgroundColor: isDark ? colors.inputBg : '#F1F5F9', borderColor: isDark ? colors.border : '#E2E8F0' },
                  searchScope === item.id && [styles.scopeChipActive, { backgroundColor: colors.secondary, borderColor: colors.secondary }]
                ]}
              >
                <Ionicons 
                  name={item.icon as any} 
                  size={16} 
                  color={searchScope === item.id ? colors.white : colors.secondary} 
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.scopeLabel,
                    { color: colors.subtitle },
                    searchScope === item.id && styles.scopeLabelActive
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.scopeList}
          />
        </View>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        numColumns={numColumns}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.secondary]} tintColor={colors.secondary} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  listContent: {
    padding: 18,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  card: {
    width: cardWidth,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: cardWidth,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  productBrand: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  measurementsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  measurementsText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
    marginBottom: 32,
  },
  addButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  scopeContainer: {
    marginTop: 16,
  },
  scopeList: {
    paddingRight: 24,
  },
  scopeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  scopeChipActive: {},
  scopeLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  scopeLabelActive: {
    color: '#FFFFFF',
  },
});
