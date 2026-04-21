import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { productsApi, categoriesApi } from '../services/api';
import { useAuth } from '../context/auth-context';
import { useToast } from '../context/toast-context';
import { parseDateToBR, parseBRDateToISO, formatCurrency } from '../services/utils';

export function useProductDetail(id: string) {
  const { token } = useAuth();
  const { showToast } = useToast();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editData, setEditData] = useState<any>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [newImageUri, setNewImageUri] = useState<string | null>(null);
  const [newLabelUri, setNewLabelUri] = useState<string | null>(null);
  
  const [measures, setMeasures] = useState({
    height: '',
    width: '',
    depth: '',
  });

  // Modais
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [activePickerType, setActivePickerType] = useState<'product' | 'label'>('product');

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    try {
      const data = await productsApi.get(id as string);
      setProduct(data);
      
      const formattedPrice = data.price ? parseFloat(data.price).toFixed(2).replace('.', ',') : '';
      setEditData({ ...data, price: formattedPrice });
      setCategoryId(data.category?.id || null);
      setCategoryName(data.category?.name || '');
      setPurchaseDate(parseDateToBR(data.purchaseDate));
      
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
  }, [id, showToast]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const toggleEditing = (value: boolean) => {
    if (!value) {
      // Reset data on cancel
      const formattedPrice = product.price ? parseFloat(product.price).toFixed(2).replace('.', ',') : '';
      setEditData({ ...product, price: formattedPrice });
      setCategoryId(product.category?.id || null);
      setCategoryName(product.category?.name || '');
      setPurchaseDate(parseDateToBR(product.purchaseDate));
      setNewImageUri(null);
      setNewLabelUri(null);
      
      if (product.size) {
        const parts = product.size.replace(' cm', '').split(' x ');
        if (parts.length === 3) {
          setMeasures({ height: parts[0], width: parts[1], depth: parts[2] });
        }
      }
    }
    setIsEditing(value);
  };

  const pickImage = (type: 'product' | 'label') => {
    setActivePickerType(type);
    setPickerVisible(true);
  };

  const openCamera = async () => {
    try {
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
        if (activePickerType === 'product') setNewImageUri(result.assets[0].uri);
        else setNewLabelUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error('[useProductDetail] Erro câmera:', err);
    } finally {
      setPickerVisible(false);
    }
  };

  const openLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast('Precisamos de acesso à sua galeria.', 'error');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        if (activePickerType === 'product') setNewImageUri(result.assets[0].uri);
        else setNewLabelUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error('[useProductDetail] Erro galeria:', err);
    } finally {
      setPickerVisible(false);
    }
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

    return productsApi.uploadImage(id, formData);
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

    return productsApi.updateImage(id, imageId, formData);
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
        price: editData.price ? parseFloat(editData.price.toString().replace(',', '.')) : 0,
        size: updatedSize,
        notes: editData.notes,
        categoryId: categoryId,
        purchaseDate: parseBRDateToISO(purchaseDate),
      };

      await productsApi.update(id, payload);

      const productImage = product?.images?.find((img: any) => img.type === 'PRODUCT');
      const labelImage = product?.images?.find((img: any) => img.type === 'LABEL');

      if (newImageUri) {
        if (productImage) await replaceImage(productImage.id, newImageUri, 'PRODUCT');
        else await uploadNewImage(newImageUri, 'PRODUCT');
      }

      if (newLabelUri) {
        if (labelImage) await replaceImage(labelImage.id, newLabelUri, 'LABEL');
        else await uploadNewImage(newLabelUri, 'LABEL');
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

  const confirmDelete = async () => {
    if (!id) return;
    setDeleteModalVisible(false);
    try {
      await productsApi.delete(id);
      showToast('O item foi removido do seu lar.', 'success');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Erro ao deletar:', error);
      showToast('Não foi possível remover o item.', 'error');
    }
  };

  return {
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
  };
}
