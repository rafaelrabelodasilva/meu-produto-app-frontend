import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../context/toast-context';
import { useTheme } from '../../context/theme-context';
import { ConfirmModal } from '../../components/ui/confirm-modal';
import { productsApi } from '../../services/api';

// Importar Constants para pegar o IP dinâmico
import Constants from 'expo-constants';
const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(':').shift() || '192.168.0.15';
const BASE_URL = `http://${localhost}:3000`;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const { showToast } = useToast();
  const { colors, isDark } = useTheme();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [newImageUri, setNewImageUri] = useState<string | null>(null);
  const [newLabelUri, setNewLabelUri] = useState<string | null>(null);
  
  // State para modal de exclusão
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // Mapear imagens por tipo para garantir consistência visual
  const productImage = product?.images?.find((img: any) => img.type === 'PRODUCT');
  const labelImage = product?.images?.find((img: any) => img.type === 'LABEL');

  const [measures, setMeasures] = useState({
    height: '',
    width: '',
    depth: '',
  });

  useEffect(() => {
    fetchProduct();
  }, [id, token]);

  const fetchProduct = async () => {
    if (!id) return;
    try {
      const data = await productsApi.get(id as string);
      setProduct(data);
      setEditData(data);

      if (data.size) {
        const parts = data.size.replace(' cm', '').split(' x ');
        if (parts.length === 3) {
          setMeasures({
            height: parts[0],
            width: parts[1],
            depth: parts[2],
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      showToast('Não foi possível carregar os detalhes do item.', 'error');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (type: 'product' | 'label') => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showToast('Precisamos de acesso à câmera.', 'error');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (type === 'product') setNewImageUri(result.assets[0].uri);
      else setNewLabelUri(result.assets[0].uri);
    }
  };

  const handleUpdate = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const updatedSize = `${measures.height || '0'} x ${measures.width || '0'} x ${measures.depth || '0'} cm`;
      
      const payload = {
        name: editData.name,
        brand: editData.brand,
        model: editData.model,
        price: editData.price ? parseFloat(editData.price.toString()) : 0,
        size: updatedSize,
        notes: editData.notes,
        categoryId: editData.categoryId,
      };

      // 1. Atualizar textos
      await productsApi.update(id as string, payload);

      // 2. Atualizar Foto do Produto (PRODUCT)
      if (newImageUri) {
        if (productImage) {
          await replaceImage(productImage.id, newImageUri, 'PRODUCT');
        } else {
          await uploadNewImage(newImageUri, 'PRODUCT');
        }
      }

      // 3. Atualizar Foto da Etiqueta (LABEL)
      if (newLabelUri) {
        if (labelImage) {
          await replaceImage(labelImage.id, newLabelUri, 'LABEL');
        } else {
          await uploadNewImage(newLabelUri, 'LABEL');
        }
      }

      await fetchProduct();
      setIsEditing(false);
      setNewImageUri(null);
      setNewLabelUri(null);
      showToast('Item atualizado pelo Gatinho Organizador!', 'success');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      showToast('Falha ao salvar as alterações.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const replaceImage = async (imageId: string, uri: string, type: string) => {
    const formData = new FormData();
    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('file', {
      uri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    } as any);
    
    formData.append('type', type);

    return productsApi.updateImage(id as string, imageId, formData);
  };

  const uploadNewImage = async (uri: string, type: string) => {
    const formData = new FormData();
    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('files', {
      uri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    } as any);

    formData.append('type', type);

    return productsApi.uploadImage(id as string, formData);
  };

  const handleDelete = () => {
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!id) return;
    setDeleteModalVisible(false);
    try {
      await productsApi.delete(id as string);
      showToast('O item foi removido do seu lar.', 'success');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Erro ao deletar:', error);
      showToast('Não foi possível remover o item.', 'error');
    }
  };

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
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: isDark ? colors.inputBg : '#F1F5F9' }]}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{isEditing ? 'Editar Item' : 'Detalhes'}</Text>
          <TouchableOpacity onPress={handleDelete} style={[styles.deleteButton, { backgroundColor: isDark ? colors.inputBg : '#FEF2F2' }]}>
            <Ionicons name="trash-outline" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>

        <View style={[styles.imageGallery, { backgroundColor: isDark ? colors.inputBg : '#F1F5F9' }]}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {/* Slide Foto do Produto */}
            <View style={styles.imageSlide}>
              {(newImageUri || productImage) ? (
                <Image 
                  source={{ uri: newImageUri || `${BASE_URL}/uploads/${productImage?.url}?t=${new Date().getTime()}` }} 
                  style={styles.mainImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="cube-outline" size={80} color={isDark ? colors.subtitle : '#CBD5E1'} />
                  <Text style={[styles.placeholderText, { color: colors.subtitle }]}>Foto do Produto</Text>
                </View>
              )}
              {isEditing && (
                <TouchableOpacity style={styles.changeImageButton} onPress={() => pickImage('product')}>
                  <Ionicons name="camera" size={20} color={colors.white} />
                  <Text style={styles.changeImageText}>Trocar Produto</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Slide Foto da Etiqueta */}
            <View style={styles.imageSlide}>
              {(newLabelUri || labelImage) ? (
                <Image 
                  source={{ uri: newLabelUri || `${BASE_URL}/uploads/${labelImage?.url}?t=${new Date().getTime()}` }} 
                  style={styles.mainImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="document-text-outline" size={80} color={isDark ? colors.subtitle : '#CBD5E1'} />
                  <Text style={[styles.placeholderText, { color: colors.subtitle }]}>Foto da Etiqueta / Manual</Text>
                </View>
              )}
              {isEditing && (
                <TouchableOpacity style={styles.changeImageButton} onPress={() => pickImage('label')}>
                  <Ionicons name="camera" size={20} color={colors.white} />
                  <Text style={styles.changeImageText}>Trocar Etiqueta</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
          <View style={styles.galleryBadge}>
            <Ionicons name="swap-horizontal" size={12} color={colors.white} />
            <Text style={styles.galleryBadgeText}>Deslize para ver a etiqueta</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.subtitle }]}>Nome do Produto</Text>
              {isEditing ? (
                <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.inputBg : '#F1F5F9', borderColor: colors.secondary }]}>
                  <Ionicons name="pricetag-outline" size={20} color={colors.subtitle} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={editData.name}
                    onChangeText={(t) => setEditData({ ...editData, name: t })}
                  />
                </View>
              ) : (
                <Text style={[styles.value, { color: colors.text, backgroundColor: isDark ? colors.inputBg : '#F8FAFC' }]}>{product.name}</Text>
              )}
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.subtitle }]}>Marca</Text>
                {isEditing ? (
                  <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.inputBg : '#F1F5F9', borderColor: colors.secondary }]}>
                    <Ionicons name="business-outline" size={20} color={colors.subtitle} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={editData.brand}
                      onChangeText={(t) => setEditData({ ...editData, brand: t })}
                    />
                  </View>
                ) : (
                  <Text style={[styles.value, { color: colors.text, backgroundColor: isDark ? colors.inputBg : '#F8FAFC' }]}>{product.brand || '---'}</Text>
                )}
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.subtitle }]}>Modelo</Text>
                {isEditing ? (
                  <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.inputBg : '#F1F5F9', borderColor: colors.secondary }]}>
                    <Ionicons name="barcode-outline" size={20} color={colors.subtitle} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={editData.model}
                      onChangeText={(t) => setEditData({ ...editData, model: t })}
                    />
                  </View>
                ) : (
                  <Text style={[styles.value, { color: colors.text, backgroundColor: isDark ? colors.inputBg : '#F8FAFC' }]}>{product.model || '---'}</Text>
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.subtitle }]}>Categoria / Notas</Text>
              {isEditing ? (
                <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.inputBg : '#F1F5F9', borderColor: colors.secondary }]}>
                  <Ionicons name="apps-outline" size={20} color={colors.subtitle} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={editData.notes}
                    onChangeText={(t) => setEditData({ ...editData, notes: t })}
                  />
                </View>
              ) : (
                <Text style={[styles.value, { color: colors.text, backgroundColor: isDark ? colors.inputBg : '#F8FAFC' }]}>{product.notes || '---'}</Text>
              )}
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, marginTop: 16 }]}>
            <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Dimensões Técnicas</Text>
            {isEditing ? (
              <View style={styles.measuresForm}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.subtitle }]}>Altura (cm)</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.inputBg : '#F1F5F9', borderColor: colors.secondary }]}>
                    <Ionicons name="resize-outline" size={20} color={colors.subtitle} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={measures.height}
                      onChangeText={(t) => setMeasures({ ...measures, height: t })}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.subtitle }]}>Largura (cm)</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.inputBg : '#F1F5F9', borderColor: colors.secondary }]}>
                    <View style={{ transform: [{ rotate: '90deg' }] }}>
                      <Ionicons name="resize-outline" size={20} color={colors.subtitle} style={styles.inputIcon} />
                    </View>
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={measures.width}
                      onChangeText={(t) => setMeasures({ ...measures, width: t })}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.subtitle }]}>Profundidade (cm)</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.inputBg : '#F1F5F9', borderColor: colors.secondary }]}>
                    <View style={{ transform: [{ rotate: '45deg' }] }}>
                      <Ionicons name="resize-outline" size={20} color={colors.subtitle} style={styles.inputIcon} />
                    </View>
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={measures.depth}
                      onChangeText={(t) => setMeasures({ ...measures, depth: t })}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.subtitle }]}>Tamanho / Medidas</Text>
                <Text style={[styles.value, { color: colors.text, backgroundColor: isDark ? colors.inputBg : '#F8FAFC' }]}>{product.size || '---'}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          {isEditing ? (
            <View style={styles.editActions}>
              <TouchableOpacity 
                style={[styles.cancelButton, { backgroundColor: isDark ? colors.inputBg : '#F1F5F9' }]} 
                onPress={() => {
                  setIsEditing(false);
                  setEditData(product);
                  setNewImageUri(null);
                  setNewLabelUri(null);
                }}
              >
                <Text style={[styles.cancelButtonText, { color: colors.subtitle }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: colors.success }]} 
                onPress={handleUpdate}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Text style={[styles.saveButtonText, { color: colors.white }]}>Salvar Alterações</Text>
                    <Ionicons name="checkmark" size={20} color={colors.white} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={[styles.editModeButton, { backgroundColor: colors.secondary, shadowColor: colors.secondary }]} onPress={() => setIsEditing(true)}>
              <Text style={[styles.editModeButtonText, { color: colors.white }]}>Editar Item</Text>
              <Ionicons name="create-outline" size={20} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Modal de Confirmação para Deletar Produto */}
      <ConfirmModal
        visible={deleteModalVisible}
        title="Remover Item"
        message="Tem certeza que deseja remover este item? Esta ação não pode ser desfeita e o Gatinho vai ficar triste."
        confirmLabel="Sim, Remover"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        type="danger"
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 12,
  },
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
  content: {
    padding: 24,
  },
  measuresForm: {
    gap: 16,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    padding: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  footer: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  editModeButton: {
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  editModeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
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
  saveButton: {
    flex: 2,
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
