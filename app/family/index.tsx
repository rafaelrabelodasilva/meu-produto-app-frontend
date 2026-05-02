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
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../context/toast-context';
import { useTheme } from '../../context/theme-context';
import { useResponsive } from '../../hooks/use-responsive';
import { apiFetch } from '../../services/api';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { ConfirmModal } from '../../components/ui/confirm-modal';

export default function FamilyScreen() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const { colors, isDark } = useTheme();
  const { width, isTablet } = useResponsive();
  
  const [families, setFamilies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setIsCreating] = useState(false);
  const [joining, setIsJoining] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);

  // States para Edição e Exclusão
  const [editingFamilyId, setEditingFamilyId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmRemoveMember, setConfirmRemoveMember] = useState<{ familyId: string, userId: string } | null>(null);

  // Responsividade
  const numColumns = width > 1000 ? 2 : 1;
  const cardWidth = numColumns > 1 ? (width - 60) / 2 : width - 40;

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

  const handleUpdateFamily = async (id: string) => {
    if (!editName.trim()) return;
    setIsUpdating(true);
    try {
      await apiFetch(`/families/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: editName }),
      });
      showToast('Nome da casa atualizado!', 'success');
      setEditingFamilyId(null);
      fetchFamilies();
    } catch (error) {
      showToast('Falha ao atualizar nome.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!confirmRemoveMember) return;
    try {
      await apiFetch(`/families/${confirmRemoveMember.familyId}/members/${confirmRemoveMember.userId}`, {
        method: 'DELETE',
      });
      showToast('Membro removido com sucesso.', 'success');
      setConfirmRemoveMember(null);
      fetchFamilies();
    } catch (error: any) {
      showToast(error.message || 'Falha ao remover membro.', 'error');
    }
  };

  const handleDeleteFamily = async () => {
    if (!confirmDeleteId) return;
    try {
      await apiFetch(`/families/${confirmDeleteId}`, {
        method: 'DELETE',
      });
      showToast('Família excluída com sucesso.', 'success');
      setConfirmDeleteId(null);
      fetchFamilies();
    } catch (error: any) {
      showToast(error.message || 'Falha ao excluir. Verifique se você é o único membro.', 'error');
    }
  };

  const handleGenerateInvite = async (familyId: string) => {
    try {
      const data = await apiFetch(`/families/${familyId}/invite-code`, {
        method: 'POST',
      });
      await Clipboard.setStringAsync(data.inviteCode);
      showToast(`Código ${data.inviteCode} copiado para a área de transferência!`, 'success');
      fetchFamilies();
    } catch (error) {
      showToast('Apenas o dono pode gerar convites.', 'error');
    }
  };

  const copyToClipboard = async (code: string) => {
    await Clipboard.setStringAsync(code);
    showToast('Código copiado!', 'success');
  };

  const renderFamilyItem = ({ item }: { item: any }) => {
    const isOwner = item.role === 'OWNER';
    const isEditing = editingFamilyId === item.family.id;

    return (
      <View style={[styles.familyCard, { backgroundColor: colors.card, width: cardWidth }]}>
        <View style={styles.familyHeader}>
          <View style={[styles.iconBox, { backgroundColor: isDark ? colors.inputBg : '#EEF2FF' }]}>
            <Ionicons name="home" size={24} color={colors.secondary} />
          </View>
          
          {isEditing ? (
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                style={[styles.editInput, { color: colors.text, backgroundColor: isDark ? colors.background : '#F1F5F9' }]}
                value={editName}
                onChangeText={setEditName}
                autoFocus
              />
              <TouchableOpacity onPress={() => handleUpdateFamily(item.family.id)} style={{ marginLeft: 10 }}>
                {isUpdating ? <ActivityIndicator size="small" color={colors.secondary} /> : <Ionicons name="checkmark-circle" size={28} color="#10B981" />}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditingFamilyId(null)} style={{ marginLeft: 5 }}>
                <Ionicons name="close-circle" size={28} color={colors.subtitle} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.familyInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.familyName, { color: colors.text }]}>{item.family.name}</Text>
                {isOwner && (
                  <TouchableOpacity 
                    onPress={() => {
                      setEditingFamilyId(item.family.id);
                      setEditName(item.family.name);
                    }}
                    style={{ marginLeft: 8 }}
                  >
                    <Ionicons name="create-outline" size={16} color={colors.subtitle} />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={[styles.memberCount, { color: colors.subtitle }]}>
                {item.family.members.length} membro(s)
              </Text>
            </View>
          )}

          {isOwner && !isEditing && (
            <TouchableOpacity onPress={() => setConfirmDeleteId(item.family.id)}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.membersList}>
          {item.family.members.map((m: any) => (
            <View key={m.id} style={styles.memberItem}>
              <View style={styles.memberAvatar}>
                <Text style={styles.avatarInitial}>{m.user.firstName[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.memberName, { color: colors.text }]}>
                  {m.user.firstName} {m.user.lastName} {m.role === 'OWNER' && '(Dono)'}
                </Text>
              </View>
              {isOwner && m.role !== 'OWNER' && (
                <TouchableOpacity onPress={() => setConfirmRemoveMember({ familyId: item.family.id, userId: m.user.id })}>
                  <Ionicons name="close-outline" size={20} color={colors.subtitle} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {isOwner && (
          <View style={styles.inviteContainer}>
            {item.family.inviteCode ? (
              <TouchableOpacity 
                style={[styles.codeBox, { backgroundColor: isDark ? colors.background : '#F8FAFC' }]}
                onPress={() => copyToClipboard(item.family.inviteCode)}
              >
                <Text style={[styles.inviteLabel, { color: colors.subtitle }]}>Código de Convite:</Text>
                <View style={styles.codeRow}>
                  <Text style={[styles.codeText, { color: colors.secondary }]}>{item.family.inviteCode}</Text>
                  <Ionicons name="copy-outline" size={18} color={colors.secondary} />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.inviteButton, { borderColor: colors.secondary }]}
                onPress={() => handleGenerateInvite(item.family.id)}
              >
                <Ionicons name="person-add" size={18} color={colors.secondary} />
                <Text style={[styles.inviteButtonText, { color: colors.secondary }]}>Gerar Convite</Text>
              </TouchableOpacity>
            )}
            
            {item.family.inviteCode && (
               <TouchableOpacity 
                onPress={() => handleGenerateInvite(item.family.id)}
                style={{ marginTop: 10, alignSelf: 'center' }}
               >
                 <Text style={{ fontSize: 12, color: colors.subtitle, textDecorationLine: 'underline' }}>Renovar Código</Text>
               </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
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
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
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
            <FlatList
              data={families}
              renderItem={renderFamilyItem}
              keyExtractor={(item) => item.family.id}
              numColumns={numColumns}
              key={numColumns} // Força re-render ao mudar layout
              scrollEnabled={false}
              columnWrapperStyle={numColumns > 1 ? { gap: 20 } : undefined}
            />
          )}

          <View style={[styles.actions, numColumns > 1 && styles.actionsTablet]}>
            {!showCreateForm && !showJoinForm && (
              <>
                <TouchableOpacity 
                  style={[styles.primaryButton, { backgroundColor: colors.secondary, flex: numColumns > 1 ? 1 : 0 }]}
                  onPress={() => setShowCreateForm(true)}
                >
                  <Text style={styles.buttonText}>Criar Nova Casa</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.secondaryButton, { borderColor: colors.secondary, flex: numColumns > 1 ? 1 : 0 }]}
                  onPress={() => setShowJoinForm(true)}
                >
                  <Text style={[styles.secondaryButtonText, { color: colors.secondary }]}>Entrar com Código</Text>
                </TouchableOpacity>
              </>
            )}

            {showCreateForm && (
              <View style={[styles.form, { backgroundColor: colors.card, width: '100%' }]}>
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
              <View style={[styles.form, { backgroundColor: colors.card, width: '100%' }]}>
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

      {/* Modais de Confirmação */}
      <ConfirmModal
        visible={!!confirmDeleteId}
        title="Excluir Família"
        message="Tem certeza que deseja excluir esta família? Os produtos vinculados a ela voltarão a ser apenas seus."
        confirmLabel="Excluir"
        onConfirm={handleDeleteFamily}
        onCancel={() => setConfirmDeleteId(null)}
        type="danger"
      />

      <ConfirmModal
        visible={!!confirmRemoveMember}
        title="Remover Membro"
        message="Deseja remover este membro da família? Ele perderá o acesso compartilhado aos itens."
        confirmLabel="Remover"
        onConfirm={handleRemoveMember}
        onCancel={() => setConfirmRemoveMember(null)}
        type="danger"
      />
    </View>
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
  content: { paddingHorizontal: 20 },
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
  memberItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  memberAvatar: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#FFD164', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 12 
  },
  avatarInitial: { fontWeight: 'bold', color: '#0042cf', fontSize: 16 },
  memberName: { fontSize: 15, fontWeight: '500' },
  inviteContainer: { marginTop: 10 },
  codeBox: {
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  inviteLabel: { fontSize: 12, marginBottom: 4 },
  codeRow: { flexDirection: 'row', alignItems: 'center' },
  codeText: { fontSize: 20, fontWeight: '800', letterSpacing: 2, marginRight: 10 },
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
  actions: { marginTop: 10 },
  actionsTablet: { flexDirection: 'row', gap: 20 },
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
    marginBottom: 15,
  },
  secondaryButtonText: { fontWeight: '700', fontSize: 16 },
  form: { padding: 20, borderRadius: 20, marginBottom: 20 },
  formTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  input: {
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  editInput: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    fontSize: 18,
    fontWeight: '700',
  },
  formActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  smallButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
});
