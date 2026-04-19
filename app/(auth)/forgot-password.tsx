import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '../../services/api';

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

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState(1); // 1: Email, 2: Code & New Password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert('E-mail necessário', 'Por favor, informe seu e-mail para receber o código.');
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setStep(2);
      Alert.alert('Código Enviado', 'O Gatinho Organizador enviou um código para seu e-mail (verifique o console do backend).');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível enviar o código agora.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!code || !newPassword) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha o código e a nova senha.');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({ email, code, newPassword });
      Alert.alert('Sucesso', 'Sua senha foi atualizada! Agora você pode entrar.', [
        { text: 'Ir para Login', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Código inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Image 
            source={require('../../assets/kitty_on_computer.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Recuperar Acesso</Text>
          <Text style={styles.subtitle}>
            {step === 1 
              ? 'Informe seu e-mail para receber o código de 6 dígitos.' 
              : 'Digite o código recebido e sua nova senha.'}
          </Text>
        </View>

        <View style={styles.form}>
          {step === 1 ? (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={COLORS.subtitle} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="seu@email.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Código de 6 dígitos</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="key-outline" size={20} color={COLORS.subtitle} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="123456"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nova Senha</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.subtitle} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="********"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                  />
                </View>
              </View>
            </>
          )}

          <TouchableOpacity 
            style={styles.button} 
            onPress={step === 1 ? handleSendCode : handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>
                {step === 1 ? 'Enviar Código' : 'Redefinir Senha'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    backgroundColor: COLORS.white,
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
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.subtitle,
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
    color: COLORS.text,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  button: {
    backgroundColor: COLORS.secondary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
  },
});
