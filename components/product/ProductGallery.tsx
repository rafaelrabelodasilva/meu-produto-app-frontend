import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/theme-context';
import { getImageUrl } from '../../services/api';

const { width } = Dimensions.get('window');

interface ProductGalleryProps {
  product: any;
  isEditing: boolean;
  newImageUri: string | null;
  newLabelUri: string | null;
  onPickImage: (type: 'product' | 'label') => void;
}

export const ProductGallery = ({ 
  product, 
  isEditing, 
  newImageUri, 
  newLabelUri, 
  onPickImage 
}: ProductGalleryProps) => {
  const { colors, isDark } = useTheme();

  const productImage = product?.images?.find((img: any) => img.type === 'PRODUCT');
  const labelImage = product?.images?.find((img: any) => img.type === 'LABEL');

  const mainUri = newImageUri || getImageUrl(productImage?.url);
  const labelUri = newLabelUri || getImageUrl(labelImage?.url);

  return (
    <View style={styles.container}>
      {/* Imagem Principal do Produto */}
      <View style={[styles.mainCard, { backgroundColor: isDark ? colors.card : '#F1F5F9', shadowColor: colors.secondary }]}>
        {mainUri ? (
          <Image source={{ uri: mainUri }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={styles.emptyHero}>
            <Ionicons name="cube-outline" size={80} color={isDark ? colors.subtitle : '#CBD5E1'} />
            <Text style={[styles.emptyText, { color: colors.subtitle }]}>Sem foto do produto</Text>
          </View>
        )}
        
        {isEditing && (
          <TouchableOpacity 
            style={[styles.editBadge, { backgroundColor: colors.secondary }]} 
            onPress={() => onPickImage('product')}
          >
            <Ionicons name="camera" size={20} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Miniatura da Etiqueta/Manual */}
      <View style={styles.secondarySection}>
        <TouchableOpacity 
          style={[styles.labelCard, { backgroundColor: isDark ? colors.card : '#FFF', borderColor: isDark ? colors.border : '#E2E8F0' }]}
          disabled={!isEditing}
          onPress={() => onPickImage('label')}
        >
          {labelUri ? (
            <Image source={{ uri: labelUri }} style={styles.labelImage} resizeMode="cover" />
          ) : (
            <View style={styles.emptyLabel}>
              <Ionicons name="document-text-outline" size={24} color={colors.subtitle} />
            </View>
          )}
          <View style={styles.labelInfo}>
            <Text style={[styles.labelTitle, { color: colors.text }]}>Etiqueta / Manual</Text>
            <Text style={[styles.labelSubtitle, { color: colors.subtitle }]}>
              {labelUri ? 'Visualizar detalhe' : 'Nenhuma foto anexada'}
            </Text>
          </View>
          {isEditing && (
            <Ionicons name="pencil" size={16} color={colors.secondary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginTop: 20,
    gap: 20,
  },
  mainCard: {
    width: '100%',
    height: width * 0.8,
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 8,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  emptyHero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
  },
  editBadge: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  secondarySection: {
    width: '100%',
  },
  labelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
  },
  labelImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  emptyLabel: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelInfo: {
    flex: 1,
  },
  labelTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  labelSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});
