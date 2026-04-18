import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, FlatList, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, RADIUS } from '../data/theme';
import AdBanner from '../components/AdBanner';

const TASKS_KEY  = 'checklist_tasks';
const DONE_KEY   = () => `checklist_done_${new Date().toDateString()}`;

const DEFAULT_TASKS = [
  { id: '1', text: 'Drink 8 glasses of water' },
  { id: '2', text: 'Exercise for 30 minutes' },
  { id: '3', text: 'Read for 20 minutes' },
];

export default function ChecklistScreen({ navigation }) {
  const [tasks, setTasks]     = useState([]);
  const [done, setDone]       = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loaded, setLoaded]   = useState(false);

  // Load tasks and today's done state on mount
  useEffect(() => {
    async function load() {
      try {
        const savedTasks = await AsyncStorage.getItem(TASKS_KEY);
        const savedDone  = await AsyncStorage.getItem(DONE_KEY());
        setTasks(savedTasks ? JSON.parse(savedTasks) : DEFAULT_TASKS);
        setDone(savedDone  ? JSON.parse(savedDone)  : []);
      } catch {
        setTasks(DEFAULT_TASKS);
        setDone([]);
      }
      setLoaded(true);
    }
    load();
  }, []);

  async function saveTasks(newTasks) {
    setTasks(newTasks);
    try { await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(newTasks)); } catch {}
  }

  async function saveDone(newDone) {
    setDone(newDone);
    try { await AsyncStorage.setItem(DONE_KEY(), JSON.stringify(newDone)); } catch {}
  }

  function toggle(id) {
    const newDone = done.includes(id)
      ? done.filter(d => d !== id)
      : [...done, id];
    saveDone(newDone);
  }

  function addTask() {
    if (!newTask.trim()) return;
    const newTasks = [...tasks, { id: Date.now().toString(), text: newTask.trim() }];
    saveTasks(newTasks);
    setNewTask('');
  }

  function deleteTask(id) {
    Alert.alert('Delete Task', 'Remove this task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        saveTasks(tasks.filter(t => t.id !== id));
        saveDone(done.filter(d => d !== id));
      }},
    ]);
  }

  function resetToday() {
    saveDone([]);
  }

  if (!loaded) return <SafeAreaView style={styles.screen} />;

  const doneCount = done.length;
  const total     = tasks.length;
  const pct       = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Daily Checklist</Text>
        <TouchableOpacity onPress={resetToday}>
          <Text style={styles.resetBtn}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progress}>
        <View style={styles.progressTop}>
          <Text style={styles.progressText}>{doneCount} of {total} done today</Text>
          <Text style={styles.progressPct}>{pct}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
        {pct === 100 && total > 0 && (
          <Text style={styles.celebrate}>🎉 All done! Great work!</Text>
        )}
      </View>

      {/* Task list */}
      <FlatList
        data={tasks}
        keyExtractor={t => t.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isDone = done.includes(item.id);
          return (
            <TouchableOpacity
              style={[styles.taskItem, isDone && styles.taskItemDone]}
              onPress={() => toggle(item.id)}
              activeOpacity={0.7}>
              <View style={[styles.checkbox, isDone && styles.checkboxDone]}>
                {isDone && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.taskText, isDone && styles.taskTextDone]}>{item.text}</Text>
              <TouchableOpacity
                onPress={() => deleteTask(item.id)}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <Text style={styles.deleteBtn}>✕</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={<View style={{ height: 20 }} />}
      />

      {/* Add task */}
      <View style={styles.addRow}>
        <TextInput
          style={styles.addInput}
          value={newTask}
          onChangeText={setNewTask}
          placeholder="Add a new task..."
          placeholderTextColor={COLORS.textTertiary}
          onSubmitEditing={addTask}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addBtn} onPress={addTask}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  topbar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.border, gap: 12,
  },
  backBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.md, borderWidth: 0.5, borderColor: COLORS.border },
  backText: { fontSize: 13, color: COLORS.textSecondary },
  title: { flex: 1, fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  resetBtn: { fontSize: 13, color: COLORS.accent },
  progress: { padding: 16, borderBottomWidth: 0.5, borderBottomColor: COLORS.border, gap: 8 },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between' },
  progressText: { fontSize: 13, color: COLORS.textSecondary },
  progressPct: { fontSize: 13, fontWeight: '600', color: COLORS.accent },
  progressBar: { height: 6, backgroundColor: COLORS.bgTertiary, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: COLORS.accent, borderRadius: 3 },
  celebrate: { fontSize: 14, color: COLORS.success, fontWeight: '500', textAlign: 'center' },
  list: { padding: 16, gap: 8 },
  taskItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border,
  },
  taskItemDone: { opacity: 0.65 },
  checkbox: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  taskText: { flex: 1, fontSize: 15, color: COLORS.textPrimary },
  taskTextDone: { textDecorationLine: 'line-through', color: COLORS.textTertiary },
  deleteBtn: { fontSize: 14, color: COLORS.textTertiary, padding: 4 },
  addRow: {
    flexDirection: 'row', gap: 10, padding: 12,
    borderTopWidth: 0.5, borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  addInput: {
    flex: 1, borderWidth: 0.5, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 15, color: COLORS.textPrimary, backgroundColor: COLORS.bgSecondary,
  },
  addBtn: {
    width: 44, height: 44, borderRadius: RADIUS.md,
    backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { fontSize: 24, color: '#fff', fontWeight: '300' },
});
