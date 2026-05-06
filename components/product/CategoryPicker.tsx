import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/theme-context';
import { useToast } from '../../context/toast-context';
import { categoriesApi } from '../../services/api';
import { styles } from './CategoryPicker.styles';

interface CategoryPickerProps {
  selectedId: string | null;
  selectedName?: string | null;
  onSelect: (id: string | null, name: string) => void;
  label?: string;
}

export const CategoryPicker = ({ selectedId, selectedName: initialName, onSelect, label = 'Categoria' }: CategoryPickerProps) => {
  const { colors, isDark } = useTheme();
  const { showToast } = useToast();
  const [modalVisible, setModalVisible] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedName, setSelectedName] = useState(initialName || '');
  
  // Edit mode inside picker
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoriesApi.list();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      showToast('Não foi possível carregar as categorias.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modalVisible) {
      fetchCategories();
    }
  }, [modalVisible]);

  useEffect(() => {
    if (initialName) {
      setSelectedName(initialName);
    } else if (!selectedId) {
      setSelectedName('');
    }
  }, [initialName, selectedId]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setCreating(true);
    try {
      const newCat = await categoriesApi.create({ name: newCategoryName.trim() });
      setCategories(prev => [...prev, newCat]);
      setNewCategoryName('');
      handleSelect(newCat.id, newCat.name);
      showToast('Categoria criada!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Erro ao criar categoria.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleSelect = (id: string | null, name: string) => {
    onSelect(id, name);
    setSelectedName(name);
    setModalVisible(false);
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    try {
      const updated = await categoriesApi.update(id, { name: editName.trim() });
      setCategories(prev => prev.map(c => c.id === id ? updated : c));
      setEditingId(null);
      if (selectedId === id) {
        setSelectedName(updated.name);
        onSelect(id, updated.name);
      }
      showToast('Categoria atualizada!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Erro ao atualizar.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await categoriesApi.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      if (selectedId === id) {
        onSelect(null, '');
        setSelectedName('');
      }
      showToast('Categoria removida.', 'success');
    } catch (error: any) {
      showToast(error.message || 'Erro ao remover.', 'error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.pickerTrigger,
          { 
            backgroundColor: colors.card, 
            borderColor: isDark ? colors.border : '#E2E8F0' 
          }
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="apps-outline" size={20} color={colors.subtitle} style={styles.icon} />
        <Text style={[styles.selectedText, { color: selectedName ? colors.text : colors.subtitle }]}>
          {selectedName || 'Selecionar Categoria'}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.subtitle} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Categorias</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.createContainer}>
                  <TextInput
                    style={[
                      styles.createInput, 
                      { 
                        color: colors.text, 
                        backgroundColor: isDark ? colors.inputBg : '#F1F5F9',
                        borderColor: isDark ? colors.border : '#E2E8F0'
                      },
                      Platform.OS === 'web' && { outlineStyle: 'none' }
                    ]}
                    placeholder="Nova Categoria..."
                    placeholderTextColor={colors.subtitle}
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                  />
                  <TouchableOpacity 
                    style={[styles.createButton, { backgroundColor: colors.secondary }]}
                    onPress={handleCreateCategory}
                    disabled={creating || !newCategoryName.trim()}
                  >
                    {creating ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Ionicons name="add" size={24} color="#FFF" />
                    )}
                  </TouchableOpacity>
                </View>

                {loading ? (
                  <ActivityIndicator style={styles.loader} color={colors.secondary} />
                ) : (
                  <FlatList
                    data={categories}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <View style={[
                        styles.categoryItem,
                        selectedId === item.id && { backgroundColor: isDark ? colors.inputBg : '#EEF2FF' }
                      ]}>
                        {editingId === item.id ? (
                          <View style={styles.editInlineRow}>
                            <TextInput
                              style={[
                                styles.editInlineInput, 
                                { color: colors.text, backgroundColor: isDark ? colors.card : '#FFF', borderColor: colors.secondary },
                                Platform.OS === 'web' && { outlineStyle: 'none' }
                              ]}
                              value={editName}
                              onChangeText={setEditName}
                              autoFocus
                            />
                            <TouchableOpacity onPress={() => handleUpdate(item.id)}>
                              <Ionicons name="checkmark-circle" size={28} color={colors.success} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setEditingId(null)}>
                              <Ionicons name="close-circle" size={28} color={colors.error} />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <>
                            <TouchableOpacity 
                              style={styles.categoryInfo} 
                              onPress={() => handleSelect(item.id, item.name)}
                            >
                              <Text style={[
                                styles.categoryItemText, 
                                { color: colors.text },
                                selectedId === item.id && { color: colors.secondary, fontWeight: '700' }
                              ]}>
                                {item.name}
                              </Text>
                              {selectedId === item.id && (
                                <Ionicons name="checkmark" size={20} color={colors.secondary} style={{ marginLeft: 8 }} />
                              )}
                            </TouchableOpacity>
                            <View style={styles.itemActions}>
                              <TouchableOpacity onPress={() => { setEditingId(item.id); setEditName(item.name); }}>
                                <Ionicons name="create-outline" size={20} color={colors.subtitle} />
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                                <Ionicons name="trash-outline" size={20} color={colors.error} />
                              </TouchableOpacity>
                            </View>
                          </>
                        )}
                      </View>
                    )}
                    ListEmptyComponent={
                      <Text style={[styles.emptyText, { color: colors.subtitle }]}>
                        Nenhuma categoria encontrada.
                      </Text>
                    }
                    style={styles.list}
                  />
                )}
                
                <TouchableOpacity
                  style={[styles.clearButton, { borderTopColor: isDark ? colors.border : '#E2E8F0' }]}
                  onPress={() => handleSelect(null, '')}
                >
                  <Text style={[styles.clearButtonText, { color: colors.error }]}>Limpar Seleção</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

