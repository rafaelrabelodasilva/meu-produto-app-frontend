import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, router } from 'expo-router';
import { useTheme } from '../../context/theme-context';
import { useResponsive } from '../../hooks/use-responsive';
import { productsApi, getImageUrl } from '../../services/api';
import { styles as dashboardStyles } from '../../styles/dashboard.styles';

export default function AlmoxarifadoScreen() {
  const { colors, isDark } = useTheme();
  const { isTablet, width } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [orphans, setOrphans] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  // Lógica de responsividade idêntica ao Dashboard
  const numColumns = width > 1200 ? 5 : width > 900 ? 4 : isTablet ? 3 : 2;
  const paddingTotal = isTablet ? 48 : 36;
  const gapTotal = (numColumns - 1) * 12;
  const cardWidth = (Math.min(width, 1400) - paddingTotal - gapTotal) / numColumns;

  const fetchOrphans = async () => {
    try {
      setLoading(true);
      const { data } = await productsApi.list({ limit: 100 });
      // Filtra apenas acessórios que não possuem 'linkedBy'
      const orphanItems = data.filter((p: any) => 
        p.type === 'ACCESSORY' && (!p.linkedBy || p.linkedBy.length === 0)
      );
      setOrphans(orphanItems);
    } catch (error) {
      console.error('Erro ao buscar órfãos:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrphans();
    }, [])
  );

  const filteredOrphans = orphans.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.brand || '').toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: any }) => {
    const productImage = item.images?.find((img: any) => img.type === 'PRODUCT') || item.images?.[0];
    const displayUri = getImageUrl(productImage?.url);

    return (
      <TouchableOpacity 
        style={[dashboardStyles.card, { backgroundColor: colors.card, width: cardWidth }]}
        activeOpacity={0.7}
        onPress={() => router.push(`/product/${item.id}`)}
      >
        <View style={[dashboardStyles.imageContainer, { backgroundColor: isDark ? colors.inputBg : '#F1F5F9', height: cardWidth }]}>
          {displayUri ? (
            <Image source={{ uri: displayUri }} style={dashboardStyles.productImage} resizeMode="cover" />
          ) : (
            <View style={dashboardStyles.placeholderImage}>
              <Ionicons name="build-outline" size={40} color={isDark ? colors.subtitle : '#CBD5E1'} />
            </View>
          )}
          <View style={styles.orphanBadge}>
            <Text style={styles.orphanBadgeText}>SEM VÍNCULO</Text>
          </View>
        </View>
        <View style={dashboardStyles.cardInfo}>
          <Text style={[dashboardStyles.productName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[dashboardStyles.productBrand, { color: colors.subtitle }]} numberOfLines={1}>
            {item.brand || 'Sem marca'}
          </Text>
          <View style={dashboardStyles.measurementsContainer}>
            <Ionicons name="resize-outline" size={14} color={colors.secondary} />
            <Text style={[dashboardStyles.measurementsText, { color: colors.secondary }]}>
              {item.size || 'Dimensões não cadastradas'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[dashboardStyles.header, { backgroundColor: colors.card, borderBottomColor: isDark ? colors.inputBg : '#F1F5F9' }]}>
        <View style={[dashboardStyles.headerContent, { flexDirection: 'row', alignItems: 'center', gap: 16 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Almoxarifado</Text>
            <Text style={[styles.subtitle, { color: colors.secondary }]}>Gestão de acessórios e peças sem vínculo com um produto principal</Text>
          </View>
          <Image 
            source={require('../../assets/kitty_on_computer.png')} 
            style={styles.kittyHeader}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={[dashboardStyles.searchWrapper, { backgroundColor: colors.inputBg }]}>
          <Ionicons name="search-outline" size={20} color={colors.subtitle} style={dashboardStyles.searchIcon} />
          <TextInput
            style={[dashboardStyles.searchInput, { color: colors.text }, Platform.OS === 'web' && { outlineStyle: 'none' }]}
            placeholder="Buscar no almoxarifado..."
            placeholderTextColor={colors.subtitle}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      ) : (
        <FlatList
          key={numColumns}
          data={filteredOrphans}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={numColumns}
          contentContainerStyle={[dashboardStyles.listContent, isTablet && dashboardStyles.listContentTablet]}
          columnWrapperStyle={numColumns > 1 ? dashboardStyles.columnWrapper : undefined}
          ListEmptyComponent={() => (
            <View style={dashboardStyles.emptyContainer}>
              <Image 
                source={require('../../assets/kitty_on_computer.png')} 
                style={dashboardStyles.emptyImage}
                resizeMode="contain"
              />
              <Text style={[dashboardStyles.emptyTitle, { color: colors.text }]}>
                Almoxarifado Vazio!
              </Text>
              <Text style={[dashboardStyles.emptySubtitle, { color: colors.subtitle }]}>
                Todos os seus acessórios estão devidamente vinculados ou você ainda não cadastrou nenhum item avulso.
              </Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    width: '100%',
    maxWidth: 1400,
    alignSelf: 'center',
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  kittyHeader: {
    width: 50,
    height: 50,
  },
  orphanBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 10,
  },
  orphanBadgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '900',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
