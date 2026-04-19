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
import { productsApi } from '../../services/api';

// Importar Constants para pegar o IP dinâmico
import Constants from 'expo-constants';
const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(':').shift() || '192.168.0.15';
const BASE_URL = `http://${localhost}:3000`;

const COLORS = {
  primary: '#FFD164',
  secondary: '#0042cf',
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#11181C',
  subtitle: '#64748B',
  inputBg: '#F1F5F9',
  white: '#FFFFFF',
  error: '#EF4444',
  success: '#10B981',
};

export default function CreateProductScreen() {
  const { token, signOut } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    category: '',
    price: '',
    height: '',
    width: '',
    depth: '',
  });

  const [images, setImages] = useState<{
    product: string | null;
    label: string | null;
  }>({
    product: null,
    label: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const pickImage = async (type: 'product' | 'label') => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera para tirar fotos do produto.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages(prev => ({ ...prev, [type]: result.assets[0].uri }));
    }
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert('Sessão expirada', 'Por favor, faça login novamente.');
      signOut();
      return;
    }

    setLoading(true);
    try {
      // 1. Criar o produto (metadados)
      const productData = {
        name: formData.name,
        brand: formData.brand,
        model: formData.model,
        price: formData.price ? parseFloat(formData.price.replace(',', '.')) : 0,
        size: `${formData.height || '0'} x ${formData.width || '0'} x ${formData.depth || '0'} cm`,
        notes: formData.category ? `Categoria: ${formData.category}` : '',
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
      
      Alert.alert(
        'Sucesso!', 
        'O Gatinho Organizador guardou tudo com perfeição.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      const msg = error.message || 'Erro desconhecido';
      Alert.alert('Erro', `Não foi possível salvar: ${msg}`);
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
        <Text style={styles.label}>Nome do Produto *</Text>
        <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
          <Ionicons name="pricetag-outline" size={20} color={COLORS.subtitle} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ex: Cadeira de Escritório"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholderTextColor="#94A3B8"
          />
        </View>
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Marca</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="business-outline" size={20} color={COLORS.subtitle} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ex: Herman Miller"
            value={formData.brand}
            onChangeText={(text) => setFormData({ ...formData, brand: text })}
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Modelo</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="barcode-outline" size={20} color={COLORS.subtitle} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ex: Aeron Size B"
            value={formData.model}
            onChangeText={(text) => setFormData({ ...formData, model: text })}
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Categoria</Text>
        <View style={[styles.inputWrapper, errors.category && styles.inputError]}>
          <Ionicons name="apps-outline" size={20} color={COLORS.subtitle} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ex: Móveis"
            value={formData.category}
            onChangeText={(text) => setFormData({ ...formData, category: text })}
            placeholderTextColor="#94A3B8"
          />
        </View>
        {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Valor Estimado (R$)</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="cash-outline" size={20} color={COLORS.subtitle} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="0,00"
            value={formData.price}
            onChangeText={(text) => setFormData({ ...formData, price: text })}
            keyboardType="numeric"
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.form}>
      <View style={styles.measurementsDiagram}>
        <Ionicons name="cube-outline" size={80} color={COLORS.secondary} />
        <Text style={styles.diagramText}>Dimensões Técnicas (cm)</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Altura (cm)</Text>
        <View style={[styles.inputWrapper, errors.height && styles.inputError]}>
          <Ionicons name="resize-outline" size={20} color={COLORS.subtitle} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="0.0"
            value={formData.height}
            onChangeText={(text) => setFormData({ ...formData, height: text })}
            keyboardType="decimal-pad"
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Largura (cm)</Text>
        <View style={[styles.inputWrapper, errors.width && styles.inputError]}>
          <View style={{ transform: [{ rotate: '90deg' }] }}>
            <Ionicons name="resize-outline" size={20} color={COLORS.subtitle} style={styles.inputIcon} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="0.0"
            value={formData.width}
            onChangeText={(text) => setFormData({ ...formData, width: text })}
            keyboardType="decimal-pad"
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Profundidade (cm)</Text>
        <View style={[styles.inputWrapper, errors.depth && styles.inputError]}>
          <View style={{ transform: [{ rotate: '45deg' }] }}>
            <Ionicons name="resize-outline" size={20} color={COLORS.subtitle} style={styles.inputIcon} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="0.0"
            value={formData.depth}
            onChangeText={(text) => setFormData({ ...formData, depth: text })}
            keyboardType="decimal-pad"
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <TouchableOpacity onPress={() => setStep(1)} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color={COLORS.secondary} />
        <Text style={styles.backButtonText}>Voltar para Info Básica</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.form}>
      <Text style={styles.sectionTitle}>Registro Visual</Text>
      
      <View style={styles.photoContainer}>
        <Text style={styles.photoLabel}>Foto do Produto (Opcional)</Text>
        <TouchableOpacity 
          style={[styles.photoBox, images.product && styles.photoBoxActive]} 
          onPress={() => pickImage('product')}
        >
          {images.product ? (
            <Image source={{ uri: images.product }} style={styles.capturedImage} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera-outline" size={40} color={COLORS.secondary} />
              <Text style={styles.photoPlaceholderText}>Tirar Foto Geral</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.photoContainer}>
        <Text style={styles.photoLabel}>Foto da Etiqueta / Manual (Opcional)</Text>
        <TouchableOpacity 
          style={[styles.photoBox, images.label && styles.photoBoxActive]} 
          onPress={() => pickImage('label')}
        >
          {images.label ? (
            <Image source={{ uri: images.label }} style={styles.capturedImage} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="document-text-outline" size={40} color={COLORS.secondary} />
              <Text style={styles.photoPlaceholderText}>Tirar Foto Detalhe</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => setStep(2)} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color={COLORS.secondary} />
        <Text style={styles.backButtonText}>Voltar para Medidas</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Novo Item</Text>
            <Text style={styles.headerSubtitle}>Etapa {step}: {
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
          style={[styles.button, step === 3 && styles.saveButton]} 
          onPress={step === 3 ? handleSubmit : handleNext} 
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.buttonText}>
                {step === 3 ? 'Finalizar Cadastro' : 'Avançar'}
              </Text>
              <Ionicons 
                name={step === 3 ? "checkmark-circle" : "arrow-forward"} 
                size={22} 
                color={COLORS.white} 
                style={{ marginLeft: 8 }} 
              />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.secondary,
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
    color: COLORS.text,
    marginBottom: 8,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputWrapperCompact: {
    paddingHorizontal: 8,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '600',
    marginLeft: 4,
  },
  button: {
    backgroundColor: COLORS.secondary,
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButton: {
    backgroundColor: COLORS.success,
    shadowColor: COLORS.success,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
  },
  measurementsDiagram: {
    backgroundColor: '#EEF2FF',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  diagramText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
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
    color: COLORS.secondary,
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
    color: COLORS.text,
    marginLeft: 4,
  },
  photoBox: {
    height: 180,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoBoxActive: {
    borderStyle: 'solid',
    borderColor: COLORS.secondary,
  },
  photoPlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  photoPlaceholderText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.subtitle,
  },
  capturedImage: {
    width: '100%',
    height: '100%',
  },
});
