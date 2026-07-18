import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { Platform } from 'react-native';
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

  const [linkedProducts, setLinkedProducts] = useState<any[]>([]);
  const [linkedBy, setLinkedBy] = useState<any[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [linkedProductIds, setLinkedProductIds] = useState<string[]>([]);

  // Modais
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [linkModalVisible, setLinkModalVisible] = useState(false);
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
      setLinkedProducts(data.linkedProducts || []);
      setLinkedBy(data.linkedBy || []);
      setLinkedProductIds((data.linkedProducts || []).map((p: any) => p.id));
      
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

  const fetchAvailableProducts = useCallback(async () => {
    try {
      const { data } = await productsApi.list({ limit: 100 });
      // Filtrar o próprio produto da lista
      const filtered = data.filter((p: any) => p.id !== id);
      
      // Ordenação inteligente: Colocar tipos opostos no topo
      const sorted = [...filtered].sort((a, b) => {
        const isAOpposite = a.type !== product?.type;
        const isBOpposite = b.type !== product?.type;
        
        if (isAOpposite && !isBOpposite) return -1;
        if (!isAOpposite && isBOpposite) return 1;
        return 0;
      });

      setAvailableProducts(sorted);
    } catch (error) {
      console.error('Erro ao buscar produtos disponíveis:', error);
    }
  }, [id, product?.type]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Preview em tempo real dos vínculos durante a edição
  useEffect(() => {
    if (isEditing && availableProducts.length > 0) {
      const preview = availableProducts.filter(p => linkedProductIds.includes(p.id));
      setLinkedProducts(preview);
    }
  }, [linkedProductIds, isEditing, availableProducts]);

  const toggleEditing = (value: boolean) => {
    if (!value) {
      // Reset data on cancel
      const formattedPrice = product.price ? parseFloat(product.price).toFixed(2).replace('.', ',') : '';
      setEditData({ ...product, price: formattedPrice });
      setCategoryId(product.category?.id || null);
      setCategoryName(product.category?.name || '');
      setPurchaseDate(parseDateToBR(product.purchaseDate));
      setLinkedProductIds((product.linkedProducts || []).map((p: any) => p.id));
      setLinkedProducts(product.linkedProducts || []); // 👈 Restaura os vínculos originais
      setNewImageUri(null);
      setNewLabelUri(null);
      
      if (product.size) {
        const parts = product.size.replace(' cm', '').split(' x ');
        if (parts.length === 3) {
          setMeasures({ height: parts[0], width: parts[1], depth: parts[2] });
        }
      }
    } else {
      fetchAvailableProducts();
    }
    setIsEditing(value);
  };

  const toggleProductLink = (productId: string) => {
    setLinkedProductIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
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
    formData.append('type', type);

    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      formData.append('files', blob, `photo_${type.toLowerCase()}.jpg`);
    } else {
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formData.append('files', {
        uri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      } as any);
    }

    return productsApi.uploadImage(id, formData);
  };

  const replaceImage = async (imageId: string, uri: string, type: string) => {
    const formData = new FormData();
    formData.append('type', type);

    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      formData.append('files', blob, `photo_${type.toLowerCase()}.jpg`);
    } else {
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formData.append('files', {
        uri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      } as any);
    }

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
        type: editData.type,
        price: editData.price ? parseFloat(editData.price.toString().replace(',', '.')) : 0,
        size: updatedSize,
        notes: editData.notes,
        categoryId: categoryId,
        purchaseDate: parseBRDateToISO(purchaseDate),
        linkedProductIds, // 👈 Novo campo
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
  };
}
