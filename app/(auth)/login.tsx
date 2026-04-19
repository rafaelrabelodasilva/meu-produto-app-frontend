import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../context/toast-context';
import { useTheme } from '../../context/theme-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { token, signIn } = useAuth();
  const { showToast } = useToast();
  const { colors, isDark } = useTheme();
  const router = useRouter();

  // Redirecionamento automático se o token estiver presente
  useEffect(() => {
    if (token) {
      router.replace('/(tabs)');
    }
  }, [token]);

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('E-mail e senha são obrigatórios.', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      
      if (data && data.access_token && data.refresh_token) {
        await signIn(data.access_token, data.refresh_token);
        // O useEffect acima redirecionará para /(tabs)
      } else {
        throw new Error('Tokens não recebidos do servidor.');
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      showToast(error.message || 'E-mail ou senha inválidos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image 
            source={require('../../assets/kitty_on_computer.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: colors.text }]}>Bem-vindo!</Text>
          <Text style={[styles.subtitle, { color: colors.subtitle }]}>O Gatinho Organizador está pronto para organizar seu lar.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>E-mail</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
              <Ionicons name="mail-outline" size={20} color={colors.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
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
                style={[styles.input, { color: colors.text }]}
                placeholder="Sua senha secreta"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor={colors.subtitle}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.forgotPassword} 
            onPress={() => router.push('/(auth)/forgot-password')}
          >
            <Text style={[styles.forgotPasswordText, { color: colors.secondary }]}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.secondary, shadowColor: colors.secondary }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.white }]}>Entrar</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.subtitle }]}>Não tem uma conta?</Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={[styles.linkText, { color: colors.secondary }]}>Cadastrar</Text>
              </TouchableOpacity>
            </Link>
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
    padding: 24,
    paddingTop: 80,
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 58,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -8,
    padding: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '700',
  },
  button: {
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    gap: 8,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 15,
    fontWeight: '500',
  },
  linkText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
