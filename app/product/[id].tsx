import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../context/theme-context';

// Components
import { ConfirmModal } from '../../components/ui/confirm-modal';
import { ImagePickerModal } from '../../components/ui/image-picker-modal';
import { ProductHeader } from '../../components/product/ProductHeader';
import { ProductGallery } from '../../components/product/ProductGallery';
import { ProductInfoSection } from '../../components/product/ProductInfoSection';
import { ProductMeasuresSection } from '../../components/product/ProductMeasuresSection';
import { ProductFooterActions } from '../../components/product/ProductFooterActions';

// Hook
import { useProductDetail } from '../../hooks/use-product-detail';

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
    deleteModalVisible,
    pickerVisible,
    setEditData,
    setCategoryId,
    setCategoryName,
    setPurchaseDate,
    setMeasures,
    setDeleteModalVisible,
    setPickerVisible,
    toggleEditing,
    pickImage,
    openCamera,
    openLibrary,
    handleUpdate,
    confirmDelete,
  } = useProductDetail(id as string);

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
        <ProductHeader 
          title={isEditing ? 'Editar Item' : 'Detalhes'} 
          onDelete={() => setDeleteModalVisible(true)} 
        />

        <ProductGallery 
          product={product}
          isEditing={isEditing}
          newImageUri={newImageUri}
          newLabelUri={newLabelUri}
          onPickImage={pickImage}
        />

        <View style={styles.content}>
          <ProductInfoSection
            product={product}
            isEditing={isEditing}
            editData={editData}
            categoryId={categoryId}
            categoryName={categoryName}
            purchaseDate={purchaseDate}
            setEditData={setEditData}
            setCategoryId={setCategoryId}
            setCategoryName={setCategoryName}
            setPurchaseDate={setPurchaseDate}
          />
          <ProductMeasuresSection 
            product={product}
            isEditing={isEditing}
            measures={measures}
            setMeasures={setMeasures}
          />
        </View>

        <ProductFooterActions 
          isEditing={isEditing}
          saving={saving}
          onEdit={() => toggleEditing(true)}
          onCancel={() => toggleEditing(false)}
          onSave={handleUpdate}
        />
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
    </KeyboardAvoidingView>
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
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 24,
  },
});
