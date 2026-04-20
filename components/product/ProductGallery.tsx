import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/theme-context';
import { getImageUrl } from '../../services/api';

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

  const renderSlide = (type: 'product' | 'label', uri: string | null, currentImage: any, placeholderIcon: any, placeholderLabel: string) => {
    const displayUri = uri || getImageUrl(currentImage?.url);

    return (
      <View style={styles.imageSlide}>
        {displayUri ? (
          <Image 
            source={{ uri: displayUri }} 
            style={styles.mainImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name={placeholderIcon} size={80} color={isDark ? colors.subtitle : '#CBD5E1'} />
            <Text style={[styles.placeholderText, { color: colors.subtitle }]}>{placeholderLabel}</Text>
          </View>
        )}
        {isEditing && (
          <TouchableOpacity style={styles.changeImageButton} onPress={() => onPickImage(type)}>
            <Ionicons name="camera" size={20} color="#FFFFFF" />
            <Text style={styles.changeImageText}>Trocar {type === 'product' ? 'Produto' : 'Etiqueta'}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.imageGallery, { backgroundColor: isDark ? colors.inputBg : '#F1F5F9' }]}>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {renderSlide('product', newImageUri, productImage, 'cube-outline', 'Foto do Produto')}
        {renderSlide('label', newLabelUri, labelImage, 'document-text-outline', 'Foto da Etiqueta / Manual')}
      </ScrollView>
      
      <View style={styles.galleryBadge}>
        <Ionicons name="swap-horizontal" size={12} color="#FFFFFF" />
        <Text style={styles.galleryBadgeText}>Deslize para ver a etiqueta</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  imageGallery: {
    width: '100%',
    height: 350,
  },
  imageSlide: {
    width: Dimensions.get('window').width,
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '600',
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  changeImageText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  galleryBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  galleryBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
