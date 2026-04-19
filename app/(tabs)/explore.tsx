import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../context/toast-context';
import { ConfirmModal } from '../../components/ui/confirm-modal';
import { authApi, userApi, apiFetch } from '../../services/api';

const COLORS = {
  primary: '#FFD164',
  secondary: '#0042cf',
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#11181C',
  subtitle: '#64748B',
  white: '#FFFFFF',
  error: '#EF4444',
};

export default function ProfileScreen() {
  const { token, signOut } = useAuth();
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // States para os modais de confirmação
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [token]);

  const fetchUserProfile = async () => {
    if (!token) return;
    try {
      const authData = await authApi.getMe();
      // O endpoint 'me' retorna apenas userId e email. 
      // Agora buscamos os dados completos do usuário usando o userId.
      const userData = await apiFetch(`/users/${authData.userId}`);
      setUser({ ...authData, ...userData });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      showToast('Não foi possível carregar os dados do seu perfil.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    setLogoutModalVisible(false);
    signOut();
  };

  const handleDeleteAccount = () => {
    setDeleteModalVisible(true);
  };

  const confirmDeleteAccount = async () => {
    if (!user?.userId) return;
    setDeleteModalVisible(false);
    try {
      await userApi.deleteAccount(user.userId);
      showToast('Seus dados foram removidos com sucesso.', 'success');
      signOut();
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      showToast('Não foi possível excluir a conta agora.', 'error');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Ajustes</Text>
            <Image 
              source={require('../../assets/kitty_on_computer.png')} 
              style={styles.kittyHeader}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={80} color={COLORS.secondary} />
          </View>
          <Text style={styles.userName}>
            {user?.firstName || 'Usuário'}
          </Text>
          <Text style={styles.userEmail}>{user?.email || 'email@exemplo.com'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sessão</Text>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={[styles.iconWrapper, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="log-out-outline" size={22} color={COLORS.secondary} />
            </View>
            <Text style={styles.menuText}>Sair da Conta</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacidade</Text>
          <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAccount}>
            <View style={[styles.iconWrapper, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="trash-outline" size={22} color={COLORS.error} />
            </View>
            <Text style={[styles.menuText, { color: COLORS.error }]}>Excluir Conta Permanentemente</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Versão 1.0.0 (Gatinho Organizador)</Text>
        </View>
      </ScrollView>

      {/* Modais de Confirmação */}
      <ConfirmModal
        visible={logoutModalVisible}
        title="Sair da Conta"
        message="Deseja realmente sair do Gatinho Organizador?"
        confirmLabel="Sair"
        onConfirm={confirmLogout}
        onCancel={() => setLogoutModalVisible(false)}
        type="primary"
      />

      <ConfirmModal
        visible={deleteModalVisible}
        title="Excluir Conta"
        message="Esta ação é permanente. Todos os seus dados e produtos serão deletados. Deseja continuar?"
        confirmLabel="Excluir"
        onConfirm={confirmDeleteAccount}
        onCancel={() => setDeleteModalVisible(false)}
        type="danger"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
  },
  kittyHeader: {
    width: 60,
    height: 60,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    margin: 24,
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.subtitle,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.subtitle,
    textTransform: 'uppercase',
    marginBottom: 16,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '600',
  },
});
