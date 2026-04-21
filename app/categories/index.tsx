import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../context/theme-context';
import { useToast } from '../../context/toast-context';
import { categoriesApi } from '../../services/api';
import { ConfirmModal } from '../../components/ui/confirm-modal';

export default function CategoriesScreen() {
  const { colors, isDark } = useTheme();
  const { showToast } = useToast();
  
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  // Delete state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.list();
      setCategories(data);
    } catch (error) {
      showToast('Erro ao carregar categorias.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!newCategoryName.trim()) return;
    setSaving(true);
    try {
      const newCat = await categoriesApi.create({ name: newCategoryName.trim() });
      setCategories(prev => [...prev, newCat]);
      setNewCategoryName('');
      showToast('Categoria adicionada!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Erro ao criar categoria.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (category: any) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const handleUpdate = async () => {
    if (!editingId || !editName.trim()) return;
    setSaving(true);
    try {
      const updated = await categoriesApi.update(editingId, { name: editName.trim() });
      setCategories(prev => prev.map(c => c.id === editingId ? updated : c));
      setEditingId(null);
      showToast('Categoria atualizada!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Erro ao atualizar.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (category: any) => {
    setCategoryToDelete(category);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setDeleteModalVisible(false);
    try {
      await categoriesApi.delete(categoryToDelete.id);
      setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
      showToast('Categoria removida.', 'success');
    } catch (error: any) {
      showToast(error.message || 'Erro ao remover.', 'error');
    } finally {
      setCategoryToDelete(null);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isEditing = editingId === item.id;

    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
        {isEditing ? (
          <View style={styles.editRow}>
            <TextInput
              style={[styles.editInput, { color: colors.text, backgroundColor: isDark ? colors.inputBg : '#F1F5F9' }]}
              value={editName}
              onChangeText={setEditName}
              autoFocus
            />
            <TouchableOpacity onPress={handleUpdate} disabled={saving}>
              <Ionicons name="checkmark-circle" size={32} color={colors.success} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditingId(null)}>
              <Ionicons name="close-circle" size={32} color={colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.categoryRow}>
            <View style={styles.categoryInfo}>
              <Ionicons name="apps-outline" size={24} color={colors.secondary} style={styles.icon} />
              <Text style={[styles.categoryName, { color: colors.text }]}>{item.name}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => startEditing(item)} style={styles.actionBtn}>
                <Ionicons name="create-outline" size={22} color={colors.subtitle} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.actionBtn}>
                <Ionicons name="trash-outline" size={22} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Gerenciar Categorias</Text>
      </View>

      <View style={styles.createBox}>
        <TextInput
          style={[
            styles.createInput, 
            { 
              color: colors.text, 
              backgroundColor: colors.card,
              borderColor: isDark ? colors.border : '#E2E8F0'
            }
          ]}
          placeholder="Nome da nova categoria..."
          placeholderTextColor={colors.subtitle}
          value={newCategoryName}
          onChangeText={setNewCategoryName}
        />
        <TouchableOpacity 
          style={[styles.createBtn, { backgroundColor: colors.secondary }]}
          onPress={handleCreate}
          disabled={saving || !newCategoryName.trim()}
        >
          {saving && !editingId ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Ionicons name="add" size={28} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={colors.secondary} />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={64} color={colors.subtitle} />
              <Text style={[styles.emptyText, { color: colors.subtitle }]}>
                Nenhuma categoria cadastrada.
              </Text>
            </View>
          }
        />
      )}

      <ConfirmModal
        visible={deleteModalVisible}
        title="Remover Categoria"
        message={`Deseja remover "${categoryToDelete?.name}"? Produtos vinculados a esta categoria ficarão sem categoria.`}
        confirmLabel="Remover"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        type="danger"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  backBtn: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  createBox: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  createInput: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  createBtn: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    marginTop: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
