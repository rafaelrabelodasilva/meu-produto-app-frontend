import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../context/toast-context';
import { useTheme } from '../../context/theme-context';
import { useResponsive } from '../../hooks/use-responsive';
import { ConfirmModal } from '../../components/ui/confirm-modal';
import { authApi, userApi, apiFetch } from '../../services/api';
import { styles } from '../../styles/settings.styles';

export default function ProfileScreen() {
  const { token, signOut } = useAuth();
  const { showToast } = useToast();
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  const { isTablet } = useResponsive();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // States para os modais de confirmação
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // States para edição de perfil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({ firstName: '', lastName: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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
      setEditProfileData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
      });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      showToast('Não foi possível carregar os dados do seu perfil.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editProfileData.firstName.trim() || !editProfileData.lastName.trim()) {
      showToast('Nome e sobrenome são obrigatórios.', 'error');
      return;
    }

    setIsSavingProfile(true);
    try {
      await userApi.update(user.userId, editProfileData);
      setUser({ ...user, ...editProfileData });
      setIsEditingProfile(false);
      showToast('Perfil atualizado com sucesso!', 'success');
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      showToast(error.message || 'Falha ao salvar alterações.', 'error');
    } finally {
      setIsSavingProfile(false);
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
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <View style={styles.headerTop}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Ajustes</Text>
            <Image 
              source={require('../../assets/kitty_on_computer.png')} 
              style={styles.kittyHeader}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
          <View style={styles.avatarContainer}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: isDark ? colors.inputBg : '#EEF2FF',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name="person" size={40} color={colors.secondary} />
            </View>
          </View>
          
          {isEditingProfile ? (
            <View style={styles.editProfileForm}>
              <TextInput
                style={[styles.editInput, { color: colors.text, backgroundColor: isDark ? colors.inputBg : '#F1F5F9' }]}
                placeholder="Nome"
                placeholderTextColor={colors.subtitle}
                value={editProfileData.firstName}
                onChangeText={(t) => setEditProfileData({ ...editProfileData, firstName: t })}
              />
              <TextInput
                style={[styles.editInput, { color: colors.text, backgroundColor: isDark ? colors.inputBg : '#F1F5F9' }]}
                placeholder="Sobrenome"
                placeholderTextColor={colors.subtitle}
                value={editProfileData.lastName}
                onChangeText={(t) => setEditProfileData({ ...editProfileData, lastName: t })}
              />
              <View style={styles.editProfileActions}>
                <TouchableOpacity 
                  style={[styles.smallButton, { backgroundColor: isDark ? colors.inputBg : '#F1F5F9' }]} 
                  onPress={() => {
                    setIsEditingProfile(false);
                    setEditProfileData({ firstName: user.firstName, lastName: user.lastName });
                  }}
                >
                  <Text style={[styles.smallButtonText, { color: colors.subtitle }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.smallButton, { backgroundColor: colors.secondary }]} 
                  onPress={handleUpdateProfile}
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={[styles.smallButtonText, { color: colors.white }]}>Salvar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.firstName}
              </Text>
              <Text style={[styles.userEmail, { color: colors.subtitle }]}>{user?.email}</Text>
              <TouchableOpacity 
                style={[styles.editBadge, { backgroundColor: isDark ? colors.inputBg : '#EEF2FF' }]}
                onPress={() => setIsEditingProfile(true)}
              >
                <Ionicons name="create-outline" size={14} color={colors.secondary} />
                <Text style={[styles.editBadgeText, { color: colors.secondary }]}>Editar Perfil</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.subtitle }]}>Aparência</Text>
          <View style={[styles.themeSwitcher, { backgroundColor: colors.card }]}>
            <TouchableOpacity 
              style={[styles.themeOption, themeMode === 'light' && { backgroundColor: isDark ? colors.inputBg : '#EEF2FF' }]} 
              onPress={() => setThemeMode('light')}
            >
              <Ionicons name="sunny" size={20} color={themeMode === 'light' ? colors.secondary : colors.subtitle} />
              <Text style={[styles.themeText, { color: themeMode === 'light' ? colors.secondary : colors.subtitle }]}>Claro</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.themeOption, themeMode === 'dark' && { backgroundColor: isDark ? colors.inputBg : '#EEF2FF' }]} 
              onPress={() => setThemeMode('dark')}
            >
              <Ionicons name="moon" size={20} color={themeMode === 'dark' ? colors.secondary : colors.subtitle} />
              <Text style={[styles.themeText, { color: themeMode === 'dark' ? colors.secondary : colors.subtitle }]}>Escuro</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.themeOption, themeMode === 'system' && { backgroundColor: isDark ? colors.inputBg : '#EEF2FF' }]} 
              onPress={() => setThemeMode('system')}
            >
              <Ionicons name="phone-portrait-outline" size={20} color={themeMode === 'system' ? colors.secondary : colors.subtitle} />
              <Text style={[styles.themeText, { color: themeMode === 'system' ? colors.secondary : colors.subtitle }]}>Auto</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.subtitle }]}>Colaboração</Text>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.card }]} 
            onPress={() => router.push('/family')}
          >
            <View style={[styles.iconWrapper, { backgroundColor: isDark ? colors.inputBg : '#EEF2FF' }]}>
              <Ionicons name="people-outline" size={22} color={colors.secondary} />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>Minha Família</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.subtitle }]}>Sessão</Text>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card }]} onPress={handleLogout}>

            <View style={[styles.iconWrapper, { backgroundColor: isDark ? colors.inputBg : '#EEF2FF' }]}>
              <Ionicons name="log-out-outline" size={22} color={colors.secondary} />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>Sair da Conta</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.subtitle }]}>Privacidade</Text>
          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card }]} onPress={handleDeleteAccount}>
            <View style={[styles.iconWrapper, { backgroundColor: isDark ? colors.inputBg : '#FEF2F2' }]}>
              <Ionicons name="trash-outline" size={22} color={colors.error} />
            </View>
            <Text style={[styles.menuText, { color: colors.error }]}>Excluir Conta Permanentemente</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: colors.subtitle }]}>Versão 1.0.0 (Gatinho Organizador)</Text>
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
