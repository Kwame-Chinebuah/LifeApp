import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, Modal, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../data/ThemeContext';
import { RADIUS } from '../data/theme';
import AdBanner from '../components/AdBanner';

const NOTES_KEY  = 'notes_tool';
const PINNED_KEY = 'pinned_notes'; // shared with HomeScreen

const NOTE_COLORS = ['#FFD966','#82E0AA','#F1948A','#85C1E9','#F0B27A','#C39BD3','#76D7C4'];
const NOTE_DARK   = ['#5C4A00','#1A5235','#6B1A1A','#1A3A5C','#6B3A00','#4A1A6B','#1A4A40'];

const MAX_PINNED = 5;

export default function NotesScreen({ navigation }) {
  const { COLORS, isDark } = useTheme();
  const [notes,      setNotes]      = useState([]);
  const [pinnedIds,  setPinnedIds]  = useState([]);
  const [editing,    setEditing]    = useState(null);
  const [editTitle,  setEditTitle]  = useState('');
  const [editBody,   setEditBody]   = useState('');
  const [editColor,  setEditColor]  = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const n = await AsyncStorage.getItem(NOTES_KEY);
        const p = await AsyncStorage.getItem(PINNED_KEY);
        if (n) setNotes(JSON.parse(n));
        // Get pinned IDs from home screen pinned notes
        if (p) {
          const pinned = JSON.parse(p);
          const ids = pinned.filter(n => n.id).map(n => n.id);
          setPinnedIds(ids);
        }
      } catch {}
    }
    load();
  }, []);

  async function saveNotes(next) {
    setNotes(next);
    try { await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(next)); } catch {}
  }

  async function syncPinned(notesList, pinnedIdsList) {
    try {
      // Build 5 pinned slots for HomeScreen
      const slots = ['pin1','pin2','pin3','pin4','pin5'].map((slotId, i) => {
        const pinnedNoteId = pinnedIdsList[i];
        if (pinnedNoteId) {
          const note = notesList.find(n => n.id === pinnedNoteId);
          if (note) return { id: slotId, title: note.title, body: note.body };
        }
        return { id: slotId, title: '', body: '' };
      });
      await AsyncStorage.setItem(PINNED_KEY, JSON.stringify(slots));
    } catch {}
  }

  function openNew() {
    setEditing('new');
    setEditTitle('');
    setEditBody('');
    setEditColor(Math.floor(Math.random() * NOTE_COLORS.length));
  }

  function openEdit(note) {
    setEditing(note);
    setEditTitle(note.title);
    setEditBody(note.body);
    setEditColor(note.colorIdx || 0);
  }

  function saveNote() {
    if (!editTitle.trim() && !editBody.trim()) { setEditing(null); return; }
    let next;
    if (editing === 'new') {
      const newNote = { id: Date.now().toString(), title: editTitle.trim(), body: editBody.trim(), colorIdx: editColor };
      next = [newNote, ...notes];
    } else {
      next = notes.map(n => n.id === editing.id
        ? { ...n, title: editTitle.trim(), body: editBody.trim(), colorIdx: editColor }
        : n);
    }
    saveNotes(next);
    syncPinned(next, pinnedIds);
    setEditing(null);
  }

  function deleteNote(id) {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => {
          const next = notes.filter(n => n.id !== id);
          const newPinnedIds = pinnedIds.filter(p => p !== id);
          saveNotes(next);
          setPinnedIds(newPinnedIds);
          syncPinned(next, newPinnedIds);
        },
      },
    ]);
  }

  function togglePin(id) {
    const isPinned = pinnedIds.includes(id);
    let newPinnedIds;
    if (isPinned) {
      newPinnedIds = pinnedIds.filter(p => p !== id);
    } else {
      if (pinnedIds.length >= MAX_PINNED) {
        Alert.alert('Max Pinned', `You can only pin up to ${MAX_PINNED} notes. Unpin one first.`);
        return;
      }
      newPinnedIds = [...pinnedIds, id];
    }
    setPinnedIds(newPinnedIds);
    syncPinned(notes, newPinnedIds);
    Alert.alert(isPinned ? 'Unpinned' : '📌 Pinned',
      isPinned ? 'Note removed from home screen' : 'Note pinned to home screen!',
      [{ text: 'OK' }]);
  }

  function onLongPress(note) {
    const isPinned = pinnedIds.includes(note.id);
    Alert.alert(note.title || 'Note', 'What would you like to do?', [
      { text: isPinned ? '📌 Unpin from Home' : '📌 Pin to Home', onPress: () => togglePin(note.id) },
      { text: '✏️ Edit', onPress: () => openEdit(note) },
      { text: '🗑️ Delete', style: 'destructive', onPress: () => deleteNote(note.id) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: COLORS.bg }]}>
      <View style={[styles.topbar, { borderBottomColor: COLORS.border }]}>
        <TouchableOpacity style={[styles.backBtn, { borderColor: COLORS.border }]} onPress={() => navigation.goBack()}>
          <Text style={[styles.backText, { color: COLORS.textSecondary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: COLORS.textPrimary }]}>Notes</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: COLORS.accent }]} onPress={openNew}>
          <Text style={styles.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>
      <AdBanner />

      {notes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={[styles.emptyTitle, { color: COLORS.textPrimary }]}>No notes yet</Text>
          <Text style={[styles.emptyDesc, { color: COLORS.textSecondary }]}>Tap "+ New" to create your first note</Text>
          <Text style={[styles.emptyHint, { color: COLORS.textTertiary }]}>Press & hold a note to pin it to the home screen</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {notes.map(note => {
            const bg = isDark ? NOTE_DARK[note.colorIdx || 0] : NOTE_COLORS[note.colorIdx || 0];
            const isPinned = pinnedIds.includes(note.id);
            return (
              <TouchableOpacity key={note.id}
                style={[styles.noteCard, { backgroundColor: bg }]}
                onPress={() => openEdit(note)}
                onLongPress={() => onLongPress(note)}
                delayLongPress={500}
                activeOpacity={0.85}>
                {isPinned && (
                  <Text style={styles.pinIndicator}>📌</Text>
                )}
                <Text style={[styles.noteTitle, { color: isDark ? '#FFFFcc' : '#1A1A1A' }]} numberOfLines={2}>
                  {note.title || 'Untitled'}
                </Text>
                <Text style={[styles.noteBody, { color: isDark ? '#DDDDAA' : '#444' }]} numberOfLines={6}>
                  {note.body}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Edit / Create modal */}
      <Modal visible={editing !== null} transparent animationType="fade">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={saveNote} />
          <View style={[styles.modal, {
            backgroundColor: editing && editing !== 'new'
              ? (isDark ? NOTE_DARK[editColor] : NOTE_COLORS[editColor])
              : (isDark ? NOTE_DARK[editColor] : NOTE_COLORS[editColor]),
          }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              style={styles.colorPicker} contentContainerStyle={styles.colorPickerContent}
              keyboardShouldPersistTaps="handled">
              {NOTE_COLORS.map((c, i) => (
                <TouchableOpacity key={i}
                  style={[styles.colorDot, { backgroundColor: c, borderWidth: editColor === i ? 3 : 0, borderColor: '#333' }]}
                  onPress={() => setEditColor(i)} />
              ))}
            </ScrollView>
            <TextInput style={styles.modalTitle} value={editTitle} onChangeText={setEditTitle}
              placeholder="Title..." placeholderTextColor="#888" autoFocus />
            <TextInput style={styles.modalBody} value={editBody} onChangeText={setEditBody}
              placeholder="Write your note here..." placeholderTextColor="#888" multiline />
            <TouchableOpacity style={styles.saveBtn} onPress={saveNote}>
              <Text style={styles.saveBtnText}>Save ✓</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:            { flex: 1 },
  topbar:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, gap: 12 },
  backBtn:           { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.md, borderWidth: 0.5 },
  backText:          { fontSize: 13 },
  title:             { flex: 1, fontSize: 16, fontWeight: '500' },
  addBtn:            { paddingHorizontal: 14, paddingVertical: 6, borderRadius: RADIUS.md },
  addBtnText:        { fontSize: 14, color: '#fff', fontWeight: '600' },
  empty:             { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 40 },
  emptyIcon:         { fontSize: 48 },
  emptyTitle:        { fontSize: 18, fontWeight: '600' },
  emptyDesc:         { fontSize: 14 },
  emptyHint:         { fontSize: 12, textAlign: 'center' },
  grid:              { padding: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  noteCard:          { width: '47%', minHeight: 150, borderRadius: 8, padding: 12, elevation: 4, shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 2, height: 3 }, position: 'relative' },
  pinIndicator:      { position: 'absolute', top: 6, right: 8, fontSize: 14 },
  noteTitle:         { fontSize: 14, fontWeight: '700', marginBottom: 6, marginTop: 8 },
  noteBody:          { fontSize: 12, lineHeight: 18 },
  modalOverlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start', paddingTop: 60 },
  modal:             { marginHorizontal: 16, borderRadius: 12, padding: 16, gap: 10, zIndex: 1, elevation: 8 },
  colorPicker:       { maxHeight: 40 },
  colorPickerContent:{ flexDirection: 'row', gap: 10, paddingBottom: 4 },
  colorDot:          { width: 28, height: 28, borderRadius: 14 },
  modalTitle:        { fontSize: 20, fontWeight: '700', color: '#1A1A1A', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.2)', paddingBottom: 8 },
  modalBody:         { fontSize: 15, color: '#333', minHeight: 140, textAlignVertical: 'top', lineHeight: 22 },
  saveBtn:           { backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 8, padding: 12, alignItems: 'center' },
  saveBtnText:       { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
});
