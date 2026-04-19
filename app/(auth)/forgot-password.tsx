import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '../../services/api';
import { useToast } from '../../context/toast-context';
import { useTheme } from '../../context/theme-context';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState(1); // 1: Email, 2: Code & New Password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { colors, isDark } = useTheme();

  const handleSendCode = async () => {
    if (!email) {
      showToast('Por favor, informe seu e-mail para receber o código.', 'error');
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setStep(2);
      showToast('Código enviado! Verifique seu e-mail.', 'success');
    } catch (error: any) {
      showToast(error.message || 'Não foi possível enviar o código agora.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!code || !newPassword) {
      showToast('Por favor, preencha o código e a nova senha.', 'error');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({ email, code, newPassword });
      showToast('Sua senha foi atualizada! Agora você pode entrar.', 'success');
      router.replace('/(auth)/login');
    } catch (error: any) {
      showToast(error.message || 'Código inválido ou expirado.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.card }]} 
            onPress={() => step === 1 ? router.back() : setStep(1)}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Image 
              source={require('../../assets/kitty_on_computer.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: colors.text }]}>Recuperar Acesso</Text>
            <Text style={[styles.subtitle, { color: colors.subtitle }]}>
              {step === 1 
                ? 'Informe seu e-mail para receber o código de 6 dígitos.' 
                : 'Digite o código recebido e sua nova senha.'}
            </Text>
          </View>

          <View style={styles.form}>
            {step === 1 ? (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>E-mail</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
                  <Ionicons name="mail-outline" size={20} color={colors.subtitle} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="seu@email.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholderTextColor={colors.subtitle}
                  />
                </View>
              </View>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Código de 6 dígitos</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
                    <Ionicons name="key-outline" size={20} color={colors.subtitle} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="123456"
                      value={code}
                      onChangeText={setCode}
                      keyboardType="number-pad"
                      maxLength={6}
                      placeholderTextColor={colors.subtitle}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Nova Senha</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
                    <Ionicons name="lock-closed-outline" size={20} color={colors.subtitle} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="********"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry
                      placeholderTextColor={colors.subtitle}
                    />
                  </View>
                </View>
              </>
            )}

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.secondary, shadowColor: colors.secondary }]} 
              onPress={step === 1 ? handleSendCode : handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.white }]}>
                  {step === 1 ? 'Enviar Código' : 'Redefinir Senha'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  form: {
    gap: 20,
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
  },
});
