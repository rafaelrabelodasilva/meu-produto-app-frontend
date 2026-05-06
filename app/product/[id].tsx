import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../context/theme-context';
import { useResponsive } from '../../hooks/use-responsive';

// Components
import { ConfirmModal } from '../../components/ui/confirm-modal';
import { ImagePickerModal } from '../../components/ui/image-picker-modal';
import { ProductHeader } from '../../components/product/ProductHeader';
import { ProductGallery } from '../../components/product/ProductGallery';
import { ProductInfoSection } from '../../components/product/ProductInfoSection';
import { ProductFooterActions } from '../../components/product/ProductFooterActions';
import { LinkedProductsSection } from '../../components/product/LinkedProductsSection';
import { ProductLinkModal } from '../../components/product/ProductLinkModal';

// Hook
import { useProductDetail } from '../../hooks/use-product-detail';
import { styles } from '../../styles/product-detail.styles';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  
  const {
    product,
    loading,
    saving,
    isEditing,
    editData,
    categoryId,
    categoryName,
    purchaseDate,
    newImageUri,
    newLabelUri,
    measures,
    linkedProducts,
    linkedBy,
    availableProducts,
    linkedProductIds,
    deleteModalVisible,
    pickerVisible,
    linkModalVisible,
    setEditData,
    setCategoryId,
    setCategoryName,
    setPurchaseDate,
    setMeasures,
    setDeleteModalVisible,
    setPickerVisible,
    setLinkModalVisible,
    toggleEditing,
    toggleProductLink,
    pickImage,
    openCamera,
    openLibrary,
    handleUpdate,
    confirmDelete,
  } = useProductDetail(id as string);

  const { width, isTablet } = useResponsive();

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerWrapper}>
          <ProductHeader title={isEditing ? 'Editar Item' : 'Detalhes'} />
        </View>

        <View style={[styles.responsiveLayout, isTablet && styles.tabletLayout]}>
          <View style={[styles.galleryWrapper, isTablet && styles.tabletGallery]}>
            <ProductGallery 
              product={product}
              isEditing={isEditing}
              newImageUri={newImageUri}
              newLabelUri={newLabelUri}
              onPickImage={pickImage}
            />
          </View>

          <View style={[styles.infoWrapper, isTablet && styles.tabletInfo]}>
            <View style={styles.content}>
              <ProductInfoSection
                product={product}
                isEditing={isEditing}
                editData={editData}
                categoryId={categoryId}
                categoryName={categoryName}
                purchaseDate={purchaseDate}
                measures={measures}
                setEditData={setEditData}
                setCategoryId={setCategoryId}
                setCategoryName={setCategoryName}
                setPurchaseDate={setPurchaseDate}
                setMeasures={setMeasures}
              />

              <LinkedProductsSection
                product={product}
                linkedProducts={linkedProducts}
                linkedBy={linkedBy}
                isEditing={isEditing}
                onManageLinks={() => setLinkModalVisible(true)}
              />
            </View>

            <View style={styles.footerWrapper}>
              <ProductFooterActions 
                isEditing={isEditing}
                saving={saving}
                onEdit={() => toggleEditing(true)}
                onCancel={() => toggleEditing(false)}
                onSave={handleUpdate}
              />
            </View>

            {!isEditing && (
              <View style={styles.dangerZoneWrapper}>
                <View style={styles.dangerZone}>
                  <Text style={[styles.dangerTitle, { color: colors.subtitle }]}>Zona de Perigo</Text>
                  <TouchableOpacity 
                    style={[styles.dangerButton, { borderColor: 'rgba(239, 68, 68, 0.3)' }]} 
                    onPress={() => setDeleteModalVisible(true)}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                    <Text style={[styles.dangerButtonText, { color: colors.error }]}>Remover este Item</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <ConfirmModal
        visible={deleteModalVisible}
        title="Remover Item"
        message="Tem certeza que deseja remover este item? Esta ação não pode ser desfeita e o Gatinho vai ficar triste."
        confirmLabel="Sim, Remover"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        type="danger"
      />

      <ImagePickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onCamera={openCamera}
        onLibrary={openLibrary}
      />

      <ProductLinkModal
        visible={linkModalVisible}
        onClose={() => setLinkModalVisible(false)}
        availableProducts={availableProducts}
        linkedProductIds={linkedProductIds}
        onToggleLink={toggleProductLink}
      />
    </KeyboardAvoidingView>
  );
}
