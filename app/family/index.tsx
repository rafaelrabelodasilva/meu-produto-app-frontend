import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../context/toast-context';
import { useTheme } from '../../context/theme-context';
import { apiFetch } from '../../services/api';
import { router } from 'expo-router';

export default function FamilyScreen() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const { colors, isDark } = useTheme();
  const [families, setFamilies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setIsCreating] = useState(false);
  const [joining, setIsJoining] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);

  useEffect(() => {
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    try {
      const data = await apiFetch('/families/my-families');
      setFamilies(data);
    } catch (error) {
      console.error('Erro ao buscar famílias:', error);
      showToast('Não foi possível carregar suas famílias.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      showToast('Dê um nome para a sua casa.', 'error');
      return;
    }

    setIsCreating(true);
    try {
      await apiFetch('/families', {
        method: 'POST',
        body: JSON.stringify({ name: familyName }),
      });
      showToast('Casa criada com sucesso!', 'success');
      setFamilyName('');
      setShowCreateForm(false);
      fetchFamilies();
    } catch (error) {
      showToast('Falha ao criar casa.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinFamily = async () => {
    if (!inviteCode.trim()) {
      showToast('Digite o código de convite.', 'error');
      return;
    }

    setIsJoining(true);
    try {
      await apiFetch('/families/join', {
        method: 'POST',
        body: JSON.stringify({ inviteCode: inviteCode.toUpperCase() }),
      });
      showToast('Agora você faz parte da família!', 'success');
      setInviteCode('');
      setShowJoinForm(false);
      fetchFamilies();
    } catch (error: any) {
      showToast(error.message || 'Código inválido ou expirado.', 'error');
    } finally {
      setIsJoining(false);
    }
  };

  const handleGenerateInvite = async (familyId: string) => {
    try {
      const data = await apiFetch(`/families/${familyId}/invite-code`, {
        method: 'POST',
      });
      showToast(`Código gerado: ${data.inviteCode}. Passe para seu familiar!`, 'success', 5000);
      fetchFamilies();
    } catch (error) {
      showToast('Apenas o dono pode gerar convites.', 'error');
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Minha Família</Text>
      </View>

      <View style={styles.content}>
        {families.length === 0 ? (
          <View style={styles.emptyState}>
            <Image 
              source={require('../../assets/kitty_on_computer.png')} 
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              Você ainda não faz parte de nenhuma família.
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.subtitle }]}>
              Crie uma casa para organizar seus itens com outras pessoas ou entre em uma existente.
            </Text>
          </View>
        ) : (
          families.map((item) => (
            <View key={item.family.id} style={[styles.familyCard, { backgroundColor: colors.card }]}>
              <View style={styles.familyHeader}>
                <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
                  <Ionicons name="home" size={24} color={colors.secondary} />
                </View>
                <View style={styles.familyInfo}>
                  <Text style={[styles.familyName, { color: colors.text }]}>{item.family.name}</Text>
                  <Text style={[styles.memberCount, { color: colors.subtitle }]}>
                    {item.family.members.length} membro(s)
                  </Text>
                </View>
              </View>

              <View style={styles.membersList}>
                {item.family.members.map((m: any) => (
                  <View key={m.id} style={styles.memberItem}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.avatarInitial}>{m.user.firstName[0]}</Text>
                    </View>
                    <Text style={[styles.memberName, { color: colors.text }]}>
                      {m.user.firstName} {m.user.lastName} {m.role === 'OWNER' && '(Dono)'}
                    </Text>
                  </View>
                ))}
              </View>

              {item.role === 'OWNER' && (
                <TouchableOpacity 
                  style={[styles.inviteButton, { borderColor: colors.secondary }]}
                  onPress={() => handleGenerateInvite(item.family.id)}
                >
                  <Ionicons name="person-add" size={18} color={colors.secondary} />
                  <Text style={[styles.inviteButtonText, { color: colors.secondary }]}>
                    {item.family.inviteCode ? `Código: ${item.family.inviteCode}` : 'Gerar Convite'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}

        <View style={styles.actions}>
          {!showCreateForm && !showJoinForm && (
            <>
              <TouchableOpacity 
                style={[styles.primaryButton, { backgroundColor: colors.secondary }]}
                onPress={() => setShowCreateForm(true)}
              >
                <Text style={styles.buttonText}>Criar Nova Casa</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.secondaryButton, { borderColor: colors.secondary }]}
                onPress={() => setShowJoinForm(true)}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.secondary }]}>Entrar com Código</Text>
              </TouchableOpacity>
            </>
          )}

          {showCreateForm && (
            <View style={[styles.form, { backgroundColor: colors.card }]}>
              <Text style={[styles.formTitle, { color: colors.text }]}>Nome da Casa</Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: isDark ? colors.inputBg : '#F1F5F9' }]}
                placeholder="Ex: Nossa Casa, Apartamento 42..."
                placeholderTextColor={colors.subtitle}
                value={familyName}
                onChangeText={setFamilyName}
              />
              <View style={styles.formActions}>
                <TouchableOpacity onPress={() => setShowCreateForm(false)}>
                  <Text style={{ color: colors.subtitle }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.smallButton, { backgroundColor: colors.secondary }]}
                  onPress={handleCreateFamily}
                  disabled={creating}
                >
                  {creating ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.buttonText}>Criar</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {showJoinForm && (
            <View style={[styles.form, { backgroundColor: colors.card }]}>
              <Text style={[styles.formTitle, { color: colors.text }]}>Código de Convite</Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: isDark ? colors.inputBg : '#F1F5F9' }]}
                placeholder="Digite o código de 8 dígitos"
                placeholderTextColor={colors.subtitle}
                value={inviteCode}
                autoCapitalize="characters"
                onChangeText={setInviteCode}
              />
              <View style={styles.formActions}>
                <TouchableOpacity onPress={() => setShowJoinForm(false)}>
                  <Text style={{ color: colors.subtitle }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.smallButton, { backgroundColor: colors.secondary }]}
                  onPress={handleJoinFamily}
                  disabled={joining}
                >
                  {joining ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.buttonText}>Entrar</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: { marginRight: 15 },
  title: { fontSize: 24, fontWeight: '800' },
  content: { padding: 20 },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyImage: { width: 150, height: 150, marginBottom: 20 },
  emptyText: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  emptySubtext: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  familyCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  familyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  familyInfo: { flex: 1 },
  familyName: { fontSize: 18, fontWeight: '700' },
  memberCount: { fontSize: 14, marginTop: 2 },
  membersList: { marginBottom: 20 },
  memberItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  memberAvatar: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: '#FFD164', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 10 
  },
  avatarInitial: { fontWeight: 'bold', color: '#0042cf' },
  memberName: { fontSize: 15 },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  inviteButtonText: { marginLeft: 8, fontWeight: '600' },
  actions: { marginTop: 20 },
  primaryButton: {
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  secondaryButton: {
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: { fontWeight: '700', fontSize: 16 },
  form: { padding: 20, borderRadius: 20, marginTop: 10 },
  formTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  input: {
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  formActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  smallButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
});
