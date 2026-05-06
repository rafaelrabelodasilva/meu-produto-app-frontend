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
  TextInput,
} from 'react-native';
import { useAuth } from '../../context/auth-context';
import { useTheme } from '../../context/theme-context';
import { useResponsive } from '../../hooks/use-responsive';
import { productsApi, getImageUrl } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { styles } from '../../styles/dashboard.styles';

export default function DashboardScreen() {
  const { token } = useAuth();
  const { colors, isDark } = useTheme();
  const { width, isTablet } = useResponsive();
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cálculos reativos dentro do componente
  const numColumns = width > 1200 ? 5 : width > 900 ? 4 : isTablet ? 3 : 2;
  const paddingTotal = isTablet ? 48 : 36;
  const gapTotal = (numColumns - 1) * 12;
  const cardWidth = (Math.min(width, 1400) - paddingTotal - gapTotal) / numColumns;

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

  const totalValue = products.reduce((acc, product: any) => acc + Number(product.price || 0), 0);
  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(totalValue);

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

  const renderProduct = ({ item }: { item: any }) => {
    const productImage = item.images?.find((img: any) => img.type === 'PRODUCT') || item.images?.[0];
    const displayUri = getImageUrl(productImage?.url);
    const isAccessory = item.type === 'ACCESSORY';

    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: colors.card, width: cardWidth }]} 
        activeOpacity={0.7}
        onPress={() => router.push(`/product/${item.id}`)}
      >
        <View style={[styles.imageContainer, { backgroundColor: isDark ? colors.inputBg : '#F1F5F9', height: cardWidth }]}>
          {displayUri ? (
            <Image 
              source={{ uri: displayUri }} 
              style={styles.productImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="cube-outline" size={40} color={isDark ? colors.subtitle : '#CBD5E1'} />
            </View>
          )}

          {isAccessory && (
            <View style={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: '#FEF3C7',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#D97706',
              zIndex: 10
            }}>
              <Ionicons name="build-outline" size={12} color="#D97706" style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#D97706' }}>ACESSÓRIO</Text>
            </View>
          )}
        </View>
        <View style={styles.cardInfo}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
              <Text style={[styles.productBrand, { color: colors.subtitle }]} numberOfLines={1}>{item.brand || 'Sem marca'}</Text>
            </View>
            {item.user && (
              <View style={{ 
                width: 24, 
                height: 24, 
                borderRadius: 12, 
                backgroundColor: '#FFD164', 
                justifyContent: 'center', 
                alignItems: 'center',
                marginLeft: 4
              }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#0042cf' }}>
                  {item.user.firstName[0]}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.measurementsContainer}>
            <Ionicons name="resize-outline" size={14} color={colors.secondary} />
            <Text style={[styles.measurementsText, { color: colors.secondary }]}>
              {item.size || 'Dimensões não cadastradas'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Meu Inventário</Text>
              <Text style={[styles.headerSubtitle, { color: colors.subtitle }]}>{products.length} itens catalogados</Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>{formattedTotal}</Text>
              <Text style={[styles.headerSubtitle, { color: colors.subtitle }]}>Capital do Gatinho</Text>
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
      </View>

      <FlatList
        key={numColumns} // Força re-render ao mudar colunas (rotação)
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        numColumns={numColumns}
        contentContainerStyle={[styles.listContent, isTablet && styles.listContentTablet]}
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
