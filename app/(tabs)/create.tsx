import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../context/toast-context';
import { useTheme } from '../../context/theme-context';
import { ImagePickerModal } from '../../components/ui/image-picker-modal';
import { productsApi, categoriesApi } from '../../services/api';

// Importar Constants para pegar o IP dinâmico
import Constants from 'expo-constants';
const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(':').shift() || '192.168.0.15';
const BASE_URL = `http://${localhost}:3000`;

export default function CreateProductScreen() {
  const { token, signOut } = useAuth();
  const { showToast } = useToast();
  const { colors, isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // States para o modal de imagem
  const [pickerVisible, setPickerVisible] = useState(false);
  const [activePickerType, setActivePickerType] = useState<'product' | 'label'>('product');

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    category: '',
    price: '',
    height: '',
    width: '',
    depth: '',
    purchaseDate: '',
    notes: '',
  });

  const [images, setImages] = useState<{
    product: string | null;
    label: string | null;
  }>({
    product: null,
    label: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatDate = (value: string) => {
    const numeric = value.replace(/\D/g, '');
    if (!numeric) return '';
    let formatted = numeric;
    if (numeric.length > 2) {
      formatted = `${numeric.slice(0, 2)}/${numeric.slice(2)}`;
    }
    if (numeric.length > 4) {
      formatted = `${numeric.slice(0, 2)}/${numeric.slice(2, 4)}/${numeric.slice(4, 8)}`;
    }
    return formatted;
  };

  const formatCurrency = (value: string) => {
    const numeric = value.replace(/\D/g, '');
    if (!numeric) return '';
    const amount = (parseInt(numeric) / 100).toFixed(2);
    return amount.replace('.', ',');
  };

  // Resetar o formulário ao focar na tela
  useFocusEffect(
    useCallback(() => {
      return () => {
        setStep(1);
        setFormData({
          name: '',
          brand: '',
          model: '',
          category: '',
          price: '',
          height: '',
          width: '',
          depth: '',
          purchaseDate: '',
          notes: '',
        });
        setImages({ product: null, label: null });
        setErrors({});
      };
    }, [])
  );

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    setErrors({});
    return true;
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
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImages(prev => ({ ...prev, [activePickerType]: result.assets[0].uri }));
      }
    } catch (err) {
      console.error('[Create] Erro ao disparar câmera:', err);
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
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImages(prev => ({ ...prev, [activePickerType]: result.assets[0].uri }));
      }
    } catch (err) {
      console.error('[Create] Erro ao disparar galeria:', err);
    }
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const getOrCreateCategory = async (categoryName: string) => {
    if (!categoryName.trim()) return null;
    
    try {
      const categories = await categoriesApi.list();
      const existing = categories.find((c: any) => c.name.toLowerCase() === categoryName.toLowerCase().trim());
      
      if (existing) return existing.id;
      
      const newCat = await categoriesApi.create({ name: categoryName.trim() });
      return newCat.id;
    } catch (error) {
      console.error('Erro ao processar categoria:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!token) {
      showToast('Sessão expirada. Por favor, faça login novamente.', 'error');
      signOut();
      return;
    }

    setLoading(true);
    try {
      // 0. Processar Categoria
      const categoryId = await getOrCreateCategory(formData.category);

      // 1. Criar o produto (metadados)
      const productData = {
        name: formData.name,
        brand: formData.brand,
        model: formData.model,
        price: formData.price ? parseFloat(formData.price.replace(',', '.')) : 0,
        size: `${formData.height || '0'} x ${formData.width || '0'} x ${formData.depth || '0'} cm`,
        categoryId,
        notes: formData.notes,
        purchaseDate: formData.purchaseDate ? formData.purchaseDate.split('/').reverse().join('-') : undefined, // Converte DD/MM/YYYY para YYYY-MM-DD
      };

      const createdProduct = await productsApi.create(productData);
      const productId = createdProduct.id;

      // 2. Fazer upload das fotos com o tipo correto
      const uploadPromises = [];
      
      if (images.product) {
        uploadPromises.push(uploadImage(productId, images.product, 'PRODUCT'));
      }
      if (images.label) {
        uploadPromises.push(uploadImage(productId, images.label, 'LABEL'));
      }

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }
      
      showToast('O Gatinho Organizador guardou tudo com perfeição!', 'success');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      const msg = error.message || 'Erro desconhecido';
      showToast(`Não foi possível salvar: ${msg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (productId: string, uri: string, type: string) => {
    const formData = new FormData();
    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('files', {
      uri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    } as any);

    formData.append('type', type);

    return productsApi.uploadImage(productId, formData);
  };

  const renderStep1 = () => (
    <View style={styles.form}>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Nome do Produto *</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }, errors.name && styles.inputError]}>
          <Ionicons name="pricetag-outline" size={20} color={colors.subtitle} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Ex: Cadeira de Escritório"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholderTextColor={colors.subtitle}
          />
        </View>
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Marca</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
          <Ionicons name="business-outline" size={20} color={colors.subtitle} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Ex: Herman Miller"
            value={formData.brand}
            onChangeText={(text) => setFormData({ ...formData, brand: text })}
            placeholderTextColor={colors.subtitle}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Modelo</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
          <Ionicons name="barcode-outline" size={20} color={colors.subtitle} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Ex: Aeron Size B"
            value={formData.model}
            onChangeText={(text) => setFormData({ ...formData, model: text })}
            placeholderTextColor={colors.subtitle}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Categoria</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }, errors.category && styles.inputError]}>
          <Ionicons name="apps-outline" size={20} color={colors.subtitle} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Ex: Móveis"
            value={formData.category}
            onChangeText={(text) => setFormData({ ...formData, category: text })}
            placeholderTextColor={colors.subtitle}
          />
        </View>
        {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Valor Estimado (R$)</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
          <Ionicons name="cash-outline" size={20} color={colors.subtitle} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="0,00"
            value={formData.price}
            onChangeText={(text) => setFormData({ ...formData, price: formatCurrency(text) })}
            keyboardType="numeric"
            placeholderTextColor={colors.subtitle}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Data de Compra (DD/MM/AAAA)</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
          <Ionicons name="calendar-outline" size={20} color={colors.subtitle} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Ex: 10/05/2024"
            value={formData.purchaseDate}
            onChangeText={(text) => setFormData({ ...formData, purchaseDate: formatDate(text) })}
            keyboardType="numeric"
            maxLength={10}
            placeholderTextColor={colors.subtitle}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Notas / Observações</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0', height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
          <Ionicons name="document-text-outline" size={20} color={colors.subtitle} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text, height: '100%' }]}
            placeholder="Ex: Comprado na Shopee, garantia de 1 ano..."
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            placeholderTextColor={colors.subtitle}
            multiline
          />
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.form}>
      <View style={[styles.measurementsDiagram, { backgroundColor: isDark ? colors.inputBg : '#EEF2FF', borderColor: isDark ? colors.border : '#E0E7FF' }]}>
        <Ionicons name="cube-outline" size={80} color={colors.secondary} />
        <Text style={[styles.diagramText, { color: colors.secondary }]}>Dimensões Técnicas (cm)</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Altura (cm)</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }, errors.height && styles.inputError]}>
          <Ionicons name="resize-outline" size={20} color={colors.subtitle} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="0.0"
            value={formData.height}
            onChangeText={(text) => setFormData({ ...formData, height: text })}
            keyboardType="decimal-pad"
            placeholderTextColor={colors.subtitle}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Largura (cm)</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }, errors.width && styles.inputError]}>
          <View style={{ transform: [{ rotate: '90deg' }] }}>
            <Ionicons name="resize-outline" size={20} color={colors.subtitle} style={styles.inputIcon} />
          </View>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="0.0"
            value={formData.width}
            onChangeText={(text) => setFormData({ ...formData, width: text })}
            keyboardType="decimal-pad"
            placeholderTextColor={colors.subtitle}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Profundidade (cm)</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }, errors.depth && styles.inputError]}>
          <View style={{ transform: [{ rotate: '45deg' }] }}>
            <Ionicons name="resize-outline" size={20} color={colors.subtitle} style={styles.inputIcon} />
          </View>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="0.0"
            value={formData.depth}
            onChangeText={(text) => setFormData({ ...formData, depth: text })}
            keyboardType="decimal-pad"
            placeholderTextColor={colors.subtitle}
          />
        </View>
      </View>

      <TouchableOpacity onPress={() => setStep(1)} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color={colors.secondary} />
        <Text style={[styles.backButtonText, { color: colors.secondary }]}>Voltar para Info Básica</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.form}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Registro Visual</Text>
      
      <View style={styles.photoContainer}>
        <Text style={[styles.photoLabel, { color: colors.text }]}>Foto do Produto (Opcional)</Text>
        <TouchableOpacity 
          style={[styles.photoBox, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }, images.product && [styles.photoBoxActive, { borderColor: colors.secondary }]]} 
          onPress={() => pickImage('product')}
        >
          {images.product ? (
            <Image source={{ uri: images.product }} style={styles.capturedImage} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera-outline" size={40} color={colors.secondary} />
              <Text style={[styles.photoPlaceholderText, { color: colors.subtitle }]}>Tirar Foto Geral</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.photoContainer}>
        <Text style={[styles.photoLabel, { color: colors.text }]}>Foto da Etiqueta / Manual (Opcional)</Text>
        <TouchableOpacity 
          style={[styles.photoBox, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }, images.label && [styles.photoBoxActive, { borderColor: colors.secondary }]]} 
          onPress={() => pickImage('label')}
        >
          {images.label ? (
            <Image source={{ uri: images.label }} style={styles.capturedImage} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="document-text-outline" size={40} color={colors.secondary} />
              <Text style={[styles.photoPlaceholderText, { color: colors.subtitle }]}>Tirar Foto Detalhe</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => setStep(2)} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color={colors.secondary} />
        <Text style={[styles.backButtonText, { color: colors.secondary }]}>Voltar para Medidas</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Novo Item</Text>
            <Text style={[styles.headerSubtitle, { color: colors.secondary }]}>Etapa {step}: {
              step === 1 ? 'Informações Básicas' : 
              step === 2 ? 'Medidas do Produto' : 'Fotos do Item'
            }</Text>
          </View>
          <Image 
            source={require('../../assets/kitty_on_computer.png')} 
            style={styles.kittyHeader}
            resizeMode="contain"
          />
        </View>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.secondary, shadowColor: colors.secondary }, step === 3 && [styles.saveButton, { backgroundColor: colors.success, shadowColor: colors.success }]]} 
          onPress={step === 3 ? handleSubmit : handleNext} 
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text style={[styles.buttonText, { color: colors.white }]}>
                {step === 3 ? 'Finalizar Cadastro' : 'Avançar'}
              </Text>
              <Ionicons 
                name={step === 3 ? "checkmark-circle" : "arrow-forward"} 
                size={22} 
                color={colors.white} 
                style={{ marginLeft: 8 }} 
              />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

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
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  kittyHeader: {
    width: 60,
    height: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  form: {
    gap: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
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
  inputWrapperCompact: {
    paddingHorizontal: 8,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 4,
  },
  button: {
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButton: {},
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
  },
  measurementsDiagram: {
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
  },
  diagramText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    padding: 10,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  photoContainer: {
    gap: 12,
  },
  photoLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  photoBox: {
    height: 180,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoBoxActive: {
    borderStyle: 'solid',
  },
  photoPlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  photoPlaceholderText: {
    fontSize: 14,
    fontWeight: '700',
  },
  capturedImage: {
    width: '100%',
    height: '100%',
  },
});
