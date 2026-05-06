import React, { useEffect, useState, useCallback } from 'react';
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

  // Lógica de responsividade idêntica ao Dashboard
  const numColumns = width > 1200 ? 3 : isTablet ? 2 : 1;
  const paddingTotal = isTablet ? 48 : 40;
  const gapTotal = (numColumns - 1) * 24;
  const cardWidth = (Math.min(width, 1400) - paddingTotal - gapTotal) / numColumns;

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
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.headerTop, { maxWidth: 1400 }]}>
            <View style={styles.titleContainer}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.title, { color: colors.text }]}>Minha Família</Text>
            </View>
            <Image 
              source={require('../../assets/kitty_on_computer.png')} 
              style={styles.kittyHeader}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={[styles.responsiveContent, { maxWidth: 1400 }]}>
          {families.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.text }]}>
                Você ainda não faz parte de nenhuma família.
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.subtitle }]}>
                Crie um grupo para organizar seus itens com outras pessoas ou entre em um existente.
              </Text>
            </View>
          ) : (
            <FlatList
              data={families}
              renderItem={renderFamilyItem}
              keyExtractor={(item) => item.family.id}
              numColumns={numColumns}
              key={numColumns}
              scrollEnabled={false}
              columnWrapperStyle={numColumns > 1 ? { gap: 24 } : undefined}
              contentContainerStyle={styles.familyList}
            />
          )}

          <View style={styles.actionsContainer}>
            {!showCreateForm && !showJoinForm && (
              <View style={styles.buttonStack}>
                <TouchableOpacity 
                  style={[styles.primaryButton, { backgroundColor: colors.secondary }]}
                  onPress={() => setShowCreateForm(true)}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.buttonText}>Criar Nova Família</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.secondaryButton, { borderColor: colors.secondary }]}
                  onPress={() => setShowJoinForm(true)}
                >
                  <Ionicons name="enter-outline" size={20} color={colors.secondary} style={{ marginRight: 8 }} />
                  <Text style={[styles.secondaryButtonText, { color: colors.secondary }]}>Entrar com Código</Text>
                </TouchableOpacity>
              </View>
            )}

            {showCreateForm && (
              <View style={[styles.form, { backgroundColor: colors.card }]}>
                <Text style={[styles.formTitle, { color: colors.text }]}>Nome da Família</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: isDark ? colors.inputBg : '#F1F5F9' }]}
                  placeholder="Ex: Família Silva, Apartamento 42..."
                  placeholderTextColor={colors.subtitle}
                  value={familyName}
                  onChangeText={setFamilyName}
                />
                <View style={styles.formActions}>
                  <TouchableOpacity onPress={() => setShowCreateForm(false)}>
                    <Text style={{ color: colors.subtitle, fontWeight: '600' }}>Cancelar</Text>
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
                    <Text style={{ color: colors.subtitle, fontWeight: '600' }}>Cancelar</Text>
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
  scrollContent: { paddingBottom: 60, alignItems: 'center' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTop: {
    width: '100%',
    maxWidth: 1000,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: { marginRight: 16 },
  title: { fontSize: 28, fontWeight: '800' },
  kittyHeader: { width: 60, height: 60 },
  responsiveContent: {
    width: '100%',
    maxWidth: 1000,
    paddingHorizontal: 24,
  },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  emptySubtext: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  familyList: { marginTop: 24 },
  familyCard: {
    padding: 24,
    borderRadius: 32,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  familyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  iconBox: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  familyInfo: { flex: 1 },
  familyName: { fontSize: 20, fontWeight: '800' },
  memberCount: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  membersList: { marginBottom: 24 },
  memberItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  memberAvatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#FFD164', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 12 
  },
  avatarInitial: { fontWeight: 'bold', color: '#0042cf', fontSize: 16 },
  memberName: { fontSize: 16, fontWeight: '600' },
  inviteContainer: { marginTop: 8 },
  codeBox: {
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  inviteLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  codeRow: { flexDirection: 'row', alignItems: 'center' },
  codeText: { fontSize: 22, fontWeight: '900', letterSpacing: 3, marginRight: 12 },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  inviteButtonText: { marginLeft: 10, fontWeight: '700' },
  actionsContainer: {
    marginTop: 20,
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
  },
  buttonStack: { gap: 16 },
  primaryButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  secondaryButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  secondaryButtonText: { fontWeight: '800', fontSize: 16 },
  form: { padding: 24, borderRadius: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 4 },
  formTitle: { fontSize: 16, fontWeight: '800', marginBottom: 16 },
  input: {
    height: 54,
    paddingHorizontal: 16,
    borderRadius: 14,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  editInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 10,
    fontSize: 18,
    fontWeight: '800',
  },
  formActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  smallButton: { paddingHorizontal: 24, height: 44, borderRadius: 12, justifyContent: 'center' },
});