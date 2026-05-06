import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '../../services/api';
import { useToast } from '../../context/toast-context';
import { useTheme } from '../../context/theme-context';
import { useResponsive } from '../../hooks/use-responsive';
import { styles } from '../../styles/register.styles';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { colors, isDark } = useTheme();
  const { isTablet } = useResponsive();
  const router = useRouter();

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      showToast('Todos os campos são obrigatórios.', 'error');
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        firstName,
        lastName,
        email,
        password,
      });
      showToast('Conta criada com sucesso! Agora você pode entrar.', 'success');
      router.push('/(auth)/login');
    } catch (error: any) {
      showToast(error.message || 'Ocorreu um erro ao criar sua conta.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image 
            source={require('../../assets/kitty_on_computer.png')} 
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Logo Gatinho Organizador"
          />
          <Text style={[styles.title, { color: colors.text }]}>Criar Conta</Text>
          <Text style={[styles.subtitle, { color: colors.subtitle }]}>O Gatinho Organizador está pronto para ajudar!</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Primeiro Nome</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
              <Ionicons name="person-outline" size={20} color={colors.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }, Platform.OS === 'web' && { outlineStyle: 'none' }]}
                placeholder="Ex: João"
                value={firstName}
                onChangeText={setFirstName}
                placeholderTextColor={colors.subtitle}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Último Nome</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
              <Ionicons name="person-outline" size={20} color={colors.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }, Platform.OS === 'web' && { outlineStyle: 'none' }]}
                placeholder="Ex: Silva"
                value={lastName}
                onChangeText={setLastName}
                placeholderTextColor={colors.subtitle}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>E-mail</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
              <Ionicons name="mail-outline" size={20} color={colors.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }, Platform.OS === 'web' && { outlineStyle: 'none' }]}
                placeholder="seu-email@exemplo.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.subtitle}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Senha</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }, Platform.OS === 'web' && { outlineStyle: 'none' }]}
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor={colors.subtitle}
              />
            </View>
            <Text style={[styles.hint, { color: colors.subtitle }]}>
              Deve conter letra maiúscula, minúscula, número e símbolo.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.secondary, shadowColor: colors.secondary }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.white }]}>Cadastrar</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.subtitle }]}>Já tem uma conta?</Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={[styles.linkText, { color: colors.secondary }]}>Entrar</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
