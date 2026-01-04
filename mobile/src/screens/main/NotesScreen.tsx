import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Animated,
  RefreshControl,
} from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigationAnimation } from '../../contexts/NavigationAnimationContext';
import { useFocusEffect } from '@react-navigation/native';
import { FamilyDropdown } from '../../components/home/FamilyDropdown';
import { brandColors } from '../../theme/colors';
import { notesApi, todosApi } from '../../services/api';
import SegmentedTabs from '../../components/common/SegmentedTabs';
import MainScreenLayout from '../../components/layout/MainScreenLayout';

const H_PADDING = 20;

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  category: 'personal' | 'work' | 'family' | 'ideas';
  isPinned: boolean;
  color: string;
}

interface TaskItem {
  id: string;
  title: string;
  description: string;
  category: 'work' | 'personal' | 'family' | 'urgent';
  priority: 'low' | 'medium' | 'high';
  dueDate: string; // ISO
  isCompleted: boolean;
}

const NotesScreen: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  console.log('[UI] NotesScreen (main) using MainScreenLayout');
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'personal' | 'work' | 'family' | 'ideas'>('all');
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [showNoteDetail, setShowNoteDetail] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // To-Do in Notes
  const [showTodoDrawer, setShowTodoDrawer] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [taskForm, setTaskForm] = useState<{ title: string; description: string; category: 'work' | 'personal' | 'family' | 'urgent'; priority: 'low' | 'medium' | 'high'; dueDate: string }>({
    title: '',
    description: '',
    category: 'work',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
  });

  // hourse selection state
  const [showFamilyDropdown, setShowFamilyDropdown] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState('Smith hourse');
  const availableFamilies = [
    { id: '1', name: 'Smith hourse', members: 4 },
    { id: '2', name: 'Johnson hourse', members: 3 },
    { id: '3', name: 'Williams hourse', members: 5 },
    { id: '4', name: 'Brown hourse', members: 2 },
  ];

  // Form state
  const [noteForm, setNoteForm] = useState<{ title: string; content: string; category: 'personal' | 'work' | 'family' | 'ideas'; color: string }>({
    title: '',
    content: '',
    category: 'personal',
    color: '#FFB6C1',
  });

  const { cardMarginTopAnim, animateToGallery, familyNameScaleAnim } = useNavigationAnimation();
  const cardOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(cardOpacityAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      animateToGallery();
    }, [animateToGallery])
  );

  // Load from backend
  const loadNotes = async () => {
    try {
      const res = await notesApi.list();
      const items: any[] = res.data || res.notes || res;
      const mapped: Note[] = (items || []).map((n: any) => ({
        id: n.id,
        title: n.title || '',
        content: n.content || '',
        createdAt: n.created_at || n.createdAt || new Date().toISOString(),
        updatedAt: n.updated_at || n.updatedAt || new Date().toISOString(),
        category: n.category || 'personal',
        isPinned: n.is_pinned || false,
        color: n.color || '#FFB6C1',
      }));
      setNotes(mapped);
    } catch (e) {
      // Keep empty on error
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const loadTodos = async () => {
    try {
      const res = await todosApi.list();
      const items: any[] = res.data || res.todos || res;
      const mapped: TaskItem[] = (items || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description || '',
        category: t.category || 'personal',
        priority: t.priority || 'medium',
        dueDate: t.due_date || new Date().toISOString(),
        isCompleted: !!t.is_completed,
      }));
      setTasks(mapped);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const reorderTasks = async (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= tasks.length || fromIndex === toIndex) return;
    const next = [...tasks];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setTasks(next);
    try {
      const orderedIds = next.map(t => t.id);
      await todosApi.reorder(orderedIds);
      await loadTodos();
    } catch (e) {
      // ignore
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadNotes(), loadTodos()]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleFamilySelect = (familyName: string) => {
    setSelectedFamily(familyName);
    setShowFamilyDropdown(false);
  };

  const handleCreateNote = () => {
    setNoteForm({
      title: '',
      content: '',
      category: 'personal',
      color: '#FFB6C1',
    });
    setShowCreateNote(true);
  };

  const handleEditNote = (note: Note) => {
    setNoteForm({
      title: note.title,
      content: note.content,
      category: note.category,
      color: note.color,
    });
    setSelectedNote(note);
    setShowNoteDetail(true);
  };

  const saveNote = async () => {
    try {
      if (selectedNote) {
        await notesApi.update(selectedNote.id, {
          title: noteForm.title,
          content: noteForm.content,
          category: noteForm.category,
          color: noteForm.color,
        });
        setShowNoteDetail(false);
      } else {
        await notesApi.create({
          title: noteForm.title,
          content: noteForm.content,
          category: noteForm.category,
          color: noteForm.color,
        });
        setShowCreateNote(false);
      }
      setSelectedNote(null);
      await loadNotes();
    } catch (e) {
      // ignore
    }
  };

  const deleteNote = async () => {
    try {
      if (selectedNote) {
        await notesApi.remove(selectedNote.id);
        setShowNoteDetail(false);
        setSelectedNote(null);
        await loadNotes();
      }
    } catch (e) {
      // ignore
    }
  };

  const togglePin = async (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    // Optimistic update
    setNotes(prev => prev.map(n =>
      n.id === noteId
        ? { ...n, isPinned: !n.isPinned }
        : n
    ));

    try {
      await notesApi.update(noteId, { is_pinned: !note.isPinned });
    } catch (e) {
      // Revert on error
      setNotes(prev => prev.map(n =>
        n.id === noteId
          ? { ...n, isPinned: note.isPinned }
          : n
      ));
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'work': return '#2196F3';
      case 'personal': return '#9C27B0';
      case 'family': return '#4CAF50';
      case 'ideas': return '#FF9800';
      default: return '#FFB6C1';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work': return 'briefcase';
      case 'personal': return 'account';
      case 'family': return 'home';
      case 'ideas': return 'lightbulb';
      default: return 'note';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF5A5A';
      case 'medium': return '#FFA500';
      case 'low': return '#4CAF50';
      default: return '#666666';
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    // Pinned notes first, then by updated date
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const Content = (
    <>
      {/* Segmented Tabs */}
      <SegmentedTabs
        tabs={[
          { id: 'all', label: 'All', icon: 'grid' },
          { id: 'personal', label: 'Personal', icon: 'account' },
          { id: 'work', label: 'Work', icon: 'briefcase' },

          { id: 'family', label: 'Family', icon: 'home' },
          { id: 'ideas', label: 'Ideas', icon: 'lightbulb' },
        ]}
        activeId={selectedCategory}
        onChange={(id) => setSelectedCategory(id as any)}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

        {/* To-Do Summary Card */}
        <View style={{ paddingHorizontal: H_PADDING, paddingTop: 16, marginBottom: 12 }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setShowTodoDrawer(true)}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
              borderWidth: 1,
              borderColor: 'rgba(255, 182, 193, 0.2)'
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconMC name="format-list-checkbox" size={18} color="#FF6B6B" />
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>To-Do</Text>
              </View>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>{tasks.filter(t => !t.isCompleted).length} open</Text>
            </View>
            <View style={{ gap: 8 }}>
              {tasks.slice(0, 3).map(t => (
                <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: getPriorityColor(t.priority) }} />
                  <Text style={{ flex: 1, fontSize: 14, color: t.isCompleted ? '#9CA3AF' : '#374151', textDecorationLine: t.isCompleted ? 'line-through' : 'none' }} numberOfLines={1}>
                    {t.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#9CA3AF' }}>{new Date(t.dueDate).toLocaleDateString()}</Text>
                </View>
              ))}
              {tasks.length > 3 && (
                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>+{tasks.length - 3} more</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={{ paddingHorizontal: H_PADDING, paddingTop: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 }}>
            <IconMC name="magnify" size={20} color="#6B7280" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search notes..."
              style={{ flex: 1, marginLeft: 8, fontSize: 16, color: '#111827' }}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <IconMC name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Filter */}
        <View style={{ paddingHorizontal: H_PADDING, marginBottom: 16 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {(['all', 'personal', 'work', 'family', 'ideas'] as const).map(category => (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: selectedCategory === category ? '#FFB6C1' : '#F3F4F6',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {category !== 'all' && (
                  <IconMC
                    name={getCategoryIcon(category)}
                    size={16}
                    color={selectedCategory === category ? '#FFFFFF' : '#6B7280'}
                  />
                )}
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: selectedCategory === category ? '#FFFFFF' : '#6B7280',
                }}>
                  {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Notes List */}
        <View style={{ paddingHorizontal: H_PADDING }}>
          {filteredNotes.length === 0 ? (
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 32, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }}>
              <IconMC name="note-outline" size={48} color="#9CA3AF" />
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#6B7280', marginTop: 12 }}>No notes found</Text>
              <Text style={{ fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginTop: 4 }}>
                {searchQuery ? 'Try adjusting your search' : 'Create your first note'}
              </Text>
            </View>
          ) : (
            <View style={{ gap: 20 }}>
              {filteredNotes.map(note => (
                <TouchableOpacity
                  key={note.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 20,
                    padding: 24,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 4,
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: 200,
                  }}
                  onPress={() => handleEditNote(note)}
                >
                  {/* Gradient accent bar */}
                  <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    backgroundColor: note.color,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                  }} />

                  {/* Header with pin and actions */}
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        {note.isPinned && (
                          <View style={{
                            backgroundColor: 'rgba(255, 107, 107, 0.1)',
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 8,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                          }}>
                            <IconMC name="pin" size={12} color="#FF6B6B" />
                            <Text style={{ fontSize: 10, color: '#FF6B6B', fontWeight: '600' }}>PINNED</Text>
                          </View>
                        )}
                      </View>
                      <Text style={{
                        fontSize: 20,
                        fontWeight: '700',
                        color: '#111827',
                        lineHeight: 28,
                        marginBottom: 12,
                      }} numberOfLines={2}>
                        {note.title}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => togglePin(note.id)}
                      style={{
                        padding: 8,
                        borderRadius: 12,
                        backgroundColor: note.isPinned ? 'rgba(255, 107, 107, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                      }}
                    >
                      <IconMC
                        name={note.isPinned ? "pin" : "pin-outline"}
                        size={18}
                        color={note.isPinned ? "#FF6B6B" : "#9CA3AF"}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Content preview */}
                  <Text style={{
                    fontSize: 16,
                    color: '#4B5563',
                    lineHeight: 24,
                    marginBottom: 20,
                    minHeight: 72,
                  }} numberOfLines={4}>
                    {note.content}
                  </Text>

                  {/* Footer with category and date */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 16,
                    borderTopWidth: 1,
                    borderTopColor: 'rgba(229, 231, 235, 0.5)',
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: getCategoryColor(note.category),
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 16,
                        gap: 6,
                        shadowColor: getCategoryColor(note.category),
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 2,
                      }}>
                        <IconMC name={getCategoryIcon(note.category)} size={14} color="#FFFFFF" />
                        <Text style={{ fontSize: 12, color: '#FFFFFF', fontWeight: '600', textTransform: 'uppercase' }}>
                          {note.category}
                        </Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <IconMC name="clock-outline" size={14} color="#9CA3AF" />
                      <Text style={{ fontSize: 12, color: '#9CA3AF', fontWeight: '500' }}>
                        {formatDate(note.updatedAt)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          right: 20,
          bottom: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#FFB6C1',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
        onPress={handleCreateNote}
      >
        <IconMC name="plus" size={24} color="#1F2937" />
      </TouchableOpacity>

      {/* Create/Edit Note Modal - Inline WYSIWYG */}
      <Modal visible={showCreateNote || showNoteDetail} transparent animationType="slide" onRequestClose={() => {
        setShowCreateNote(false);
        setShowNoteDetail(false);
        setSelectedNote(null);
      }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 0, maxHeight: '95%', flex: 1 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(229, 231, 235, 0.5)' }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>
                {selectedNote ? 'Edit Note' : 'Create Note'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {/* Category selector in header */}
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {(['personal', 'work', 'family', 'ideas'] as const).map(category => (
                    <TouchableOpacity
                      key={category}
                      onPress={() => setNoteForm(prev => ({ ...prev, category }))}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: noteForm.category === category ? getCategoryColor(category) : '#F3F4F6',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconMC
                        name={getCategoryIcon(category)}
                        size={16}
                        color={noteForm.category === category ? '#FFFFFF' : '#6B7280'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity onPress={() => {
                  setShowCreateNote(false);
                  setShowNoteDetail(false);
                  setSelectedNote(null);
                }} style={{ padding: 8 }}>
                  <IconMC name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Inline WYSIWYG Editor */}
            <View style={{ flex: 1, padding: 20 }}>
              {/* Title Input */}
              <TextInput
                value={noteForm.title}
                onChangeText={(text) => setNoteForm(prev => ({ ...prev, title: text }))}
                placeholder="Note title..."
                style={{
                  fontSize: 24,
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: 20,
                  paddingVertical: 8,
                  borderBottomWidth: 2,
                  borderBottomColor: 'rgba(255, 182, 193, 0.3)',
                }}
                placeholderTextColor="#9CA3AF"
              />

              {/* Content Input - WYSIWYG style */}
              <TextInput
                value={noteForm.content}
                onChangeText={(text) => setNoteForm(prev => ({ ...prev, content: text }))}
                placeholder="Start writing your note..."
                multiline
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: '#374151',
                  lineHeight: 24,
                  textAlignVertical: 'top',
                  paddingVertical: 8,
                }}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(229, 231, 235, 0.5)', gap: 12 }}>
              {selectedNote && (
                <TouchableOpacity
                  onPress={deleteNote}
                  style={{ flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' }}
                >
                  <Text style={{ color: '#DC2626', fontWeight: '600', textAlign: 'center' }}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={saveNote}
                style={{ flex: selectedNote ? 1 : 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#FFB6C1' }}
              >
                <Text style={{ color: '#1F2937', fontWeight: '600', textAlign: 'center' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* To-Do Drawer */}
      <Modal visible={showTodoDrawer} transparent animationType="slide" onRequestClose={() => setShowTodoDrawer(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingTop: 12, paddingBottom: 24, maxHeight: '85%' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>To-Do List</Text>
              <TouchableOpacity onPress={() => setShowTodoDrawer(false)} style={{ padding: 8 }}>
                <IconMC name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Task List */}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
              {tasks.map((task, index) => (
                <View
                  key={task.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 16,
                    paddingHorizontal: 4,
                    borderBottomWidth: 1,
                    borderBottomColor: 'rgba(229, 231, 235, 0.5)',
                  }}
                >
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        await todosApi.update(task.id, { is_completed: !task.isCompleted });
                        await loadTodos();
                      } catch (e) {
                        // ignore
                      }
                    }}
                    style={{ marginRight: 16 }}
                  >
                    <IconMC
                      name={task.isCompleted ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                      size={24}
                      color={task.isCompleted ? '#4CAF50' : '#D1D5DB'}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedTask(task);
                      setTaskForm({
                        title: task.title,
                        description: task.description,
                        category: task.category,
                        priority: task.priority,
                        dueDate: task.dueDate.split('T')[0],
                      });
                      setShowAddTask(true);
                    }}
                    style={{ flex: 1 }}
                  >
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '500',
                      color: task.isCompleted ? '#9CA3AF' : '#111827',
                      textDecorationLine: task.isCompleted ? 'line-through' : 'none',
                      marginBottom: 4,
                    }}>
                      {task.title}
                    </Text>
                    {task.description && (
                      <Text style={{
                        fontSize: 14,
                        color: '#6B7280',
                        lineHeight: 18,
                      }} numberOfLines={2}>
                        {task.description}
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Reorder controls */}
                  <View style={{ flexDirection: 'column', marginLeft: 8 }}>
                    <TouchableOpacity onPress={() => reorderTasks(index, index - 1)} style={{ padding: 4 }}>
                      <IconMC name="chevron-up" size={22} color="#9CA3AF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => reorderTasks(index, index + 1)} style={{ padding: 4 }}>
                      <IconMC name="chevron-down" size={22} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* FAB inside drawer */}
            <TouchableOpacity
              onPress={() => { setSelectedTask(null); setTaskForm({ title: '', description: '', category: 'work', priority: 'medium', dueDate: new Date().toISOString().split('T')[0] }); setShowAddTask(true); }}
              style={{ position: 'absolute', right: 20, bottom: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFB6C1', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
            >
              <IconMC name="plus" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Task Modal */}
      <Modal visible={showAddTask} transparent animationType="slide" onRequestClose={() => setShowAddTask(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '85%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>{selectedTask ? 'Edit Task' : 'Add Task'}</Text>
              <TouchableOpacity onPress={() => setShowAddTask(false)} style={{ padding: 8 }}>
                <IconMC name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ gap: 16 }}>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Title</Text>
                  <TextInput value={taskForm.title} onChangeText={(text) => setTaskForm(prev => ({ ...prev, title: text }))} placeholder="Task title" style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 16 }} />
                </View>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Description</Text>
                  <TextInput value={taskForm.description} onChangeText={(text) => setTaskForm(prev => ({ ...prev, description: text }))} placeholder="Task description" multiline numberOfLines={4} style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 16, textAlignVertical: 'top' }} />
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {(['work', 'personal', 'family', 'urgent'] as const).map(cat => (
                    <TouchableOpacity key={cat} onPress={() => setTaskForm(prev => ({ ...prev, category: cat }))} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: taskForm.category === cat ? getCategoryColor(cat) : '#F3F4F6' }}>
                      <Text style={{ color: taskForm.category === cat ? '#FFFFFF' : '#6B7280', fontWeight: '600' }}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <TouchableOpacity key={p} onPress={() => setTaskForm(prev => ({ ...prev, priority: p }))} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: getPriorityColor(p), backgroundColor: taskForm.priority === p ? getPriorityColor(p) : 'transparent' }}>
                      <Text style={{ color: taskForm.priority === p ? '#FFFFFF' : getPriorityColor(p), fontWeight: '600' }}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Due Date</Text>
                  <TextInput value={taskForm.dueDate} onChangeText={(text) => setTaskForm(prev => ({ ...prev, dueDate: text }))} placeholder="YYYY-MM-DD" style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 16 }} />
                </View>
              </View>
            </ScrollView>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 12 }}>
              {selectedTask && (
                <TouchableOpacity onPress={async () => {
                  try {
                    await todosApi.remove(selectedTask.id);
                    setSelectedTask(null);
                    setShowAddTask(false);
                    await loadTodos();
                  } catch (e) {
                    // ignore
                  }
                }} style={{ flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' }}>
                  <Text style={{ color: '#DC2626', fontWeight: '600', textAlign: 'center' }}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={async () => {
                if (!taskForm.title.trim()) return;
                try {
                  if (selectedTask) {
                    await todosApi.update(selectedTask.id, {
                      title: taskForm.title.trim(),
                      description: taskForm.description.trim(),
                      category: taskForm.category,
                      priority: taskForm.priority,
                      due_date: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : null,
                    });
                  } else {
                    await todosApi.create({
                      title: taskForm.title.trim(),
                      description: taskForm.description.trim() || undefined,
                      category: taskForm.category,
                      priority: taskForm.priority,
                      due_date: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : null,
                    });
                  }
                  setSelectedTask(null);
                  setShowAddTask(false);
                  await loadTodos();
                } catch (e) {
                  // ignore
                }
              }} style={{ flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#FFB6C1' }}>
                <Text style={{ color: '#1F2937', fontWeight: '600', textAlign: 'center' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );

  if (embedded) {
    return (
      <View style={{ flex: 1 }}>
        {Content}
      </View>
    );
  }

  return (
    <MainScreenLayout
      selectedFamily={selectedFamily}
      onToggleFamilyDropdown={() => setShowFamilyDropdown(!showFamilyDropdown)}
      showFamilyDropdown={showFamilyDropdown}
      cardMarginTopAnim={cardMarginTopAnim}
      cardOpacityAnim={cardOpacityAnim}
    >
      {/* hourse Selection Modal */}
      <FamilyDropdown
        visible={showFamilyDropdown}
        onClose={() => setShowFamilyDropdown(false)}
        selectedFamily={selectedFamily}
        onFamilySelect={handleFamilySelect}
        availableFamilies={availableFamilies}
      />
      {Content}
    </MainScreenLayout>
  );
};

export default NotesScreen;
