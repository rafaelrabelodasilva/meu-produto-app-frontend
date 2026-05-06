import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../context/toast-context';
import { useTheme } from '../../context/theme-context';
import { useResponsive } from '../../hooks/use-responsive';
import { ImagePickerModal } from '../../components/ui/image-picker-modal';
import { CategoryPicker } from '../../components/product/CategoryPicker';
import { productsApi } from '../../services/api';
import { parseBRDateToISO, formatDate, formatCurrency } from '../../services/utils';
import { styles } from '../../styles/create.styles';

export default function CreateProductScreen() {
  const { token, signOut } = useAuth();
  const { showToast } = useToast();
  const { colors, isDark } = useTheme();
  const { isTablet } = useResponsive();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [pickerVisible, setPickerVisible] = useState(false);
  const [activePickerType, setActivePickerType] = useState<'product' | 'label'>('product');

  const [formData, setFormData] = useState({
    name: '', brand: '', model: '', categoryId: null as string | null, categoryName: '',
    price: '', height: '', width: '', depth: '', purchaseDate: '', notes: '',
    type: 'MAIN' as 'MAIN' | 'ACCESSORY',
  });

  const [images, setImages] = useState<{ product: string | null; label: string | null; }>({ product: null, label: null });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useFocusEffect(
    useCallback(() => {
      return () => {
        setStep(0);
        setFormData({
          name: '', brand: '', model: '', categoryId: null, categoryName: '',
          price: '', height: '', width: '', depth: '', purchaseDate: '', notes: '',
          type: 'MAIN',
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

  const pickImage = (type: 'product' | 'label') => {
    setActivePickerType(type);
    setPickerVisible(true);
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') { showToast('Precisamos de acesso à câmera.', 'error'); return; }
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8 });
      if (!result.canceled) setImages(prev => ({ ...prev, [activePickerType]: result.assets[0].uri }));
    } catch (err) { console.error(err); }
  };

  const openLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { showToast('Precisamos de acesso à sua galeria.', 'error'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8 });
      if (!result.canceled) setImages(prev => ({ ...prev, [activePickerType]: result.assets[0].uri }));
    } catch (err) { console.error(err); }
  };

  const handleNext = () => { 
    if (step === 1 && validateStep1()) setStep(2); 
  };

  const selectType = (type: 'MAIN' | 'ACCESSORY') => {
    setFormData(prev => ({ ...prev, type }));
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!token) { signOut(); return; }
    setLoading(true);
    try {
      const productData = {
        name: formData.name,
        brand: formData.brand,
        model: formData.model,
        type: formData.type,
        price: formData.price ? parseFloat(formData.price.toString().replace(',', '.')) : 0,
        size: `${formData.height || '0'} x ${formData.width || '0'} x ${formData.depth || '0'} cm`,
        categoryId: formData.categoryId,
        notes: formData.notes,
        purchaseDate: formData.purchaseDate ? parseBRDateToISO(formData.purchaseDate) : undefined,
      };

      const createdProduct = await productsApi.create(productData);
      const productId = createdProduct.id;

      const uploadPromises = [];
      if (images.product) uploadPromises.push(uploadImage(productId, images.product, 'PRODUCT'));
      if (images.label) uploadPromises.push(uploadImage(productId, images.label, 'LABEL'));
      if (uploadPromises.length > 0) await Promise.all(uploadPromises);
      
      showToast('O Gatinho Organizador guardou tudo com perfeição!', 'success');
      router.replace('/(tabs)');
    } catch (error: any) {
      showToast(`Não foi possível salvar: ${error.message || 'Erro'}`, 'error');
    } finally { setLoading(false); }
  };

  const uploadImage = async (productId: string, uri: string, type: string) => {
    const fd = new FormData();
    fd.append('type', type);
    
    if (Platform.OS === 'web') {
      // No Web, precisamos converter a URI em Blob
      const response = await fetch(uri);
      const blob = await response.blob();
      fd.append('files', blob, `photo_${type.toLowerCase()}.jpg`);
    } else {
      // No Native (Android/iOS)
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      fd.append('files', { 
        uri, 
        name: `photo.${fileType}`, 
        type: `image/${fileType}` 
      } as any);
    }
    
    return productsApi.uploadImage(productId, fd);
  };

  const renderStep0 = () => {
    const cardHeight = isTablet ? 240 : 130;
    
    const commonCardStyle: ViewStyle = {
      backgroundColor: colors.card,
      borderWidth: 2,
      padding: 20,
      borderRadius: 16,
      flex: 1,
      flexDirection: isTablet ? 'column' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: cardHeight, // Altura fixa para garantir simetria absoluta
      marginBottom: 0,    // Remove margens que podem causar desalinhamento
    };

    return (
      <View style={{ flex: 1, paddingVertical: 20, width: '100%', maxWidth: 800 }}>
        <Text style={[styles.sectionTitle, { color: colors.text, textAlign: 'center', marginBottom: 30 }]}>
          O que vamos catalogar hoje?
        </Text>
        
        <View style={{ 
          flexDirection: isTablet ? 'row' : 'column', 
          gap: 16, 
          width: '100%',
          alignItems: 'stretch',
        }}>
          <TouchableOpacity 
            style={[styles.card, commonCardStyle, { borderColor: colors.secondary }]}
            onPress={() => selectType('MAIN')}
          >
            <View style={{ 
              width: isTablet ? 80 : 50, 
              height: isTablet ? 80 : 50, 
              borderRadius: isTablet ? 40 : 25, 
              backgroundColor: '#E0F2FE', 
              justifyContent: 'center', 
              alignItems: 'center', 
              marginRight: isTablet ? 0 : 16,
              marginBottom: isTablet ? 16 : 0
            }}>
              <Ionicons name="cube-outline" size={isTablet ? 40 : 28} color={colors.secondary} />
            </View>
            <View style={{ flex: 1, alignItems: isTablet ? 'center' : 'flex-start' }}>
              <Text style={{ fontSize: isTablet ? 20 : 17, fontWeight: '700', color: colors.text, textAlign: isTablet ? 'center' : 'left' }}>Produto Principal</Text>
              <Text style={{ fontSize: isTablet ? 14 : 13, color: colors.subtitle, marginTop: 4, textAlign: isTablet ? 'center' : 'left' }}>
                Itens como Geladeiras, TVs, Ferramentas ou Móveis.
              </Text>
            </View>
            {!isTablet && <Ionicons name="chevron-forward" size={20} color={colors.subtitle} />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.card, commonCardStyle, { borderColor: '#FFD164' }]}
            onPress={() => selectType('ACCESSORY')}
          >
            <View style={{ 
              width: isTablet ? 80 : 50, 
              height: isTablet ? 80 : 50, 
              borderRadius: isTablet ? 40 : 25, 
              backgroundColor: '#FEF3C7', 
              justifyContent: 'center', 
              alignItems: 'center', 
              marginRight: isTablet ? 0 : 16,
              marginBottom: isTablet ? 16 : 0
            }}>
              <Ionicons name="build-outline" size={isTablet ? 40 : 28} color="#D97706" />
            </View>
            <View style={{ flex: 1, alignItems: isTablet ? 'center' : 'flex-start' }}>
              <Text style={{ fontSize: isTablet ? 20 : 17, fontWeight: '700', color: colors.text, textAlign: isTablet ? 'center' : 'left' }}>Acessório ou Peça</Text>
              <Text style={{ fontSize: isTablet ? 14 : 13, color: colors.subtitle, marginTop: 4, textAlign: isTablet ? 'center' : 'left' }}>
                Itens como Pilhas, Filtros, Brocas ou Cabos.
              </Text>
            </View>
            {!isTablet && <Ionicons name="chevron-forward" size={20} color={colors.subtitle} />}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderStep1 = () => (
    <View style={styles.form}>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Nome do {formData.type === 'MAIN' ? 'Produto' : 'Acessório'} *</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }, errors.name && styles.inputError]}>
          <Ionicons name="pricetag-outline" size={20} color={colors.subtitle} style={styles.inputIcon} />
          <TextInput style={[styles.input, { color: colors.text }]} placeholder={formData.type === 'MAIN' ? "Ex: Cadeira de Escritório" : "Ex: Pilha AA Recarregável"} value={formData.name} onChangeText={(text) => setFormData({ ...formData, name: text })} placeholderTextColor={colors.subtitle} />
        </View>
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Marca</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
          <Ionicons name="business-outline" size={20} color={colors.subtitle} style={styles.inputIcon} />
          <TextInput style={[styles.input, { color: colors.text }]} placeholder="Ex: Herman Miller" value={formData.brand} onChangeText={(text) => setFormData({ ...formData, brand: text })} placeholderTextColor={colors.subtitle} />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Modelo</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
          <Ionicons name="barcode-outline" size={20} color={colors.subtitle} style={styles.inputIcon} />
          <TextInput style={[styles.input, { color: colors.text }]} placeholder="Ex: Aeron Size B" value={formData.model} onChangeText={(text) => setFormData({ ...formData, model: text })} placeholderTextColor={colors.subtitle} />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <CategoryPicker selectedId={formData.categoryId} selectedName={formData.categoryName} onSelect={(id, name) => setFormData({ ...formData, categoryId: id, categoryName: name })} />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Valor Estimado (R$)</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
          <Ionicons name="cash-outline" size={20} color={colors.subtitle} style={styles.inputIcon} />
          <TextInput style={[styles.input, { color: colors.text }]} placeholder="0,00" value={formData.price} onChangeText={(text) => setFormData({ ...formData, price: formatCurrency(text) })} keyboardType="numeric" placeholderTextColor={colors.subtitle} />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Data de Compra (DD/MM/AAAA)</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
          <Ionicons name="calendar-outline" size={20} color={colors.subtitle} style={styles.inputIcon} />
          <TextInput style={[styles.input, { color: colors.text }]} placeholder="Ex: 10/05/2024" value={formData.purchaseDate} onChangeText={(text) => setFormData({ ...formData, purchaseDate: formatDate(text) })} keyboardType="numeric" maxLength={10} placeholderTextColor={colors.subtitle} />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Dimensões do Item</Text>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { fontSize: 10, color: colors.subtitle, marginBottom: 4, textTransform: 'uppercase' }]}>ALTURA (CM)</Text>
            <TextInput style={[styles.measureInput, { color: colors.text, backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }]} placeholder="0.0" value={formData.height} onChangeText={(text) => setFormData({ ...formData, height: text })} keyboardType="decimal-pad" placeholderTextColor={colors.subtitle} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { fontSize: 10, color: colors.subtitle, marginBottom: 4, textTransform: 'uppercase' }]}>LARGURA (CM)</Text>
            <TextInput style={[styles.measureInput, { color: colors.text, backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }]} placeholder="0.0" value={formData.width} onChangeText={(text) => setFormData({ ...formData, width: text })} keyboardType="decimal-pad" placeholderTextColor={colors.subtitle} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { fontSize: 10, color: colors.subtitle, marginBottom: 4, textTransform: 'uppercase' }]}>PROFUND. (CM)</Text>
            <TextInput style={[styles.measureInput, { color: colors.text, backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }]} placeholder="0.0" value={formData.depth} onChangeText={(text) => setFormData({ ...formData, depth: text })} keyboardType="decimal-pad" placeholderTextColor={colors.subtitle} />
          </View>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Notas / Observações</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0', height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
          <Ionicons name="document-text-outline" size={20} color={colors.subtitle} style={styles.inputIcon} />
          <TextInput style={[styles.input, { color: colors.text, height: '100%' }]} placeholder="Ex: Comprado na Shopee, garantia de 1 ano..." value={formData.notes} onChangeText={(text) => setFormData({ ...formData, notes: text })} placeholderTextColor={colors.subtitle} multiline />
        </View>
      </View>
      
      <TouchableOpacity onPress={() => setStep(0)} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color={colors.secondary} /><Text style={[styles.backButtonText, { color: colors.secondary }]}>Mudar Tipo de Item</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.form}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Registro Visual</Text>
      <View style={styles.photoContainer}>
        <Text style={[styles.photoLabel, { color: colors.text }]}>Foto do {formData.type === 'MAIN' ? 'Produto' : 'Acessório'} (Opcional)</Text>
        <TouchableOpacity style={[styles.photoBox, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }, images.product && [styles.photoBoxActive, { borderColor: colors.secondary }]]} onPress={() => pickImage('product')}>
          {images.product ? <Image source={{ uri: images.product }} style={styles.capturedImage} /> : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera-outline" size={40} color={colors.secondary} />
              <Text style={[styles.photoPlaceholderText, { color: colors.subtitle }]}>Tirar Foto Geral</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.photoContainer}>
        <Text style={[styles.photoLabel, { color: colors.text }]}>Foto da Etiqueta / Manual (Opcional)</Text>
        {formData.type === 'ACCESSORY' && (
          <Text style={{ color: colors.secondary, fontSize: 12, marginBottom: 8, fontStyle: 'italic' }}>
            💡 Dica do Gatinho: Para acessórios, tire uma foto bem nítida da etiqueta técnica ou modelo impresso!
          </Text>
        )}
        <TouchableOpacity style={[styles.photoBox, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }, images.label && [styles.photoBoxActive, { borderColor: colors.secondary }]]} onPress={() => pickImage('label')}>
          {images.label ? <Image source={{ uri: images.label }} style={styles.capturedImage} /> : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="document-text-outline" size={40} color={colors.secondary} />
              <Text style={[styles.photoPlaceholderText, { color: colors.subtitle }]}>Tirar Foto Detalhe</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => setStep(1)} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color={colors.secondary} /><Text style={[styles.backButtonText, { color: colors.secondary }]}>Voltar para Dados</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Novo Item</Text>
            <Text style={[styles.headerSubtitle, { color: colors.secondary }]}>
              {step === 0 ? 'Escolha o Tipo' : `Etapa ${step}: ${step === 1 ? 'Dados e Dimensões' : 'Fotos do Item'}`}
            </Text>
          </View>
          <Image source={require('../../assets/kitty_on_computer.png')} style={styles.kittyHeader} resizeMode="contain" />
        </View>
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        
        {step > 0 && (
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.secondary }, step === 2 && { backgroundColor: colors.success }]} onPress={step === 2 ? handleSubmit : handleNext} activeOpacity={0.8} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.white} /> : (
              <>
                <Text style={[styles.buttonText, { color: colors.white }]}>{step === 2 ? 'Finalizar Cadastro' : 'Avançar'}</Text>
                <Ionicons name={step === 2 ? "checkmark-circle" : "arrow-forward"} size={22} color={colors.white} style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
      <ImagePickerModal visible={pickerVisible} onClose={() => setPickerVisible(false)} onCamera={openCamera} onLibrary={openLibrary} />
    </KeyboardAvoidingView>
  );
}
